import './email.worker'
import logger from '@/lib/utils/logger'

logger.info('Workers started')

process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...')
  process.exit(0)
})
