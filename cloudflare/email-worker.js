/**
 * Cloudflare Email Routing Worker
 *
 * Receives emails from Cloudflare Email Routing and forwards them
 * to the Briefly webhook endpoint with HMAC-SHA256 signature.
 *
 * Environment variables (set in Cloudflare Dashboard):
 * - WEBHOOK_SECRET: Shared secret for HMAC signing
 * - WEBHOOK_URL: Target webhook URL (default: https://briefly.app/api/webhooks/email)
 */

export default {
  async email(message, env) {
    try {
      if (!env.WEBHOOK_SECRET) {
        throw new Error('WEBHOOK_SECRET environment variable is not configured')
      }

      const rawEmail = await streamToString(message.raw)

      const payload = JSON.stringify({
        to: message.to,
        from: message.from,
        subject: message.headers.get('subject') || '(no subject)',
        rawEmail,
      })

      const signature = await hmacSign(payload, env.WEBHOOK_SECRET)
      const webhookUrl = env.WEBHOOK_URL || 'https://briefly.app/api/webhooks/email'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Email-Signature': signature,
        },
        body: payload,
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      // Log to Cloudflare Worker logs (visible in wrangler tail / dashboard)
      console.error(`Email worker error for ${message.from} → ${message.to}:`, err.message)
      throw err
    }
  },
}

async function streamToString(stream) {
  const reader = stream.getReader()
  const chunks = []
  let done = false

  while (!done) {
    const result = await reader.read()
    done = result.done
    if (result.value) {
      chunks.push(result.value)
    }
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(combined)
}

async function hmacSign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}
