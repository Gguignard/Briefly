import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

export const cleanupQueue = new Queue('cleanup', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 200 },
  },
})

export async function registerCleanupCron() {
  await cleanupQueue.add(
    'purge-old-data',
    {},
    {
      repeat: { pattern: '0 0 * * *' },
      jobId: 'daily-purge',
    },
  )
}
