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
2. ✅ Produit "Briefly Premium" créé dans Stripe (5€/mois)
3. ✅ `stripe_customer_id` stocké dans Supabase lors du premier checkout
4. ✅ Table `subscriptions` créée dans Supabase
5. ✅ `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` dans `.env.example`
6. ✅ Stripe client (server) exporté depuis `src/lib/stripe.ts`

---

## Technical Notes

### Installation

```bash
npm install stripe @stripe/stripe-js
```

### `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const STRIPE_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID!
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

- [ ] `stripe` et `@stripe/stripe-js` installés
- [ ] `src/lib/stripe.ts` créé
- [ ] Migration `subscriptions` et `stripe_customer_id` créée
- [ ] Variables dans `.env.example`
- [ ] Produit Stripe créé manuellement et `STRIPE_PREMIUM_PRICE_ID` configuré

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Installer `stripe` et `@stripe/stripe-js`
- [ ] Créer `src/lib/stripe.ts`
- [ ] Créer migration Supabase (`subscriptions` + `stripe_customer_id`)
- [ ] Documenter la configuration manuelle Stripe dans `.env.example`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
