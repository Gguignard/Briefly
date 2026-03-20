import { z } from 'zod'
import { Resend } from 'resend'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { NextRequest } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

const CONTACT_FROM = process.env.CONTACT_FROM_EMAIL ?? 'Briefly Contact <noreply@briefly.app>'
const CONTACT_TO = process.env.CONTACT_TO_EMAIL ?? 'support@briefly.app'

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
})

// Simple in-memory rate limiter (production : utiliser Redis)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()
const MAX_RATE_LIMIT_ENTRIES = 10000

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}

function cleanupRateLimiter(now: number) {
  if (rateLimiter.size <= MAX_RATE_LIMIT_ENTRIES) return
  for (const [key, val] of rateLimiter) {
    if (now >= val.resetAt) rateLimiter.delete(key)
  }
}

function checkRateLimit(ip: string, now: number): boolean {
  const entry = rateLimiter.get(ip)

  if (entry && now >= entry.resetAt) {
    rateLimiter.delete(ip)
    return false
  }

  return !!(entry && entry.count >= 3)
}

function incrementRateLimit(ip: string, now: number) {
  const entry = rateLimiter.get(ip)
  if (entry && now < entry.resetAt) {
    entry.count++
  } else {
    rateLimiter.set(ip, { count: 1, resetAt: now + 3600000 })
  }
  cleanupRateLimiter(now)
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const now = Date.now()

  if (checkRateLimit(ip, now)) {
    return apiError('RATE_LIMIT', 'Too many messages sent. Try again in 1 hour.', 429)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Invalid JSON request body', 400)
  }

  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const { name, email, subject, message } = parsed.data

  // Increment rate limit only after successful validation
  incrementRateLimit(ip, now)

  try {
    await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Support] ${subject}`,
      text: `De: ${name} (${email})\n\n${message}`,
    })
  } catch {
    return apiError('INTERNAL_ERROR', 'Failed to send message', 500)
  }

  return apiResponse({ sent: true })
}
