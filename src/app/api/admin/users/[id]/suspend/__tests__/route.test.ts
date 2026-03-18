import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

const mockSingle = vi.fn()
const mockEqSelect = vi.fn()
const mockEqUpdate = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

const makeParams = (id: string) => Promise.resolve({ id })

describe('POST /api/admin/users/[id]/suspend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    mockSingle.mockResolvedValue({ data: { suspended: false }, error: null })
    mockEqSelect.mockReturnValue({ single: mockSingle })
    mockEqUpdate.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEqUpdate })
    mockSelect.mockReturnValue({ eq: mockEqSelect })
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    }))
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'user' } },
    })

    const request = new NextRequest('http://localhost/api/admin/users/uuid-1/suspend', {
      method: 'POST',
    })
    const { POST } = await import('../route')
    const response = await POST(request, { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('toggles suspended from false to true', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const request = new NextRequest('http://localhost/api/admin/users/uuid-1/suspend', {
      method: 'POST',
    })
    const { POST } = await import('../route')
    const response = await POST(request, { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toEqual({ id: 'uuid-1', suspended: true })
    expect(mockUpdate).toHaveBeenCalledWith({ suspended: true })
  })

  it('toggles suspended from true to false', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockSingle.mockResolvedValue({ data: { suspended: true }, error: null })

    const request = new NextRequest('http://localhost/api/admin/users/uuid-1/suspend', {
      method: 'POST',
    })
    const { POST } = await import('../route')
    const response = await POST(request, { params: makeParams('uuid-1') })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data).toEqual({ id: 'uuid-1', suspended: false })
    expect(mockUpdate).toHaveBeenCalledWith({ suspended: false })
  })

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const request = new NextRequest('http://localhost/api/admin/users/uuid-999/suspend', {
      method: 'POST',
    })
    const { POST } = await import('../route')
    const response = await POST(request, { params: makeParams('uuid-999') })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error.code).toBe('NOT_FOUND')
  })
})
