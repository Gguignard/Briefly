# Story 3.6 : Suppression de Compte (RGPD)

**Epic :** Epic 3 - Authentification & Gestion de Compte
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to permanently delete my account and all associated data,
**so that** I can exercise my GDPR right to erasure and leave the platform without any trace.

---

## Acceptance Criteria

1. ✅ Bouton "Supprimer mon compte" dans Settings → zone de danger
2. ✅ Dialog de confirmation avec texte explicite sur l'irréversibilité
3. ✅ Après confirmation : suppression de toutes les données Supabase + compte Clerk
4. ✅ Annulation de l'abonnement Stripe actif si présent (via webhook ou API Stripe)
5. ✅ Redirect vers la landing page après suppression avec message de confirmation
6. ✅ L'opération est idempotente (pas d'erreur si données déjà supprimées)

---

## Technical Notes

### API Route de suppression

```typescript
// src/app/api/account/delete/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { logError } from '@/lib/utils/logger'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()

  try {
    // 1. Annuler l'abonnement Stripe si actif
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
    }

    // 2. Supprimer toutes les données Supabase (RLS + CASCADE)
    await supabase.from('user_settings').delete().eq('user_id', userId)
    await supabase.from('summaries').delete().eq('user_id', userId)
    await supabase.from('newsletters').delete().eq('user_id', userId)
    await supabase.from('subscriptions').delete().eq('user_id', userId)

    // 3. Supprimer le compte Clerk
    const client = await clerkClient()
    await client.users.deleteUser(userId)

    return apiResponse({ deleted: true })
  } catch (error) {
    logError(error as Error, { userId, action: 'account_deletion' })
    return apiError('DELETION_FAILED', 'Erreur lors de la suppression', 500)
  }
}
```

### Composant Dialog de confirmation

```typescript
// src/features/settings/components/DeleteAccountDialog.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteAccountDialog() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const locale = useLocale()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' })
      if (response.ok) {
        router.push(`/${locale}?deleted=true`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est <strong>irréversible</strong>. Toutes vos données seront
            supprimées : newsletters, résumés, paramètres et abonnement.
            <br /><br />
            Votre abonnement payant sera annulé immédiatement sans remboursement au
            prorata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Suppression...' : 'Oui, supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Zone de danger dans Settings

```typescript
// Ajouter dans settings/page.tsx
import { DeleteAccountDialog } from '@/features/settings/components/DeleteAccountDialog'

// Section "Zone de danger"
<section className="border border-destructive/50 rounded-lg p-6 space-y-4">
  <h2 className="text-lg font-medium text-destructive">Zone de danger</h2>
  <p className="text-sm text-muted-foreground">
    La suppression de votre compte est définitive et irréversible.
  </p>
  <DeleteAccountDialog />
</section>
```

---

## Dependencies

**Requires :**
- Story 3.4 : Page Settings
- Story 3.1 : Clerk configuré
- Story 7.1 : Stripe configuré (pour annulation abonnement)

**Blocks :**
- Conformité RGPD droit à l'effacement

---

## Definition of Done

- [ ] `DELETE /api/account/delete` supprime données Supabase + compte Clerk
- [ ] Abonnement Stripe annulé si actif
- [ ] `DeleteAccountDialog` avec confirmation AlertDialog
- [ ] Redirect vers landing page après suppression
- [ ] Test : compte supprimé → accès à `/summaries` impossible

---

## Testing Strategy

- **Manuel :** Settings → "Supprimer mon compte" → confirmer → vérifier redirect
- **Manuel :** Vérifier dans Clerk Dashboard que le compte est supprimé
- **Manuel :** Vérifier dans Supabase que les données sont supprimées
- **Manuel :** `DELETE /api/account/delete` sans auth → 401

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `DELETE /api/account/delete`
- [ ] Créer `DeleteAccountDialog` component
- [ ] Intégrer dans settings page (zone de danger)
- [ ] Tester le flux complet

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
