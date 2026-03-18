import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { CategoryRow } from '../CategoryRow'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      newsletterCount: `${params?.count ?? 0} newsletters`,
      deleteConfirmTitle: 'Supprimer la catégorie',
      deleteConfirmDescription: 'Cette catégorie sera supprimée.',
      categoryNameLabel: 'Nom de la catégorie',
      colorLabel: 'Couleur',
      renameError: 'Erreur lors du renommage',
      colorError: 'Erreur lors du changement de couleur',
      deleteError: 'Erreur lors de la suppression',
      delete: 'Supprimer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
    }
    return messages[key] ?? key
  },
}))

const mockCategory = {
  id: 'cat-1',
  user_id: 'u1',
  name: 'Tech',
  color: '#3b82f6',
  created_at: '2026-01-01',
}

describe('CategoryRow', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders category name and color', () => {
    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )

    expect(screen.getByDisplayValue('Tech')).toBeInTheDocument()
    expect(screen.getByText('5 newsletters')).toBeInTheDocument()
  })

  it('renders color swatch with correct color', () => {
    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )

    const colorInput = screen.getByTestId('color-input')
    expect(colorInput).toHaveValue('#3b82f6')
  })

  it('calls API to rename on blur with changed name', async () => {
    const onUpdate = vi.fn()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { ...mockCategory, name: 'Technology' } }),
    })

    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={onUpdate} />,
    )

    const input = screen.getByDisplayValue('Tech')
    fireEvent.change(input, { target: { value: 'Technology' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/categories/cat-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Technology' }),
        }),
      )
    })
  })

  it('blurs input on Enter key press to trigger rename', () => {
    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )

    const input = screen.getByDisplayValue('Tech') as HTMLInputElement
    const blurSpy = vi.spyOn(input, 'blur')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(blurSpy).toHaveBeenCalled()
  })

  it('saves color on blur, not on every change', async () => {
    const onUpdate = vi.fn()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { ...mockCategory, color: '#ff0000' } }),
    })

    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={onUpdate} />,
    )

    const colorInput = screen.getByTestId('color-input')
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })

    // No API call on change
    expect(global.fetch).not.toHaveBeenCalled()

    fireEvent.blur(colorInput)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/categories/cat-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ color: '#ff0000' }),
        }),
      )
    })
  })

  it('does not call API on blur when name unchanged', () => {
    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )

    const input = screen.getByDisplayValue('Tech')
    fireEvent.blur(input)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows delete confirmation dialog', async () => {
    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={vi.fn()} onUpdate={vi.fn()} />,
    )

    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Supprimer la catégorie')).toBeInTheDocument()
    })
  })

  it('calls onDelete after confirming deletion', async () => {
    const onDelete = vi.fn()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { deleted: true } }),
    })

    render(
      <CategoryRow category={mockCategory} newsletterCount={5} onDelete={onDelete} onUpdate={vi.fn()} />,
    )

    // Open confirmation
    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    fireEvent.click(deleteButton)

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirmer/i })
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('cat-1')
    })
  })
})
