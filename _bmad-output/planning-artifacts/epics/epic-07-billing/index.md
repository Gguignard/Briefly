# Epic 7 : Abonnement & Monétisation Freemium

**Epic ID :** epic-07-billing
**Priority :** P0 (Critical)
**Domain :** Payments, Subscriptions

---

## Objectif

Implémenter le système freemium avec Stripe : page billing, checkout Stripe, webhooks pour synchroniser l'état de l'abonnement, et mise à jour du tier utilisateur dans Clerk + Supabase.

---

## Stories

| Story | Titre | Priority | Complexity | Effort |
|-------|-------|----------|------------|--------|
| [7.1](./story-7.1-stripe-setup.md) | Configuration Stripe & produits | P0 | Medium (3 pts) | 1 day |
| [7.2](./story-7.2-billing-page.md) | Page Billing avec état abonnement | P0 | Low (2 pts) | 0.5 day |
| [7.3](./story-7.3-checkout.md) | Flow Checkout Stripe → upgrade | P0 | Medium (3 pts) | 1 day |
| [7.4](./story-7.4-webhooks.md) | Webhooks Stripe → sync tier | P0 | Medium (3 pts) | 1 day |
| [7.5](./story-7.5-cancel.md) | Annulation abonnement (portail Stripe) | P1 | Low (1 pt) | 0.25 day |

**Total :** 12 pts, ~3.75 days

---

## FRs couverts

- FR41 : Page billing avec état abonnement actuel
- FR42 : Bouton "Passer au Premium" → Stripe Checkout
- FR43 : Stripe webhook `checkout.session.completed` → tier = 'paid'
- FR44 : Stripe webhook `customer.subscription.deleted` → tier = 'free'
- FR45 : Factures téléchargeables (portail Stripe)
- FR46 : Annulation via portail Stripe
- FR47 : Mise à jour `publicMetadata.tier` dans Clerk
- FR48 : Mise à jour `users.tier` dans Supabase
- FR49 : Idempotence des webhooks (éviter double-traitement)
