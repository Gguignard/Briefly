import { createAdminClient } from '@/lib/supabase/admin'
import { emailQueue } from '@/lib/queue/email.queue'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger, { logError } from '@/lib/utils/logger'

const MAX_BODY_SIZE = 10 * 1024 * 1024 // 10 MB

async function verifyHmac(body: string, signature: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET
  if (!secret) return false

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
    return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.text()

  // M3: Rejeter les payloads trop volumineux
  if (body.length > MAX_BODY_SIZE) {
    logger.warn({ bodyLength: body.length }, 'Email webhook body too large')
    return apiError('BODY_TOO_LARGE', 'Payload trop volumineux', 413)
  }

  const signature = req.headers.get('X-Email-Signature')

  if (!signature) {
    logger.warn('Email webhook received without X-Email-Signature header')
    return apiError('MISSING_SIGNATURE', 'Signature manquante', 401)
  }

  // 1. Valider la signature HMAC
  const valid = await verifyHmac(body, signature)
  if (!valid) {
    logger.warn({ signature }, 'Invalid HMAC signature on email webhook')
    return apiError('INVALID_SIGNATURE', 'Signature invalide', 401)
  }

  let parsed: { to?: string; from?: string; subject?: string; rawEmail?: string }
  try {
    parsed = JSON.parse(body)
  } catch {
    logger.warn('Email webhook received with invalid JSON body')
    return apiError('INVALID_BODY', 'Corps JSON invalide', 400)
  }

  const { to, from, subject, rawEmail } = parsed
  if (!to || !from || !subject || !rawEmail) {
    logger.warn({ to, from, subject: !!subject, rawEmail: !!rawEmail }, 'Email webhook missing required fields')
    return apiError('MISSING_FIELDS', 'Champs requis manquants: to, from, subject, rawEmail', 400)
  }

  // 2. Résoudre l'utilisateur depuis l'adresse inbox (C1: select id UUID, pas clerk_id)
  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, tier')
    .eq('inbox_address', to)
    .single()

  if (!user) {
    logger.warn({ to }, 'Email received for unknown inbox address')
    return apiError('USER_NOT_FOUND', 'Utilisateur introuvable', 404)
  }

  // 3. Enqueue dans BullMQ (asynchrone) — M2: try/catch si Redis down
  try {
    await emailQueue.add('process', {
      userId: user.id,
      userTier: user.tier,
      from,
      subject,
      rawEmail,
      receivedAt: new Date().toISOString(),
    })
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { userId: user.id })
    return apiError('QUEUE_UNAVAILABLE', 'Service temporairement indisponible', 503)
  }

  logger.info({ userId: user.id, subject }, 'Email queued for processing')
  return apiResponse({ received: true })
}
