import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { SubscriptionCard } from '../SubscriptionCard'

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      title: 'Active Premium subscription',
      badge: 'Premium',
      renewalDate: `Next renewal: ${params?.date ?? ''}`,
      manage: 'Manage subscription',
      loading: 'Loading...',
      error: 'Unable to open the billing portal. Please try again.',
    }
    return messages[key] ?? key
  },
}))

describe('SubscriptionCard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the active subscription title and badge', () => {
    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    expect(screen.getByText('Active Premium subscription')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('renders the renewal date when provided', () => {
    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    expect(screen.getByText(/Next renewal:/)).toBeInTheDocument()
  })

  it('does not render renewal date when null', () => {
    render(
      <SubscriptionCard
        currentPeriodEnd={null}
      />
    )

    expect(screen.queryByText(/Next renewal:/)).not.toBeInTheDocument()
  })

  it('renders the manage button', () => {
    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    expect(screen.getByRole('button', { name: 'Manage subscription' })).toBeInTheDocument()
  })

  it('calls portal API on manage button click', async () => {
    const portalUrl = 'https://billing.stripe.com/session/test'
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { url: portalUrl } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Manage subscription' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/billing/portal', { method: 'POST' })
    })
  })

  it('shows error message when portal fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Manage subscription' }))

    await waitFor(() => {
      expect(screen.getByText('Unable to open the billing portal. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows error message when portal returns no URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: null }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(
      <SubscriptionCard
        currentPeriodEnd="2026-04-15T00:00:00Z"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Manage subscription' }))

    await waitFor(() => {
      expect(screen.getByText('Unable to open the billing portal. Please try again.')).toBeInTheDocument()
    })
  })
})
