import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { OnboardingBanner } from '../OnboardingBanner'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
})

describe('OnboardingBanner', () => {
  const testAddress = 'abc-123@mail.briefly.app'
  const mockDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders the welcome title and subtitle', () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders all 3 onboarding steps', () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('steps.copy_address.title')).toBeInTheDocument()
    expect(screen.getByText('steps.subscribe.title')).toBeInTheDocument()
    expect(screen.getByText('steps.wait_summary.title')).toBeInTheDocument()
  })

  it('renders copy button and dismiss button', () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    expect(screen.getByText('copy_button')).toBeInTheDocument()
    expect(screen.getByText('dismiss')).toBeInTheDocument()
  })

  it('copies inbox address to clipboard on copy button click', async () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    const copyButton = screen.getByText('copy_button')

    await fireEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(testAddress)
    await waitFor(() => {
      expect(screen.getByText('copied')).toBeInTheDocument()
    })
  })

  it('calls onDismiss when close button is clicked', () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    const closeButton = screen.getByLabelText('close')

    fireEvent.click(closeButton)

    expect(mockDismiss).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    const dismissButton = screen.getByText('dismiss')

    fireEvent.click(dismissButton)

    expect(mockDismiss).toHaveBeenCalledOnce()
  })

  it('handles clipboard API failure gracefully', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Permission denied'))

    render(<OnboardingBanner inboxAddress={testAddress} onDismiss={mockDismiss} />)
    const copyButton = screen.getByText('copy_button')

    await fireEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(testAddress)
    // Should not throw, component still renders
    expect(screen.getByText('copy_button')).toBeInTheDocument()
  })
})
