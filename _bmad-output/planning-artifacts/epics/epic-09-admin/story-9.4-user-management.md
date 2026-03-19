# Story 9.4 : Gestion Manuelle des Utilisateurs

**Epic :** Epic 9 - Dashboard Admin & Contrôle Opérationnel
**Priority :** P2 (Medium)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** admin,
**I want** to manually upgrade, downgrade, or suspend users,
**so that** I can handle edge cases like support requests, refunds, or abuse.

---

## Acceptance Criteria

1. ✅ Page `/admin/users` liste les utilisateurs (email, tier, date d'inscription, résumés générés)
2. ✅ Select dropdown tier (free/starter/pro) par utilisateur
3. ✅ Bouton "Suspendre" avec confirmation — bloque le traitement des emails de cet utilisateur
4. ✅ Recherche par email
5. ✅ Pagination (20 users par page)

---

## Technical Notes

### `GET /api/admin/users`

```typescript
// src/app/api/admin/users/route.ts
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function GET(req: Request) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Accès refusé', 403)
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createAdminClient()

  let query = supabase
    .from('users')
    .select('id, email, tier, created_at, summaries(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const { data, count, error } = await query
  if (error) return apiError('DB_ERROR', 'Erreur', 500)

  return apiResponse({ users: data ?? [], total: count ?? 0, page })
}
```

### `POST /api/admin/users/:id/tier`

```typescript
// src/app/api/admin/users/[id]/tier/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Accès refusé', 403)
  }

  const { tier } = await req.json() // 'free' ou 'paid'
  const supabase = createAdminClient()

  await supabase.from('users').update({ tier }).eq('id', params.id)

  const clerk = await clerkClient()
  await clerk.users.updateUser(params.id, {
    publicMetadata: { tier },
  })

  return apiResponse({ updated: true })
}
```

### Page admin users

```typescript
// src/app/admin/users/page.tsx (Server Component simplifié)
import { AdminUsersTable } from '@/features/admin/components/AdminUsersTable'

export default async function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
      <AdminUsersTable />
    </div>
  )
}
```

### Schema — colonne `suspended`

```sql
-- supabase/migrations/20250115_user_suspended.sql
ALTER TABLE users ADD COLUMN suspended BOOLEAN NOT NULL DEFAULT false;
```

Le worker email vérifie `suspended` avant de processer un job :

```typescript
// Dans email.worker.ts
const { data: user } = await supabase
  .from('users')
  .select('tier, suspended')
  .eq('id', userId)
  .single()

if (user?.suspended) {
  logger.info({ userId }, 'User suspended, skipping email processing')
  return
}
```

---

## Dependencies

**Requires :**
- Story 9.1 : Accès admin
- Story 4.4 : Worker email (pour check `suspended`)

**Blocks :**
- Rien

---

## Definition of Done

- [x] `GET /api/admin/users` avec pagination et recherche
- [x] `POST /api/admin/users/:id/tier` pour upgrade/downgrade
- [x] Colonne `suspended` dans `users`
- [x] Page `/admin/users` fonctionnelle

---

## Dev Agent Record

### Status
done

### Agent Model Used
claude-opus-4-6

### Tasks
- [x] Créer `GET /api/admin/users`
- [x] Créer `POST /api/admin/users/[id]/tier`
- [x] Créer `POST /api/admin/users/[id]/suspend`
- [x] Créer migration `suspended` column
- [x] Créer page `/admin/users`
- [x] Créer composant `AdminUsersTable` (client component)
- [x] Ajouter types admin (`AdminUserRow`, `AdminUsersResponse`)
- [x] Ajouter clés i18n `admin.users.*` (en.json, fr.json)
- [x] Ajouter tests API routes (GET, tier, suspend)
- [x] Ajouter tests composant AdminUsersTable
- [x] Mettre à jour types Supabase (colonne `suspended`)

### Completion Notes
- Code review (2026-03-18) : 11 issues trouvées et corrigées (3 Critical, 2 High, 4 Medium, 2 Low)
  - C2: Ajouté vérification `suspended` dans `email.processor.ts` (AC #3 manquant)
  - C3: Corrigé bug metadata Clerk dans tier route (écrasait metadata du user cible avec celles de l'admin)
  - H1: Remplacé fetch de toutes les lignes summaries par Supabase relation count
  - H2: Remplacé boutons tier simples par Select dropdown supportant free/starter/pro
  - M1+L1+L2: Ajouté i18n complet au composant AdminUsersTable + titre page + dates locale-aware
  - M2: Extrait logique partagée dans `admin.service.ts` (DRY entre page SSR et API route)
  - M3: Ajouté toast notifications (sonner) pour feedback succès/erreur
  - M4: Ajouté AlertDialog de confirmation pour suspend/réactivation

### File List
- `src/app/api/admin/users/route.ts` — GET /api/admin/users (pagination, recherche)
- `src/app/api/admin/users/[id]/tier/route.ts` — POST tier upgrade/downgrade
- `src/app/api/admin/users/[id]/suspend/route.ts` — POST toggle suspend
- `src/app/[locale]/admin/users/page.tsx` — Page admin users (SSR)
- `src/features/admin/components/AdminUsersTable.tsx` — Table client component
- `src/features/admin/admin.types.ts` — Types AdminUserRow, AdminUsersResponse
- `src/features/admin/admin.service.ts` — Service partagé fetchAdminUsers
- `src/lib/supabase/types.ts` — Types Supabase mis à jour (colonne suspended)
- `src/workers/email.processor.ts` — Ajout check suspended
- `supabase/migrations/011_user_suspended.sql` — Migration colonne suspended
- `messages/en.json` — Clés i18n admin.users (EN)
- `messages/fr.json` — Clés i18n admin.users (FR)
- `src/app/api/admin/users/__tests__/route.test.ts` — Tests GET route
- `src/app/api/admin/users/[id]/tier/__tests__/route.test.ts` — Tests tier route
- `src/app/api/admin/users/[id]/suspend/__tests__/route.test.ts` — Tests suspend route
- `src/features/admin/components/__tests__/AdminUsersTable.test.tsx` — Tests composant

### Completion Notes (Review 2)
- Code review (2026-03-19) : 9 issues trouvées (3 High, 4 Medium, 2 Low) — 7 corrigées (H+M)
  - H1: Ajouté rollback Supabase si Clerk échoue lors du changement de tier (évite désynchronisation)
  - H2: Ajouté 2 tests pour l'échec Clerk (getUser + updateUser) avec vérification du rollback
  - H3: Ajouté gestion d'erreur (catch + toast.error) dans fetchUsers du composant AdminUsersTable
  - M1: Remplacé messages d'erreur API hardcodés en français par des messages techniques en anglais
  - M2: Réutilisé un seul client Supabase dans email.processor.ts (au lieu de deux instances)
  - M3: Requête unique avec count intégré dans admin.service.ts (élimine race condition count vs data)
  - M4: Ajouté audit logging (logger.info) pour les actions admin (tier change, suspend toggle)
  - L1 (non corrigé): Clés i18n mortes upgradePaid/revertFree/changeTier
  - L2 (non corrigé): Pas de validation UUID sur le paramètre id

### Debug Log
Aucun problème lors de l'implémentation initiale. Code review a identifié et corrigé 11 issues.
