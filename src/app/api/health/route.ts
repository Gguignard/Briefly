import { NextResponse } from 'next/server'
import logger, { logError } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  checks?: {
    redis?: 'ok' | 'error' | 'skipped'
  }
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  const { searchParams } = new URL(request.url)
  const detailed = searchParams.get('detailed') === 'true'

  logger.info({ requestId, path: '/api/health', detailed }, 'GET /api/health')

  try {
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }

    // Basic health check (default) - just confirms server is running
    if (!detailed) {
      logger.info({ requestId, status: health.status }, 'Health check completed')
      return NextResponse.json(health)
    }

    // Detailed health check - verify dependencies
    health.checks = {}

    // Redis check (if REDIS_URL is configured)
    // TODO(Story 4.4): Implémenter vraie vérification Redis avec BullMQ client
    // Pour l'instant, vérifie uniquement la présence de la variable d'environnement
    const redisUrl = process.env.REDIS_URL
    if (redisUrl) {
      // Placeholder: retourne 'ok' si REDIS_URL existe
      // La vraie vérification de connectivité sera ajoutée avec BullMQ
      health.checks.redis = 'ok'
    } else {
      health.checks.redis = 'skipped'
    }

    logger.info({ requestId, status: health.status, checks: health.checks }, 'Detailed health check completed')
    return NextResponse.json(health)
  } catch (error) {
    logError(error as Error, { requestId, path: '/api/health' })
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
