# Story 7.1 : Configuration Stripe & Produits

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** developer,
**I want** Stripe configured with the correct products, prices, and customer management,
**so that** the billing system can process subscriptions end-to-end.

---

## Acceptance Criteria

1. ✅ Stripe SDK installé (`stripe` serveur + `@stripe/stripe-js` client)
2. ⬜ Produit "Briefly Premium" créé dans Stripe (5€/mois) — _action manuelle utilisateur_
3. ✅ Colonne `stripe_customer_id` créée dans Supabase — _le stockage runtime sera implémenté dans Story 7.3 (Checkout)_
4. ✅ Table `subscriptions` créée dans Supabase
5. ✅ `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` dans `.env.example`
6. ✅ Stripe client (server) exporté depuis `src/lib/stripe/index.ts`

---

## Technical Notes

### Installation

```bash
npm install stripe @stripe/stripe-js
```

### `src/lib/stripe/index.ts`

```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
  throw new Error('Missing STRIPE_PREMIUM_PRICE_ID environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
})

export const STRIPE_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID
```

### Schema Supabase

```sql
-- supabase/migrations/20250115_subscriptions.sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');
```

### Variables d'environnement

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx  # ID du prix créé dans le dashboard Stripe
```

### Configuration manuelle dans Stripe Dashboard

1. Créer un produit "Briefly Premium"
2. Créer un prix récurrent : 5€/mois
3. Copier le `price_id` dans `.env.local`
4. Configurer le webhook endpoint : `https://briefly.app/api/webhooks/stripe`
   - Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Dependencies

**Requires :**
- Story 1.2 : Supabase configuré

**Blocks :**
- Story 7.3 : Checkout (utilise `stripe` client + `STRIPE_PRICE_ID`)
- Story 7.4 : Webhooks (utilise `STRIPE_WEBHOOK_SECRET`)

---

## Definition of Done

- [x] `stripe` et `@stripe/stripe-js` installés
- [x] `src/lib/stripe.ts` créé
- [x] Migration `subscriptions` et `stripe_customer_id` créée
- [x] Variables dans `.env.example`
- [ ] Produit Stripe créé manuellement et `STRIPE_PREMIUM_PRICE_ID` configuré

---

## Dev Agent Record

### Status
in-progress

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Installer `stripe` et `@stripe/stripe-js`
- [x] Créer `src/lib/stripe.ts`
- [x] Créer migration Supabase (`subscriptions` + `stripe_customer_id`)
- [x] Documenter la configuration manuelle Stripe dans `.env.example`

### Completion Notes
- `stripe@20.4.1` et `@stripe/stripe-js@8.9.0` installés via pnpm
- Module Stripe créé dans `src/lib/stripe/index.ts` (pattern dossier cohérent avec `src/lib/supabase/`)
- API version mise à jour vers `2026-02-25.clover` (version par défaut du SDK v20, au lieu de `2024-12-18.acacia` spécifiée dans la story)
- Migration `009_subscriptions.sql` : `stripe_customer_id` sur `users` + table `subscriptions` avec RLS
- Type `user_id` corrigé en UUID (la story indiquait TEXT mais `users.id` est UUID)
- Pattern RLS aligné avec l'existant (`current_setting('request.jwt.claims')` au lieu de `auth.jwt()`)
- Variables Stripe ajoutées dans `.env.example` avec section dédiée
- `STRIPE_WEBHOOK_SECRET` déplacé de la section Email vers la nouvelle section Stripe
- 2 tests unitaires ajoutés et passent à 100%
- Suite complète : 388 PASS, 8 FAIL préexistants (intégration Supabase + UI, aucun lié à ces changements)
- DoD item restant : création manuelle du produit dans le Stripe Dashboard (action utilisateur)

### File List
- `package.json` (modifié — ajout stripe, @stripe/stripe-js)
- `pnpm-lock.yaml` (modifié — lockfile)
- `src/lib/stripe/index.ts` (nouveau — client Stripe + export STRIPE_PRICE_ID)
- `src/lib/stripe/__tests__/stripe.test.ts` (nouveau — 4 tests unitaires)
- `supabase/migrations/009_subscriptions.sql` (nouveau — table subscriptions + stripe_customer_id)
- `.env.example` (modifié — section Stripe ajoutée)

### Debug Log
Aucun problème rencontré.

### Change Log
- 2026-03-15 : Implémentation complète Story 7.1 — Configuration Stripe & Produits
- 2026-03-15 : Code review — Ajout validation env vars, index DB manquants, tests erreurs, correction ACs story
