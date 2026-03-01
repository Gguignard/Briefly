import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '@/lib/queue/redis'
import { deadLetterQueue } from '@/lib/queue/dead-letter.queue'
import logger, { logError } from '@/lib/utils/logger'
import { processEmailJob, type EmailJobData } from './email.processor'

export const emailWorker = new Worker<EmailJobData>(
  'email.process',
  async (job: Job<EmailJobData>) => {
    await processEmailJob(job.id, job.data)
  },
  {
    connection: getRedisConnection(),
    concurrency: 5,
  },
)

emailWorker.on('failed', (job, err) => {
  logError(err, { jobId: job?.id, data: job?.data })

  // Move to dead letter queue after all retries exhausted
  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    deadLetterQueue
      .add('email.process.failed', {
        originalJobId: job.id,
        queue: 'email.process',
        data: job.data,
        error: err.message,
        failedAt: new Date().toISOString(),
      })
      .then(() => {
        logger.info({ jobId: job.id }, 'Job moved to dead letter queue')
      })
      .catch((dlqErr) => {
        logError(dlqErr instanceof Error ? dlqErr : new Error(String(dlqErr)), {
          jobId: job.id,
          context: 'Failed to enqueue in DLQ',
        })
      })
  }
})
