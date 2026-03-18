import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

const mockFetchAdminUsers = vi.fn()
vi.mock('@/features/admin/admin.service', () => ({
  fetchAdminUsers: (...args: unknown[]) => mockFetchAdminUsers(...args),
}))

function makeRequest(url: string) {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'user' } },
    })

    const { GET } = await import('../route')
    const response = await GET(makeRequest('http://localhost/api/admin/users'))
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns paginated users for admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockFetchAdminUsers.mockResolvedValue({
      users: [
        {
          id: 'uuid-1',
          clerk_id: 'clerk_1',
          email: 'alice@test.com',
          tier: 'free',
          suspended: false,
          created_at: '2026-01-15T10:00:00Z',
          summaries_count: 3,
        },
      ],
      total: 1,
      page: 1,
      perPage: 20,
    })

    const { GET } = await import('../route')
    const response = await GET(makeRequest('http://localhost/api/admin/users'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data.users).toHaveLength(1)
    expect(json.data.users[0].email).toBe('alice@test.com')
    expect(json.data.users[0].summaries_count).toBe(3)
    expect(json.data.total).toBe(1)
    expect(json.data.page).toBe(1)
    expect(json.data.perPage).toBe(20)
  })

  it('passes search and page params to service', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockFetchAdminUsers.mockResolvedValue({
      users: [],
      total: 0,
      page: 3,
      perPage: 20,
    })

    const { GET } = await import('../route')
    await GET(makeRequest('http://localhost/api/admin/users?search=alice&page=3'))

    expect(mockFetchAdminUsers).toHaveBeenCalledWith(3, 'alice')
  })

  it('returns 500 when service throws', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockFetchAdminUsers.mockRejectedValue(new Error('DB error'))

    const { GET } = await import('../route')
    const response = await GET(makeRequest('http://localhost/api/admin/users'))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })

  it('handles empty search parameter', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockFetchAdminUsers.mockResolvedValue({
      users: [],
      total: 0,
      page: 1,
      perPage: 20,
    })

    const { GET } = await import('../route')
    await GET(makeRequest('http://localhost/api/admin/users'))

    expect(mockFetchAdminUsers).toHaveBeenCalledWith(1, '')
  })
})
