import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

// Hoisted mocks - vi.mock factories are hoisted above imports
const { mockAdd, mockSingle, mockEq, mockSelect } = vi.hoisted(() => ({
  mockAdd: vi.fn(),
  mockSingle: vi.fn(),
  mockEq: vi.fn(),
  mockSelect: vi.fn(),
}))

vi.mock('@/lib/queue/email.queue', () => ({
  emailQueue: { add: mockAdd },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ select: mockSelect })),
  })),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
  logError: vi.fn(),
}))

// HMAC helper
const TEST_SECRET = 'test-webhook-secret'

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(TEST_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

function createRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/webhooks/email', {
    method: 'POST',
    body,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
  })
}

describe('POST /api/webhooks/email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET = TEST_SECRET
    // Re-wire Supabase chain after clearAllMocks
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockAdd.mockResolvedValue({ id: 'job-1' })
  })

  it('returns 401 when X-Email-Signature header is missing', async () => {
    const request = createRequest(JSON.stringify({ to: 'test@mail.briefly.app' }))

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('MISSING_SIGNATURE')
  })

  it('returns 401 when HMAC signature is invalid', async () => {
    const body = JSON.stringify({ to: 'test@mail.briefly.app' })
    const request = createRequest(body, {
      'X-Email-Signature': 'aW52YWxpZA==',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('INVALID_SIGNATURE')
  })

  it('returns 401 when CLOUDFLARE_EMAIL_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET

    const body = JSON.stringify({ to: 'test@mail.briefly.app' })
    const request = createRequest(body, {
      'X-Email-Signature': 'some-signature',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('INVALID_SIGNATURE')
  })

  it('returns 401 when X-Email-Signature is not valid base64', async () => {
    const body = JSON.stringify({ to: 'test@mail.briefly.app' })
    const request = createRequest(body, {
      'X-Email-Signature': '!!!not-base64!!!',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('INVALID_SIGNATURE')
  })

  it('returns 400 when body is not valid JSON', async () => {
    const body = 'this is not json'
    const signature = await hmacSign(body)

    const request = createRequest(body, { 'X-Email-Signature': signature })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_BODY')
  })

  it('returns 400 when required fields are missing from payload', async () => {
    const body = JSON.stringify({ to: 'test@mail.briefly.app' })
    const signature = await hmacSign(body)

    const request = createRequest(body, { 'X-Email-Signature': signature })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('MISSING_FIELDS')
  })

  it('returns 404 when inbox address is unknown', async () => {
    const payload = {
      to: 'unknown@mail.briefly.app',
      from: 'newsletter@example.com',
      subject: 'Test Newsletter',
      rawEmail: 'raw email content',
    }
    const body = JSON.stringify(payload)
    const signature = await hmacSign(body)

    mockSingle.mockResolvedValueOnce({ data: null, error: null })

    const request = createRequest(body, { 'X-Email-Signature': signature })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('USER_NOT_FOUND')
    expect(mockEq).toHaveBeenCalledWith('inbox_address', 'unknown@mail.briefly.app')
  })

  it('returns 200 and enqueues email for valid request', async () => {
    const payload = {
      to: 'abc-uuid@mail.briefly.app',
      from: 'newsletter@example.com',
      subject: 'Weekly Digest',
      rawEmail: 'raw email content here',
    }
    const body = JSON.stringify(payload)
    const signature = await hmacSign(body)

    mockSingle.mockResolvedValueOnce({
      data: { id: 'a1b2c3d4-uuid', tier: 'free' },
      error: null,
    })

    const request = createRequest(body, { 'X-Email-Signature': signature })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.received).toBe(true)

    expect(mockAdd).toHaveBeenCalledWith(
      'process',
      expect.objectContaining({
        userId: 'a1b2c3d4-uuid',
        userTier: 'free',
        from: 'newsletter@example.com',
        subject: 'Weekly Digest',
        rawEmail: 'raw email content here',
        receivedAt: expect.any(String),
      }),
    )
  })

  it('queries the correct Supabase table and columns', async () => {
    const payload = {
      to: 'test@mail.briefly.app',
      from: 'sender@example.com',
      subject: 'Test',
      rawEmail: 'content',
    }
    const body = JSON.stringify(payload)
    const signature = await hmacSign(body)

    mockSingle.mockResolvedValueOnce({
      data: { id: 'user-uuid-1', tier: 'pro' },
      error: null,
    })

    const request = createRequest(body, { 'X-Email-Signature': signature })
    await POST(request)

    expect(mockSelect).toHaveBeenCalledWith('id, tier')
    expect(mockEq).toHaveBeenCalledWith('inbox_address', 'test@mail.briefly.app')
  })

  it('returns 503 when Redis/BullMQ is unavailable', async () => {
    const payload = {
      to: 'abc-uuid@mail.briefly.app',
      from: 'newsletter@example.com',
      subject: 'Weekly Digest',
      rawEmail: 'raw email content here',
    }
    const body = JSON.stringify(payload)
    const signature = await hmacSign(body)

    mockSingle.mockResolvedValueOnce({
      data: { id: 'user-uuid-1', tier: 'free' },
      error: null,
    })
    mockAdd.mockRejectedValueOnce(new Error('Redis connection refused'))

    const request = createRequest(body, { 'X-Email-Signature': signature })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error.code).toBe('QUEUE_UNAVAILABLE')
  })

})
