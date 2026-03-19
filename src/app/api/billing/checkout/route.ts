import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { apiError } from '@/lib/utils/apiResponse'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { logError } from '@/lib/utils/logger'
import { featureFlags } from '@/lib/flags'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL environment variable')
}

export async function GET() {
  if (!featureFlags.premiumEnabled) {
    return apiError('FEATURE_DISABLED', 'Premium subscriptions are temporarily disabled', 503)
  }

  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()

  try {
    // Récupérer l'utilisateur depuis la base
    const { data: user } = await supabase
      .from('users')
      .select('email, stripe_customer_id, tier')
      .eq('clerk_id', userId)
      .single()

    if (!user) return apiError('NOT_FOUND', 'Utilisateur introuvable', 404)

    // Déjà abonné → redirect
    if (user.tier === 'paid') {
      redirect('/billing?already_subscribed=true')
    }

    // Récupérer ou créer le customer Stripe
    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkId: userId },
      })
      customerId = customer.id

      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('clerk_id', userId)

      if (updateError) {
        logError(new Error(`Failed to persist stripe_customer_id: ${updateError.message}`), {
          userId,
          stripeCustomerId: customerId,
          action: 'billing_checkout',
        })
        return apiError('INTERNAL_ERROR', 'Erreur lors de la création du checkout', 500)
      }
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { clerkId: userId },
      subscription_data: {
        metadata: { clerkId: userId },
      },
    })

    if (!session.url) {
      logError(new Error('Stripe checkout session created without URL'), {
        userId,
        sessionId: session.id,
        action: 'billing_checkout',
      })
      return apiError('INTERNAL_ERROR', 'Erreur lors de la création du checkout', 500)
    }

    redirect(session.url)
  } catch (error) {
    // redirect() throws a NEXT_REDIRECT error — re-throw it
    if (isRedirectError(error)) {
      throw error
    }
    logError(error as Error, { userId, action: 'billing_checkout' })
    return apiError('INTERNAL_ERROR', 'Erreur lors de la création du checkout', 500)
  }
}
