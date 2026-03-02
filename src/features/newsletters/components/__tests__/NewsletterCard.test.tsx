import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { NewsletterCard } from '../NewsletterCard'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      confirm: 'Confirm',
      cancel: 'Cancel',
    }
    return messages[key] ?? key
  },
}))

const baseNewsletter = {
  id: 'nl-1',
  name: 'Morning Brew',
  email_address: 'brew@morningbrew.com',
  active: true,
}

describe('NewsletterCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders newsletter name and email', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.getByText('brew@morningbrew.com')).toBeInTheDocument()
  })

  it('does not render email when null', () => {
    render(
      <NewsletterCard
        newsletter={{ ...baseNewsletter, email_address: null }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Morning Brew')).toBeInTheDocument()
    expect(screen.queryByText('brew@morningbrew.com')).not.toBeInTheDocument()
  })

  it('renders switch with correct checked state', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
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
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'unchecked')
  })

  it('shows confirm/cancel buttons after clicking delete', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    // Initially only the trash icon button
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()

    // Click trash button
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
        onToggle={vi.fn()}
        onDelete={onDelete}
      />,
    )

    // Click trash
    fireEvent.click(screen.getByRole('button'))
    // Click confirm
    fireEvent.click(screen.getByText('Confirm'))

    expect(onDelete).toHaveBeenCalledWith('nl-1')
  })

  it('hides confirm/cancel when cancel is clicked', () => {
    render(
      <NewsletterCard
        newsletter={baseNewsletter}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    // Click trash
    fireEvent.click(screen.getByRole('button'))
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })
})
