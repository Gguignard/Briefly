import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '../route'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock Supabase admin client
const mockUpsert = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: mockUpsert,
      select: mockSelect,
      eq: mockEq,
    })),
  })),
}))

function createRequest(body: unknown, contentType = 'application/json'): Request {
  return new Request('http://localhost:3000/api/settings/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('PATCH /api/settings/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsert.mockResolvedValue({ error: null })
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const req = createRequest({ dailySummaryEnabled: true })
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 when request body is invalid JSON', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest('not valid json')
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when dailySummaryEnabled is not a boolean', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ dailySummaryEnabled: 'yes' })
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('upserts with onConflict and returns success when enabling notifications', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ dailySummaryEnabled: true })
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.updated).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: 'user_123', daily_summary_enabled: true },
      { onConflict: 'user_id' }
    )
  })

  it('upserts with onConflict and returns success when disabling notifications', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const req = createRequest({ dailySummaryEnabled: false })
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.updated).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: 'user_123', daily_summary_enabled: false },
      { onConflict: 'user_id' }
    )
  })

  it('returns 500 when Supabase upsert fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockUpsert.mockResolvedValue({ error: { message: 'DB error' } })

    const req = createRequest({ dailySummaryEnabled: true })
    const response = await PATCH(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
