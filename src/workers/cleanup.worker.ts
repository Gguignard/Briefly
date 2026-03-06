import { Worker } from 'bullmq'
import { getRedisConnection } from '@/lib/queue/redis'
import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/utils/logger'

export const RETENTION_DAYS = 90

export async function processCleanupJob(): Promise<{
  summaryCount: number | null
  emailCount: number | null
}> {
  const supabase = createAdminClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
  const cutoff = cutoffDate.toISOString()

  // Supprimer les summaries d'abord (avant raw_emails) pour éviter que
  // ON DELETE CASCADE sur raw_emails.id ne supprime des summaries récents
  // dont le raw_email serait > 90 jours (cas théorique si le summary worker a du retard)
  const { count: summaryCount, error: summaryError } = await supabase
    .from('summaries')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff)

  if (summaryError) throw new Error(`Failed to purge summaries: ${summaryError.message}`)

  logger.info({ summaryCount, cutoff }, 'Purged old summaries')

  const { count: emailCount, error: emailError } = await supabase
    .from('raw_emails')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff)

  if (emailError) {
    logger.error({ summaryCount, cutoff }, 'Partial purge: summaries deleted but raw_emails failed')
    throw new Error(`Failed to purge raw_emails: ${emailError.message}`)
  }

  logger.info({ summaryCount, emailCount, cutoff }, 'Daily purge completed')

  return { summaryCount, emailCount }
}

export const cleanupWorker = new Worker(
  'cleanup',
  async () => {
    await processCleanupJob()
  },
  { connection: getRedisConnection() },
)

cleanupWorker.on('failed', (_job, err) => {
  logger.error({ err }, 'Cleanup job failed')
})
