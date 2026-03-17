import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NewsletterList } from '../NewsletterList'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

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
    onToggle,
    onDelete,
    onCategoryChange,
  }: {
    newsletter: { id: string; name: string; active: boolean }
    categories: unknown[]
    onToggle: (id: string, active: boolean) => void
    onDelete: (id: string) => void
    onCategoryChange: (id: string, categoryId: string | null) => void
  }) => (
    <div data-testid={`card-${newsletter.id}`}>
      {newsletter.name}
      <button onClick={() => onToggle(newsletter.id, !newsletter.active)}>Toggle</button>
      <button onClick={() => onDelete(newsletter.id)}>Delete</button>
      <button onClick={() => onCategoryChange(newsletter.id, 'cat-1')}>SetCategory</button>
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
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/categories') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [{ id: 'cat-1', name: 'Tech', color: '#3b82f6' }] }),
          })
        }
        return Promise.resolve({ ok: true })
      }),
    )
  })

  it('renders empty state when no newsletters', () => {
    render(<NewsletterList initialNewsletters={[]} userTier="free" />, { wrapper: createWrapper() })

    expect(
      screen.getByText(
        'Add your first newsletter and forward it to your Briefly address.',
      ),
    ).toBeInTheDocument()
  })

  it('renders newsletter cards when newsletters exist', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByTestId('card-nl-1')).toBeInTheDocument()
    expect(screen.getByTestId('card-nl-2')).toBeInTheDocument()
    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.getByText('TechCrunch')).toBeInTheDocument()
  })

  it('renders limit banner with active count', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    // Only 1 active newsletter (nl-1)
    expect(screen.getByTestId('limit-banner')).toHaveTextContent('1 - free')
  })

  it('renders add button', () => {
    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument()
  })

  it('opens modal when add button is clicked', () => {
    render(<NewsletterList initialNewsletters={[]} userTier="free" />, { wrapper: createWrapper() })

    expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Add/i }))

    expect(screen.getByTestId('add-modal')).toBeInTheDocument()
  })

  it('removes newsletter from list on delete', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
      }
      return Promise.resolve({ ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
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

  it('calls PATCH API and updates state on toggle', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
      }
      return Promise.resolve({ ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    // nl-1 is active, toggle it off
    const toggleButtons = screen.getAllByText('Toggle')
    fireEvent.click(toggleButtons[0])

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/newsletters/nl-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      })
    })
  })

  it('does not update state when toggle API fails', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
      }
      return Promise.resolve({ ok: false })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    // Banner shows 1 active before toggle
    expect(screen.getByTestId('limit-banner')).toHaveTextContent('1 - free')

    const toggleButtons = screen.getAllByText('Toggle')
    fireEvent.click(toggleButtons[0])

    // After failed toggle, active count should remain 1
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })
    expect(screen.getByTestId('limit-banner')).toHaveTextContent('1 - free')
  })

  it('disables add button when free tier at limit', () => {
    const fiveActive = Array.from({ length: 5 }, (_, i) => ({
      id: `nl-${i}`,
      name: `Newsletter ${i}`,
      email_address: null,
      active: true,
    }))

    render(<NewsletterList initialNewsletters={fiveActive} userTier="free" />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: /Add/i })).toBeDisabled()
  })

  it('calls PATCH API with categoryId on category change', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ id: 'cat-1', name: 'Tech', color: '#3b82f6' }] }),
        })
      }
      return Promise.resolve({ ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsletterList initialNewsletters={mockNewsletters} userTier="free" />,
      { wrapper: createWrapper() },
    )

    const setCategoryButtons = screen.getAllByText('SetCategory')
    fireEvent.click(setCategoryButtons[0])

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/newsletters/nl-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: 'cat-1' }),
      })
    })
  })

  it('enables add button for paid tier regardless of count', () => {
    const fiveActive = Array.from({ length: 5 }, (_, i) => ({
      id: `nl-${i}`,
      name: `Newsletter ${i}`,
      email_address: null,
      active: true,
    }))

    render(<NewsletterList initialNewsletters={fiveActive} userTier="paid" />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: /Add/i })).toBeEnabled()
  })
})
