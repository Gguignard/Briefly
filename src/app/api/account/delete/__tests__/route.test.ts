import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '../route'

// Mock Clerk auth
const mockAuth = vi.fn()
const mockDeleteUser = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
  clerkClient: vi.fn(() => Promise.resolve({
    users: { deleteUser: mockDeleteUser },
  })),
}))

// Mock Supabase admin client
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  default: { error: vi.fn(), debug: vi.fn() },
}))

function createDeleteBuilder(result = { error: null }) {
  return {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  }
}

describe('DELETE /api/account/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteUser.mockResolvedValue(undefined)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('deletes all user data and returns { deleted: true }', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValue(createDeleteBuilder())

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)

    // Verify all tables were targeted for deletion
    const tablesCalled = mockFrom.mock.calls.map((c) => c[0])
    expect(tablesCalled).toContain('user_settings')
    expect(tablesCalled).toContain('summaries')
    expect(tablesCalled).toContain('newsletters')
    expect(tablesCalled).toContain('llm_costs')
    expect(tablesCalled).toContain('users')

    // Verify Clerk user deleted
    expect(mockDeleteUser).toHaveBeenCalledWith('user_clerk_123')
  })

  it('returns 500 when Supabase deletion fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    })

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 when Clerk deletion fails with non-404 error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValue(createDeleteBuilder())
    mockDeleteUser.mockRejectedValue(new Error('Clerk server error'))

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('is idempotent — returns success when Supabase rows already gone', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    // Supabase delete on non-existent rows returns no error (idempotent)
    mockFrom.mockReturnValue(createDeleteBuilder({ error: null }))

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)
  })

  it('is idempotent — returns success when Clerk user already deleted (404)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValue(createDeleteBuilder({ error: null }))
    mockDeleteUser.mockRejectedValue({ status: 404, message: 'User not found' })

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)
  })
})
