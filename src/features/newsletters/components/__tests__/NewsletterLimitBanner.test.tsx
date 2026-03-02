import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { NewsletterLimitBanner } from '../NewsletterLimitBanner'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      limitReached: `${params?.count}/5 newsletters (free tier)`,
      limitMessage: 'Limit reached.',
      upgrade: 'Upgrade to Premium',
      upgradeDetail: 'for unlimited newsletters.',
    }
    return messages[key] ?? key
  },
  useLocale: () => 'en',
}))

describe('NewsletterLimitBanner', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing for paid tier users', () => {
    const { container } = render(
      <NewsletterLimitBanner count={3} tier="paid" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows counter for free tier users below limit', () => {
    render(<NewsletterLimitBanner count={2} tier="free" />)

    expect(screen.getByText('2/5 newsletters (free tier)')).toBeInTheDocument()
    expect(screen.queryByText(/Limit reached/)).not.toBeInTheDocument()
  })

  it('shows limit warning at 5/5 with upgrade link', () => {
    render(<NewsletterLimitBanner count={5} tier="free" />)

    expect(screen.getByText('5/5 newsletters (free tier)')).toBeInTheDocument()
    expect(screen.getByText(/Limit reached/)).toBeInTheDocument()

    const upgradeLink = screen.getByRole('link', { name: 'Upgrade to Premium' })
    expect(upgradeLink).toBeInTheDocument()
    expect(upgradeLink).toHaveAttribute('href', '/en/billing')
  })

  it('shows limit warning when over limit', () => {
    render(<NewsletterLimitBanner count={6} tier="free" />)

    expect(screen.getByText(/Limit reached/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Upgrade to Premium' })).toBeInTheDocument()
  })

  it('does not render add button (handled by parent)', () => {
    render(<NewsletterLimitBanner count={5} tier="free" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
