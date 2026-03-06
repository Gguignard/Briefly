import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '@/lib/queue/redis'
import { deadLetterQueue } from '@/lib/queue/dead-letter.queue'
import type { SummaryJobData } from '@/lib/queue/summary.queue'
import { createAdminClient } from '@/lib/supabase/admin'
import { summarize } from '@/lib/llm/llmService'
import { getLLMTierForUser } from '@/lib/llm/tier-selector'
import { trackLLMCost } from '@/lib/llm/cost-tracker'
import logger, { logError } from '@/lib/utils/logger'

export async function processSummaryJob(
  jobId: string | undefined,
  data: SummaryJobData,
): Promise<void> {
  const { rawEmailId, userId, userTier, subject } = data
  logger.info({ jobId, userId, rawEmailId }, 'Generating summary')

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
  const llmTier = getLLMTierForUser(userId, userTier)

  // 3. Générer le résumé
  const result = await summarize(rawEmail.content_text, { tier: llmTier })

  // 4. Stocker le résumé
  const { error: insertError } = await supabase.from('summaries').insert({
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
  const { error: updateError } = await supabase
    .from('raw_emails')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', rawEmailId)

  if (updateError) throw new Error(`Failed to update processed_at: ${updateError.message}`)

  // 6. Tracker le coût
  await trackLLMCost(userId, result)

  logger.info({ jobId, userId, llmTier: result.llmTier }, 'Summary generated')
}

export const summaryWorker = new Worker<SummaryJobData>(
  'summary.generate',
  async (job: Job<SummaryJobData>) => {
    await processSummaryJob(job.id, job.data)
  },
  {
    connection: getRedisConnection(),
    concurrency: 3,
    lockDuration: 60000,
  },
)

summaryWorker.on('failed', (job, err) => {
  logError(err, { jobId: job?.id, userId: job?.data?.userId })

  // Move to dead letter queue after all retries exhausted
  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    deadLetterQueue
      .add('summary.generate.failed', {
        originalJobId: job.id,
        queue: 'summary.generate',
        data: job.data,
        error: err.message,
        failedAt: new Date().toISOString(),
      })
      .then(() => {
        logger.info({ jobId: job.id }, 'Summary job moved to dead letter queue')
      })
      .catch((dlqErr) => {
        logError(dlqErr instanceof Error ? dlqErr : new Error(String(dlqErr)), {
          jobId: job.id,
          context: 'Failed to enqueue summary in DLQ',
        })
      })
  }
})
