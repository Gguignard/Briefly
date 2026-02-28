# Story 3.5 : Export des Données Personnelles (RGPD)

**Epic :** Epic 3 - Authentification & Gestion de Compte
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to export all my personal data (newsletters, summaries, settings),
**so that** I can exercise my GDPR right to data portability and have a local copy of my data.

---

## Acceptance Criteria

1. ✅ Bouton "Exporter mes données" visible dans Settings → Compte
2. ✅ Clic → génère un fichier JSON avec toutes les données de l'utilisateur
3. ✅ Export contient : profil, newsletters configurées, résumés (90 derniers jours), paramètres
4. ✅ Téléchargement déclenché automatiquement (nom fichier : `briefly-export-YYYY-MM-DD.json`)
5. ✅ Opération complète en < 5 secondes pour un utilisateur standard
6. ✅ Route API protégée (seul l'utilisateur authentifié peut exporter ses données)

---

## Technical Notes

### API Route d'export

```typescript
// src/app/api/account/export/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiError } from '@/lib/utils/apiResponse'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()

  // Récupérer toutes les données de l'utilisateur en parallèle
  const [newsletters, summaries, settings] = await Promise.all([
    supabase
      .from('newsletters')
      .select('name, email_address, category_id, active, created_at')
      .eq('user_id', userId),
    supabase
      .from('summaries')
      .select('title, content, llm_tier, created_at, newsletter_id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('user_settings')
      .select('daily_summary_enabled, created_at')
      .eq('user_id', userId)
      .single(),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    newsletters: newsletters.data ?? [],
    summaries: summaries.data ?? [],
    settings: settings.data ?? {},
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="briefly-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
```

### Composant bouton d'export

```typescript
// src/features/settings/components/DataExportButton.tsx
'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DataExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `briefly-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Export en cours...' : 'Exporter mes données'}
    </Button>
  )
}
```

### Intégration dans AccountSection

```typescript
// Ajouter dans AccountSection (story 3.4)
import { DataExportButton } from './DataExportButton'

// Dans le JSX :
<div className="pt-4 border-t space-y-2">
  <p className="text-sm font-medium">Portabilité des données (RGPD)</p>
  <DataExportButton />
</div>
```

---

## Dependencies

**Requires :**
- Story 3.4 : Page Settings (AccountSection)
- Story 1.2 : Supabase configuré

**Blocks :**
- Rien (feature autonome RGPD)

---

## Definition of Done

- [ ] `GET /api/account/export` retourne le JSON avec headers `Content-Disposition`
- [ ] `DataExportButton` déclenche le téléchargement
- [ ] Export contient newsletters, résumés (90j), settings
- [ ] Route protégée : 401 si non connecté
- [ ] Test : fichier JSON bien formé et téléchargeable

---

## Testing Strategy

- **Manuel :** Cliquer "Exporter mes données" → fichier `briefly-export-YYYY-MM-DD.json` téléchargé
- **Manuel :** Vérifier le contenu JSON (newsletters, résumés, settings présents)
- **Manuel :** `curl /api/account/export` sans auth → 401

---

## Dev Agent Record

### Status
done

### Agent Model Used
claude-sonnet-4-6

### Tasks
- [x] Créer `GET /api/account/export`
- [x] Créer `DataExportButton` component
- [x] Intégrer dans `AccountSection`

### Review Follow-ups (AI) — Résolus (Revue 1)
- [x] [AI-Review][HIGH] Utiliser `createAdminClient()` au lieu de `createClient()` [route.ts:9]
- [x] [AI-Review][HIGH] AC #3 : ajouter le profil utilisateur (table `users`) dans l'export [route.ts:28]
- [x] [AI-Review][HIGH] Ajouter `catch` + feedback d'erreur dans `DataExportButton` [DataExportButton.tsx:12]
- [x] [AI-Review][HIGH] Vérifier `newsletters.error` / `summaries.error` [route.ts:31]
- [x] [AI-Review][MEDIUM] Corriger `a.click()` avec `appendChild/removeChild` (Firefox) [DataExportButton.tsx:21]
- [x] [AI-Review][MEDIUM] Ajouter tests automatisés pour la route export [export/__tests__/route.test.ts]

### Review Follow-ups (AI) — Résolus (Revue 2)
- [x] [AI-Review][CRITIQUE] Stager les fichiers non committés : `route.ts`, `route.test.ts`, `types.ts` étaient UNTRACKED/unstaged
- [x] [AI-Review][CRITIQUE] Vérifier `profile.error` et `settings.error` (incohérence avec newsletters/summaries) [route.ts:33]
- [x] [AI-Review][MOYEN] Ajouter `export const dynamic = 'force-dynamic'` pour éviter le cache Next.js [route.ts:5]
- [x] [AI-Review][MOYEN] Documenter `BillingSection.tsx` et `NotificationSection.tsx` dans le File List (harmonisation CSS)
- [x] [AI-Review][MOYEN] Ajouter tests pour `settings.error` (vrai erreur DB vs PGRST116) [route.test.ts:130-150]

### Completion Notes
- Route `GET /api/account/export` protégée par Clerk auth, retourne JSON avec headers `Content-Disposition`
- Utilise `createAdminClient()` (service role) conformément au pattern du projet
- Export inclut le profil utilisateur (email, tier) depuis la table `users`
- `DataExportButton` gère les erreurs avec état visuel + clé i18n `export_error`
- Types Supabase mis à jour pour inclure les tables `newsletters` et `summaries` (stubs pour les stories futures)
- Clés i18n ajoutées dans `fr.json` et `en.json` sous `settings.account.gdpr` (dont `export_error`)
- 6 tests unitaires couvrant 401, 200, erreurs BD, profil manquant, données vides

### File List
- `src/app/api/account/export/route.ts` (créé)
- `src/app/api/account/export/__tests__/route.test.ts` (créé)
- `src/features/settings/components/DataExportButton.tsx` (créé)
- `src/features/settings/components/AccountSection.tsx` (modifié)
- `src/features/settings/components/BillingSection.tsx` (modifié — harmonisation style CSS `bg-card border-border rounded-xl shadow-sm`)
- `src/features/settings/components/NotificationSection.tsx` (modifié — harmonisation style CSS `bg-card border-border rounded-xl shadow-sm`)
- `src/lib/supabase/types.ts` (modifié — ajout types `newsletters` et `summaries`)
- `messages/fr.json` (modifié — clés RGPD dont `export_error`)
- `messages/en.json` (modifié — clés RGPD dont `export_error`)

### Debug Log
- Tables `newsletters` et `summaries` absentes des types Supabase → ajout de stubs typés pour permettre la compilation sans erreur
