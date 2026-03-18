import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { AddCategoryForm } from '../AddCategoryForm'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      namePlaceholder: 'Nom de la catégorie',
      colorLabel: 'Couleur',
      addError: "Erreur lors de l'ajout",
      save: 'Enregistrer',
      cancel: 'Annuler',
    }
    return messages[key] ?? key
  },
}))

describe('AddCategoryForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders name input and color picker', () => {
    render(<AddCategoryForm onAdd={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText('Nom de la catégorie')).toBeInTheDocument()
    expect(screen.getByTestId('color-input')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<AddCategoryForm onAdd={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('submits form and calls onAdd with new category', async () => {
    const onAdd = vi.fn()
    const newCategory = { id: 'cat-new', user_id: 'u1', name: 'Science', color: '#6366f1', created_at: '2026-01-01' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: newCategory }),
    })

    render(<AddCategoryForm onAdd={onAdd} onCancel={vi.fn()} />)

    const input = screen.getByPlaceholderText('Nom de la catégorie')
    fireEvent.change(input, { target: { value: 'Science' } })

    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/categories',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Science'),
        }),
      )
    })

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled()
    })
  })

  it('disables submit button when name is empty', () => {
    render(<AddCategoryForm onAdd={vi.fn()} onCancel={vi.fn()} />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toBeDisabled()
  })
})
