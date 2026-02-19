# Story 3.1 : Inscription et Connexion OAuth (Google + Microsoft)

**Epic :** Epic 3 - Auth & Account Management
**Priority :** P0
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** new or returning visitor,
**I want** to sign up and sign in with my Google or Microsoft account in one click,
**so that** I can access Briefly without creating a new password and trust that my account is secure from the start.

---

## Acceptance Criteria

1. ✅ Un bouton "Continuer avec Google" et un bouton "Continuer avec Microsoft" sont affichés sur la page `/sign-in` et `/sign-up`.
2. ✅ Après une première connexion OAuth réussie, un événement `user.created` est déclenché dans Clerk et un webhook `POST /api/webhooks/clerk` est appelé.
3. ✅ Le webhook crée une ligne dans la table `users` Supabase avec `tier: 'free'`, `clerk_id`, `email`, `created_at`.
4. ✅ La signature Svix du webhook est vérifiée ; les requêtes sans signature valide retournent HTTP 400.
5. ✅ Après connexion, l'utilisateur est redirigé vers `/summaries`.
6. ✅ Les variables d'environnement `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` sont documentées dans `.env.example`.
7. ✅ Les pages sign-in et sign-up sont accessibles sans être authentifié (routes publiques dans le middleware).
8. ✅ Un message d'accueil rassurant est présent dans l'apparence Clerk (configuré via Clerk Dashboard > Customization).

---

## Technical Notes

### Installation

```bash
npm install @clerk/nextjs svix
```

### ClerkProvider dans le layout racine

```typescript
// src/app/[locale]/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { frFR, enUS } from '@clerk/localizations'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const localization = params.locale === 'fr' ? frFR : enUS

  return (
    <ClerkProvider localization={localization}>
      {children}
    </ClerkProvider>
  )
}
```

### Page Sign-In

```typescript
// src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/summaries"
      />
    </div>
  )
}
```

### Page Sign-Up

```typescript
// src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/summaries"
      />
    </div>
  )
}
```

### Webhook Handler - Sync Clerk → Supabase

```typescript
// src/app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { apiResponse } from '@/lib/api-response'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('CLERK_WEBHOOK_SECRET not configured')
    return apiResponse({ error: 'Server misconfiguration' }, 500)
  }

  // Vérification Svix
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn('Webhook received without Svix headers')
    return apiResponse({ error: 'Missing Svix headers' }, 400)
  }

  const body = await req.text()
  const wh = new Webhook(webhookSecret)

  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    logger.warn({ err }, 'Invalid Svix webhook signature')
    return apiResponse({ error: 'Invalid signature' }, 400)
  }

  // Traitement des événements
  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses, created_at } = event.data
    const primaryEmail = email_addresses.find(
      (e) => e.id === event.data.primary_email_address_id,
    )?.email_address

    if (!primaryEmail) {
      logger.error({ clerkId }, 'user.created event has no primary email')
      return apiResponse({ error: 'No primary email' }, 400)
    }

    const { error } = await supabaseAdmin.from('users').insert({
      clerk_id: clerkId,
      email: primaryEmail,
      tier: 'free',
      created_at: new Date(created_at).toISOString(),
    })

    if (error) {
      logger.error({ error, clerkId }, 'Failed to insert user in Supabase')
      return apiResponse({ error: 'Database error' }, 500)
    }

    logger.info({ clerkId, email: primaryEmail }, 'User created in Supabase')
  }

  if (event.type === 'user.deleted') {
    const { id: clerkId } = event.data

    // Nettoyage cascade géré par les FK ON DELETE CASCADE
    // Ce handler sert de filet de sécurité si la suppression via API échoue
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)

    if (error) {
      logger.error({ error, clerkId }, 'Failed to delete user from Supabase via webhook')
    } else {
      logger.info({ clerkId }, 'User deleted from Supabase via webhook')
    }
  }

  return apiResponse({ received: true }, 200)
}
```

### Types Auth

