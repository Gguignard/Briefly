# Story 5.2 : Worker `summary.generate`

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** a BullMQ worker that processes `summary.generate` jobs,
**so that** AI summaries are generated and stored reliably for each newsletter email received.

---

## Acceptance Criteria

1. ✅ Worker `summary.generate` consomme la queue BullMQ
2. ✅ Détermine le tier LLM (premium vs basic) selon la logique story 5.3
3. ✅ Appelle `LLMService.summarize()` avec le contenu de l'email
4. ✅ Résumé stocké dans la table `summaries` Supabase
5. ✅ `raw_emails.processed_at` mis à jour après traitement réussi
6. ✅ Génération < 30s (P95) — timeout configuré à 45s
7. ✅ Job échoué après 3 retries → dead letter queue + Sentry alert

---

## Technical Notes

### `src/lib/queue/summary.queue.ts`

```typescript
import { Queue } from 'bullmq'
import { getRedis } from './redis'

export interface SummaryJobData {
  rawEmailId: string
  userId: string
  userTier: 'free' | 'paid'
  subject: string
}

export const summaryQueue = new Queue<SummaryJobData>('summary.generate', {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 1000 },
  },
})
```

### `src/workers/summary.worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { getRedis } from '@/lib/queue/redis'
import { SummaryJobData } from '@/lib/queue/summary.queue'
import { createAdminClient } from '@/lib/supabase/admin'
import { summarize } from '@/lib/llm/service'
import { getLLMTierForUser } from '@/lib/llm/tier-selector'
import { trackLLMCost } from '@/lib/llm/cost-tracker'
import logger, { logError } from '@/lib/utils/logger'

export const summaryWorker = new Worker<SummaryJobData>(
  'summary.generate',
  async (job: Job<SummaryJobData>) => {
    const { rawEmailId, userId, userTier, subject } = job.data
    logger.info({ jobId: job.id, userId, rawEmailId }, 'Generating summary')

    const supabase = createAdminClient()

    // 1. Récupérer le contenu de l'email
    const { data: rawEmail, error: fetchError } = await supabase
      .from('raw_emails')
      .select('content_text, sender_email')
      .eq('id', rawEmailId)
      .single()

    if (fetchError || !rawEmail) {
      throw new Error(`raw_email not found: ${rawEmailId}`)
    }

    // 2. Déterminer le tier LLM
    const llmTier = await getLLMTierForUser(userId, userTier)

    // 3. Générer le résumé
    const result = await summarize(rawEmail.content_text, { tier: llmTier })

    // 4. Stocker le résumé
    const { error: insertError } = await supabase
      .from('summaries')
      .insert({
        user_id: userId,
        raw_email_id: rawEmailId,
        title: result.title,
        key_points: result.keyPoints,
        source_url: result.sourceUrl,
        llm_tier: result.llmTier,
        llm_provider: result.provider,
        tokens_input: result.tokensInput,
        tokens_output: result.tokensOutput,
        generated_at: result.generatedAt,
      })

    if (insertError) throw new Error(`Failed to store summary: ${insertError.message}`)

    // 5. Marquer l'email brut comme traité
    await supabase
      .from('raw_emails')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', rawEmailId)

    // 6. Tracker le coût
    await trackLLMCost(userId, result)

    logger.info({ jobId: job.id, userId, llmTier: result.llmTier }, 'Summary generated')
  },
  {
    connection: getRedis(),
    concurrency: 3,
    settings: { stalledInterval: 45000 }, // timeout 45s
  }
)

summaryWorker.on('failed', (job, err) => {
  logError(err, { jobId: job?.id, userId: job?.data?.userId })
})
```

### Schema Supabase `summaries`

```sql
-- supabase/migrations/20250115_summaries.sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_email_id UUID NOT NULL REFERENCES raw_emails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  key_points TEXT[] NOT NULL,
  source_url TEXT,
  llm_tier TEXT NOT NULL CHECK (llm_tier IN ('basic', 'premium')),
  llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'anthropic')),
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
  ON summaries FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');

CREATE INDEX idx_summaries_user_id_created ON summaries(user_id, created_at DESC);
```

---

## Dependencies

**Requires :**
- Story 4.4 : BullMQ infrastructure + `raw_emails` table
- Story 5.1 : `summarize()` LLM service
- Story 5.3 : `getLLMTierForUser()` dual-tier logic

**Blocks :**
- Story 6.1 : Feed résumés (lit la table `summaries`)

---

## Definition of Done

- [ ] `src/lib/queue/summary.queue.ts` créé
- [ ] `src/workers/summary.worker.ts` créé
- [ ] Migration `summaries` table créée
- [ ] Worker intégré dans `src/workers/index.ts`
- [ ] Test : email reçu → résumé stocké dans `summaries` en < 30s

---

## Testing Strategy

- **Manuel :** Envoyer un email test → vérifier le résumé dans `summaries` (Supabase)
- **Manuel :** Vérifier le `processed_at` mis à jour dans `raw_emails`
- **Manuel :** Simuler un timeout LLM → vérifier retry + dead letter

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/lib/queue/summary.queue.ts`
- [ ] Créer `src/workers/summary.worker.ts`
- [ ] Créer migration `summaries`
- [ ] Intégrer dans `src/workers/index.ts`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
