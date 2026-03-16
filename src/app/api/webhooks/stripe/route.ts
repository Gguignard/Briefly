import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { clerkClient } from '@clerk/nextjs/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger, { logError } from '@/lib/utils/logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string
if (!webhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
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
        const clerkId = session.metadata?.clerkId
        if (!clerkId) break

        // Récupérer l'utilisateur pour obtenir l'UUID interne
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkId)
          .single()

        if (!user) {
          logger.warn({ clerkId }, 'User not found for checkout.session.completed')
          break
        }

        const subscriptionId = session.subscription as string
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end

        // Mettre à jour Supabase — subscriptions
        const { error: upsertError } = await supabase.from('subscriptions').upsert(
          {
            user_id: user.id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            status: 'active',
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        )
        if (upsertError) throw new Error(`Supabase upsert failed: ${upsertError.message}`)

        // Mettre à jour le tier utilisateur
        const { error: tierError } = await supabase
          .from('users')
          .update({ tier: 'paid' })
          .eq('clerk_id', clerkId)
        if (tierError) throw new Error(`Supabase tier update failed: ${tierError.message}`)

        // Mettre à jour Clerk publicMetadata
        const clerk = await clerkClient()
        await clerk.users.updateUser(clerkId, {
          publicMetadata: { tier: 'paid' },
        })

        logger.info({ clerkId }, 'User upgraded to paid tier')
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        let clerkId: string | undefined = sub.metadata?.clerkId

        // Fallback : si metadata absente, lookup via stripe_customer_id
        if (!clerkId) {
          const { data: subRow } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', sub.id)
            .single()

          if (subRow) {
            const { data: user } = await supabase
              .from('users')
              .select('clerk_id')
              .eq('id', subRow.user_id)
              .single()
            clerkId = user?.clerk_id
          }
        }

        if (!clerkId) {
          logger.warn({ subscriptionId: sub.id }, 'Cannot resolve clerkId for subscription.deleted')
          break
        }

        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        if (cancelError) throw new Error(`Supabase cancel update failed: ${cancelError.message}`)

        const { error: downgradeError } = await supabase
          .from('users')
          .update({ tier: 'free' })
          .eq('clerk_id', clerkId)
        if (downgradeError) throw new Error(`Supabase downgrade failed: ${downgradeError.message}`)

        const clerk = await clerkClient()
        await clerk.users.updateUser(clerkId, {
          publicMetadata: { tier: 'free' },
        })

        logger.info({ clerkId }, 'User downgraded to free tier')
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        if (updateSubError) throw new Error(`Supabase subscription update failed: ${updateSubError.message}`)

        // Sync tier si le statut implique un changement de tier
        const newTier = sub.status === 'active' ? 'paid' : sub.status === 'canceled' ? 'free' : null
        if (newTier && sub.metadata?.clerkId) {
          const { error: tierError } = await supabase
            .from('users')
            .update({ tier: newTier })
            .eq('clerk_id', sub.metadata.clerkId)
          if (tierError) throw new Error(`Supabase tier sync failed: ${tierError.message}`)

          const clerk = await clerkClient()
          await clerk.users.updateUser(sub.metadata.clerkId, {
            publicMetadata: { tier: newTier },
          })
          logger.info({ clerkId: sub.metadata.clerkId, newTier }, 'Tier synced via subscription.updated')
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        logger.warn(
          { customerId: invoice.customer },
          'Payment failed'
        )
        break
      }
    }
  } catch (err) {
    logError(err as Error, { eventType: event.type })
    return apiError('WEBHOOK_ERROR', 'Erreur de traitement', 500)
  }

  return apiResponse({ received: true })
}
