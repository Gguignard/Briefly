import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
})

export default logger

// Helper pour logger les erreurs + les envoyer à Sentry
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({ err: error, ...context }, error.message)
  if (process.env.NODE_ENV === 'production') {
    import('@sentry/nextjs')
      .then(({ captureException }) => {
        captureException(error, { extra: context })
      })
      .catch((importError) => {
        logger.error({ err: importError }, 'Failed to load Sentry for error capture')
      })
  }
}
