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

- [x] `src/lib/queue/summary.queue.ts` créé
- [x] `src/workers/summary.worker.ts` créé
- [x] Migration `summaries` table créée
- [x] Worker intégré dans `src/workers/index.ts`
- [x] Test : email reçu → résumé stocké dans `summaries` en < 30s

---

## Testing Strategy

- **Manuel :** Envoyer un email test → vérifier le résumé dans `summaries` (Supabase)
- **Manuel :** Vérifier le `processed_at` mis à jour dans `raw_emails`
- **Manuel :** Simuler un timeout LLM → vérifier retry + dead letter

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/lib/queue/summary.queue.ts` (déjà existant via story 4.4)
- [x] Créer `src/workers/summary.worker.ts`
- [x] Créer migration `summaries`
- [x] Intégrer dans `src/workers/index.ts`

### Completion Notes
- `summary.queue.ts` existait déjà (story 4.4) avec interface `SummaryJobData` et config BullMQ conforme
- `summary.worker.ts` créé avec `processSummaryJob()` exporté séparément pour testabilité (pattern identique à `email.processor.ts`)
- Worker : fetch raw_email → tier selection → LLM summarize → store summary → mark processed_at → track cost
- Dead letter queue intégrée après épuisement des retries (3 attempts, backoff exponentiel)
- `tier-selector.ts` créé (logique simple paid→premium, free→basic) — story 5.3 l'enrichira
- `cost-tracker.ts` créé — insère dans `llm_costs` avec calcul de coût par modèle
- Migration `006_summaries.sql` avec schéma complet (key_points TEXT[], llm_provider, tokens, etc.)
- Types Supabase mis à jour pour refléter le nouveau schéma summaries
- `workers/index.ts` : summaryWorker ajouté avec graceful shutdown via Promise.all
- 11 nouveaux tests (5 worker + 3 tier-selector + 3 cost-tracker), tous passent
- 0 régression (293 tests existants passent, 7 échecs pré-existants non liés)

### File List
- `src/workers/summary.worker.ts` (nouveau)
- `src/workers/__tests__/summary.worker.test.ts` (nouveau)
- `src/workers/index.ts` (modifié — ajout summaryWorker)
- `src/lib/llm/tier-selector.ts` (nouveau)
- `src/lib/llm/tier-selector.test.ts` (nouveau)
- `src/lib/llm/cost-tracker.ts` (nouveau)
- `src/lib/llm/cost-tracker.test.ts` (nouveau)
- `supabase/migrations/006_summaries.sql` (nouveau)
- `src/lib/supabase/types.ts` (modifié — schéma summaries mis à jour)

### Debug Log
- Mock bullmq `Worker` : `vi.fn().mockImplementation(...)` ne fonctionne pas comme constructeur → corrigé avec `vi.fn(function(this) {...})`

### Change Log
- 2026-03-03 : Story 5.2 implémentée — worker summary.generate, migration summaries, tier-selector, cost-tracker
- 2026-03-06 : Code review — 9 issues corrigés (4H, 3M, 2L) :
  - H1: Supprimé DROP TABLE destructif dans migration 006
  - H2: Ajouté UNIQUE constraint sur raw_email_id dans summaries
  - H3: Ajouté vérification erreur sur update processed_at
  - H4: Remplacé stalledInterval (pas un timeout) par timeout: 45000 dans defaultJobOptions
  - M1: Calcul coût LLM avec tarifs séparés input/output
  - M2: Refactorisé mocks Supabase avec chaînes par table + ajout test processed_at error
  - M3: Signature getLLMTierForUser(userId, userTier) forward-compat story 5.3
  - L1/L2: Documentés, non bloquants
  - 12 tests passent (0 régression sur 294 existants)
