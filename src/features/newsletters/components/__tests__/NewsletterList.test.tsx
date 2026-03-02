import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { NewsletterList } from '../NewsletterList'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      addButton: 'Add',
      empty: 'Add your first newsletter and forward it to your Briefly address.',
      limitReached: `${params?.count}/5 newsletters (free tier)`,
      limitMessage: 'Limit reached.',
      upgrade: 'Upgrade to Premium',
      upgradeDetail: 'for unlimited newsletters.',
      'card.confirm': 'Confirm',
      'card.cancel': 'Cancel',
    }
    return messages[key] ?? key
  },
  useLocale: () => 'en',
}))

// Mock child components to isolate NewsletterList behavior
vi.mock('../NewsletterLimitBanner', () => ({
  FREE_NEWSLETTER_LIMIT: 5,
  NewsletterLimitBanner: ({ count, tier }: { count: number; tier: string }) => (
    <div data-testid="limit-banner">{`${count} - ${tier}`}</div>
  ),
}))

vi.mock('../AddNewsletterModal', () => ({
  AddNewsletterModal: ({
    open,
    onClose,
  }: {
    open: boolean
    onClose: () => void
    onAdd: (n: unknown) => void
  }) =>
    open ? (
      <div data-testid="add-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

vi.mock('../NewsletterCard', () => ({
  NewsletterCard: ({
    newsletter,
    onDelete,
  }: {
    newsletter: { id: string; name: string }
    onToggle: (id: string, active: boolean) => void
    onDelete: (id: string) => void
  }) => (
    <div data-testid={`card-${newsletter.id}`}>
      {newsletter.name}
      <button onClick={() => onDelete(newsletter.id)}>Delete</button>
    </div>
  ),
}))

const mockNewsletters = [
  { id: 'nl-1', name: 'Morning Brew', email_address: 'brew@mb.com', active: true },
  { id: 'nl-2', name: 'TechCrunch', email_address: null, active: false },
]

describe('NewsletterList', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('renders empty state when no newsletters', () => {
    render(<NewsletterList initialNewsletters={[]} userTier="free" />)

    expect(
      screen.getByText(
        'Add your first newsletter and forward it to your Briefly address.',
      ),
    ).toBeInTheDocument()
  })

  it('renders newsletter cards when newsletters exist', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
    )

    expect(screen.getByTestId('card-nl-1')).toBeInTheDocument()
    expect(screen.getByTestId('card-nl-2')).toBeInTheDocument()
    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.getByText('TechCrunch')).toBeInTheDocument()
  })

  it('renders limit banner with active count', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
    )

    // Only 1 active newsletter (nl-1)
    expect(screen.getByTestId('limit-banner')).toHaveTextContent('1 - free')
  })

  it('renders add button', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
    )

    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument()
  })

  it('opens modal when add button is clicked', () => {
    render(<NewsletterList initialNewsletters={[]} userTier="free" />)

    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Add/i }))

    expect(screen.getByTestId('add-modal')).toBeInTheDocument()
  })

  it('removes newsletter from list on delete', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
    )

    expect(screen.getByTestId('card-nl-1')).toBeInTheDocument()

    // Click delete on first card
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.queryByTestId('card-nl-1')).not.toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/newsletters/nl-1', {
      method: 'DELETE',
    })
  })

  it('disables add button when free tier at limit', () => {
    const fiveActive = Array.from({ length: 5 }, (_, i) => ({
      id: `nl-${i}`,
      name: `Newsletter ${i}`,
      email_address: null,
      active: true,
    }))

    render(<NewsletterList initialNewsletters={fiveActive} userTier="free" />)

    expect(screen.getByRole('button', { name: /Add/i })).toBeDisabled()
  })

  it('enables add button for paid tier regardless of count', () => {
    const fiveActive = Array.from({ length: 5 }, (_, i) => ({
      id: `nl-${i}`,
      name: `Newsletter ${i}`,
      email_address: null,
      active: true,
    }))

    render(<NewsletterList initialNewsletters={fiveActive} userTier="paid" />)

    expect(screen.getByRole('button', { name: /Add/i })).toBeEnabled()
  })
})
