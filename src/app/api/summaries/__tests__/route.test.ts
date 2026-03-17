import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
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

const VALID_CATEGORY_ID = '660e8400-e29b-41d4-a716-446655440001'
const USER_INTERNAL_ID = 'user-internal-123'

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/summaries')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return new NextRequest(url)
}

// Chainable query builder mock
function chainMock(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  const handler = () => chain
  chain.select = vi.fn().mockImplementation((cols: string, opts?: unknown) => {
    if (opts && typeof opts === 'object' && 'count' in (opts as Record<string, unknown>)) {
      // unread count query
      return { eq: vi.fn().mockReturnValue({ is: vi.fn().mockResolvedValue({ count: 0 }) }) }
    }
    return chain
  })
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.range = vi.fn().mockReturnValue(chain)
  chain.is = vi.fn().mockResolvedValue({ count: 0 })
  chain.single = vi.fn().mockResolvedValue(resolvedValue)
  // Make the chain itself thenable for await query
  chain.then = (resolve: (v: unknown) => void) => resolve(resolvedValue)
  return handler
}

describe('GET /api/summaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const response = await GET(makeRequest())
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid categoryId format', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    const response = await GET(makeRequest({ categoryId: 'not-a-uuid' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }
      }
      return {}
    })

    const response = await GET(makeRequest())
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('returns 404 when categoryId does not belong to user', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: USER_INTERNAL_ID }, error: null }),
            }),
          }),
        }
      }
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
          }),
        }
      }
      return {}
    })

    const response = await GET(makeRequest({ categoryId: VALID_CATEGORY_ID }))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.message).toBe('Catégorie introuvable')
  })

  it('returns summaries without categoryId filter', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    const mockSummaries = [{ id: 's1', title: 'Test' }]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: USER_INTERNAL_ID }, error: null }),
            }),
          }),
        }
      }
      // summaries table — called twice: once for data query, once for unread count
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn().mockImplementation((_cols: string, opts?: Record<string, unknown>) => {
        if (opts?.count === 'exact') {
          return {
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ count: 1 }),
            }),
          }
        }
        return chain
      })
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockReturnValue(chain)
      chain.range = vi.fn().mockResolvedValue({ data: mockSummaries, error: null })
      return chain
    })

    const response = await GET(makeRequest({ page: '1' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.summaries).toEqual(mockSummaries)
    expect(data.data.unreadCount).toBe(1)
    expect(data.data.page).toBe(1)
  })

  it('returns filtered summaries with valid categoryId', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    const mockSummaries = [{ id: 's1', title: 'Filtered' }]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: USER_INTERNAL_ID }, error: null }),
            }),
          }),
        }
      }
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: VALID_CATEGORY_ID }, error: null }),
              }),
            }),
          }),
        }
      }
      // summaries table — chain must stay chainable after .range() for .eq() calls
      const result = { data: mockSummaries, error: null }
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn().mockImplementation((_cols: string, opts?: Record<string, unknown>) => {
        if (opts?.count === 'exact') {
          return {
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ count: 0 }),
            }),
          }
        }
        return chain
      })
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockReturnValue(chain)
      chain.range = vi.fn().mockReturnValue(chain)
      chain.then = (resolve: (v: unknown) => void) => Promise.resolve(resolve(result))
      return chain
    })

    const response = await GET(makeRequest({ page: '1', categoryId: VALID_CATEGORY_ID }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.summaries).toEqual(mockSummaries)
  })

  it('defaults page to 1 for invalid page param', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: USER_INTERNAL_ID }, error: null }),
            }),
          }),
        }
      }
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn().mockImplementation((_cols: string, opts?: Record<string, unknown>) => {
        if (opts?.count === 'exact') {
          return {
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ count: 0 }),
            }),
          }
        }
        return chain
      })
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockReturnValue(chain)
      chain.range = vi.fn().mockResolvedValue({ data: [], error: null })
      return chain
    })

    const response = await GET(makeRequest({ page: 'abc' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.page).toBe(1)
  })
})
