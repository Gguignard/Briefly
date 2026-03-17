import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { CategorySelect } from '../CategorySelect'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      categoryPlaceholder: 'Category...',
      noCategory: 'None',
    }
    return messages[key] ?? key
  },
}))

const categories = [
  { id: 'cat-1', user_id: 'u1', name: 'Tech', color: '#3b82f6', created_at: '2026-01-01' },
  { id: 'cat-2', user_id: 'u1', name: 'Finance', color: '#10b981', created_at: '2026-01-01' },
]

describe('CategorySelect', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the select trigger', () => {
    render(
      <CategorySelect
        categories={categories}
        currentCategoryId={null}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays "None" when no category is selected', () => {
    render(
      <CategorySelect
        categories={categories}
        currentCategoryId={null}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('displays the selected category name', () => {
    render(
      <CategorySelect
        categories={categories}
        currentCategoryId="cat-1"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('renders with empty categories list', () => {
    render(
      <CategorySelect
        categories={[]}
        currentCategoryId={null}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
