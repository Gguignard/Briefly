import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SummariesFeed } from '../SummariesFeed'

// Mock next/navigation
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => {
    const t = (key: string, values?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        empty: 'Vos premiers résumés arriveront demain matin !',
        error: 'Impossible de charger vos résumés.',
        newCount: `${values?.count ?? 0} nouveaux résumés`,
        readMore: 'Lire la newsletter complète',
        badgePremium: 'Premium',
        badgeBasic: 'Basique',
        readIndicator: 'Lu',
        justNow: "À l'instant",
        hoursAgo: `Il y a ${values?.hours ?? ''}h`,
        yesterday: 'Hier',
      }
      return messages[key] ?? key
    }
    return t
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

const mockSummary = {
  id: 's1',
  title: 'Test Summary',
  key_points: ['Point 1'],
  source_url: null,
  llm_tier: 'basic' as const,
  read_at: null,
  generated_at: new Date().toISOString(),
  raw_emails: { sender_email: 'test@test.com', subject: 'Test', newsletter_id: 'n1' },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('SummariesFeed', () => {
  beforeEach(() => {
    mockSearchParams.delete('categoryId')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('fetches summaries without categoryId by default', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { summaries: [mockSummary], unreadCount: 0 } }),
    } as Response)

    render(<SummariesFeed />, { wrapper: createWrapper() })

    await screen.findByText('Test Summary')

    expect(fetchSpy).toHaveBeenCalledWith('/api/summaries?page=1')
  })

  it('includes categoryId in fetch when search param is set', async () => {
    mockSearchParams.set('categoryId', 'cat-1')

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { summaries: [mockSummary], unreadCount: 0 } }),
    } as Response)

    render(<SummariesFeed />, { wrapper: createWrapper() })

    await screen.findByText('Test Summary')

    expect(fetchSpy).toHaveBeenCalledWith('/api/summaries?page=1&categoryId=cat-1')
  })

  it('shows empty state when no summaries', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { summaries: [], unreadCount: 0 } }),
    } as Response)

    render(<SummariesFeed />, { wrapper: createWrapper() })

    expect(await screen.findByText('Vos premiers résumés arriveront demain matin !')).toBeInTheDocument()
  })
})
