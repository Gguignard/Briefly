import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SummaryCardSkeleton } from '../SummaryCardSkeleton'

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const messages: Record<string, string> = {
        loadingSkeleton: 'Chargement du résumé',
      }
      return messages[key] ?? key
    }
    return t
  },
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div className={className} data-testid="skeleton" {...props} />
  ),
}))

describe('SummaryCardSkeleton', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with aria-busy attribute', () => {
    const { container } = render(<SummaryCardSkeleton />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveAttribute('aria-busy', 'true')
  })

  it('renders with localized loading aria-label', () => {
    const { container } = render(<SummaryCardSkeleton />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveAttribute('aria-label', 'Chargement du résumé')
  })

  it('renders multiple skeleton elements', () => {
    render(<SummaryCardSkeleton />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(5)
  })
})
