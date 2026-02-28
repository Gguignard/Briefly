import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock Supabase admin client
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

type MockResult = { data: unknown; error: unknown }

function createBuilder(result: MockResult) {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
  // Make it directly awaitable for queries without .single()
  builder.then = (onFulfilled: (v: MockResult) => unknown) =>
    Promise.resolve(result).then(onFulfilled)
  return builder
}

function setupMocks({
  profile = { data: { email: 'test@example.com', tier: 'free', created_at: '2024-01-01' }, error: null },
  newsletters = { data: [], error: null },
  summaries = { data: [], error: null },
  settings = { data: { daily_summary_enabled: true, created_at: '2024-01-01' }, error: null },
}: {
  profile?: MockResult
  newsletters?: MockResult
  summaries?: MockResult
  settings?: MockResult
} = {}) {
  mockFrom.mockImplementation((table: string) => {
    const results: Record<string, MockResult> = { users: profile, newsletters, summaries, user_settings: settings }
    return createBuilder(results[table] ?? { data: null, error: null })
  })
}

describe('GET /api/account/export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 200 with correct export structure', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({
      profile: { data: { email: 'test@example.com', tier: 'free', created_at: '2024-01-01' }, error: null },
      newsletters: {
        data: [{ name: 'Tech', email_address: 'tech@news.com', category_id: null, active: true, created_at: '2024-01-01' }],
        error: null,
      },
    })

    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Content-Disposition')).toMatch(
      /attachment; filename="briefly-export-\d{4}-\d{2}-\d{2}\.json"/
    )

    const data = JSON.parse(await response.text())
    expect(data.exportedAt).toBeDefined()
    expect(data.profile).toEqual({ email: 'test@example.com', tier: 'free', created_at: '2024-01-01' })
    expect(data.newsletters).toHaveLength(1)
    expect(data.summaries).toEqual([])
    expect(data.settings).toEqual({ daily_summary_enabled: true, created_at: '2024-01-01' })
  })

  it('returns empty profile when user not found in Supabase', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({ profile: { data: null, error: { code: 'PGRST116', message: 'No rows' } } })

    const response = await GET()
    expect(response.status).toBe(200)
    const data = JSON.parse(await response.text())
    expect(data.profile).toEqual({})
  })

  it('returns 500 when newsletters query fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({ newsletters: { data: null, error: { message: 'DB error' } } })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 when summaries query fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({ summaries: { data: null, error: { message: 'DB error' } } })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns empty arrays when no newsletters or summaries exist', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks()

    const response = await GET()
    expect(response.status).toBe(200)
    const data = JSON.parse(await response.text())
    expect(data.newsletters).toEqual([])
    expect(data.summaries).toEqual([])
  })

  it('returns 500 when settings query fails with a real DB error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({ settings: { data: null, error: { code: '42P01', message: 'relation does not exist' } } })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns empty settings when user has no settings row (PGRST116)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    setupMocks({ settings: { data: null, error: { code: 'PGRST116', message: 'No rows' } } })

    const response = await GET()
    expect(response.status).toBe(200)
    const data = JSON.parse(await response.text())
    expect(data.settings).toEqual({})
  })
})
