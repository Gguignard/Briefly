import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock Supabase admin client
const mockSelect = vi.fn()
const mockGte = vi.fn()
const mockOrder = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

describe('GET /api/admin/export-costs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    mockOrder.mockResolvedValue({
      data: [
        {
          user_id: 'user_1',
          provider: 'openai',
          model: 'gpt-4o',
          tokens_input: 400,
          tokens_output: 100,
          cost_cents: 50,
          created_at: '2026-03-10T10:00:00Z',
        },
        {
          user_id: 'user_2',
          provider: 'anthropic',
          model: 'claude-sonnet',
          tokens_input: 800,
          tokens_output: 200,
          cost_cents: 120,
          created_at: '2026-03-11T12:00:00Z',
        },
      ],
    })
    mockGte.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ gte: mockGte })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('returns 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'user' } },
    })

    const { GET } = await import('../route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 403 when no session claims', async () => {
    mockAuth.mockResolvedValue({ sessionClaims: null })

    const { GET } = await import('../route')
    const response = await GET()

    expect(response.status).toBe(403)
  })

  it('returns CSV with correct headers for admin', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const { GET } = await import('../route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv')
    expect(response.headers.get('Content-Disposition')).toMatch(/attachment; filename="costs-.*\.csv"/)
  })

  it('returns CSV with header row and data rows', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const { GET } = await import('../route')
    const response = await GET()
    const csv = await response.text()
    const lines = csv.split('\n')

    expect(lines[0]).toBe('user_id,provider,model,tokens_input,tokens_output,cost_cents,created_at')
    expect(lines).toHaveLength(3) // header + 2 data rows
    expect(lines[1]).toContain('user_1')
    expect(lines[1]).toContain('openai')
    expect(lines[2]).toContain('user_2')
    expect(lines[2]).toContain('anthropic')
  })

  it('returns CSV with only header when no data', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockOrder.mockResolvedValue({ data: [] })

    const { GET } = await import('../route')
    const response = await GET()
    const csv = await response.text()
    const lines = csv.split('\n')

    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('user_id,provider,model,tokens_input,tokens_output,cost_cents,created_at')
  })

  it('sanitizes CSV fields with special characters', async () => {
    mockAuth.mockResolvedValue({
      sessionClaims: { metadata: { role: 'admin' } },
    })
    mockOrder.mockResolvedValue({
      data: [
        {
          user_id: 'user_1',
          provider: '=CMD("evil")',
          model: 'model,with,commas',
          tokens_input: 100,
          tokens_output: 50,
          cost_cents: 10,
          created_at: '2026-03-10T10:00:00Z',
        },
      ],
    })

    const { GET } = await import('../route')
    const response = await GET()
    const csv = await response.text()
    const lines = csv.split('\n')

    expect(lines[1]).toContain('"=CMD(""evil"")"')
    expect(lines[1]).toContain('"model,with,commas"')
  })
})
