# Story 4.3 : Webhook d'Ingestion Email Cloudflare

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** to receive and validate incoming newsletter emails via a Cloudflare webhook,
**so that** newsletter content is securely ingested and queued for AI summarization.

---

## Acceptance Criteria

1. ✅ `POST /api/webhooks/email` reçoit les emails redirigés par Cloudflare Email Routing
2. ✅ Validation HMAC-SHA256 du payload (header `X-Email-Signature`)
3. ✅ Email parsé : expéditeur, sujet, corps HTML et texte
4. ✅ Résolution du `user_id` depuis `inbox_address` (destinataire)
5. ✅ Email enqueué dans BullMQ `email.process`
6. ✅ Réponse `200 OK` en moins de 500ms (traitement asynchrone)
7. ✅ Emails invalides (HMAC échoué, user inconnu) loggés et rejetés avec 4xx

---

## Technical Notes

### Architecture Cloudflare Email Routing

```
Newsletter → expéditeur@newsletter.com → {uuid}@mail.briefly.app
                                               ↓
                              Cloudflare Email Routing Worker
                                               ↓
                         POST https://briefly.app/api/webhooks/email
                         Headers: X-Email-Signature: HMAC(body, secret)
                         Body: { to, from, subject, html, text }
```

### Cloudflare Email Worker

```javascript
// cloudflare/email-worker.js (déployé sur Cloudflare)
export default {
  async email(message, env) {
    const rawEmail = await streamToString(message.raw)

    const payload = JSON.stringify({
      to: message.to,
      from: message.from,
      subject: message.headers.get('subject'),
      rawEmail,
    })

    const signature = await hmacSign(payload, env.WEBHOOK_SECRET)

    await fetch('https://briefly.app/api/webhooks/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Email-Signature': signature,
      },
      body: payload,
    })
  }
}

async function hmacSign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}
```

### `POST /api/webhooks/email`

```typescript
// src/app/api/webhooks/email/route.ts
import { createClient } from '@/lib/supabase/server'
import { emailQueue } from '@/lib/queue/email.queue'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger, { logError } from '@/lib/utils/logger'

async function verifyHmac(body: string, signature: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_WEBHOOK_SECRET!
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body))
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('X-Email-Signature') ?? ''

  // 1. Valider la signature HMAC
  const valid = await verifyHmac(body, signature)
  if (!valid) {
    logger.warn({ signature }, 'Invalid HMAC signature on email webhook')
    return apiError('INVALID_SIGNATURE', 'Signature invalide', 401)
  }

  const { to, from, subject, rawEmail } = JSON.parse(body)

  // 2. Résoudre l'utilisateur depuis l'adresse inbox
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, tier')
    .eq('inbox_address', to)
    .single()

  if (!user) {
    logger.warn({ to }, 'Email received for unknown inbox address')
    return apiError('USER_NOT_FOUND', 'Utilisateur introuvable', 404)
  }

  // 3. Enqueue dans BullMQ (asynchrone)
  await emailQueue.add('email.process', {
    userId: user.id,
    userTier: user.tier,
    from,
    subject,
    rawEmail,
    receivedAt: new Date().toISOString(),
  })

  logger.info({ userId: user.id, subject }, 'Email queued for processing')
  return apiResponse({ received: true })
}
```

### Variables d'environnement

```bash
# .env.local
CLOUDFLARE_WEBHOOK_SECRET=xxx   # Secret partagé Cloudflare ↔ Next.js
```

---

## Dependencies

**Requires :**
- Story 4.1 : Table `users` avec `inbox_address`
- Story 4.4 : BullMQ queue `email.process` configurée

**Blocks :**
- Story 4.4 : Worker email (consomme la queue)

---

## Definition of Done

- [ ] `POST /api/webhooks/email` créé avec validation HMAC
- [ ] Résolution `inbox_address` → `user_id` fonctionnelle
- [ ] Email enqueué dans BullMQ
- [ ] Réponse < 500ms vérifiée
- [ ] Test : signature invalide → 401
- [ ] Test : adresse inconnue → 404

---

## Testing Strategy

- **Manuel :** Simuler un email Cloudflare avec `curl -X POST /api/webhooks/email` + payload valide → 200
- **Manuel :** Même requête sans signature → 401
- **Manuel :** Vérifier dans le dashboard BullMQ que le job est enqueué

---

## References

- [Cloudflare Email Routing Workers](https://developers.cloudflare.com/email-routing/email-workers/)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `POST /api/webhooks/email` avec HMAC validation
- [ ] Créer `src/lib/queue/email.queue.ts` (BullMQ)
- [ ] Créer le Cloudflare Worker (`cloudflare/email-worker.js`)
- [ ] Ajouter `CLOUDFLARE_WEBHOOK_SECRET` dans `.env.example`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
