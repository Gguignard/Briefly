import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { OnboardingWrapper } from '../OnboardingWrapper'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockFetch = vi.fn().mockResolvedValue({ ok: true })
vi.stubGlobal('fetch', mockFetch)

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
})

describe('OnboardingWrapper', () => {
  const testAddress = 'abc-123@mail.briefly.app'

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders OnboardingBanner when visible', () => {
    render(<OnboardingWrapper inboxAddress={testAddress} />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('hides banner and calls API on dismiss', async () => {
    render(<OnboardingWrapper inboxAddress={testAddress} />)

    const dismissButton = screen.getByText('dismiss')
    await fireEvent.click(dismissButton)

    expect(screen.queryByText('title')).not.toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledWith('/api/settings/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: true }),
    })
  })

  it('re-shows banner when API call throws a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<OnboardingWrapper inboxAddress={testAddress} />)

    const dismissButton = screen.getByText('dismiss')
    await fireEvent.click(dismissButton)

    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument()
    })
  })

  it('re-shows banner when API returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

    render(<OnboardingWrapper inboxAddress={testAddress} />)

    const dismissButton = screen.getByText('dismiss')
    await fireEvent.click(dismissButton)

    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument()
    })
  })
})
