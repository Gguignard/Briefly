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
const mockCustomersCreate = vi.fn()
const mockCheckoutSessionsCreate = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: (...args: unknown[]) => mockCustomersCreate(...args) },
    checkout: { sessions: { create: (...args: unknown[]) => mockCheckoutSessionsCreate(...args) } },
  },
  STRIPE_PRICE_ID: 'price_test_123',
}))

// Mock redirect
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    // Simulate Next.js redirect behavior
    const error = new Error('NEXT_REDIRECT')
    ;(error as Error & { digest: string }).digest = `NEXT_REDIRECT;replace;${url};307;`
    throw error
  },
}))

// Mock isRedirectError to recognize our mock redirect errors
vi.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: (error: unknown) =>
    error instanceof Error &&
    'digest' in error &&
    typeof (error as Error & { digest: string }).digest === 'string' &&
    (error as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT'),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  default: { error: vi.fn(), debug: vi.fn() },
}))

// Mock env
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

function createUserSelectBuilder(user: { email: string; stripe_customer_id: string | null; tier: string } | null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: user, error: user ? null : { message: 'not found' } }),
  }
}

function createUpdateBuilder(error: { message: string } | null = null) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error }),
  }
}

describe('GET /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const { GET } = await import('../route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 404 when user not found in database', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(createUserSelectBuilder(null))

    const { GET } = await import('../route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('redirects to /billing?already_subscribed=true when user is already paid', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: null, tier: 'paid' })
    )

    const { GET } = await import('../route')
    await expect(GET()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/billing?already_subscribed=true')
  })

  it('creates a new Stripe customer when stripe_customer_id is null', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom
      .mockReturnValueOnce(
        createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: null, tier: 'free' })
      )
      .mockReturnValueOnce(createUpdateBuilder())

    mockCustomersCreate.mockResolvedValue({ id: 'cus_new_123' })
    mockCheckoutSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_123' })

    const { GET } = await import('../route')
    await expect(GET()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: 'test@test.com',
      metadata: { clerkId: 'user_clerk_123' },
    })

    // Verify customer ID persisted
    const updateBuilder = mockFrom.mock.results[1].value
    expect(updateBuilder.update).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new_123' })
  })

  it('reuses existing Stripe customer when stripe_customer_id exists', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: 'cus_existing_456', tier: 'free' })
    )

    mockCheckoutSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_789' })

    const { GET } = await import('../route')
    await expect(GET()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCustomersCreate).not.toHaveBeenCalled()
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing_456',
        mode: 'subscription',
      })
    )
  })

  it('creates checkout session with correct parameters', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: 'cus_456', tier: 'free' })
    )

    mockCheckoutSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_abc' })

    const { GET } = await import('../route')
    await expect(GET()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
      customer: 'cus_456',
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: 'price_test_123', quantity: 1 }],
      success_url: 'http://localhost:3000/billing?success=true',
      cancel_url: 'http://localhost:3000/billing?canceled=true',
      metadata: { clerkId: 'user_clerk_123' },
      subscription_data: {
        metadata: { clerkId: 'user_clerk_123' },
      },
    })
  })

  it('redirects to Stripe checkout URL', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: 'cus_456', tier: 'free' })
    )

    mockCheckoutSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_final' })

    const { GET } = await import('../route')
    await expect(GET()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('https://checkout.stripe.com/session_final')
  })

  it('returns 500 when Supabase fails to persist stripe_customer_id', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom
      .mockReturnValueOnce(
        createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: null, tier: 'free' })
      )
      .mockReturnValueOnce(createUpdateBuilder({ message: 'DB connection error' }))

    mockCustomersCreate.mockResolvedValue({ id: 'cus_new_123' })

    const { GET } = await import('../route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when Stripe session URL is null', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: 'cus_456', tier: 'free' })
    )

    mockCheckoutSessionsCreate.mockResolvedValue({ id: 'cs_123', url: null })

    const { GET } = await import('../route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('returns 500 when Stripe API fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_clerk_123' })
    mockFrom.mockReturnValueOnce(
      createUserSelectBuilder({ email: 'test@test.com', stripe_customer_id: 'cus_456', tier: 'free' })
    )

    mockCheckoutSessionsCreate.mockRejectedValue(new Error('Stripe error'))

    const { GET } = await import('../route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
