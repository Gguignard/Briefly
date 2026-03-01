import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '@/lib/queue/redis'
import { logError } from '@/lib/utils/logger'
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
})
