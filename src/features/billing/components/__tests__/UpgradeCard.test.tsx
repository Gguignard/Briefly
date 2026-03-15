import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { UpgradeCard } from '../UpgradeCard'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      title: 'Upgrade to Premium',
      price: '$5/month',
      roi: '5h saved per week >> $5 per month',
      cta: 'Start Premium trial',
      'features.unlimited': 'Unlimited newsletters',
      'features.premium_llm': 'All summaries with premium LLM',
      'features.categories': 'Custom categorization',
      'features.support': 'Priority support',
    }
    return messages[key] ?? key
  },
}))

describe('UpgradeCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the upgrade title and price', () => {
    render(<UpgradeCard />)

    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument()
    expect(screen.getByText('$5/month')).toBeInTheDocument()
  })

  it('renders the ROI message', () => {
    render(<UpgradeCard />)

    expect(screen.getByText('5h saved per week >> $5 per month')).toBeInTheDocument()
  })

  it('renders all premium features', () => {
    render(<UpgradeCard />)

    expect(screen.getByText('Unlimited newsletters')).toBeInTheDocument()
    expect(screen.getByText('All summaries with premium LLM')).toBeInTheDocument()
    expect(screen.getByText('Custom categorization')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
  })

  it('renders the CTA link pointing to checkout', () => {
    render(<UpgradeCard />)

    const link = screen.getByRole('link', { name: 'Start Premium trial' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/api/billing/checkout')
  })
})
