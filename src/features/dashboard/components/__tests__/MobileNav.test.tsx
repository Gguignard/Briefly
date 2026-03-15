import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MobileNav } from '../MobileNav'

let mockPathname = '/fr/summaries'

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => {
    const t = (key: string) => {
      const messages: Record<string, string> = {
        summaries: 'Résumés',
        newsletters: 'Newsletters',
        categories: 'Catégories',
        settings: 'Paramètres',
      }
      return messages[key] ?? key
    }
    return t
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

afterEach(() => {
  cleanup()
  mockPathname = '/fr/summaries'
})

describe('MobileNav', () => {
  it('renders 4 navigation items (no billing)', () => {
    render(<MobileNav />)
    expect(screen.getByText('Résumés')).toBeInTheDocument()
    expect(screen.getByText('Newsletters')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
    expect(screen.queryByText('Facturation')).not.toBeInTheDocument()
  })

  it('renders links with correct locale-prefixed hrefs', () => {
    render(<MobileNav />)
    const summariesLink = screen.getByText('Résumés').closest('a')
    expect(summariesLink).toHaveAttribute('href', '/fr/summaries')
    const settingsLink = screen.getByText('Paramètres').closest('a')
    expect(settingsLink).toHaveAttribute('href', '/fr/settings')
  })

  it('highlights the active navigation item with primary color', () => {
    mockPathname = '/fr/categories'
    render(<MobileNav />)
    const categoriesLink = screen.getByText('Catégories').closest('a')
    expect(categoriesLink?.className).toContain('text-primary')
  })

  it('does not highlight inactive items', () => {
    mockPathname = '/fr/summaries'
    render(<MobileNav />)
    const newslettersLink = screen.getByText('Newsletters').closest('a')
    expect(newslettersLink?.className).toContain('text-muted-foreground')
    expect(newslettersLink?.className).not.toContain('text-primary')
  })

  it('renders icons alongside labels', () => {
    const { container } = render(<MobileNav />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(4)
  })

  it('uses flex-col layout for icon + label stacking', () => {
    render(<MobileNav />)
    const link = screen.getByText('Résumés').closest('a')
    expect(link?.className).toContain('flex-col')
  })

  it('sets aria-current="page" on the active link', () => {
    mockPathname = '/fr/categories'
    render(<MobileNav />)
    const activeLink = screen.getByText('Catégories').closest('a')
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('does not set aria-current on inactive links', () => {
    mockPathname = '/fr/summaries'
    render(<MobileNav />)
    const inactiveLink = screen.getByText('Newsletters').closest('a')
    expect(inactiveLink).not.toHaveAttribute('aria-current')
  })
})
