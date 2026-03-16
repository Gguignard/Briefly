import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// Set env vars before any imports that read them at module level
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.STRIPE_PREMIUM_PRICE_ID = 'price_test_fake'

// Mock Stripe
const mockConstructEvent = vi.fn()
const mockSubscriptionsRetrieve = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => mockSubscriptionsRetrieve(...args) },
  },
}))

// Mock Supabase admin client
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

// Mock Clerk
const mockUpdateUser = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: { updateUser: (...args: unknown[]) => mockUpdateUser(...args) },
  }),
}))

// Mock env
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')

// Mock logger
const mockLoggerWarn = vi.fn()
const mockLoggerInfo = vi.fn()
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  default: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

function createRequest(body = '{}', signature = 'sig_test') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  })
}

function createStripeEvent(type: string, data: Record<string, unknown>): Stripe.Event {
  return {
    id: 'evt_test_123',
    type,
    data: { object: data },
  } as unknown as Stripe.Event
}

function createUpsertBuilder() {
  return {
    upsert: vi.fn().mockReturnValue({ error: null }),
  }
}

function createUpdateBuilder() {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  }
}

function createSelectBuilder(data: Record<string, unknown> | null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: data ? null : { message: 'not found' } }),
  }
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- AC1: Signature validation ---

  it('returns 400 when stripe signature is invalid', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_SIGNATURE')
  })

  it('reads raw body and stripe-signature header for verification', async () => {
    const rawBody = '{"test":"payload"}'
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const { POST } = await import('../route')
    await POST(createRequest(rawBody, 'whsec_test_sig'))

    expect(mockConstructEvent).toHaveBeenCalledWith(
      rawBody,
      'whsec_test_sig',
      process.env.STRIPE_WEBHOOK_SECRET
    )
  })

  // --- AC2: checkout.session.completed → tier 'paid' ---

  it('upgrades user to paid tier on checkout.session.completed', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_clerk_123' },
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    // User lookup
    mockFrom.mockReturnValueOnce(createSelectBuilder({ id: 'uuid-user-1' }))
    // Subscription retrieve
    mockSubscriptionsRetrieve.mockResolvedValue({
      current_period_end: 1700000000,
    })
    // subscriptions.upsert
    mockFrom.mockReturnValueOnce(createUpsertBuilder())
    // users.update tier
    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    mockUpdateUser.mockResolvedValue({})

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual({ received: true })

    // Verify subscriptions upsert
    const upsertBuilder = mockFrom.mock.results[1].value
    expect(upsertBuilder.upsert).toHaveBeenCalledWith(
      {
        user_id: 'uuid-user-1',
        stripe_subscription_id: 'sub_abc',
        stripe_customer_id: 'cus_456',
        status: 'active',
        current_period_end: new Date(1700000000 * 1000).toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    )

    // Verify users.update tier = paid
    const updateBuilder = mockFrom.mock.results[2].value
    expect(updateBuilder.update).toHaveBeenCalledWith({ tier: 'paid' })

    // Verify Clerk update
    expect(mockUpdateUser).toHaveBeenCalledWith('user_clerk_123', {
      publicMetadata: { tier: 'paid' },
    })
  })

  it('skips checkout.session.completed when clerkId is missing from metadata', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: {},
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('skips checkout.session.completed when user not found in DB', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_unknown' },
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    mockFrom.mockReturnValueOnce(createSelectBuilder(null))

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  // --- AC3: customer.subscription.deleted → tier 'free' ---

  it('downgrades user to free tier on customer.subscription.deleted', async () => {
    const event = createStripeEvent('customer.subscription.deleted', {
      id: 'sub_del_123',
      metadata: { clerkId: 'user_clerk_456' },
    })
    mockConstructEvent.mockReturnValue(event)

    // subscriptions.update status
    mockFrom.mockReturnValueOnce(createUpdateBuilder())
    // users.update tier
    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    mockUpdateUser.mockResolvedValue({})

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual({ received: true })

    // Verify subscription status → canceled
    const subUpdateBuilder = mockFrom.mock.results[0].value
    expect(subUpdateBuilder.update).toHaveBeenCalledWith({ status: 'canceled' })

    // Verify user tier → free
    const userUpdateBuilder = mockFrom.mock.results[1].value
    expect(userUpdateBuilder.update).toHaveBeenCalledWith({ tier: 'free' })

    // Verify Clerk update
    expect(mockUpdateUser).toHaveBeenCalledWith('user_clerk_456', {
      publicMetadata: { tier: 'free' },
    })
  })

  it('falls back to DB lookup when clerkId missing from subscription.deleted metadata', async () => {
    const event = createStripeEvent('customer.subscription.deleted', {
      id: 'sub_del_no_meta',
      metadata: {},
    })
    mockConstructEvent.mockReturnValue(event)

    // Fallback: subscriptions lookup → user_id
    mockFrom.mockReturnValueOnce(createSelectBuilder({ user_id: 'uuid-user-2' }))
    // Fallback: users lookup → clerk_id
    mockFrom.mockReturnValueOnce(createSelectBuilder({ clerk_id: 'user_clerk_resolved' }))
    // subscriptions.update status
    mockFrom.mockReturnValueOnce(createUpdateBuilder())
    // users.update tier
    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    mockUpdateUser.mockResolvedValue({})

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(mockUpdateUser).toHaveBeenCalledWith('user_clerk_resolved', {
      publicMetadata: { tier: 'free' },
    })
  })

  it('skips subscription.deleted when clerkId cannot be resolved at all', async () => {
    const event = createStripeEvent('customer.subscription.deleted', {
      id: 'sub_del_orphan',
      metadata: {},
    })
    mockConstructEvent.mockReturnValue(event)

    // Fallback: subscriptions lookup → not found
    mockFrom.mockReturnValueOnce(createSelectBuilder(null))

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(mockUpdateUser).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      { subscriptionId: 'sub_del_orphan' },
      'Cannot resolve clerkId for subscription.deleted'
    )
  })

  // --- AC4: customer.subscription.updated → status + period_end ---

  it('updates subscription status and period_end on customer.subscription.updated', async () => {
    const event = createStripeEvent('customer.subscription.updated', {
      id: 'sub_upd_789',
      status: 'past_due',
      current_period_end: 1710000000,
    })
    mockConstructEvent.mockReturnValue(event)

    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)

    const updateBuilder = mockFrom.mock.results[0].value
    expect(updateBuilder.update).toHaveBeenCalledWith({
      status: 'past_due',
      current_period_end: new Date(1710000000 * 1000).toISOString(),
    })
  })

  it('syncs tier to paid when subscription.updated status is active', async () => {
    const event = createStripeEvent('customer.subscription.updated', {
      id: 'sub_reactivated',
      status: 'active',
      current_period_end: 1720000000,
      metadata: { clerkId: 'user_clerk_reactivated' },
    })
    mockConstructEvent.mockReturnValue(event)

    // subscriptions.update
    mockFrom.mockReturnValueOnce(createUpdateBuilder())
    // users.update tier
    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    mockUpdateUser.mockResolvedValue({})

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)

    // Verify tier synced to paid
    const tierUpdateBuilder = mockFrom.mock.results[1].value
    expect(tierUpdateBuilder.update).toHaveBeenCalledWith({ tier: 'paid' })

    // Verify Clerk update
    expect(mockUpdateUser).toHaveBeenCalledWith('user_clerk_reactivated', {
      publicMetadata: { tier: 'paid' },
    })
  })

  it('does not sync tier when subscription.updated status is past_due', async () => {
    const event = createStripeEvent('customer.subscription.updated', {
      id: 'sub_past_due',
      status: 'past_due',
      current_period_end: 1710000000,
      metadata: { clerkId: 'user_clerk_789' },
    })
    mockConstructEvent.mockReturnValue(event)

    mockFrom.mockReturnValueOnce(createUpdateBuilder())

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    // No tier sync for past_due — only active and canceled trigger tier changes
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  // --- AC5: invoice.payment_failed → log warning ---

  it('logs warning on invoice.payment_failed', async () => {
    const event = createStripeEvent('invoice.payment_failed', {
      customer: 'cus_fail_123',
    })
    mockConstructEvent.mockReturnValue(event)

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      { customerId: 'cus_fail_123' },
      'Payment failed'
    )
  })

  // --- AC6: Idempotence ---

  it('uses upsert with onConflict for idempotent subscription creation', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_clerk_123' },
      subscription: 'sub_idem',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    mockFrom.mockReturnValueOnce(createSelectBuilder({ id: 'uuid-user-1' }))
    mockSubscriptionsRetrieve.mockResolvedValue({ current_period_end: 1700000000 })
    mockFrom.mockReturnValueOnce(createUpsertBuilder())
    mockFrom.mockReturnValueOnce(createUpdateBuilder())
    mockUpdateUser.mockResolvedValue({})

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    expect(response.status).toBe(200)

    // Verify upsert uses onConflict for idempotence
    const upsertBuilder = mockFrom.mock.results[1].value
    expect(upsertBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_subscription_id: 'sub_idem' }),
      { onConflict: 'stripe_subscription_id' }
    )
  })

  it('handles duplicate events without error on second call', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_clerk_123' },
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    const setupMocks = () => {
      mockFrom.mockReturnValueOnce(createSelectBuilder({ id: 'uuid-user-1' }))
      mockSubscriptionsRetrieve.mockResolvedValue({ current_period_end: 1700000000 })
      mockFrom.mockReturnValueOnce(createUpsertBuilder())
      mockFrom.mockReturnValueOnce(createUpdateBuilder())
      mockUpdateUser.mockResolvedValue({})
    }

    const { POST } = await import('../route')

    setupMocks()
    const response1 = await POST(createRequest())
    expect(response1.status).toBe(200)

    setupMocks()
    const response2 = await POST(createRequest())
    expect(response2.status).toBe(200)
  })

  // --- Error handling ---

  it('returns 500 when handler throws an error', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_clerk_123' },
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    // User lookup succeeds
    mockFrom.mockReturnValueOnce(createSelectBuilder({ id: 'uuid-user-1' }))
    // Subscription retrieve fails
    mockSubscriptionsRetrieve.mockRejectedValue(new Error('Stripe API error'))

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('WEBHOOK_ERROR')
  })

  it('returns 500 when Supabase upsert fails', async () => {
    const event = createStripeEvent('checkout.session.completed', {
      metadata: { clerkId: 'user_clerk_123' },
      subscription: 'sub_abc',
      customer: 'cus_456',
    })
    mockConstructEvent.mockReturnValue(event)

    mockFrom.mockReturnValueOnce(createSelectBuilder({ id: 'uuid-user-1' }))
    mockSubscriptionsRetrieve.mockResolvedValue({ current_period_end: 1700000000 })
    // Supabase upsert returns error
    mockFrom.mockReturnValueOnce({
      upsert: vi.fn().mockReturnValue({ error: { message: 'DB constraint violation' } }),
    })

    const { POST } = await import('../route')
    const response = await POST(createRequest())

    expect(response.status).toBe(500)
    expect((await response.json()).error.code).toBe('WEBHOOK_ERROR')
  })

  it('returns 200 with received:true for unhandled event types', async () => {
    const event = createStripeEvent('some.unknown.event', { foo: 'bar' })
    mockConstructEvent.mockReturnValue(event)

    const { POST } = await import('../route')
    const response = await POST(createRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual({ received: true })
  })

  it('uses empty string when stripe-signature header is missing', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signature')
    })

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
    })

    const { POST } = await import('../route')
    await POST(req)

    expect(mockConstructEvent).toHaveBeenCalledWith('{}', '', process.env.STRIPE_WEBHOOK_SECRET)
  })
})
