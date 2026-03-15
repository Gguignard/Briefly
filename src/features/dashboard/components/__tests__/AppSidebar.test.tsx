import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AppSidebar } from '../AppSidebar'

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
        billing: 'Facturation',
        signOut: 'Se déconnecter',
        mainNav: 'Navigation principale',
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

vi.mock('@clerk/nextjs', () => ({
  UserButton: ({ afterSignOutUrl }: any) => (
    <div data-testid="user-button" data-after-sign-out-url={afterSignOutUrl} />
  ),
  useUser: () => ({
    user: {
      primaryEmailAddress: { emailAddress: 'greg@test.com' },
    },
    isLoaded: true,
  }),
}))

vi.mock('@/features/auth/components/SignOutButton', () => ({
  SignOutButton: () => <button data-testid="sign-out-button">Se déconnecter</button>,
}))

afterEach(() => {
  cleanup()
  mockPathname = '/fr/summaries'
})

describe('AppSidebar', () => {
  it('renders the Briefly logo linking to summaries', () => {
    render(<AppSidebar />)
    const logo = screen.getByText('Briefly')
    expect(logo.closest('a')).toHaveAttribute('href', '/fr/summaries')
  })

  it('renders all 5 navigation items', () => {
    render(<AppSidebar />)
    expect(screen.getByText('Résumés')).toBeInTheDocument()
    expect(screen.getByText('Newsletters')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
    expect(screen.getByText('Facturation')).toBeInTheDocument()
  })

  it('renders navigation links with correct locale-prefixed hrefs', () => {
    render(<AppSidebar />)
    const summariesLink = screen.getByText('Résumés').closest('a')
    expect(summariesLink).toHaveAttribute('href', '/fr/summaries')
    const billingLink = screen.getByText('Facturation').closest('a')
    expect(billingLink).toHaveAttribute('href', '/fr/billing')
  })

  it('highlights the active navigation item', () => {
    mockPathname = '/fr/newsletters'
    render(<AppSidebar />)
    const newslettersLink = screen.getByText('Newsletters').closest('a')
    expect(newslettersLink?.className).toContain('bg-primary/10')
    expect(newslettersLink?.className).toContain('text-primary')
  })

  it('does not highlight inactive navigation items', () => {
    mockPathname = '/fr/summaries'
    render(<AppSidebar />)
    const settingsLink = screen.getByText('Paramètres').closest('a')
    expect(settingsLink?.className).toContain('text-muted-foreground')
    expect(settingsLink?.className).not.toContain('bg-primary/10')
  })

  it('renders UserButton with correct afterSignOutUrl', () => {
    render(<AppSidebar />)
    const userButton = screen.getByTestId('user-button')
    expect(userButton).toHaveAttribute('data-after-sign-out-url', '/fr')
  })

  it('renders user email', () => {
    render(<AppSidebar />)
    expect(screen.getByText('greg@test.com')).toBeInTheDocument()
  })

  it('renders the SignOutButton', () => {
    render(<AppSidebar />)
    expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
  })

  it('sets aria-current="page" on the active link', () => {
    mockPathname = '/fr/summaries'
    render(<AppSidebar />)
    const activeLink = screen.getByText('Résumés').closest('a')
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('does not set aria-current on inactive links', () => {
    mockPathname = '/fr/summaries'
    render(<AppSidebar />)
    const inactiveLink = screen.getByText('Newsletters').closest('a')
    expect(inactiveLink).not.toHaveAttribute('aria-current')
  })

  it('renders nav with aria-label', () => {
    render(<AppSidebar />)
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(nav).toBeInTheDocument()
  })
})
