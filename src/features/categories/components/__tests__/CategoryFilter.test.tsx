import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoryFilter } from '../CategoryFilter'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()
let mockPathname = '/fr/summaries'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      allCategories: 'Toutes',
    }
    return messages[key] ?? key
  },
}))

// Mock fetch for categories
const mockCategories = [
  { id: 'cat-1', user_id: 'u1', name: 'Tech', color: '#3b82f6', created_at: '2026-01-01' },
  { id: 'cat-2', user_id: 'u1', name: 'Finance', color: '#10b981', created_at: '2026-01-01' },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('CategoryFilter', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCategories }),
    } as Response)
    mockPush.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders "Toutes" button and category buttons after loading', async () => {
    render(<CategoryFilter />, { wrapper: createWrapper() })

    expect(await screen.findByText('Toutes')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Finance')).toBeInTheDocument()
  })

  it('renders nothing when no categories exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as Response)

    const { container } = render(<CategoryFilter />, { wrapper: createWrapper() })

    // Wait for query to settle
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Should render nothing
    expect(container.innerHTML).toBe('')
  })

  it('clicking a category navigates with categoryId param', async () => {
    render(<CategoryFilter />, { wrapper: createWrapper() })

    const techButton = await screen.findByText('Tech')
    fireEvent.click(techButton)

    expect(mockPush).toHaveBeenCalledWith('/fr/summaries?categoryId=cat-1')
  })

  it('clicking "Toutes" removes categoryId param', async () => {
    // Simulate active filter
    mockSearchParams.set('categoryId', 'cat-1')

    render(<CategoryFilter />, { wrapper: createWrapper() })

    const allButton = await screen.findByText('Toutes')
    fireEvent.click(allButton)

    expect(mockPush).toHaveBeenCalledWith('/fr/summaries')

    // Cleanup
    mockSearchParams.delete('categoryId')
  })

  it('displays color indicators for each category', async () => {
    render(<CategoryFilter />, { wrapper: createWrapper() })

    await screen.findByText('Tech')

    const colorDots = document.querySelectorAll('[data-testid="category-color"]')
    expect(colorDots).toHaveLength(2)
  })
})
