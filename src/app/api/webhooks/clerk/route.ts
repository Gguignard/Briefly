import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import logger from '@/lib/utils/logger'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('CLERK_WEBHOOK_SECRET not configured')
    return apiError('SERVER_MISCONFIGURATION', 'Server misconfiguration', 500)
  }

  // Vérification Svix
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn('Webhook received without Svix headers')
    return apiError('MISSING_HEADERS', 'Missing Svix headers', 400)
  }

  const body = await req.text()
  const wh = new Webhook(webhookSecret)

  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    logger.warn({ err }, 'Invalid Svix webhook signature')
    return apiError('INVALID_SIGNATURE', 'Invalid signature', 400)
  }

  // Traitement des événements
  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses, created_at } = event.data
    const primaryEmail = email_addresses.find(
      (e) => e.id === event.data.primary_email_address_id,
    )?.email_address

    if (!primaryEmail) {
      logger.error({ clerkId }, 'user.created event has no primary email')
      return apiError('NO_PRIMARY_EMAIL', 'No primary email', 400)
    }

    const { error } = await supabaseAdmin.from('users').insert({
      clerk_id: clerkId,
      email: primaryEmail,
      tier: 'free',
      created_at: new Date(created_at).toISOString(),
    })

    if (error) {
      logger.error({ error, clerkId }, 'Failed to insert user in Supabase')
      return apiError('DATABASE_ERROR', 'Database error', 500)
    }

    logger.info({ clerkId, email: primaryEmail }, 'User created in Supabase')
  }

  if (event.type === 'user.deleted') {
    const { id: clerkId } = event.data

    if (!clerkId) {
      logger.error('user.deleted event has no user id')
      return apiError('NO_USER_ID', 'No user id in event', 400)
    }

    // Nettoyage cascade géré par les FK ON DELETE CASCADE
    // Ce handler sert de filet de sécurité si la suppression via API échoue
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)

    if (error) {
      logger.error({ error, clerkId }, 'Failed to delete user from Supabase via webhook')
      // Return error to trigger Clerk retry mechanism
      return apiError('DATABASE_ERROR', 'Failed to delete user', 500)
    }

    logger.info({ clerkId }, 'User deleted from Supabase via webhook')
    return apiResponse({ received: true, action: 'user_deleted' }, 200)
  }

  // Log unhandled event types for debugging
  logger.debug({ eventType: event.type }, 'Received unhandled webhook event type')
  return apiResponse({ received: true, action: 'no_action' }, 200)
}
