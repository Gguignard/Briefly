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

- [x] Routes `/admin/*` protégées par le check de rôle
- [x] `src/app/admin/layout.tsx` créé
- [x] Test : accès à `/admin` sans rôle admin → 403

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Étendre le middleware pour les routes `/admin`
- [x] Créer `src/app/admin/layout.tsx`

### Completion Notes
- Le middleware (`src/middleware.ts`) contenait déjà la protection admin (implémenté dans une story précédente) : `isAdminRoute` matcher, `auth.protect()` pour non-connectés, vérification `role !== 'admin'` → 403. Tests existants couvrent tous les cas (22 tests passent).
- Créé `src/app/[locale]/admin/layout.tsx` avec double vérification : redirection `/sign-in` si non authentifié, redirection `/` si rôle non-admin. Utilise `BrieflyPublicMetadata` pour le typage.
- Créé `src/app/[locale]/admin/page.tsx` comme page d'accueil minimale du dashboard admin.
- Créé 4 tests unitaires pour le layout admin couvrant : non-authentifié → redirect sign-in, utilisateur sans rôle admin → redirect /, metadata vide → redirect /, admin → rendu children.
- Layout placé sous `[locale]/admin/` (et non `admin/` directement) pour cohérence avec le routing i18n du projet.
- 532 tests au total, 0 régression introduite (7 échecs préexistants : Supabase integration tests et tests non liés).

### File List
- `src/app/[locale]/admin/layout.tsx` (nouveau)
- `src/app/[locale]/admin/page.tsx` (nouveau)
- `src/app/[locale]/admin/__tests__/layout.test.tsx` (nouveau)
- `messages/fr.json` (modifié — ajout clés i18n `admin`)
- `messages/en.json` (modifié — ajout clés i18n `admin`)

### Debug Log
Aucun problème rencontré.

### Code Review (AI) — 2026-03-18
**Reviewer :** Claude Opus 4.6

**Issues corrigées (4) :**
- **[H1]** Test `renders children when user is admin` renforcé : assertion `toBeTruthy()` remplacée par `render()` + vérification du header "Briefly Admin" et du contenu children via `@testing-library/react`
- **[M1/L3]** i18n : ajout namespace `admin` dans `messages/fr.json` et `messages/en.json` (clés `title`, `dashboardTitle`, `dashboardWelcome`). Layout utilise `getTranslations('admin')` au lieu de texte en dur
- **[M2]** Suppression du `return null` mort après `redirect()` (2 occurrences dans layout)
- **[M3]** Redirect non-admin corrigé : `redirect('/')` → `redirect('/${locale}')` pour cohérence i18n

**Issues non corrigées (note) :**
- `page.tsx` a été significativement modifié par une story ultérieure (9.2+) — le hardcoded "Dashboard Admin" dans page.tsx est hors scope de cette review
- 543 tests passent, 10 échecs préexistants (Supabase integration, settings, categories API), 0 régression
