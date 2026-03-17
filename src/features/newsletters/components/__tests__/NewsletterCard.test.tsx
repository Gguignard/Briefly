import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { NewsletterCard } from '../NewsletterCard'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      confirm: 'Confirm',
      cancel: 'Cancel',
      categoryPlaceholder: 'Category...',
      noCategory: 'None',
    }
    return messages[key] ?? key
  },
}))

const baseNewsletter = {
  id: 'nl-1',
  name: 'Morning Brew',
  email_address: 'brew@morningbrew.com',
  active: true,
  category_id: null,
}

const categories = [
  { id: 'cat-1', user_id: 'u1', name: 'Tech', color: '#3b82f6', created_at: '2026-01-01' },
  { id: 'cat-2', user_id: 'u1', name: 'Finance', color: '#10b981', created_at: '2026-01-01' },
]

describe('NewsletterCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders newsletter name and email', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.getByText('brew@morningbrew.com')).toBeInTheDocument()
  })

  it('does not render email when null', () => {
    render(
      <NewsletterCard
        newsletter={{ ...baseNewsletter, email_address: null }}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.queryByText('brew@morningbrew.com')).not.toBeInTheDocument()
  })

  it('renders switch with correct checked state', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    const switchEl = screen.getByRole('switch')
    expect(switchEl).toBeInTheDocument()
    expect(switchEl).toHaveAttribute('data-state', 'checked')
  })

  it('renders switch unchecked when inactive', () => {
    render(
      <NewsletterCard
        newsletter={{ ...baseNewsletter, active: false }}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'unchecked')
  })

  it('shows confirm/cancel buttons after clicking delete', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()

    const trashButton = screen.getByRole('button')
    fireEvent.click(trashButton)

    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onDelete when confirm is clicked', () => {
    const onDelete = vi.fn()
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onCategoryChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Confirm'))

    expect(onDelete).toHaveBeenCalledWith('nl-1')
  })

  it('hides confirm/cancel when cancel is clicked', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Cancel'))

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('displays category badge when newsletter has a category', () => {
    render(
      <NewsletterCard
        newsletter={{ ...baseNewsletter, category_id: 'cat-1' }}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    // Badge is the span with the colored background style
    const badge = screen.getAllByText('Tech').find(
      (el) => el.className.includes('rounded-full'),
    )
    expect(badge).toBeDefined()
  })

  it('does not display category badge when category_id is null', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    expect(screen.queryByText('Tech')).not.toBeInTheDocument()
    expect(screen.queryByText('Finance')).not.toBeInTheDocument()
  })

  it('renders CategorySelect component', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        categories={categories}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onCategoryChange={vi.fn()}
      />,
    )

    // The select trigger should be present (combobox role from Radix)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
