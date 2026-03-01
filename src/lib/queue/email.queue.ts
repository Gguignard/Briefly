import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

export interface EmailJobData {
  userId: string
  userTier: string
  from: string
  subject: string
  rawEmail: string
  receivedAt: string
}

export const emailQueue = new Queue<EmailJobData>('email.process', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})
