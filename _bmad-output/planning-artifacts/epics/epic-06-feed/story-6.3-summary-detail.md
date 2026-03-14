# Story 6.3 : Page Détail d'un Résumé

**Epic :** Epic 6 - Interface de Lecture & Feed de Résumés
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to open a summary and see all details in a focused reading view,
**so that** I can read the full summary without distractions before deciding to click through to the original newsletter.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/summaries/[id]` affiche le résumé complet
2. ✅ Affichage : titre, source, tous les points clés, badge tier LLM, date de génération
3. ✅ Bouton "Lire la newsletter originale" vers `source_url` (si présent)
4. ✅ Bouton "Retour" vers `/summaries`
5. ✅ Résumé automatiquement marqué comme lu à l'ouverture de la page
6. ✅ 404 si le résumé n'appartient pas à l'utilisateur connecté

---

## Technical Notes

### Route

```
src/app/[locale]/(dashboard)/summaries/[id]/page.tsx
```

### Page (Server Component)

```typescript
// src/app/[locale]/(dashboard)/summaries/[id]/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  params: { id: string; locale: string }
}

export default async function SummaryDetailPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createClient()

  // Récupérer le résumé
  const { data: summary, error } = await supabase
    .from('summaries')
    .select(`
      id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails ( sender_email, subject, received_at )
    `)
    .eq('id', params.id)
    .eq('user_id', userId) // Sécurité : seul le propriétaire peut voir
    .single()

  if (error || !summary) notFound()

  // Marquer comme lu si pas encore fait
  if (!summary.read_at) {
    await supabase
      .from('summaries')
      .update({ read_at: new Date().toISOString() })
      .eq('id', params.id)
  }

  const email = summary.raw_emails as any

  return (
    <article className="max-w-2xl space-y-6">
      {/* Navigation retour */}
      <Link
        href={`/${params.locale}/summaries`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux résumés
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {summary.llm_tier === 'premium' && (
            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
              Premium
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(summary.generated_at).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{summary.title}</h1>
        <p className="text-sm text-muted-foreground">
          Source : {email?.sender_email}
        </p>
      </div>

      {/* Points clés */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">POINTS CLÉS</h2>
        <ul className="space-y-3">
          {summary.key_points.map((point: string, i: number) => (
            <li key={i} className="flex gap-3 text-base">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA vers newsletter originale */}
      {summary.source_url && (
        <div className="pt-4 border-t">
          <Button asChild variant="outline">
            <a href={summary.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Lire la newsletter originale
            </a>
          </Button>
        </div>
      )}
    </article>
  )
}
```

---

## Dependencies

**Requires :**
- Story 6.2 : SummaryCard (lien vers la page détail)
- Story 5.2 : Table `summaries`

**Blocks :**
- Rien (page terminale)

---

## Definition of Done

- [x] Page `/[locale]/summaries/[id]` créée
- [x] Marquage automatique comme lu à l'ouverture
- [x] 404 si résumé non trouvé ou n'appartient pas à l'utilisateur
- [x] Bouton retour vers `/summaries`
- [x] Tous les points clés affichés

---

## Testing Strategy

- **Manuel :** Cliquer sur une card → page détail avec tous les points clés
- **Manuel :** Ouvrir la page → vérifier `read_at` mis à jour dans Supabase
- **Manuel :** Accéder à `/summaries/[id-autre-user]` → 404

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/app/[locale]/(dashboard)/summaries/[id]/page.tsx`
- [x] Marquage automatique comme lu (server-side dans page.tsx)
- [x] Gestion 404
- [x] API route PATCH `/api/summaries/[id]/read` pour marquage client-side
- [x] Hook `useMarkAsRead` avec optimistic update TanStack Query
- [x] Export barrel `src/features/summaries/index.ts`

### Completion Notes
- Page détail Server Component créée avec fetch Supabase + filtre `user_id` (AC6 - sécurité)
- Marquage `read_at` automatique si null à l'ouverture (AC5)
- `notFound()` si résumé inexistant ou n'appartient pas à l'utilisateur (AC6)
- Bouton retour vers `/{locale}/summaries` (AC4)
- Affichage de tous les points clés numérotés (AC2, AC5)
- Badge Premium conditionnel sur `llm_tier` (AC2)
- Bouton "Lire la newsletter originale" vers `source_url` si présent (AC3)
- Traductions i18n ajoutées (fr + en) : backToSummaries, keyPointsHeading, readOriginal, source, notFound
- 15 tests unitaires couvrant : auth redirect, 404, rendu titre/points clés/badge/source/back link, marquage read_at, sémantique article
- 0 régression (354 tests existants passent toujours)

### File List
- `src/app/[locale]/(dashboard)/summaries/[id]/page.tsx` (nouveau)
- `src/app/[locale]/(dashboard)/summaries/[id]/__tests__/page.test.tsx` (nouveau)
- `src/app/api/summaries/[id]/read/route.ts` (nouveau - API marquage lu)
- `src/app/api/summaries/[id]/read/__tests__/route.test.ts` (nouveau)
- `src/features/summaries/hooks/useMarkAsRead.ts` (nouveau - hook optimistic update)
- `src/features/summaries/hooks/__tests__/useMarkAsRead.test.ts` (nouveau)
- `src/features/summaries/index.ts` (modifié - export useMarkAsRead)
- `messages/fr.json` (modifié - ajout clés summaries.backToSummaries, keyPointsHeading, readOriginal, source, notFound)
- `messages/en.json` (modifié - ajout clés summaries.backToSummaries, keyPointsHeading, readOriginal, source, notFound)

### Change Log
- **2026-03-14 — Code Review (AI):** 3 HIGH + 2 MEDIUM corrigés :
  - H1: File List complétée (5 fichiers manquants ajoutés)
  - H2: Ajout filtre `user_id` sur UPDATE `read_at` dans page.tsx (défense en profondeur)
  - H3: API route vérifie maintenant que l'update a affecté des lignes (404 si résumé inexistant)
  - M1: Tasks et File List documentent l'infrastructure client-side (hook + API route)
  - M2: Validation UUID ajoutée sur l'API route (pattern Zod existant)
  - Tests mis à jour (14 tests passent, 0 régression sur 371 tests)

### Debug Log
- Fix cleanup manquant entre tests async (ajout afterEach + cleanup)
