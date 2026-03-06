import { emailWorker } from './email.worker'
import { summaryWorker } from './summary.worker'
import { cleanupWorker } from './cleanup.worker'
import { registerCleanupCron } from '@/lib/queue/cleanup.queue'
import logger from '@/lib/utils/logger'

registerCleanupCron().catch((err) => {
  logger.error({ err }, 'Failed to register cleanup cron')
})

logger.info('Workers started')

async function gracefulShutdown() {
  logger.info('Shutting down workers...')
  await Promise.all([emailWorker.close(), summaryWorker.close(), cleanupWorker.close()])
  logger.info('Workers closed gracefully')
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
