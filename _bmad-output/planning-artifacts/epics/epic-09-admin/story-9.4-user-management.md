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
2. ✅ Bouton "Passer en paid" / "Revenir en free" par utilisateur
3. ✅ Bouton "Suspendre" — bloque le traitement des emails de cet utilisateur
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

- [ ] `GET /api/admin/users` avec pagination et recherche
- [ ] `POST /api/admin/users/:id/tier` pour upgrade/downgrade
- [ ] Colonne `suspended` dans `users`
- [ ] Page `/admin/users` fonctionnelle

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `GET /api/admin/users`
- [ ] Créer `POST /api/admin/users/[id]/tier`
- [ ] Créer migration `suspended` column
- [ ] Créer page `/admin/users`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
