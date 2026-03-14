import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SummaryCardSkeleton } from '../SummaryCardSkeleton'

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

  it('renders with loading aria-label', () => {
    const { container } = render(<SummaryCardSkeleton />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveAttribute('aria-label', 'Loading summary')
  })

  it('renders multiple skeleton elements', () => {
    render(<SummaryCardSkeleton />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(5)
  })
})
