# Story 3.2 : Protection des Routes et Middleware d'Authentification

**Epic :** Epic 3 - Auth & Account Management
**Priority :** P0
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** developer,
**I want** all dashboard routes to be protected by the Clerk middleware at the Edge,
**so that** unauthenticated users are automatically redirected to `/sign-in` and authenticated users with insufficient roles are blocked before any page logic runs.

---

## Acceptance Criteria

1. ✅ Les routes `/summaries`, `/newsletters`, `/categories`, `/settings`, `/billing` (et sous-routes) redirigent vers `/sign-in?redirect_url=...` si l'utilisateur n'est pas connecté.
2. ✅ Les routes publiques (`/`, `/pricing`, `/legal/*`, `/sign-in/*`, `/sign-up/*`, `/api/webhooks/*`) sont accessibles sans authentification.
3. ✅ Les routes admin (`/(fr|en)/admin/*`) vérifient `publicMetadata.role === 'admin'` et retournent 403 si l'utilisateur n'est pas admin.
4. ✅ Le middleware s'exécute à la couche Edge (aucun `node:` import dans `middleware.ts`).
5. ✅ Le fichier `middleware.ts` est placé à `src/middleware.ts` et exporté avec un `config.matcher` correct.
6. ✅ Les fonctions `isAdmin()`, `isPaid()`, `getRole()`, `getTier()` sont disponibles depuis `src/features/auth/auth.utils.ts`.
7. ✅ Les redirections i18n (`/fr/...`, `/en/...`) sont couvertes par le matcher.

---

## Technical Notes

### Middleware Edge (`src/middleware.ts`)

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/(fr|en)',
  '/(fr|en)/pricing',
  '/(fr|en)/legal/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/(fr|en)/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Routes publiques : laisser passer sans vérification
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Routes protégées : exiger authentification
  const { userId, sessionClaims } = await auth.protect()

  // Routes admin : vérifier le rôle
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Matcher Next.js recommandé pour Clerk :
     * - Exclut _next/static, _next/image, favicon.ico, fichiers publics
     * - Inclut toutes les routes API et pages
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Lecture des métadonnées Clerk dans un Server Component

```typescript
// Exemple dans un RSC dashboard
import { auth, currentUser } from '@clerk/nextjs/server'
import { getTier, isAdmin } from '@/features/auth/auth.utils'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null // middleware garantit déjà l'auth

  const user = await currentUser()
  const tier = getTier(user!)
  const admin = isAdmin(user!)

  return <div>Tier: {tier}</div>
}
```

### Lecture des métadonnées Clerk dans un Route Handler

```typescript
// Exemple dans un Route Handler API
import { auth } from '@clerk/nextjs/server'
import { apiResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return apiResponse({ error: 'Unauthorized' }, 401)
  }

  logger.info({ userId }, 'Authenticated API request')
  // ...
}
```

### Utilitaires Auth (complément à 3.1)

```typescript
// src/features/auth/auth.utils.ts
import { User } from '@clerk/nextjs/server'
import type { BrieflyPublicMetadata, UserTier, UserRole } from './auth.types'

export function getTier(user: User): UserTier {
  const metadata = user.publicMetadata as Partial<BrieflyPublicMetadata>
  return metadata?.tier ?? 'free'
}

export function getRole(user: User): UserRole {
  const metadata = user.publicMetadata as Partial<BrieflyPublicMetadata>
  return metadata?.role ?? 'user'
}

export function isPaid(user: User): boolean {
  const tier = getTier(user)
  return tier === 'starter' || tier === 'pro'
}

export function isAdmin(user: User): boolean {
  return getRole(user) === 'admin'
}
```

### Schéma des redirections

```
GET /(fr|en)/summaries (non authentifié)
  └─► clerkMiddleware → auth.protect()
        └─► Redirect 307 → /sign-in?redirect_url=%2Ffr%2Fsummaries

GET /(fr|en)/admin (authentifié, role: 'user')
  └─► clerkMiddleware → role check
        └─► Response 403 { error: 'Forbidden: admin access required' }

GET /(fr|en)/admin (authentifié, role: 'admin')
  └─► clerkMiddleware → pass
        └─► Page admin renderisée
```

### Pattern d'intégration i18n + Clerk

Si le projet utilise `next-intl` avec un middleware i18n, il faut combiner les deux middlewares :

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

const isPublicRoute = createRouteMatcher([...])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Dependencies

**Requires :**
- Story 3.1 - Clerk installé et `ClerkProvider` configuré

**Blocks :**
- Story 3.3 - Déconnexion (nécessite middleware actif)
- Story 3.4 - Page Paramètres (route dashboard protégée)
- Story 4.x - Toutes les stories Newsletters (routes dashboard)
- Story 5.x - Toutes les stories LLM (routes dashboard + API)
- Story 6.x - Toutes les stories Feed (routes dashboard)
- Story 9.x - Toutes les stories Admin (routes admin)

---

## Definition of Done

- [ ] `src/middleware.ts` créé avec `clerkMiddleware()` et `createRouteMatcher`
- [ ] `config.matcher` exporte le pattern Next.js recommandé
- [ ] Accès à `/summaries` sans auth → redirect vers `/sign-in` vérifié manuellement
- [ ] Accès à `/` sans auth → page accessible (route publique) vérifié manuellement
- [ ] Accès à `/api/webhooks/clerk` sans auth → pas de redirect (route publique) vérifié
- [ ] Accès à `/admin` avec `role: 'user'` → HTTP 403 retourné
- [ ] Accès à `/admin` avec `role: 'admin'` → accès autorisé
- [ ] Aucun import `node:` dans `middleware.ts` (runtime Edge compatible)
- [ ] Les routes i18n `/fr/...` et `/en/...` sont bien couvertes

---

## Testing Strategy

**Tests manuels :**
1. Naviguer vers `/summaries` sans session → vérifier redirect vers `/sign-in?redirect_url=...`
2. Se connecter → vérifier redirect automatique vers `/summaries` (grâce au `redirect_url`)
3. Naviguer vers `/` sans session → page accessible
4. Tester avec curl : `curl -I http://localhost:3000/summaries` → doit retourner 307

**Tests automatisés (middleware) :**
```typescript
// src/__tests__/middleware.test.ts
// Utiliser NextRequest mock de 'next/server'
import { middleware } from '../middleware'

describe('clerkMiddleware', () => {
  it('allows public routes without authentication')
  it('redirects unauthenticated users from dashboard routes')
  it('returns 403 for non-admin users on admin routes')
  it('allows admin users on admin routes')
})
```

---

## References

- [Clerk Middleware Docs](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [createRouteMatcher](https://clerk.com/docs/references/nextjs/create-route-matcher)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [next-intl + Clerk integration](https://next-intl-docs.vercel.app/docs/routing/middleware)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/middleware.ts` avec `clerkMiddleware()`, `isPublicRoute`, `isAdminRoute`
- [ ] Configurer `config.matcher` avec le pattern Next.js recommandé
- [ ] Ajouter la vérification `publicMetadata.role` pour les routes admin
- [ ] Vérifier la compatibilité Edge runtime (aucun import Node.js)
- [ ] Tester manuellement les redirections
- [ ] Vérifier que `src/features/auth/auth.utils.ts` contient toutes les fonctions utilitaires

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
