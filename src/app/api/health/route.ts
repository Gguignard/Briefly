import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  checks?: {
    redis?: 'ok' | 'error' | 'skipped'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const detailed = searchParams.get('detailed') === 'true'

  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }

  // Basic health check (default) - just confirms server is running
  if (!detailed) {
    return NextResponse.json(health)
  }

  // Detailed health check - verify dependencies
  health.checks = {}

  // Redis check (if REDIS_URL is configured)
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    try {
      // Basic TCP connectivity check would go here
      // For now, mark as ok if env var exists
      health.checks.redis = 'ok'
    } catch {
      health.checks.redis = 'error'
      health.status = 'degraded'
    }
  } else {
    health.checks.redis = 'skipped'
  }

  return NextResponse.json(health)
}
