import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SummaryCard, formatRelativeDate } from '../SummaryCard'

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => {
    const t = (key: string, values?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
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
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>{children}</span>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const mockMarkAsRead = vi.fn()
vi.mock('../../hooks/useMarkAsRead', () => ({
  useMarkAsRead: () => ({ markAsRead: mockMarkAsRead }),
}))

const baseSummary = {
  id: 'sum-1',
  title: 'Top 5 des tendances tech 2026',
  key_points: [
    'IA générative en entreprise',
    'Edge computing en croissance',
    'Web3 en recul',
  ],
  source_url: 'https://example.com/newsletter',
  llm_tier: 'basic' as const,
  read_at: null,
  generated_at: new Date().toISOString(),
  raw_emails: {
    sender_email: 'tech@newsletter.com',
    subject: 'Tech Weekly #42',
    newsletter_id: 'nl-1',
  },
}

describe('SummaryCard', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders title, sender email, and date', () => {
    render(<SummaryCard summary={baseSummary} />)

    expect(screen.getByText('Top 5 des tendances tech 2026')).toBeInTheDocument()
    expect(screen.getByText(/tech@newsletter.com/)).toBeInTheDocument()
  })

  it('renders max 3 key points', () => {
    const summary = {
      ...baseSummary,
      key_points: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
    }
    render(<SummaryCard summary={summary} />)

    expect(screen.getByText('Point 1')).toBeInTheDocument()
    expect(screen.getByText('Point 2')).toBeInTheDocument()
    expect(screen.getByText('Point 3')).toBeInTheDocument()
    expect(screen.queryByText('Point 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Point 5')).not.toBeInTheDocument()
  })

  it('renders Premium badge when llm_tier is premium', () => {
    render(<SummaryCard summary={{ ...baseSummary, llm_tier: 'premium' }} />)

    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('does not render Premium badge when llm_tier is basic', () => {
    render(<SummaryCard summary={baseSummary} />)

    expect(screen.queryByText('Premium')).not.toBeInTheDocument()
  })

  it('renders source link opening in new tab', () => {
    render(<SummaryCard summary={baseSummary} />)

    const link = screen.getByText('Lire la newsletter complète')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('href', 'https://example.com/newsletter')
  })

  it('does not render source link when source_url is null', () => {
    render(<SummaryCard summary={{ ...baseSummary, source_url: null }} />)

    expect(screen.queryByText('Lire la newsletter complète')).not.toBeInTheDocument()
  })

  it('renders unread indicator (ring) when read_at is null', () => {
    const { container } = render(<SummaryCard summary={baseSummary} />)

    const article = container.querySelector('article')
    expect(article?.className).toContain('ring-2')
    expect(article?.className).not.toContain('opacity-75')
  })

  it('renders read indicator (opacity + check icon) when read_at is set', () => {
    const readSummary = { ...baseSummary, read_at: '2026-03-05T10:00:00Z' }
    const { container } = render(<SummaryCard summary={readSummary} />)

    const article = container.querySelector('article')
    expect(article?.className).toContain('opacity-75')
    expect(article?.className).not.toContain('ring-2')

    expect(screen.getByLabelText('Lu')).toBeInTheDocument()
  })

  it('does not render check icon when unread', () => {
    render(<SummaryCard summary={baseSummary} />)

    expect(screen.queryByLabelText('Lu')).not.toBeInTheDocument()
  })

  it('renders title as link to detail page', () => {
    render(<SummaryCard summary={baseSummary} />)

    const link = screen.getByText('Top 5 des tendances tech 2026')
    expect(link.closest('a')).toHaveAttribute('href', '/fr/summaries/sum-1')
  })

  it('has accessible article element', () => {
    render(<SummaryCard summary={baseSummary} />)

    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  it('has focus-visible styles on title link', () => {
    render(<SummaryCard summary={baseSummary} />)

    const link = screen.getByText('Top 5 des tendances tech 2026')
    expect(link.className).toContain('focus-visible:ring-2')
  })

  it('renders empty key points list gracefully', () => {
    render(<SummaryCard summary={{ ...baseSummary, key_points: [] }} />)

    const list = screen.getByRole('list')
    expect(list.children).toHaveLength(0)
  })

  it('calls onNavigate when title is clicked', () => {
    const onNavigate = vi.fn()
    render(<SummaryCard summary={baseSummary} onNavigate={onNavigate} />)

    screen.getByText('Top 5 des tendances tech 2026').click()
    expect(onNavigate).toHaveBeenCalled()
  })

  it('calls markAsRead when title link is clicked', () => {
    render(<SummaryCard summary={baseSummary} />)

    screen.getByText('Top 5 des tendances tech 2026').click()
    expect(mockMarkAsRead).toHaveBeenCalled()
  })

  it('calls markAsRead when source link is clicked', () => {
    render(<SummaryCard summary={baseSummary} />)

    screen.getByText('Lire la newsletter complète').click()
    expect(mockMarkAsRead).toHaveBeenCalled()
  })

  it('calls both markAsRead and onNavigate on title click', () => {
    const onNavigate = vi.fn()
    render(<SummaryCard summary={baseSummary} onNavigate={onNavigate} />)

    screen.getByText('Top 5 des tendances tech 2026').click()
    expect(mockMarkAsRead).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalled()
  })
})

describe('formatRelativeDate', () => {
  const mockT = (key: string, values?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      justNow: "À l'instant",
      hoursAgo: `Il y a ${values?.hours ?? ''}h`,
      yesterday: 'Hier',
    }
    return messages[key] ?? key
  }

  it('returns "just now" for dates less than 1 hour ago', () => {
    const recent = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    expect(formatRelativeDate(recent, mockT)).toBe("À l'instant")
  })

  it('returns hours ago for dates less than 24 hours ago', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    expect(formatRelativeDate(fiveHoursAgo, mockT)).toBe('Il y a 5h')
  })

  it('returns "yesterday" for dates 24-48 hours ago', () => {
    const yesterday = new Date(Date.now() - 30 * 3600 * 1000).toISOString()
    expect(formatRelativeDate(yesterday, mockT)).toBe('Hier')
  })

  it('returns formatted date for older dates', () => {
    const oldDate = '2026-01-15T10:00:00Z'
    const result = formatRelativeDate(oldDate, mockT, 'fr')
    expect(result).toContain('15')
    expect(result).toContain('janv')
  })

  it('returns "just now" for future dates', () => {
    const future = new Date(Date.now() + 3600 * 1000).toISOString()
    expect(formatRelativeDate(future, mockT)).toBe("À l'instant")
  })

  it('returns "just now" for invalid date strings', () => {
    expect(formatRelativeDate('not-a-date', mockT)).toBe("À l'instant")
  })

  it('uses en-US locale for English', () => {
    const oldDate = '2026-01-15T10:00:00Z'
    const result = formatRelativeDate(oldDate, mockT, 'en')
    expect(result).toContain('15')
    expect(result).toContain('Jan')
  })
})
