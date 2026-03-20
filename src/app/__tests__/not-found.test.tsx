import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import NotFound from '../not-found'

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

const mockGetLocale = vi.fn()
vi.mock('next-intl/server', () => ({
  getLocale: () => mockGetLocale(),
}))

describe('NotFound (404)', () => {
  afterEach(() => {
    cleanup()
    mockAuth.mockReset()
    mockGetLocale.mockReset()
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: 'user_123' })
      mockGetLocale.mockResolvedValue('fr')
    })

    it('should render 404 code', async () => {
      render(await NotFound())
      expect(screen.getByText('404')).toBeDefined()
    })

    it('should render "Page introuvable" heading', async () => {
      render(await NotFound())
      expect(screen.getByText('Page introuvable')).toBeDefined()
    })

    it('should render descriptive message', async () => {
      render(await NotFound())
      expect(screen.getByText("Cette page n'existe pas ou a été déplacée.")).toBeDefined()
    })

    it('should render link to summaries with correct locale', async () => {
      const { container } = render(await NotFound())
      const summariesLink = container.querySelector('a[href="/fr/summaries"]')
      expect(summariesLink).not.toBeNull()
      expect(summariesLink?.textContent).toBe('Mes résumés')
    })

    it('should render link to home page with correct locale', async () => {
      const { container } = render(await NotFound())
      const homeLink = container.querySelector('a[href="/fr"]')
      expect(homeLink).not.toBeNull()
      expect(homeLink?.textContent).toBe('Accueil')
    })
  })

  describe('when user is NOT authenticated', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: null })
      mockGetLocale.mockResolvedValue('fr')
    })

    it('should NOT render link to summaries', async () => {
      const { container } = render(await NotFound())
      const summariesLink = container.querySelector('a[href="/fr/summaries"]')
      expect(summariesLink).toBeNull()
    })

    it('should still render link to home page', async () => {
      const { container } = render(await NotFound())
      const homeLink = container.querySelector('a[href="/fr"]')
      expect(homeLink).not.toBeNull()
    })
  })

  describe('locale handling', () => {
    it('should use English locale when detected', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' })
      mockGetLocale.mockResolvedValue('en')

      const { container } = render(await NotFound())
      const summariesLink = container.querySelector('a[href="/en/summaries"]')
      const homeLink = container.querySelector('a[href="/en"]')
      expect(summariesLink).not.toBeNull()
      expect(homeLink).not.toBeNull()
    })
  })
})
