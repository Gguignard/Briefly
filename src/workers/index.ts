import { emailWorker } from './email.worker'
import logger from '@/lib/utils/logger'

logger.info('Workers started')

async function gracefulShutdown() {
  logger.info('Shutting down workers...')
  await emailWorker.close()
  logger.info('Workers closed gracefully')
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
