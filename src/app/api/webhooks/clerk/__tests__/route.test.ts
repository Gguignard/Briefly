import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Svix - Create a proper mock constructor
const mockVerify = vi.fn()

vi.mock('svix', () => ({
  Webhook: class MockWebhook {
    constructor(secret: string) {}
    verify = mockVerify
  },
}))

// Mock Supabase
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          insert: mockInsert.mockReturnValue({
            error: null,
          }),
          delete: mockDelete.mockReturnValue({
            eq: mockEq.mockReturnValue({
              error: null,
            }),
          }),
        }
      }
      return {}
    }),
  })),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

// Helper to create mock NextRequest
function createRequest(
  url: string,
  body: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body,
    headers: new Headers(headers),
  })
}

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required env var
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  it('returns 500 when CLERK_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify({ type: 'user.created' }),
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('SERVER_MISCONFIGURATION')
  })

  it('returns 400 when Svix headers are missing', async () => {
    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify({ type: 'user.created' }),
      {}, // No Svix headers
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('MISSING_HEADERS')
  })

  it('returns 400 when signature is invalid', async () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Invalid signature')
    })

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify({ type: 'user.created' }),
      {
        'svix-id': 'msg_test',
        'svix-timestamp': '1234567890',
        'svix-signature': 'invalid',
      },
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_SIGNATURE')
  })

  it('inserts user in Supabase on user.created event', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user_test123',
        email_addresses: [
          {
            id: 'email_test',
            email_address: 'test@example.com',
          },
        ],
        primary_email_address_id: 'email_test',
        created_at: 1234567890000,
      },
    }

    mockVerify.mockReturnValueOnce(mockEvent)

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify(mockEvent),
      {
        'svix-id': 'msg_test',
        'svix-timestamp': '1234567890',
        'svix-signature': 'valid_signature',
      },
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.received).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith({
      clerk_id: 'user_test123',
      email: 'test@example.com',
      tier: 'free',
      created_at: new Date(1234567890000).toISOString(),
    })
  })

  it('returns 500 when Supabase insert fails', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user_test123',
        email_addresses: [
          {
            id: 'email_test',
            email_address: 'test@example.com',
          },
        ],
        primary_email_address_id: 'email_test',
        created_at: 1234567890000,
      },
    }

    mockVerify.mockReturnValueOnce(mockEvent)

    // Mock Supabase error
    mockInsert.mockReturnValueOnce({
      error: { message: 'Database error', code: 'DB_ERROR' },
    })

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify(mockEvent),
      {
        'svix-id': 'msg_test',
        'svix-timestamp': '1234567890',
        'svix-signature': 'valid_signature',
      },
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('DATABASE_ERROR')
  })

  it('returns 400 when user.created has no primary email', async () => {
    const mockEvent = {
      type: 'user.created',
      data: {
        id: 'user_test123',
        email_addresses: [],
        primary_email_address_id: 'email_nonexistent',
        created_at: 1234567890000,
      },
    }

    mockVerify.mockReturnValueOnce(mockEvent)

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify(mockEvent),
      {
        'svix-id': 'msg_test',
        'svix-timestamp': '1234567890',
        'svix-signature': 'valid_signature',
      },
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('NO_PRIMARY_EMAIL')
  })

  it('deletes user from Supabase on user.deleted event', async () => {
    const mockEvent = {
      type: 'user.deleted',
      data: {
        id: 'user_test123',
      },
    }

    mockVerify.mockReturnValueOnce(mockEvent)

    const request = createRequest(
      'http://localhost:3000/api/webhooks/clerk',
      JSON.stringify(mockEvent),
      {
        'svix-id': 'msg_test',
        'svix-timestamp': '1234567890',
        'svix-signature': 'valid_signature',
      },
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.received).toBe(true)
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('clerk_id', 'user_test123')
  })
})
