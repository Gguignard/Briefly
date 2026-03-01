import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

export interface SummaryJobData {
  rawEmailId: string
  userId: string
  userTier: string
  subject: string
}

export const summaryQueue = new Queue<SummaryJobData>('summary.generate', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})
