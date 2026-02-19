# Story 7.2 : Page Billing avec État Abonnement

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to see my current subscription status and manage my plan from a billing page,
**so that** I can upgrade, cancel, or view my invoices in one place.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/billing` affiche le tier actuel (Gratuit ou Premium)
2. ✅ Si tier gratuit : bouton "Passer au Premium" (5€/mois) + ROI "5h économisées/semaine"
3. ✅ Si tier payant : date de prochain renouvellement + bouton "Gérer l'abonnement" (portail Stripe)
4. ✅ Page protégée (connecté requis)

---

## Technical Notes

### Route

```
src/app/[locale]/(dashboard)/billing/page.tsx
```

### Page (Server Component)

```typescript
// src/app/[locale]/(dashboard)/billing/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpgradeCard } from '@/features/billing/components/UpgradeCard'
import { SubscriptionCard } from '@/features/billing/components/SubscriptionCard'

export default async function BillingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createClient()

  const [{ data: user }, { data: subscription }] = await Promise.all([
    supabase.from('users').select('tier').eq('id', userId).single(),
    supabase
      .from('subscriptions')
      .select('status, current_period_end, stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single(),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Facturation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre abonnement Briefly.
        </p>
      </div>

      {user?.tier === 'paid' && subscription ? (
        <SubscriptionCard
          currentPeriodEnd={subscription.current_period_end}
          subscriptionId={subscription.stripe_subscription_id}
        />
      ) : (
        <UpgradeCard />
      )}
    </div>
  )
}
```

### `UpgradeCard`

```typescript
// src/features/billing/components/UpgradeCard.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckIcon, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'

const PAID_FEATURES = [
  'Newsletters illimitées',
  'Tous les résumés en LLM premium',
  'Catégorisation personnalisée',
  'Support prioritaire',
]

export function UpgradeCard() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Passez au Premium
        </CardTitle>
        <p className="text-2xl font-bold">5€/mois</p>
        <p className="text-sm text-green-700 font-medium">
          💡 5h économisées par semaine >> 5€ par mois
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {PAID_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckIcon className="h-4 w-4 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href="/api/billing/checkout">
            Commencer l&apos;essai Premium
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

### `SubscriptionCard`

```typescript
// src/features/billing/components/SubscriptionCard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  currentPeriodEnd: string | null
  subscriptionId: string
}

export function SubscriptionCard({ currentPeriodEnd }: Props) {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { data } = await res.json()
    if (data?.url) window.location.href = data.url
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Abonnement Premium actif
          </span>
          <Badge className="bg-violet-100 text-violet-700">Premium</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            Prochain renouvellement :{' '}
            {new Date(currentPeriodEnd).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        )}
        <Button variant="outline" onClick={handlePortal} disabled={loading}>
          {loading ? 'Chargement...' : 'Gérer l\'abonnement'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## Dependencies

**Requires :**
- Story 7.1 : Stripe configuré + table `subscriptions`

**Blocks :**
- Story 7.3 : Checkout (bouton depuis cette page)
- Story 7.5 : Annulation (via portail Stripe depuis cette page)

---

## Definition of Done

- [ ] Page `/[locale]/billing` affiche la carte selon le tier
- [ ] `UpgradeCard` avec features et CTA
- [ ] `SubscriptionCard` avec date renouvellement et lien portail Stripe

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(dashboard)/billing/page.tsx`
- [ ] Créer `UpgradeCard` et `SubscriptionCard`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
