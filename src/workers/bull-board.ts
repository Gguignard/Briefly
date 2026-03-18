import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import express from 'express'
import { emailQueue } from '@/lib/queue/email.queue'
import { summaryQueue } from '@/lib/queue/summary.queue'
import { cleanupQueue } from '@/lib/queue/cleanup.queue'
import logger from '@/lib/utils/logger'

const BULL_BOARD_PORT = parseInt(process.env.BULL_BOARD_PORT ?? '3001', 10)
export function createBullBoardServer() {
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/queues')

  createBullBoard({
    queues: [
      new BullMQAdapter(emailQueue),
      new BullMQAdapter(summaryQueue),
      new BullMQAdapter(cleanupQueue),
    ],
    serverAdapter,
  })

  const app = express()

  // Token-based auth middleware — reads env per-request for token rotation support
  app.use('/queues', (req, res, next) => {
    const expectedToken = process.env.BULL_BOARD_TOKEN
    if (expectedToken) {
      const token = req.query.token ?? req.headers['x-bull-board-token']
      if (token !== expectedToken) {
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    }
    next()
  })

  app.use('/queues', serverAdapter.getRouter())

  return app
}

let serverHandle: ReturnType<ReturnType<typeof express>['listen']> | null = null

export function startBullBoard() {
  const app = createBullBoardServer()
  serverHandle = app.listen(BULL_BOARD_PORT, () => {
    logger.info(`Bull Board: http://localhost:${BULL_BOARD_PORT}/queues`)
  })
}

export function stopBullBoard(): Promise<void> {
  return new Promise((resolve) => {
    if (serverHandle) {
      serverHandle.close(() => resolve())
    } else {
      resolve()
    }
  })
}
