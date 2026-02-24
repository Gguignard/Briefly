import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import PrivacyPage, { generateMetadata, generateStaticParams } from '../page'

// Mock translations for FR
const frTranslations: Record<string, string> = {
  meta_title: 'Politique de Confidentialité — Briefly',
  title: 'Politique de Confidentialité',
  last_updated: 'Dernière mise à jour : février 2026',
  data_collected_title: 'Données collectées',
  data_collected_intro: 'Briefly collecte uniquement les données nécessaires...',
  data_collected_email_note: "Briefly n'accède jamais à votre boîte mail personnelle.",
  data_collected_email_method: "L'ingestion des newsletters se fait via une adresse email dédiée.",
  data_usage_title: 'Utilisation des données',
  data_usage_summaries: 'Génération de résumés IA',
  data_usage_billing: 'Gestion de votre abonnement',
  data_usage_improvement: 'Amélioration du service',
  retention_title: 'Durée de rétention',
  retention_summaries: 'Résumés : conservés 90 jours',
  retention_account: "Compte utilisateur : jusqu'à suppression",
  retention_logs: 'Logs techniques : 30 jours',
  gdpr_title: 'Vos droits (RGPD)',
  gdpr_intro: 'Vous disposez d\'un droit d\'accès...',
  gdpr_delete: 'Vous pouvez supprimer votre compte...',
  processors_title: 'Sous-traitants',
  processor_clerk: 'Clerk — Authentification',
  processor_supabase: 'Supabase — Base de données',
  processor_stripe: 'Stripe — Paiements',
  processor_cloudflare: 'Cloudflare — Routage email',
  processor_ai: 'OpenAI / Anthropic — Génération IA',
  processor_sentry: 'Sentry — Tracking erreurs',
  contact_title: 'Contact',
  contact_intro: 'Pour toute question :',
}

// Mock translations for EN
const enTranslations: Record<string, string> = {
  meta_title: 'Privacy Policy — Briefly',
  title: 'Privacy Policy',
  last_updated: 'Last updated: February 2026',
  data_collected_title: 'Data Collected',
  data_collected_intro: 'Briefly only collects data necessary...',
  data_collected_email_note: 'Briefly never accesses your personal inbox.',
  data_collected_email_method: 'Newsletter ingestion is done via a dedicated email address.',
  data_usage_title: 'Data Usage',
  data_usage_summaries: 'AI summary generation',
  data_usage_billing: 'Subscription management',
  data_usage_improvement: 'Service improvement',
  retention_title: 'Data Retention',
  retention_summaries: 'Summaries: kept for 90 days',
  retention_account: 'User account: until deletion',
  retention_logs: 'Technical logs: 30 days',
  gdpr_title: 'Your Rights (GDPR)',
  gdpr_intro: 'You have the right to access...',
  gdpr_delete: 'You can delete your account...',
  processors_title: 'Data Processors',
  processor_clerk: 'Clerk — Authentication',
  processor_supabase: 'Supabase — Database',
  processor_stripe: 'Stripe — Payments',
  processor_cloudflare: 'Cloudflare — Email routing',
  processor_ai: 'OpenAI / Anthropic — AI generation',
  processor_sentry: 'Sentry — Error tracking',
  contact_title: 'Contact',
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

describe('PrivacyPage', () => {
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

      expect(metadata.title).toBe('Politique de Confidentialité — Briefly')
    })

    it('should have correct English title', async () => {
      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })

      expect(metadata.title).toBe('Privacy Policy — Briefly')
    })
  })

  describe('Page Content - French', () => {
    it('should render French privacy policy heading', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText('Politique de Confidentialité')).toBeDefined()
    })

    it('should display French last updated date', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText(/février 2026/i)).toBeDefined()
    })

    it('should include French GDPR rights section', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText('Vos droits (RGPD)')).toBeDefined()
    })

    it('should include contact email', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await PrivacyPage({ params }))

      const emailLinks = container.querySelectorAll('a[href="mailto:privacy@briefly.app"]')
      expect(emailLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Page Content - English', () => {
    it('should render English privacy policy heading', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText('Privacy Policy')).toBeDefined()
    })

    it('should display English last updated date', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText(/February 2026/i)).toBeDefined()
    })

    it('should include English GDPR rights section', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await PrivacyPage({ params }))

      expect(screen.getByText('Your Rights (GDPR)')).toBeDefined()
    })
  })
})
