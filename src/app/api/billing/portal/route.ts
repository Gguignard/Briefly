import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { logError } from '@/lib/utils/logger'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
if (!appUrl) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL environment variable')
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()

  try {
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_id', userId)
      .single()

    if (!user) return apiError('NOT_FOUND', 'Utilisateur introuvable', 404)

    if (!user.stripe_customer_id) {
      return apiError('NO_CUSTOMER', 'Aucun abonnement actif', 400)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    })

    return apiResponse({ url: session.url })
  } catch (error) {
    logError(error as Error, { userId, action: 'billing_portal' })
    return apiError('INTERNAL_ERROR', 'Erreur lors de l\'ouverture du portail', 500)
  }
}
