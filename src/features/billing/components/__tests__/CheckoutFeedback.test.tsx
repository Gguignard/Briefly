import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { CheckoutFeedback } from '../CheckoutFeedback'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      success: 'Welcome to Briefly Premium! Your subscription is active.',
      canceled: 'Checkout canceled. You can subscribe at any time.',
      alreadySubscribed: 'You are already subscribed to Briefly Premium.',
    }
    return messages[key] ?? key
  },
}))

describe('CheckoutFeedback', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when no feedback flags are set', () => {
    const { container } = render(
      <CheckoutFeedback success={false} canceled={false} alreadySubscribed={false} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders success message when success is true', () => {
    render(<CheckoutFeedback success={true} canceled={false} alreadySubscribed={false} />)

    expect(screen.getByText('Welcome to Briefly Premium! Your subscription is active.')).toBeInTheDocument()
  })

  it('renders canceled message when canceled is true', () => {
    render(<CheckoutFeedback success={false} canceled={true} alreadySubscribed={false} />)

    expect(screen.getByText('Checkout canceled. You can subscribe at any time.')).toBeInTheDocument()
  })

  it('renders already subscribed message when alreadySubscribed is true', () => {
    render(<CheckoutFeedback success={false} canceled={false} alreadySubscribed={true} />)

    expect(screen.getByText('You are already subscribed to Briefly Premium.')).toBeInTheDocument()
  })

  it('renders success alert with green styling', () => {
    render(<CheckoutFeedback success={true} canceled={false} alreadySubscribed={false} />)

    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('border-green-200')
    expect(alert.className).toContain('bg-green-50')
  })

  it('renders already subscribed alert with blue styling', () => {
    render(<CheckoutFeedback success={false} canceled={false} alreadySubscribed={true} />)

    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('border-blue-200')
    expect(alert.className).toContain('bg-blue-50')
  })
})
