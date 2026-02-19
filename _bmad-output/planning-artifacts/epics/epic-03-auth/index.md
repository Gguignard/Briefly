# Epic 3 - Authentication & User Account

**Project :** Briefly
**Epic :** Epic 3 - Auth & Account Management
**Status :** Not Started

---

## Overview

Epic 3 covers the full authentication lifecycle and user account management for Briefly. It relies on **Clerk** as the identity provider (OAuth via Google and Microsoft), with a **Supabase** `users` table as the application-level data store. It also satisfies French/EU RGPD obligations (data export Art. 20, account deletion Art. 17).

All authenticated pages live under the `(dashboard)` route group; all Clerk-hosted UI pages live under the `(auth)` route group.

---

## Stories

| Story | Title | Priority | Complexity | Effort | Status |
|-------|-------|----------|------------|--------|--------|
| [3.1](./story-3.1-oauth-signup.md) | Inscription et Connexion OAuth (Google + Microsoft) | P0 | Medium (3 pts) | 1 day | Not Started |
| [3.2](./story-3.2-route-protection.md) | Protection des Routes et Middleware d'Authentification | P0 | Low (2 pts) | 0.5 day | Not Started |
| [3.3](./story-3.3-logout.md) | Déconnexion et Gestion de Session | P0 | Low (1 pt) | 0.25 day | Not Started |
| [3.4](./story-3.4-account-settings.md) | Page des Paramètres de Compte | P1 | Low (2 pts) | 0.5 day | Not Started |
| [3.5](./story-3.5-data-export.md) | Export des Données Utilisateur (RGPD Art. 20) | P1 | Medium (2 pts) | 0.5 day | Not Started |
| [3.6](./story-3.6-account-deletion.md) | Suppression de Compte (RGPD Art. 17) | P1 | Medium (3 pts) | 1 day | Not Started |

**Total estimated effort :** 3.75 days

---

## Architecture Decisions

### Identity Provider : Clerk

- OAuth providers configured in Clerk Dashboard (Google, Microsoft)
- Clerk issues a JWT consumed by the Next.js Edge middleware via `clerkMiddleware()`
- `publicMetadata.tier` : `'free' | 'starter' | 'pro'`
- `publicMetadata.role` : `'user' | 'admin'`

### Database sync : Webhook Clerk → Supabase

```
Clerk event: user.created
  └─► POST /api/webhooks/clerk
        └─► INSERT INTO users (clerk_id, email, tier, created_at)
```

Signature verified with **Svix** (`svix` npm package).

### Route groups

```
src/app/[locale]/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
└── (dashboard)/
    ├── summaries/
    ├── newsletters/
    ├── categories/
    ├── settings/
    └── billing/
```

### Utility functions (`src/features/auth/auth.utils.ts`)

```typescript
isAdmin(user): boolean
isPaid(user): boolean
getRole(user): 'user' | 'admin'
getTier(user): 'free' | 'starter' | 'pro'
```

---

## Key Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/summaries
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/summaries

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Dependencies

**Requires (upstream) :**
- Epic 1 - Foundations (monorepo, toolchain, Supabase schema)
- Story 1.2 - Supabase client setup

**Blocks (downstream) :**
- Epic 4 - Newsletters (needs authenticated user)
- Epic 5 - LLM Summaries (needs authenticated user)
- Epic 6 - Feed (needs authenticated user)
- Epic 7 - Billing (needs tier in metadata)
- Epic 9 - Admin (needs role check)

---

## RGPD Compliance Summary

| Article | Story | Implementation |
|---------|-------|----------------|
| Art. 20 - Portabilité | 3.5 | GET /api/user/export → JSON download |
| Art. 17 - Droit à l'effacement | 3.6 | DELETE /api/user/delete → cascade Supabase + deleteUser Clerk |
