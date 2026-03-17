import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock Supabase
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

function createRequest(body?: unknown): NextRequest {
  if (body) {
    return new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new NextRequest('http://localhost:3000/api/categories')
}

describe('GET /api/categories', () => {
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

  it('returns categories for authenticated user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const mockCategories = [
      { id: 'cat-1', name: 'Tech', color: '#6366f1', user_id: 'user_123' },
    ]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockCategories)
    expect(mockFrom).toHaveBeenCalledWith('categories')
  })

  it('returns empty array when no categories', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
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

describe('POST /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to set up mocks for POST (tier check + limit count + name uniqueness + insert)
  function setupPostMocks(options: {
    tier?: string
    count?: number
    nameCount?: number
    insertData?: unknown
    insertError?: unknown
  }) {
    const { tier = 'free', count = 0, nameCount = 0, insertData = null, insertError = null } = options

    const userChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { tier }, error: null }),
        }),
      }),
    }

    const countChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count, error: null }),
      }),
    }

    const nameCountChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: nameCount, error: null }),
        }),
      }),
    }

    const insertChain = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: insertData, error: insertError }),
        }),
      }),
    }

    let catCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return userChain
      catCallCount++
      if (catCallCount === 1) return countChain
      if (catCallCount === 2) return nameCountChain
      return insertChain
    })
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = createRequest({ name: 'Tech' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 on invalid body (missing name)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ color: '#ff0000' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid color format', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ name: 'Tech', color: 'not-a-color' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid JSON body', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when name exceeds 50 characters', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ name: 'A'.repeat(51) })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('creates category successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const createdCategory = {
      id: 'cat-new',
      user_id: 'user_123',
      name: 'Tech',
      color: '#6366f1',
    }

    setupPostMocks({ tier: 'free', count: 1, nameCount: 0, insertData: createdCategory })

    const req = createRequest({ name: 'Tech' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toEqual(createdCategory)
  })

  it('creates category with custom color', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const createdCategory = {
      id: 'cat-new',
      user_id: 'user_123',
      name: 'Finance',
      color: '#ef4444',
    }

    setupPostMocks({ tier: 'paid', count: 0, nameCount: 0, insertData: createdCategory })

    const req = createRequest({ name: 'Finance', color: '#ef4444' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data.color).toBe('#ef4444')
  })

  it('returns 403 when free tier limit reached (3 categories)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    setupPostMocks({ tier: 'free', count: 3 })

    const req = createRequest({ name: 'Fourth Category' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('LIMIT_REACHED')
  })

  it('allows paid tier to create more than 3 categories', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const createdCategory = {
      id: 'cat-new',
      user_id: 'user_123',
      name: 'Fourth',
      color: '#6366f1',
    }

    setupPostMocks({ tier: 'paid', count: 5, nameCount: 0, insertData: createdCategory })

    const req = createRequest({ name: 'Fourth' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toEqual(createdCategory)
  })

  it('returns 409 when duplicate category name', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    setupPostMocks({ tier: 'free', count: 1, nameCount: 1 })

    const req = createRequest({ name: 'Existing Category' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 500 on database insert error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    setupPostMocks({ tier: 'free', count: 0, nameCount: 0, insertError: { message: 'Insert failed' } })

    const req = createRequest({ name: 'Test' })
    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
