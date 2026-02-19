# Story 7.3 : Flow Checkout Stripe → Upgrade

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** free-tier user,
**I want** to upgrade to Premium with a single click via Stripe Checkout,
**so that** I can unlock unlimited newsletters and premium AI summaries immediately after payment.

---

## Acceptance Criteria

1. ✅ `GET /api/billing/checkout` crée une session Stripe Checkout et redirige
2. ✅ Client Stripe existant récupéré ou créé (`stripe_customer_id` persisté)
3. ✅ Après paiement réussi → redirect vers `/billing?success=true`
4. ✅ Annulation checkout → redirect vers `/billing?canceled=true`
5. ✅ Message de confirmation/annulation affiché sur la page billing
6. ✅ L'upgrade est effectif immédiatement via webhook (story 7.4)

---

## Technical Notes

### `GET /api/billing/checkout`

```typescript
// src/app/api/billing/checkout/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { apiError } from '@/lib/utils/apiResponse'
import { redirect } from 'next/navigation'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()

  // Récupérer ou créer le customer Stripe
  const { data: user } = await supabase
    .from('users')
    .select('email, stripe_customer_id, tier')
    .eq('id', userId)
    .single()

  if (user?.tier === 'paid') {
    redirect('/billing?already_subscribed=true')
  }

  let customerId = user?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
      metadata: { userId },
    })
    customerId = customer.id

    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  })

  redirect(session.url!)
}
```

### Message de confirmation sur la page billing

```typescript
// Ajouter dans billing/page.tsx
import { Alert, AlertDescription } from '@/components/ui/alert'

// Dans le JSX (Server Component peut lire searchParams)
interface Props {
  searchParams: { success?: string; canceled?: string }
}

export default async function BillingPage({ searchParams }: Props) {
  // ...
  return (
    <div className="max-w-2xl space-y-6">
      {searchParams.success === 'true' && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            🎉 Bienvenue dans Briefly Premium ! Votre abonnement est actif.
          </AlertDescription>
        </Alert>
      )}
      {searchParams.canceled === 'true' && (
        <Alert>
          <AlertDescription className="text-muted-foreground">
            Abonnement annulé. Vous pouvez vous abonner à tout moment.
          </AlertDescription>
        </Alert>
      )}
      {/* ... reste du contenu */}
    </div>
  )
}
```

### Variable d'environnement supplémentaire

```bash
NEXT_PUBLIC_APP_URL=https://briefly.app  # ou http://localhost:3000 en dev
```

---

## Dependencies

**Requires :**
- Story 7.1 : Stripe configuré (`stripe` client, `STRIPE_PRICE_ID`)
- Story 7.2 : Page billing (redirect après checkout)

**Blocks :**
- Story 7.4 : Webhook Stripe (traite `checkout.session.completed`)

---

## Definition of Done

- [ ] `GET /api/billing/checkout` crée une session et redirige vers Stripe
- [ ] `stripe_customer_id` persisté en base au premier checkout
- [ ] Redirect vers `/billing?success=true` après paiement
- [ ] Messages de feedback sur la page billing

---

## Testing Strategy

- **Manuel (test mode Stripe) :** Cliquer "Passer au Premium" → Stripe Checkout en mode test → carte `4242 4242 4242 4242` → vérifier redirect
- **Manuel :** Vérifier `stripe_customer_id` dans Supabase après checkout
- **Manuel :** Tester l'annulation → message "Abonnement annulé"

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `GET /api/billing/checkout`
- [ ] Logique create-or-get Stripe customer
- [ ] Messages success/canceled dans billing page
- [ ] Ajouter `NEXT_PUBLIC_APP_URL` dans `.env.example`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
