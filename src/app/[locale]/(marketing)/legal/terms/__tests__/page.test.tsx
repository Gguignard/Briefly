import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import TermsPage, { generateMetadata, generateStaticParams } from '../page'

// Mock translations for FR
const frTranslations: Record<string, string> = {
  meta_title: "Conditions Générales d'Utilisation — Briefly",
  title: "Conditions Générales d'Utilisation",
  last_updated: 'Dernière mise à jour : février 2026',
  purpose_title: '1. Objet',
  purpose_text: 'Briefly est un service de résumés automatiques...',
  account_title: '2. Compte utilisateur',
  account_text: "L'accès au service nécessite la création d'un compte...",
  tiers_title: '3. Tiers gratuit et payant',
  tier_free: 'Tier gratuit : 5 newsletters maximum',
  tier_paid: 'Tier payant (5€/mois) : newsletters illimitées',
  acceptable_use_title: '4. Utilisation acceptable',
  acceptable_use_text: 'Le service est destiné à un usage personnel...',
  termination_title: '5. Résiliation',
  termination_text: 'Vous pouvez résilier votre abonnement...',
  liability_title: '6. Limitation de responsabilité',
  liability_text: 'Les résumés sont générés automatiquement...',
  contact_title: '7. Contact',
  contact_intro: 'Pour toute question :',
}

// Mock translations for EN
const enTranslations: Record<string, string> = {
  meta_title: 'Terms of Service — Briefly',
  title: 'Terms of Service',
  last_updated: 'Last updated: February 2026',
  purpose_title: '1. Purpose',
  purpose_text: 'Briefly is an automatic newsletter summarization service...',
  account_title: '2. User Account',
  account_text: 'Access to the service requires creating an account...',
  tiers_title: '3. Free and Paid Tiers',
  tier_free: 'Free tier: 5 newsletters maximum',
  tier_paid: 'Paid tier ($5/month): unlimited newsletters',
  acceptable_use_title: '4. Acceptable Use',
  acceptable_use_text: 'The service is intended for personal use...',
  termination_title: '5. Termination',
  termination_text: 'You can cancel your subscription...',
  liability_title: '6. Limitation of Liability',
  liability_text: 'Summaries are automatically generated...',
  contact_title: '7. Contact',
  contact_intro: 'For any questions:',
}

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockImplementation(({ locale }: { locale: string }) => {
    const translations = locale === 'en' ? enTranslations : frTranslations
    return Promise.resolve((key: string) => translations[key] ?? key)
  }),
  setRequestLocale: vi.fn(),
}))

describe('TermsPage', () => {
  afterEach(() => {
    cleanup()
  })

  describe('generateStaticParams', () => {
    it('should generate params for fr and en locales', () => {
      const params = generateStaticParams()

      expect(params).toEqual([{ locale: 'fr' }, { locale: 'en' }])
    })
  })

  describe('Metadata', () => {
    it('should set noindex robots meta', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.robots).toEqual({ index: false, follow: false })
    })

    it('should have correct French title', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.title).toBe("Conditions Générales d'Utilisation — Briefly")
    })

    it('should have correct English title', async () => {
      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })

      expect(metadata.title).toBe('Terms of Service — Briefly')
    })
  })

  describe('Page Content - French', () => {
    it('should render French terms heading', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await TermsPage({ params }))

      expect(screen.getByText("Conditions Générales d'Utilisation")).toBeDefined()
    })

    it('should display French last updated date', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await TermsPage({ params }))

      expect(screen.getByText(/février 2026/i)).toBeDefined()
    })

    it('should include French pricing tiers section', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await TermsPage({ params }))

      expect(screen.getByText('3. Tiers gratuit et payant')).toBeDefined()
    })

    it('should include French acceptable use section', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await TermsPage({ params }))

      expect(screen.getByText('4. Utilisation acceptable')).toBeDefined()
    })

    it('should include contact email', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await TermsPage({ params }))

      const emailLinks = container.querySelectorAll('a[href="mailto:hello@briefly.app"]')
      expect(emailLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Page Content - English', () => {
    it('should render English terms heading', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await TermsPage({ params }))

      expect(screen.getByText('Terms of Service')).toBeDefined()
    })

    it('should display English last updated date', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await TermsPage({ params }))

      expect(screen.getByText(/February 2026/i)).toBeDefined()
    })

    it('should include English pricing tiers section', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await TermsPage({ params }))

      expect(screen.getByText('3. Free and Paid Tiers')).toBeDefined()
    })

    it('should include English acceptable use section', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await TermsPage({ params }))

      expect(screen.getByText('4. Acceptable Use')).toBeDefined()
    })
  })
})
