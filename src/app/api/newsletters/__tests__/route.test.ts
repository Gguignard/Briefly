import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
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

function createRequest(body?: unknown): NextRequest {
  if (body) {
    return new NextRequest('http://localhost:3000/api/newsletters', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new NextRequest('http://localhost:3000/api/newsletters')
}

describe('GET /api/newsletters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns newsletters for authenticated user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const mockNewsletters = [
      { id: 'nl-1', name: 'Tech Weekly', email_address: 'tech@example.com', active: true },
    ]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockNewsletters, error: null }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockNewsletters)
    expect(mockFrom).toHaveBeenCalledWith('newsletters')
  })

  it('returns 500 on database error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('POST /api/newsletters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = createRequest({ name: 'Test', emailAddress: 'test@example.com' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 on invalid body (missing name)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ emailAddress: 'test@example.com' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid email', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ name: 'Test', emailAddress: 'not-an-email' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid JSON body', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest('http://localhost:3000/api/newsletters', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('creates newsletter successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const createdNewsletter = {
      id: 'nl-new',
      user_id: 'user_123',
      name: 'Tech Weekly',
      email_address: 'tech@example.com',
      active: true,
    }

    // Mock count query (active newsletters)
    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
        }),
      }),
    }

    // Mock user tier query
    const userChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { tier: 'free' }, error: null }),
        }),
      }),
    }

    // Mock insert query
    const insertChain = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdNewsletter, error: null }),
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return userChain
      // newsletters is called twice: count then insert
      callCount++
      if (callCount === 1) return countChain
      return insertChain
    })

    const req = createRequest({ name: 'Tech Weekly', emailAddress: 'tech@example.com' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toEqual(createdNewsletter)
  })

  it('returns 403 when free tier limit reached', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      }),
    }

    const userChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { tier: 'free' }, error: null }),
        }),
      }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return userChain
      return countChain
    })

    const req = createRequest({ name: 'Sixth Newsletter', emailAddress: 'sixth@example.com' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('LIMIT_REACHED')
  })

  it('returns 500 on database insert error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }),
    }

    const userChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { tier: 'free' }, error: null }),
        }),
      }),
    }

    const insertChain = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return userChain
      callCount++
      if (callCount === 1) return countChain
      return insertChain
    })

    const req = createRequest({ name: 'Test', emailAddress: 'test@example.com' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
