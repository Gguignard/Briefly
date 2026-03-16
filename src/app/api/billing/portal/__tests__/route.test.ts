import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock Stripe
const mockBillingPortalSessionsCreate = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    billingPortal: {
      sessions: { create: (...args: unknown[]) => mockBillingPortalSessionsCreate(...args) },
    },
  },
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  default: { error: vi.fn(), debug: vi.fn() },
}))

// Mock env
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

function createUserSelectBuilder(user: { stripe_customer_id: string | null } | null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: user, error: user ? null : { message: 'not found' } }),
  }
}

describe('POST /api/billing/portal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const { POST } = await import('../route')
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 404 when user not found in database', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder(null))

    const { POST } = await import('../route')
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('returns 400 when user has no stripe_customer_id', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder({ stripe_customer_id: null }))

    const { POST } = await import('../route')
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('NO_CUSTOMER')
  })

  it('creates a billing portal session and returns URL', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder({ stripe_customer_id: 'cus_456' }))
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.com/p/session_test',
    })

    const { POST } = await import('../route')
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.url).toBe('https://billing.stripe.com/p/session_test')
  })

  it('creates portal session with correct parameters', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder({ stripe_customer_id: 'cus_789' }))
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.com/p/session_abc',
    })

    const { POST } = await import('../route')
    await POST()

    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith({
      customer: 'cus_789',
      return_url: 'http://localhost:3000/billing',
    })
  })

  it('returns 500 when Stripe API fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder({ stripe_customer_id: 'cus_456' }))
    mockBillingPortalSessionsCreate.mockRejectedValue(new Error('Stripe portal error'))

    const { POST } = await import('../route')
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
