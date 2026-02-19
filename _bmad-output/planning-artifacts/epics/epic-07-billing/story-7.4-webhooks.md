# Story 7.4 : Webhooks Stripe → Sync Tier

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** Stripe webhooks to automatically synchronize subscription status with Clerk and Supabase,
**so that** user tier upgrades and cancellations are reflected in real-time without manual intervention.

---

## Acceptance Criteria

1. ✅ `POST /api/webhooks/stripe` reçoit et valide les événements Stripe (signature HMAC)
2. ✅ `checkout.session.completed` → tier = 'paid' dans Clerk + Supabase
3. ✅ `customer.subscription.deleted` → tier = 'free' dans Clerk + Supabase
4. ✅ `customer.subscription.updated` → mise à jour du statut et `current_period_end`
5. ✅ `invoice.payment_failed` → log warning + (optionnel) email utilisateur
6. ✅ Idempotence : double-traitement d'un même event → pas d'erreur

---

## Technical Notes

### `POST /api/webhooks/stripe`

```typescript
// src/app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { clerkClient } from '@clerk/nextjs/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger, { logError } from '@/lib/utils/logger'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    logger.warn({ err }, 'Invalid Stripe webhook signature')
    return apiError('INVALID_SIGNATURE', 'Signature invalide', 400)
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const subscriptionId = session.subscription as string
        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        // Mettre à jour Supabase
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          status: 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        await supabase.from('users').update({ tier: 'paid' }).eq('id', userId)

        // Mettre à jour Clerk publicMetadata
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
          publicMetadata: { tier: 'paid' },
        })

        logger.info({ userId }, 'User upgraded to paid tier')
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        await supabase.from('users').update({ tier: 'free' }).eq('id', userId)

        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
          publicMetadata: { tier: 'free' },
        })

        logger.info({ userId }, 'User downgraded to free tier')
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        logger.warn({ customerId: invoice.customer }, 'Payment failed')
        break
      }
    }
  } catch (err) {
    logError(err as Error, { eventType: event.type })
    return apiError('WEBHOOK_ERROR', 'Erreur de traitement', 500)
  }

  return apiResponse({ received: true })
}
```

### Désactiver le body parsing Next.js (requis pour la vérification de signature Stripe)

```typescript
// Pas de config nécessaire en App Router — le body est lu via req.text()
// En Pages Router uniquement, il faut `export const config = { api: { bodyParser: false } }`
```

---

## Dependencies

**Requires :**
- Story 7.1 : Stripe configuré + `stripe` client
- Story 7.3 : Checkout (crée les sessions avec `userId` dans metadata)

**Blocks :**
- Story 7.5 : Annulation (dépend du tier synchronisé)
- Story 5.3 : Dual-tier LLM (lit `users.tier`)

---

## Definition of Done

- [ ] `POST /api/webhooks/stripe` créé avec validation signature
- [ ] `checkout.session.completed` → tier 'paid' dans Supabase + Clerk
- [ ] `customer.subscription.deleted` → tier 'free' dans Supabase + Clerk
- [ ] Test avec `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Testing Strategy

- **Manuel :** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Manuel :** Compléter un checkout test → vérifier tier 'paid' dans Supabase et Clerk
- **Manuel :** Annuler via portail Stripe → vérifier tier 'free'

---

## References

- [Stripe Webhooks Node.js](https://stripe.com/docs/webhooks/quickstart)
- [Stripe CLI testing](https://stripe.com/docs/stripe-cli/webhooks)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `POST /api/webhooks/stripe`
- [ ] Handlers pour les 4 événements Stripe
- [ ] Sync Supabase + Clerk

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
