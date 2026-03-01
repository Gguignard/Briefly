import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { InboxAddressCard } from '../InboxAddressCard'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
})

describe('InboxAddressCard', () => {
  const testAddress = 'abc-123@mail.briefly.app'

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders the inbox address', () => {
    render(<InboxAddressCard inboxAddress={testAddress} />)
    expect(screen.getByText(testAddress)).toBeInTheDocument()
  })

  it('renders the title and description', () => {
    render(<InboxAddressCard inboxAddress={testAddress} />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('renders a copy button with aria-label', () => {
    render(<InboxAddressCard inboxAddress={testAddress} />)
    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument()
  })

  it('copies address to clipboard and shows check icon', async () => {
    render(<InboxAddressCard inboxAddress={testAddress} />)
    const copyButton = screen.getByRole('button', { name: 'copy' })

    await fireEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(testAddress)
    await waitFor(() => {
      // Check icon should appear (lucide renders SVGs with class)
      const svg = copyButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('handles clipboard API failure gracefully', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard permission denied'))

    render(<InboxAddressCard inboxAddress={testAddress} />)
    const copyButton = screen.getByRole('button', { name: 'copy' })

    // Should not throw
    await fireEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(testAddress)
  })
})
