import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// --- Mocks ---

const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

const mockRedirect = vi.fn()
const mockNotFound = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('REDIRECT')
  },
  notFound: () => {
    mockNotFound()
    throw new Error('NOT_FOUND')
  },
}))

vi.mock('next-intl/server', () => ({
  getTranslations: () => {
    const t = (key: string, values?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        backToSummaries: 'Retour aux résumés',
        keyPointsHeading: 'POINTS CLÉS',
        readOriginal: 'Lire la newsletter originale',
        badgePremium: 'Premium',
        source: `Source : ${values?.sender ?? ''}`,
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
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>{children}</span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => (
    asChild ? <>{children}</> : <button {...props}>{children}</button>
  ),
}))

const mockSelect = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'summaries') {
        return {
          select: (...args: unknown[]) => mockSelect(...args),
          update: (data: unknown) => mockUpdate(data),
        }
      }
      return {}
    },
  }),
}))

// Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: ({ className }: any) => <span data-testid="arrow-left" className={className} />,
  ExternalLink: ({ className }: any) => <span data-testid="external-link" className={className} />,
}))

import SummaryDetailPage from '../page'

// --- Helpers ---

const baseSummary = {
  id: 'sum-123',
  title: 'Top 5 tendances tech 2026',
  key_points: ['IA générative', 'Edge computing', 'Web3 en recul'],
  source_url: 'https://example.com/newsletter',
  llm_tier: 'premium',
  read_at: null,
  generated_at: '2026-03-10T08:00:00Z',
  raw_emails: {
    sender_email: 'tech@newsletter.com',
    subject: 'Tech Weekly',
    received_at: '2026-03-10T07:00:00Z',
  },
}

function setupSupabaseMock(summary: any, error: any = null) {
  mockSelect.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: summary, error }),
      }),
    }),
  })
  mockUpdate.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  })
}

const defaultParams = Promise.resolve({ id: 'sum-123', locale: 'fr' })

// --- Tests ---

describe('SummaryDetailPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user-1' })
  })

  it('redirects to sign-in when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    setupSupabaseMock(baseSummary)

    await expect(
      SummaryDetailPage({ params: defaultParams })
    ).rejects.toThrow('REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })

  it('returns notFound when summary does not exist', async () => {
    setupSupabaseMock(null, { message: 'not found' })

    await expect(
      SummaryDetailPage({ params: defaultParams })
    ).rejects.toThrow('NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('returns notFound when supabase returns error (wrong user)', async () => {
    setupSupabaseMock(null, { message: 'Row not found' })

    await expect(
      SummaryDetailPage({ params: defaultParams })
    ).rejects.toThrow('NOT_FOUND')
  })

  it('renders summary title and key points', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.getByText('Top 5 tendances tech 2026')).toBeInTheDocument()
    expect(screen.getByText('IA générative')).toBeInTheDocument()
    expect(screen.getByText('Edge computing')).toBeInTheDocument()
    expect(screen.getByText('Web3 en recul')).toBeInTheDocument()
  })

  it('renders key points heading', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.getByText('POINTS CLÉS')).toBeInTheDocument()
  })

  it('renders Premium badge for premium tier', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('does not render Premium badge for basic tier', async () => {
    setupSupabaseMock({ ...baseSummary, llm_tier: 'basic' })

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.queryByText('Premium')).not.toBeInTheDocument()
  })

  it('renders source email', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.getByText('Source : tech@newsletter.com')).toBeInTheDocument()
  })

  it('renders back link to summaries', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    const backLink = screen.getByText('Retour aux résumés')
    expect(backLink.closest('a')).toHaveAttribute('href', '/fr/summaries')
  })

  it('renders original newsletter link when source_url exists', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    const link = screen.getByText('Lire la newsletter originale')
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/newsletter')
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
    expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render original newsletter link when source_url is null', async () => {
    setupSupabaseMock({ ...baseSummary, source_url: null })

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.queryByText('Lire la newsletter originale')).not.toBeInTheDocument()
  })

  it('marks summary as read when read_at is null', async () => {
    setupSupabaseMock({ ...baseSummary, read_at: null })

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(mockUpdate).toHaveBeenCalledWith({
      read_at: expect.any(String),
    })
  })

  it('does not mark as read when already read', async () => {
    setupSupabaseMock({ ...baseSummary, read_at: '2026-03-09T10:00:00Z' })

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('renders all key points numbered', async () => {
    const summary = {
      ...baseSummary,
      key_points: ['Point A', 'Point B', 'Point C', 'Point D', 'Point E'],
    }
    setupSupabaseMock(summary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    // All 5 points rendered (not truncated like SummaryCard)
    expect(screen.getByText('Point A')).toBeInTheDocument()
    expect(screen.getByText('Point E')).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('5.')).toBeInTheDocument()
  })

  it('renders article as semantic element', async () => {
    setupSupabaseMock(baseSummary)

    const jsx = await SummaryDetailPage({ params: defaultParams })
    render(jsx)

    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})
