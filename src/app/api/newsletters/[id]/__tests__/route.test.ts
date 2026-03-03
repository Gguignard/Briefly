import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE, PATCH } from '../route'
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
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('DELETE /api/newsletters/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid UUID', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest('http://localhost:3000/api/newsletters/not-uuid', {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams('not-uuid'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('deletes newsletter successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [{ id: VALID_UUID }], error: null }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('newsletters')
  })

  it('returns 404 when newsletter belongs to another user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('returns 500 on database delete error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Delete failed' } }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('PATCH /api/newsletters/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create table-aware mock for PATCH tests with limit check
  function setupPatchMock(options: {
    tier?: string
    activeCount?: number
    updateResult?: { data: unknown; error: unknown }
  }) {
    const { tier = 'free', activeCount = 0, updateResult = { data: [], error: null } } = options

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { tier }, error: null }),
            }),
          }),
        }
      }
      // table === 'newsletters'
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: activeCount, data: null, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue(updateResult),
            }),
          }),
        }),
      }
    })
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid UUID', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest('http://localhost:3000/api/newsletters/not-uuid', {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('not-uuid'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid body (missing active)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'wrong field' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid JSON body', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when newsletter belongs to another user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    // Deactivating skips limit check, so simple mock works
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('toggles newsletter inactive successfully (no limit check)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const updatedNewsletter = {
      id: VALID_UUID,
      user_id: 'user_123',
      name: 'Tech Weekly',
      email_address: 'tech@example.com',
      active: false,
    }

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [updatedNewsletter], error: null }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.active).toBe(false)
    expect(mockFrom).toHaveBeenCalledWith('newsletters')
  })

  it('toggles newsletter active successfully when under limit', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const updatedNewsletter = {
      id: VALID_UUID,
      user_id: 'user_123',
      name: 'Tech Weekly',
      email_address: 'tech@example.com',
      active: true,
    }

    setupPatchMock({
      tier: 'free',
      activeCount: 3,
      updateResult: { data: [updatedNewsletter], error: null },
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.active).toBe(true)
  })

  it('returns 403 LIMIT_REACHED when free tier at limit and activating', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    setupPatchMock({ tier: 'free', activeCount: 5 })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('LIMIT_REACHED')
  })

  it('allows activation for paid tier regardless of count', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const updatedNewsletter = {
      id: VALID_UUID,
      user_id: 'user_123',
      name: 'Tech Weekly',
      email_address: 'tech@example.com',
      active: true,
    }

    setupPatchMock({
      tier: 'paid',
      activeCount: 10,
      updateResult: { data: [updatedNewsletter], error: null },
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.active).toBe(true)
  })

  it('returns 500 on database update error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    setupPatchMock({
      tier: 'free',
      activeCount: 2,
      updateResult: { data: null, error: { message: 'Update failed' } },
    })

    const req = new NextRequest(`http://localhost:3000/api/newsletters/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
