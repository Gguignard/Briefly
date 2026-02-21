import { describe, it, expect } from 'vitest'
import { GET } from '../route'

// Helper to create mock request
function createRequest(url: string): Request {
  return new Request(url)
}

describe('/api/health', () => {
  describe('basic health check', () => {
    it('should return status ok', async () => {
      const request = createRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.timestamp).toBeDefined()
    })

    it('should return valid ISO timestamp', async () => {
      const request = createRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()

      const timestamp = new Date(data.timestamp)
      expect(timestamp.toISOString()).toBe(data.timestamp)
    })

    it('should not include checks in basic mode', async () => {
      const request = createRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()

      expect(data.checks).toBeUndefined()
    })
  })

  describe('detailed health check', () => {
    it('should include checks when detailed=true', async () => {
      const request = createRequest('http://localhost:3000/api/health?detailed=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.checks).toBeDefined()
    })

    it('should skip redis check when REDIS_URL not configured', async () => {
      const originalRedisUrl = process.env.REDIS_URL
      delete process.env.REDIS_URL

      const request = createRequest('http://localhost:3000/api/health?detailed=true')
      const response = await GET(request)
      const data = await response.json()

      expect(data.checks?.redis).toBe('skipped')

      // Restore
      if (originalRedisUrl) process.env.REDIS_URL = originalRedisUrl
    })
  })
})
