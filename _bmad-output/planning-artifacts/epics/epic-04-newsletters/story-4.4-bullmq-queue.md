# Story 4.4 : Pipeline BullMQ — Queue `email.process`

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** a BullMQ worker processing incoming emails asynchronously,
**so that** email content is parsed, stored, and handed off to the summarization pipeline reliably.

---

## Acceptance Criteria

1. ✅ BullMQ installé avec Redis self-hosted (Docker Compose)
2. ✅ Queue `email.process` configurée avec retry x3 (backoff exponentiel)
3. ✅ Worker parse l'email brut : extrait texte propre (sans HTML/CSS)
4. ✅ Contenu extrait stocké dans la table `raw_emails` Supabase
5. ✅ Job suivant enqueué dans `summary.generate` avec le `raw_email_id`
6. ✅ Jobs échoués après 3 retries → dead letter queue (loggés + Sentry)
7. ✅ Bull Board dashboard disponible sur `/admin/queues` (accès admin uniquement)

---

## Technical Notes

### Installation

```bash
npm install bullmq ioredis
```

### Configuration Redis (Docker Compose)

```yaml
# docker-compose.yml (ajout au fichier existant)
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### `src/lib/queue/redis.ts`

```typescript
import { Redis } from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Requis pour BullMQ
    })
  }
  return redis
}
```

### `src/lib/queue/email.queue.ts`

```typescript
import { Queue } from 'bullmq'
import { getRedis } from './redis'

export const emailQueue = new Queue('email.process', {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})
```

### `src/workers/email.worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { getRedis } from '@/lib/queue/redis'
import { summaryQueue } from '@/lib/queue/summary.queue'
import { createAdminClient } from '@/lib/supabase/admin'
import logger, { logError } from '@/lib/utils/logger'
import { extractTextFromEmail } from '@/lib/email/extractor'

interface EmailJobData {
  userId: string
  userTier: 'free' | 'paid'
  from: string
  subject: string
  rawEmail: string
  receivedAt: string
}

export const emailWorker = new Worker<EmailJobData>(
  'email.process',
  async (job: Job<EmailJobData>) => {
    const { userId, userTier, from, subject, rawEmail, receivedAt } = job.data
    logger.info({ jobId: job.id, userId, subject }, 'Processing email job')

    // 1. Extraire le contenu texte de l'email
    const { text, html } = await extractTextFromEmail(rawEmail)

    if (!text || text.length < 100) {
      logger.warn({ jobId: job.id }, 'Email content too short, skipping')
      return
    }

    // 2. Stocker le contenu brut
    const supabase = createAdminClient()
    const { data: rawEmailRecord, error } = await supabase
      .from('raw_emails')
      .insert({
        user_id: userId,
        sender_email: from,
        subject,
        content_text: text,
        content_html: html,
        received_at: receivedAt,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to store raw email: ${error.message}`)

    // 3. Enqueue pour génération de résumé
    await summaryQueue.add('summary.generate', {
      rawEmailId: rawEmailRecord.id,
      userId,
      userTier,
      subject,
    })

    logger.info({ jobId: job.id, rawEmailId: rawEmailRecord.id }, 'Email processed')
  },
  {
    connection: getRedis(),
    concurrency: 5,
  }
)

emailWorker.on('failed', (job, err) => {
  logError(err, { jobId: job?.id, data: job?.data })
})
```

### `src/lib/email/extractor.ts`

```typescript
import { simpleParser } from 'mailparser'

export async function extractTextFromEmail(rawEmail: string): Promise<{
  text: string
  html: string | null
}> {
  const parsed = await simpleParser(rawEmail)
  return {
    text: parsed.text ?? '',
    html: parsed.html || null,
  }
}
```

```bash
npm install mailparser
npm install --save-dev @types/mailparser
```

### Schema Supabase `raw_emails`

```sql
-- supabase/migrations/20250115_raw_emails.sql
CREATE TABLE raw_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_text TEXT NOT NULL,
  content_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE raw_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own raw emails"
  ON raw_emails FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');

CREATE INDEX idx_raw_emails_user_id ON raw_emails(user_id);
```

### Démarrage du worker (script)

```typescript
// src/workers/index.ts — point d'entrée des workers
import './email.worker'
import './summary.worker' // Epic 5
import logger from '@/lib/utils/logger'

logger.info('Workers started')
process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...')
  process.exit(0)
})
```

```json
// package.json — ajout script
{
  "scripts": {
    "workers": "tsx src/workers/index.ts"
  }
}
```

---

## Dependencies

**Requires :**
- Story 1.3 : Docker Compose (Redis service)
- Story 4.3 : Webhook email (produit les jobs)

**Blocks :**
- Story 5.1 : LLM worker (consomme `summary.generate`)

---

## Definition of Done

- [ ] Redis dans `docker-compose.yml`
- [ ] `src/lib/queue/redis.ts`, `email.queue.ts`, `summary.queue.ts` créés
- [ ] Worker `email.worker.ts` : parse → stocke → enqueue summary
- [ ] Migration `raw_emails` créée
- [ ] `npm run workers` démarre sans erreur
- [ ] Test : envoyer un email → vérifier `raw_emails` en base + job `summary.generate` dans la queue

---

## Testing Strategy

- **Manuel :** Envoyer un email test → vérifier le job dans Bull Board `/admin/queues`
- **Manuel :** Vérifier `raw_emails` dans Supabase après traitement
- **Manuel :** Simuler un échec → vérifier retry x3 → dead letter queue

---

## References

- [BullMQ documentation](https://docs.bullmq.io)
- [mailparser](https://nodemailer.com/extras/mailparser/)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Ajouter Redis dans `docker-compose.yml`
- [ ] Créer `src/lib/queue/redis.ts` et `email.queue.ts`
- [ ] Créer `src/workers/email.worker.ts`
- [ ] Créer `src/lib/email/extractor.ts`
- [ ] Créer migration `raw_emails`
- [ ] Ajouter script `workers` dans `package.json`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
