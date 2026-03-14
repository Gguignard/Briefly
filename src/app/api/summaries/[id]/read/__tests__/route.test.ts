import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '../route'

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

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function createParams(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id })
}

function setupUserLookup(user: { id: string } | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: user, error: null }),
      }),
    }),
  }
}

function setupUpdate(data: unknown[] | null, error: unknown = null) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  }
}

describe('PATCH /api/summaries/[id]/read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid UUID', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams('not-a-uuid'),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })
    mockFrom.mockReturnValue(setupUserLookup(null))

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('updates read_at and returns success', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    const updateMock = setupUpdate([{ id: VALID_UUID }])

    mockFrom
      .mockReturnValueOnce(setupUserLookup({ id: 'user-uuid' }))
      .mockReturnValueOnce(updateMock)

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual({ read: true })
    expect(updateMock.update).toHaveBeenCalledWith({
      read_at: expect.any(String),
    })
  })

  it('returns 404 when summary does not belong to user', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom
      .mockReturnValueOnce(setupUserLookup({ id: 'user-uuid' }))
      .mockReturnValueOnce(setupUpdate([]))

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('returns 500 on database error', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom
      .mockReturnValueOnce(setupUserLookup({ id: 'user-uuid' }))
      .mockReturnValueOnce(setupUpdate(null, { message: 'DB error' }))

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('is idempotent - succeeds even if already read', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' })

    mockFrom
      .mockReturnValueOnce(setupUserLookup({ id: 'user-uuid' }))
      .mockReturnValueOnce(setupUpdate([{ id: VALID_UUID }]))

    const response = await PATCH(new Request('http://localhost'), {
      params: createParams(VALID_UUID),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual({ read: true })
  })
})
