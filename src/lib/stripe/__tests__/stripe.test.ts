import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Stripe Client - Unit', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key_for_testing')
    vi.stubEnv('STRIPE_PREMIUM_PRICE_ID', 'price_test_fake_id')
  })

  it('should export a configured Stripe instance', async () => {
    const { stripe } = await import('../index')
    expect(stripe).toBeDefined()
    expect(typeof stripe.customers).toBe('object')
    expect(typeof stripe.subscriptions).toBe('object')
    expect(typeof stripe.checkout).toBe('object')
  })

  it('should export STRIPE_PRICE_ID from env', async () => {
    const { STRIPE_PRICE_ID } = await import('../index')
    expect(STRIPE_PRICE_ID).toBe('price_test_fake_id')
  })

  it('should throw if STRIPE_SECRET_KEY is missing', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '')
    await expect(() => import('../index')).rejects.toThrow(
      'Missing STRIPE_SECRET_KEY environment variable'
    )
  })

  it('should throw if STRIPE_PREMIUM_PRICE_ID is missing', async () => {
    vi.stubEnv('STRIPE_PREMIUM_PRICE_ID', '')
    await expect(() => import('../index')).rejects.toThrow(
      'Missing STRIPE_PREMIUM_PRICE_ID environment variable'
    )
  })
})
