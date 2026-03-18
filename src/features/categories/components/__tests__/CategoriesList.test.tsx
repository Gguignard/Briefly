import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { CategoriesList } from '../CategoriesList'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      count: `${params?.count ?? 0} catégorie(s)`,
      countWithLimit: `${params?.count ?? 0}/3 catégorie(s)`,
      add: 'Ajouter',
      empty: 'Aucune catégorie. Créez-en une pour organiser vos newsletters.',
      upgradeBanner: 'Limite de 3 catégories atteinte.',
      upgradeLink: 'Passez au Premium',
      unlimitedCategories: 'pour des catégories illimitées.',
      deleteConfirmTitle: 'Supprimer la catégorie',
      deleteConfirmDescription: 'Cette catégorie sera supprimée.',
      newsletterCount: `${params?.count ?? 0} newsletters`,
      namePlaceholder: 'Nom de la catégorie',
      colorLabel: 'Couleur',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      confirm: 'Confirmer',
      addError: "Erreur lors de l'ajout",
      categoryNameLabel: 'Nom de la catégorie',
      colorLabel: 'Couleur',
      renameError: 'Erreur lors du renommage',
      colorError: 'Erreur lors du changement de couleur',
      deleteError: 'Erreur lors de la suppression',
    }
    return messages[key] ?? key
  },
  useLocale: () => 'fr',
}))

const mockCategories = [
  { id: 'cat-1', user_id: 'u1', name: 'Tech', color: '#3b82f6', created_at: '2026-01-01', newsletters: [{ count: 5 }] },
  { id: 'cat-2', user_id: 'u1', name: 'Finance', color: '#10b981', created_at: '2026-01-01', newsletters: [{ count: 2 }] },
]

describe('CategoriesList', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders category list with counts for free tier', () => {
    render(<CategoriesList initialCategories={mockCategories} userTier="free" />)

    expect(screen.getByDisplayValue('Tech')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Finance')).toBeInTheDocument()
    expect(screen.getByText('2/3 catégorie(s)')).toBeInTheDocument()
  })

  it('renders category count without limit for paid tier', () => {
    render(<CategoriesList initialCategories={mockCategories} userTier="paid" />)

    expect(screen.getByText('2 catégorie(s)')).toBeInTheDocument()
  })

  it('shows upgrade banner when free tier at limit (3/3)', () => {
    const threeCategories = [
      ...mockCategories,
      { id: 'cat-3', user_id: 'u1', name: 'Culture', color: '#f59e0b', created_at: '2026-01-01', newsletters: [{ count: 0 }] },
    ]

    render(<CategoriesList initialCategories={threeCategories} userTier="free" />)

    expect(screen.getByText(/Limite de 3 catégories atteinte/)).toBeInTheDocument()
    expect(screen.getByText('Passez au Premium')).toBeInTheDocument()
  })

  it('does not show upgrade banner for paid tier', () => {
    render(<CategoriesList initialCategories={mockCategories} userTier="paid" />)

    expect(screen.queryByText(/Limite de 3 catégories atteinte/)).not.toBeInTheDocument()
  })

  it('shows empty state when no categories', () => {
    render(<CategoriesList initialCategories={[]} userTier="free" />)

    expect(screen.getByText('Aucune catégorie. Créez-en une pour organiser vos newsletters.')).toBeInTheDocument()
  })

  it('disables add button when free tier at limit', () => {
    const threeCategories = [
      ...mockCategories,
      { id: 'cat-3', user_id: 'u1', name: 'Culture', color: '#f59e0b', created_at: '2026-01-01', newsletters: [{ count: 0 }] },
    ]

    render(<CategoriesList initialCategories={threeCategories} userTier="free" />)

    const addButton = screen.getByRole('button', { name: /ajouter/i })
    expect(addButton).toBeDisabled()
  })

  it('shows add form when add button is clicked', () => {
    render(<CategoriesList initialCategories={mockCategories} userTier="free" />)

    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }))

    expect(screen.getByPlaceholderText('Nom de la catégorie')).toBeInTheDocument()
  })

  it('displays newsletter count per category', () => {
    render(<CategoriesList initialCategories={mockCategories} userTier="free" />)

    expect(screen.getByText('5 newsletters')).toBeInTheDocument()
    expect(screen.getByText('2 newsletters')).toBeInTheDocument()
  })
})
