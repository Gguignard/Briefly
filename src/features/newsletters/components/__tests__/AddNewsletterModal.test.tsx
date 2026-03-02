import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { AddNewsletterModal } from '../AddNewsletterModal'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      title: 'Add a newsletter',
      description: 'Enter the newsletter name and optionally the sender email address.',
      nameLabel: 'Name',
      namePlaceholder: 'e.g. Morning Brew',
      emailLabel: 'Sender email (optional)',
      emailPlaceholder: 'e.g. newsletter@morningbrew.com',
      submit: 'Add',
      submitting: 'Adding...',
      error: 'An error occurred. Please try again.',
    }
    return messages[key] ?? key
  },
}))

describe('AddNewsletterModal', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not render when closed', () => {
    render(
      <AddNewsletterModal open={false} onClose={vi.fn()} onAdd={vi.fn()} />,
    )

    expect(screen.queryByText('Add a newsletter')).not.toBeInTheDocument()
  })

  it('renders form fields when open', () => {
    render(
      <AddNewsletterModal open={true} onClose={vi.fn()} onAdd={vi.fn()} />,
    )

    expect(screen.getByText('Add a newsletter')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Sender email (optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('disables submit when name is empty', () => {
    render(
      <AddNewsletterModal open={true} onClose={vi.fn()} onAdd={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('enables submit when name is entered', () => {
    render(
      <AddNewsletterModal open={true} onClose={vi.fn()} onAdd={vi.fn()} />,
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Newsletter' },
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })

  it('calls onAdd with API response data on successful submit', async () => {
    const mockNewsletter = {
      id: 'nl-new',
      name: 'Test Newsletter',
      email_address: 'test@example.com',
      active: true,
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockNewsletter }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const onAdd = vi.fn()
    render(
      <AddNewsletterModal open={true} onClose={vi.fn()} onAdd={onAdd} />,
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Newsletter' },
    })
    fireEvent.change(screen.getByLabelText('Sender email (optional)'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(mockNewsletter)
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/newsletters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Newsletter',
        emailAddress: 'test@example.com',
      }),
    })
  })

  it('shows error on failed submit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false }),
    )

    render(
      <AddNewsletterModal open={true} onClose={vi.fn()} onAdd={vi.fn()} />,
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred. Please try again.'),
      ).toBeInTheDocument()
    })
  })
})
