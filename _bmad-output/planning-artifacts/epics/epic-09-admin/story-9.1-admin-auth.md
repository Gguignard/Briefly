# Story 9.1 : Accès Admin Sécurisé (Rôle Clerk)

**Epic :** Epic 9 - Dashboard Admin & Contrôle Opérationnel
**Priority :** P2 (Medium)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** developer/operator,
**I want** admin routes protected by a Clerk `role: 'admin'` check,
**so that** only authorized operators can access the administration dashboard.

---

## Acceptance Criteria

1. ✅ Toutes les routes `/admin/*` redirigent vers `/sign-in` si non connecté
2. ✅ 403 retourné si connecté mais `publicMetadata.role !== 'admin'`
3. ✅ Rôle `admin` assigné manuellement via Clerk Dashboard (`publicMetadata: { role: 'admin' }`)
4. ✅ Middleware vérifie le rôle sur toutes les routes `/admin/*`

---

## Technical Notes

### Vérification du rôle dans le middleware

```typescript
// Extension de src/middleware.ts (story 1.5)
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId) redirect('/sign-in')
    if (sessionClaims?.metadata?.role !== 'admin') {
      return new Response('Forbidden', { status: 403 })
    }
  }

  if (!isPublicRoute(req)) await auth.protect()
  return intlMiddleware(req)
})
```

### Layout admin

```typescript
// src/app/admin/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background px-6 py-3">
        <p className="text-sm font-medium">Briefly Admin</p>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

### Assigner le rôle admin (manuel)

Dans le Clerk Dashboard :
1. Aller sur l'utilisateur → Edit user
2. Public metadata → `{ "role": "admin", "tier": "paid" }`

---

## Dependencies

**Requires :**
- Story 3.1 : Clerk configuré
- Story 1.5 : Middleware

**Blocks :**
- Stories 9.2-9.5 (tout le dashboard admin)

---

## Definition of Done

- [ ] Routes `/admin/*` protégées par le check de rôle
- [ ] `src/app/admin/layout.tsx` créé
- [ ] Test : accès à `/admin` sans rôle admin → 403

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Étendre le middleware pour les routes `/admin`
- [ ] Créer `src/app/admin/layout.tsx`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
