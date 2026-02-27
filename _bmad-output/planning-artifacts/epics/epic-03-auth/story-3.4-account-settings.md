# Story 3.4 : Page Paramètres de Compte

**Epic :** Epic 3 - Authentification & Gestion de Compte
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to view and manage my account settings (email, avatar, notification preferences),
**so that** I can keep my profile information up to date.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/settings` accessible aux utilisateurs connectés
2. ✅ Affichage de l'email et de l'avatar via Clerk `useUser()`
3. ✅ Section "Compte" avec lien vers Clerk User Profile pour modifier email/avatar
4. ✅ Section "Notifications" avec toggle pour les résumés quotidiens (stocké en Supabase)
5. ✅ Section "Abonnement" avec lien vers `/billing` et affichage du tier actuel
6. ✅ Page protégée (redirect si non connecté)

---

## Technical Notes

### Route et fichier

```
src/app/[locale]/(dashboard)/settings/page.tsx
```

### Composant principal

```typescript
// src/app/[locale]/(dashboard)/settings/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountSection } from '@/features/settings/components/AccountSection'
import { NotificationSection } from '@/features/settings/components/NotificationSection'
import { BillingSection } from '@/features/settings/components/BillingSection'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <AccountSection />
      <NotificationSection userId={userId} />
      <BillingSection />
    </div>
  )
}
```

### Section Compte (Clerk UserButton)

```typescript
// src/features/settings/components/AccountSection.tsx
'use client'

import { useUser, UserButton } from '@clerk/nextjs'

export function AccountSection() {
  const { user } = useUser()

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">Compte</h2>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
        <div>
          <p className="font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Pour modifier votre email ou avatar, cliquez sur votre avatar ci-dessus.
      </p>
    </section>
  )
}
```

### Section Notifications (Supabase)

```typescript
// src/features/settings/components/NotificationSection.tsx
'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Props {
  userId: string
  initialEnabled?: boolean
}

export function NotificationSection({ userId, initialEnabled = true }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)

  const handleToggle = async (value: boolean) => {
    setEnabled(value)
    await fetch('/api/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ dailySummaryEnabled: value }),
    })
  }

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">Notifications</h2>
      <div className="flex items-center justify-between">
        <Label htmlFor="daily-summary">Résumé quotidien par email</Label>
        <Switch
          id="daily-summary"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </section>
  )
}
```

### API Route pour les préférences

```typescript
// src/app/api/settings/notifications/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { dailySummaryEnabled } = await req.json()
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, daily_summary_enabled: dailySummaryEnabled })

  if (error) return apiError('DB_ERROR', 'Erreur de sauvegarde', 500)
  return apiResponse({ updated: true })
}
```

### Schema Supabase (migration)

```sql
-- supabase/migrations/20250115_user_settings.sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  daily_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (user_id = auth.jwt() ->> 'sub');
```

---

## Dependencies

**Requires :**
- Story 3.1 : Clerk configuré
- Story 1.2 : Supabase configuré

**Blocks :**
- Story 3.6 : Suppression de compte (dans la même page settings)

---

## Definition of Done

- [ ] `src/app/[locale]/(dashboard)/settings/page.tsx` créé
- [ ] `AccountSection`, `NotificationSection`, `BillingSection` créés
- [ ] `PATCH /api/settings/notifications` fonctionnel
- [ ] Migration SQL `user_settings` créée
- [ ] Page accessible uniquement connecté

---

## Testing Strategy

- **Manuel :** Visiter `/fr/settings` connecté → vérifier les sections
- **Manuel :** Toggler la notification → vérifier la persistance (refresh page)
- **Manuel :** Visiter `/fr/settings` déconnecté → vérifier redirect

---

## Dev Agent Record

### Status
Done ✅

### Agent Model Used
claude-sonnet-4-6

### Tasks
- [x] Créer `src/app/[locale]/(dashboard)/settings/page.tsx`
- [x] Créer `AccountSection`, `NotificationSection`, `BillingSection`
- [x] Créer `PATCH /api/settings/notifications`
- [x] Créer migration `user_settings`
- [x] [AI-Review] Corriger race condition + rollback UI dans `NotificationSection.handleToggle`
- [x] [AI-Review] Protéger `req.json()` contre les corps JSON invalides dans l'API route
- [x] [AI-Review] Remplacer `.single()` par `.maybeSingle()` dans la settings page
- [x] [AI-Review] Renforcer les tests de la page (assertions sur props `initialEnabled`)
- [x] [AI-Review] Ajouter protection auth dans le `(dashboard)` layout
- [x] [AI-Review] Ajouter `{ onConflict: 'user_id' }` explicite dans l'upsert
- [x] [AI-Review] Mettre à jour les tests API route (JSON invalide + assertions onConflict)

### Completion Notes
- Utilisation de `createAdminClient()` dans la page et l'API route (le client SSR Supabase n'a pas de JWT Clerk pour le RLS)
- Fetch de la valeur initiale `daily_summary_enabled` dans le Server Component (settings page) pour initialiser le toggle correctement
- Composants UI `Switch` et `Label` créés via `radix-ui` (umbrella package)
- i18n ajouté pour les namespaces `settings.account`, `settings.notifications`, `settings.billing` (fr + en)
- `userId` retiré des props de `NotificationSection` (l'auth est vérifiée dans l'API route)
- **[Code Review]** `NotificationSection.handleToggle` : ajout try/catch avec rollback optimiste si la réponse n'est pas `ok`
- **[Code Review]** API route : `req.json()` enveloppé dans try/catch (400 si JSON invalide)
- **[Code Review]** Settings page : `.single()` → `.maybeSingle()` pour éviter PGRST116 sur nouvel utilisateur
- **[Code Review]** Tests page : assertions sur `initialEnabled` via mock trackable de `NotificationSection`
- **[Code Review]** Dashboard layout : protection auth ajoutée au niveau layout (défense en profondeur)
- **[Code Review]** API upsert : `{ onConflict: 'user_id' }` explicite ; code d'erreur `DB_ERROR` → `INTERNAL_ERROR`

### File List
- `src/components/ui/switch.tsx` (nouveau)
- `src/components/ui/label.tsx` (nouveau)
- `src/features/settings/components/AccountSection.tsx` (nouveau)
- `src/features/settings/components/NotificationSection.tsx` (modifié — rollback handleToggle)
- `src/features/settings/components/BillingSection.tsx` (nouveau)
- `src/app/[locale]/(dashboard)/settings/page.tsx` (modifié — maybeSingle)
- `src/app/[locale]/(dashboard)/layout.tsx` (modifié — auth protection)
- `src/app/api/settings/notifications/route.ts` (modifié — try/catch JSON, onConflict, INTERNAL_ERROR)
- `src/app/api/settings/notifications/__tests__/route.test.ts` (modifié — nouveau test JSON invalide, assertions onConflict)
- `src/app/[locale]/(dashboard)/settings/__tests__/page.test.ts` (modifié — assertions initialEnabled, maybeSingle mock)
- `supabase/migrations/002_user_settings.sql` (nouveau)
- `src/lib/supabase/types.ts` (modifié — ajout `user_settings`)
- `messages/fr.json` (modifié — ajout namespace `settings`)
- `messages/en.json` (modifié — ajout namespace `settings`)

### Debug Log
Aucun.
