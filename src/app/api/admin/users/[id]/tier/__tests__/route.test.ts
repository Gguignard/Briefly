import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockAuth = vi.fn()
const mockUpdateUser = vi.fn()
const mockGetUser = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
  clerkClient: () =>
    Promise.resolve({ users: { updateUser: mockUpdateUser, getUser: mockGetUser } }),
}))

const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/users/uuid-1/tier', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const makeParams = (id: string) => Promise.resolve({ id })

describe('POST /api/admin/users/[id]/tier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    mockSingle.mockResolvedValue({ data: { clerk_id: 'clerk_1' }, error: null })
    mockEq.mockImplementation(() => {
      return { single: mockSingle }
    })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    }))
    mockUpdateUser.mockResolvedValue({})
    mockGetUser.mockResolvedValue({ publicMetadata: { role: 'user', tier: 'free' } })
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'user' } },
    })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ tier: 'pro' }), { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 400 for invalid tier', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ tier: 'invalid' }), { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ tier: 'pro' }), { params: makeParams('uuid-999') })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('updates tier in Supabase and Clerk for admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ tier: 'pro' }), { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toEqual({ id: 'uuid-1', tier: 'pro' })
    expect(mockUpdate).toHaveBeenCalledWith({ tier: 'pro' })
    expect(mockGetUser).toHaveBeenCalledWith('clerk_1')
    expect(mockUpdateUser).toHaveBeenCalledWith('clerk_1', {
      publicMetadata: { role: 'user', tier: 'pro' },
    })
  })

  it('preserves target user metadata, not admin metadata', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin', tier: 'pro' } },
    })
    mockGetUser.mockResolvedValue({
      publicMetadata: { role: 'user', tier: 'free', customField: 'keep' },
    })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ tier: 'starter' }), {
      params: makeParams('uuid-1'),
    })

    expect(response.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith('clerk_1', {
      publicMetadata: { role: 'user', tier: 'starter', customField: 'keep' },
    })
  })
})
