# Story 4.1 : Adresse Email Dédiée par Utilisateur

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** authenticated user,
**I want** a unique dedicated email address (`{uuid}@mail.briefly.app`) automatically generated for my account,
**so that** I can forward my newsletters to Briefly without sharing my personal inbox.

---

## Acceptance Criteria

1. ✅ Adresse `{uuid}@mail.briefly.app` générée lors de la création du compte (webhook Clerk)
2. ✅ UUID stable dans le temps (non régénéré à chaque connexion)
3. ✅ Adresse stockée dans la table `users` Supabase
4. ✅ Adresse visible dans le dashboard (page newsletters ou settings)
5. ✅ Bouton "Copier" pour copier l'adresse dans le presse-papier
6. ✅ Route Cloudflare configurée pour router `*@mail.briefly.app` vers le webhook

---

## Technical Notes

### Schema Supabase

```sql
-- supabase/migrations/20250115_users.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- = Clerk userId
  email TEXT NOT NULL,              -- email principal Clerk
  inbox_address TEXT UNIQUE NOT NULL, -- {uuid}@mail.briefly.app
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (id = auth.jwt() ->> 'sub');
```

### Webhook Clerk `user.created`

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger from '@/lib/utils/logger'

export async function POST(req: Request) {
  const body = await req.text()
  const svixId = req.headers.get('svix-id') ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
  const svixSignature = req.headers.get('svix-signature') ?? ''

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: any

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return apiError('INVALID_SIGNATURE', 'Signature invalide', 400)
  }

  if (event.type === 'user.created') {
    const { id, email_addresses } = event.data
    const email = email_addresses[0]?.email_address
    const inboxAddress = `${crypto.randomUUID()}@mail.briefly.app`

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('users')
      .insert({ id, email, inbox_address: inboxAddress })

    if (error) {
      logger.error({ err: error, userId: id }, 'Failed to create user record')
      return apiError('DB_ERROR', 'Erreur de création', 500)
    }

    logger.info({ userId: id, inboxAddress }, 'User created with inbox address')
  }

  return apiResponse({ received: true })
}
```

### Client Supabase Admin (service role)

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypass RLS
    { auth: { persistSession: false } }
  )
}
```

### Composant affichage adresse inbox

```typescript
// src/features/newsletters/components/InboxAddressCard.tsx
'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  inboxAddress: string
}

export function InboxAddressCard({ inboxAddress }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inboxAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Votre adresse de forwarding</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
          <code className="flex-1 text-sm font-mono truncate">{inboxAddress}</code>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Transférez vos newsletters vers cette adresse pour les recevoir dans Briefly.
        </p>
      </CardContent>
    </Card>
  )
}
```

### Variables d'environnement

```bash
# .env.local
CLERK_WEBHOOK_SECRET=whsec_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Admin key (bypass RLS)
```

---

## Dependencies

**Requires :**
- Story 1.2 : Supabase configuré
- Story 3.1 : Clerk configuré (webhooks activés)

**Blocks :**
- Story 4.3 : Webhook email (utilise la table `users.inbox_address`)
- Story 4.6 : Liste newsletters (affiche `InboxAddressCard`)

---

## Definition of Done

- [ ] Migration SQL `users` créée
- [ ] Webhook `POST /api/webhooks/clerk` créé et sécurisé avec svix
- [ ] Création utilisateur → enregistrement Supabase avec `inbox_address` unique
- [ ] `InboxAddressCard` composant créé
- [ ] Test : créer un compte → vérifier `users` table dans Supabase

---

## Testing Strategy

- **Manuel :** Créer un compte Clerk → vérifier `users` dans Supabase avec `inbox_address`
- **Manuel :** Afficher la page newsletters → voir `InboxAddressCard` avec adresse
- **Manuel :** Cliquer "Copier" → vérifier le presse-papier

---

## References

- [Clerk Webhooks docs](https://clerk.com/docs/users/sync-data-to-your-backend)
- [Svix webhook verification](https://docs.svix.com/receiving/verifying-payloads/how)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer migration `users` table → ajout colonne `inbox_address` (migration 003)
- [x] Mettre à jour `POST /api/webhooks/clerk` → génère `inbox_address` via `crypto.randomUUID()`
- [x] `src/lib/supabase/admin.ts` → déjà existant, aucun changement nécessaire
- [x] Créer `InboxAddressCard` component → `src/features/newsletters/components/InboxAddressCard.tsx`
- [x] Mettre à jour types Supabase (`types.ts`) → ajout `inbox_address` au type `users`
- [x] Ajouter traductions i18n (fr/en) pour `newsletters.inbox`
- [x] Tests webhook mis à jour (vérifie `inbox_address` pattern UUID)
- [x] Tests InboxAddressCard créés (5 tests : rendu, titre, bouton copier, clipboard + feedback visuel, erreur clipboard)

### Completion Notes
- Migration `003_inbox_address.sql` : ajoute `inbox_address TEXT UNIQUE NOT NULL` à `users`, génère des adresses pour les utilisateurs existants
- Webhook `user.created` : génère `{uuid}@mail.briefly.app` automatiquement à la création du compte
- `InboxAddressCard` : composant client avec bouton copier, i18n via `useTranslations('newsletters.inbox')`, suit le pattern section existant (`bg-card border...`)
- Tous les tests Story 4.1 passent (13/13).

### File List
- `supabase/migrations/003_inbox_address.sql` (nouveau)
- `src/app/api/webhooks/clerk/route.ts` (modifié)
- `src/app/api/webhooks/clerk/__tests__/route.test.ts` (modifié)
- `src/lib/supabase/types.ts` (modifié)
- `src/features/newsletters/components/InboxAddressCard.tsx` (nouveau)
- `src/features/newsletters/components/__tests__/InboxAddressCard.test.tsx` (nouveau)
- `src/features/newsletters/index.ts` (nouveau)
- `src/app/[locale]/(dashboard)/newsletters/page.tsx` (nouveau)
- `messages/fr.json` (modifié)
- `messages/en.json` (modifié)

### Change Log
- 2026-03-01 : Code review corrections (Claude Opus 4.6)
  - [H1] Créé page `/newsletters` qui monte `InboxAddressCard` avec fetch `inbox_address` depuis Supabase
  - [H2] Remplacé `createClient()` inline par `createAdminClient()` dans webhook route (type-safety + cohérence)
  - [M1] Ajouté try/catch sur `navigator.clipboard.writeText()` pour gérer les erreurs gracieusement
  - [M2] Créé barrel export `src/features/newsletters/index.ts`
  - [M3] Ajouté test `user.deleted` avec erreur DB (webhook)
  - [M4] Ajouté test feedback visuel copié + test erreur clipboard (InboxAddressCard)
  - Mock webhook test mis à jour : `@supabase/supabase-js` → `@/lib/supabase/admin`

### Debug Log
- Fix mock clipboard dans test : `Object.assign(navigator, ...)` échoue en happy-dom → remplacé par `Object.defineProperty` avec `configurable: true`