```typescript
// src/features/auth/auth.types.ts
export type UserTier = 'free' | 'starter' | 'pro'
export type UserRole = 'user' | 'admin'

export interface BrieflyPublicMetadata {
  tier: UserTier
  role: UserRole
}

export interface BrieflyUser {
  clerkId: string
  email: string
  tier: UserTier
  role: UserRole
  createdAt: Date
}
```

### Utilitaires Auth

```typescript
// src/features/auth/auth.utils.ts
import { currentUser, User } from '@clerk/nextjs/server'
import type { BrieflyPublicMetadata, UserTier, UserRole } from './auth.types'

export function getTier(user: User): UserTier {
  const metadata = user.publicMetadata as BrieflyPublicMetadata
  return metadata?.tier ?? 'free'
}

export function getRole(user: User): UserRole {
  const metadata = user.publicMetadata as BrieflyPublicMetadata
  return metadata?.role ?? 'user'
}

export function isPaid(user: User): boolean {
  const tier = getTier(user)
  return tier === 'starter' || tier === 'pro'
}

export function isAdmin(user: User): boolean {
  return getRole(user) === 'admin'
}

export async function requireUser(): Promise<User> {
  const user = await currentUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}
```

### Variables d'environnement (.env.example)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/summaries
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/summaries
```

### Schema Supabase - Table `users`

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row"
  ON users FOR SELECT
  USING (clerk_id = auth.uid()::text);
```

---

## Dependencies

**Requires :**
- Story 1.1 - Monorepo et toolchain Next.js configurés
- Story 1.2 - Client Supabase et variables d'environnement initialisés

**Blocks :**
- Story 3.2 - Protection des routes (nécessite Clerk installé)

---

## Definition of Done

- [ ] `@clerk/nextjs` et `svix` installés et présents dans `package.json`
- [ ] Pages `/sign-in` et `/sign-up` renderisent les composants Clerk sans erreur
- [ ] La connexion OAuth Google fonctionne en environnement de développement
- [ ] La connexion OAuth Microsoft fonctionne en environnement de développement
- [ ] Le webhook `/api/webhooks/clerk` répond HTTP 200 à un événement `user.created` valide
- [ ] Le webhook rejette avec HTTP 400 toute requête sans signature Svix valide
- [ ] La table `users` Supabase contient une ligne après inscription
- [ ] `.env.example` documenté avec toutes les variables Clerk
- [ ] Logs Pino présents (info pour succès, error pour échecs)
- [ ] Aucun `console.log` dans le code livré

---

## Testing Strategy

**Tests manuels (Clerk Dashboard → Webhooks → Test) :**
1. Envoyer un événement `user.created` synthétique via le dashboard Clerk et vérifier l'insertion Supabase.
2. Envoyer la même requête sans les headers Svix et vérifier HTTP 400.
3. Créer un compte via Google OAuth en dev et vérifier la redirection vers `/summaries`.

**Tests automatisés :**
```typescript
// src/app/api/webhooks/clerk/__tests__/route.test.ts
// Mocker svix.Webhook.verify pour tester les branches succès/échec
// Utiliser @supabase/supabase-js mock pour vérifier l'INSERT

describe('POST /api/webhooks/clerk', () => {
  it('returns 400 when Svix headers are missing')
  it('returns 400 when signature is invalid')
  it('inserts user in Supabase on user.created event')
  it('returns 500 when Supabase insert fails')
})
```

---

## References

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [Clerk Localizations](https://clerk.com/docs/components/customization/localization)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Installer `@clerk/nextjs` et `svix`
- [ ] Configurer `ClerkProvider` dans `src/app/[locale]/layout.tsx`
- [ ] Créer `src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx`
- [ ] Créer `src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx`
- [ ] Créer `src/app/api/webhooks/clerk/route.ts` avec vérification Svix
- [ ] Créer `src/features/auth/auth.types.ts`
- [ ] Créer `src/features/auth/auth.utils.ts`
- [ ] Mettre à jour `.env.example` avec toutes les variables Clerk
- [ ] Configurer les providers OAuth dans le Clerk Dashboard
- [ ] Configurer l'URL du webhook dans le Clerk Dashboard
- [ ] Tester le webhook avec un événement synthétique

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
