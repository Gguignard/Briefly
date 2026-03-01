import type { ConnectionOptions } from 'bullmq'

function parseRedisUrl(url: string): ConnectionOptions {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      maxRetriesPerRequest: null, // Requis pour BullMQ
    }
  } catch (err) {
    console.warn(`[Redis] Failed to parse REDIS_URL "${url}", falling back to localhost:6379`, err)
    return { host: 'localhost', port: 6379, maxRetriesPerRequest: null }
  }
}

let connection: ConnectionOptions | null = null

export function getRedisConnection(): ConnectionOptions {
  if (!connection) {
    connection = parseRedisUrl(process.env.REDIS_URL ?? 'redis://localhost:6379')
  }
  return connection
}
