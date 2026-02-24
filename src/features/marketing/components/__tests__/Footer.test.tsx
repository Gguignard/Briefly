import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Footer from '../Footer'

// Mock translations for FR
const frTranslations: Record<string, string> = {
  copyright: '© 2026 Briefly. Tous droits réservés.',
  privacy: 'Confidentialité',
  terms: 'Conditions d\'utilisation',
  contact: 'Contact',
}

// Mock translations for EN
const enTranslations: Record<string, string> = {
  copyright: '© 2026 Briefly. All rights reserved.',
  privacy: 'Privacy',
  terms: 'Terms of Service',
  contact: 'Contact',
}

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockImplementation(({ locale }: { locale: string }) => {
    const translations = locale === 'en' ? enTranslations : frTranslations
    return Promise.resolve((key: string) => translations[key] ?? key)
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Footer', () => {
  afterEach(() => {
    cleanup()
  })

  describe('French locale', () => {
    it('should render French copyright text', async () => {
      render(await Footer({ locale: 'fr' }))

      expect(screen.getByText(/© 2026 Briefly. Tous droits réservés./i)).toBeDefined()
    })

    it('should render French privacy policy link', async () => {
      const { container } = render(await Footer({ locale: 'fr' }))

      const privacyLink = container.querySelector('a[href="/fr/legal/privacy"]')
      expect(privacyLink).toBeDefined()
      expect(privacyLink?.textContent).toBe('Confidentialité')
    })

    it('should render French terms link', async () => {
      const { container } = render(await Footer({ locale: 'fr' }))

      const termsLink = container.querySelector('a[href="/fr/legal/terms"]')
      expect(termsLink).toBeDefined()
      expect(termsLink?.textContent).toBe("Conditions d'utilisation")
    })

    it('should render contact email link', async () => {
      const { container } = render(await Footer({ locale: 'fr' }))

      const contactLink = container.querySelector('a[href="mailto:hello@briefly.app"]')
      expect(contactLink).toBeDefined()
      expect(contactLink?.textContent).toBe('Contact')
    })
  })

  describe('English locale', () => {
    it('should render English copyright text', async () => {
      render(await Footer({ locale: 'en' }))

      expect(screen.getByText(/© 2026 Briefly. All rights reserved./i)).toBeDefined()
    })

    it('should render English privacy policy link', async () => {
      const { container } = render(await Footer({ locale: 'en' }))

      const privacyLink = container.querySelector('a[href="/en/legal/privacy"]')
      expect(privacyLink).toBeDefined()
      expect(privacyLink?.textContent).toBe('Privacy')
    })

    it('should render English terms link', async () => {
      const { container } = render(await Footer({ locale: 'en' }))

      const termsLink = container.querySelector('a[href="/en/legal/terms"]')
      expect(termsLink).toBeDefined()
      expect(termsLink?.textContent).toBe('Terms of Service')
    })
  })

  describe('Structure', () => {
    it('should have navigation element', async () => {
      const { container } = render(await Footer({ locale: 'fr' }))

      expect(container.querySelector('nav')).toBeDefined()
    })

    it('should have footer element', async () => {
      const { container } = render(await Footer({ locale: 'fr' }))

      expect(container.querySelector('footer')).toBeDefined()
    })
  })
})
