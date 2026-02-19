# Story 7.5 : Annulation Abonnement (Portail Stripe)

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** paid user,
**I want** to cancel my subscription through a self-service portal,
**so that** I can stop being charged without having to contact support.

---

## Acceptance Criteria

1. ✅ Bouton "Gérer l'abonnement" dans la page billing → portail Stripe
2. ✅ `POST /api/billing/portal` crée une session portail Stripe et retourne l'URL
3. ✅ Le portail Stripe permet : voir les factures, annuler l'abonnement
4. ✅ Après annulation → webhook `customer.subscription.deleted` → tier revient à 'free' (story 7.4)

---

## Technical Notes

### `POST /api/billing/portal`

```typescript
// src/app/api/billing/portal/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (!user?.stripe_customer_id) {
    return apiError('NO_CUSTOMER', 'Aucun abonnement actif', 400)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  return apiResponse({ url: session.url })
}
```

### Configuration du portail dans Stripe Dashboard

Activer manuellement dans Stripe → Billing → Customer Portal :
- Permettre l'annulation des abonnements
- Permettre la consultation des factures
- URL de retour : `https://briefly.app/billing`

---

## Dependencies

**Requires :**
- Story 7.1 : `stripe_customer_id` en base
- Story 7.2 : Bouton "Gérer l'abonnement" dans `SubscriptionCard`
- Story 7.4 : Webhook pour traiter l'annulation

**Blocks :**
- Rien

---

## Definition of Done

- [ ] `POST /api/billing/portal` créé
- [ ] Bouton dans `SubscriptionCard` appelle l'API et redirige vers le portail
- [ ] Test : accéder au portail → annuler → vérifier downgrade via webhook

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `POST /api/billing/portal`
- [ ] Configurer le portail Stripe dans le dashboard (manuel)

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
