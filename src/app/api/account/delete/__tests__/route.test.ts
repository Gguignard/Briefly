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

// Users lookup builder (returns internal UUID)
function createUsersSelectBuilder(uuid: string | null = 'supabase-uuid-123') {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: uuid ? { id: uuid } : null,
    }),
  }
}

// Setup mockFrom for a full happy-path run
// Call order: users(select), user_settings, summaries, newsletters, llm_costs, users(delete)
function setupHappyPath(userUuid: string | null = 'supabase-uuid-123') {
  mockFrom
    .mockReturnValueOnce(createUsersSelectBuilder(userUuid))  // UUID lookup
    .mockReturnValueOnce(createDeleteBuilder())               // user_settings
    .mockReturnValueOnce(createDeleteBuilder())               // summaries
    .mockReturnValueOnce(createDeleteBuilder())               // newsletters
    .mockReturnValueOnce(createDeleteBuilder())               // llm_costs (only if uuid found)
    .mockReturnValueOnce(createDeleteBuilder())               // users delete
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
    setupHappyPath('supabase-uuid-123')

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)

    // Verify all tables were targeted
    const tablesCalled = mockFrom.mock.calls.map((c) => c[0])
    expect(tablesCalled).toContain('user_settings')
    expect(tablesCalled).toContain('summaries')
    expect(tablesCalled).toContain('newsletters')
    expect(tablesCalled).toContain('llm_costs')
    expect(tablesCalled).toContain('users')

    // Verify Clerk user deleted
    expect(mockDeleteUser).toHaveBeenCalledWith('user_clerk_123')
  })

  it('deletes llm_costs with internal UUID (not Clerk ID)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupHappyPath('supabase-uuid-abc')

    await DELETE()

    // llm_costs is the 5th call (index 4) — verify it uses the internal UUID
    const llmCostsDeleteBuilder = mockFrom.mock.results[4].value
    expect(llmCostsDeleteBuilder.eq).toHaveBeenCalledWith('user_id', 'supabase-uuid-abc')
  })

  it('skips llm_costs deletion when user has no internal record', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    // No uuid → only 5 calls (no llm_costs step)
    mockFrom
      .mockReturnValueOnce(createUsersSelectBuilder(null)) // UUID lookup → null
      .mockReturnValueOnce(createDeleteBuilder())          // user_settings
      .mockReturnValueOnce(createDeleteBuilder())          // summaries
      .mockReturnValueOnce(createDeleteBuilder())          // newsletters
      .mockReturnValueOnce(createDeleteBuilder())          // users delete

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)

    const tablesCalled = mockFrom.mock.calls.map((c) => c[0])
    expect(tablesCalled).not.toContain('llm_costs')
  })

  it('returns 500 when Supabase deletion fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom
      .mockReturnValueOnce(createUsersSelectBuilder())
      .mockReturnValueOnce({
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
    setupHappyPath()
    mockDeleteUser.mockRejectedValue(new Error('Clerk server error'))

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('is idempotent — returns success when Clerk user already deleted (404)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupHappyPath()
    mockDeleteUser.mockRejectedValue({ status: 404, message: 'User not found' })

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.deleted).toBe(true)
  })
})
