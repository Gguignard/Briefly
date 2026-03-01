import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

export const deadLetterQueue = new Queue('dead-letter', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
  },
})
