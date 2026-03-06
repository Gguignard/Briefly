import { emailWorker } from './email.worker'
import { summaryWorker } from './summary.worker'
import logger from '@/lib/utils/logger'

logger.info('Workers started')

async function gracefulShutdown() {
  logger.info('Shutting down workers...')
  await Promise.all([emailWorker.close(), summaryWorker.close()])
  logger.info('Workers closed gracefully')
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
