import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH, DELETE } from '../route'
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

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('PATCH /api/categories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 on invalid UUID', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/categories/not-a-uuid`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams('not-a-uuid'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid JSON body', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when no fields provided', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 on invalid color format', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ color: 'red' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('renames category successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const updatedCategory = {
      id: VALID_UUID,
      user_id: 'user_123',
      name: 'Updated Name',
      color: '#6366f1',
    }

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedCategory, error: null }),
            }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.name).toBe('Updated Name')
    expect(mockFrom).toHaveBeenCalledWith('categories')
  })

  it('updates color successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const updatedCategory = {
      id: VALID_UUID,
      user_id: 'user_123',
      name: 'Tech',
      color: '#ef4444',
    }

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedCategory, error: null }),
            }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ color: '#ef4444' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.color).toBe('#ef4444')
  })

  it('returns 404 when category not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }),
            }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('returns 500 on database update error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Update failed' } }),
            }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PATCH(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('DELETE /api/categories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 on invalid UUID', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = new NextRequest(`http://localhost:3000/api/categories/not-a-uuid`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams('not-a-uuid'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when category not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('deletes category and unassigns newsletters', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    // Mock existence check
    const existsChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: VALID_UUID }, error: null }),
          }),
        }),
      }),
    }

    // Mock newsletters update (unassign)
    const newsletterChain = {
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }

    // Mock categories delete
    const categoryChain = {
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'newsletters') return newsletterChain
      // categories: first call = existence check, second call = delete
      callCount++
      if (callCount === 1) return existsChain
      return categoryChain
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('newsletters')
    expect(mockFrom).toHaveBeenCalledWith('categories')
  })

  it('returns 500 when newsletter unassign fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const existsChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: VALID_UUID }, error: null }),
          }),
        }),
      }),
    }

    const newsletterChain = {
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Unassign failed' } }),
        }),
      }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'newsletters') return newsletterChain
      return existsChain
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on database delete error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const existsChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: VALID_UUID }, error: null }),
          }),
        }),
      }),
    }

    const newsletterChain = {
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }

    const categoryChain = {
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'newsletters') return newsletterChain
      callCount++
      if (callCount === 1) return existsChain
      return categoryChain
    })

    const req = new NextRequest(`http://localhost:3000/api/categories/${VALID_UUID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(VALID_UUID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
