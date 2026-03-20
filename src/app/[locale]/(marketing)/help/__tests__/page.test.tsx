import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import HelpPage, { generateMetadata, generateStaticParams } from '../page'

const frTranslations: Record<string, string> = {
  meta_title: 'Aide — Briefly',
  meta_description: 'Questions fréquentes sur Briefly, le service de résumés de newsletters IA.',
  title: "Centre d'aide",
  subtitle: 'Questions fréquentes sur Briefly',
  section_how_it_works: 'Comment ça marche ?',
  section_email_issues: "Problèmes d'ingestion email",
  section_billing: 'Facturation',
  section_gdpr: 'RGPD',
  faq_how_it_works_q: 'Comment fonctionne Briefly ?',
  faq_how_it_works_a: 'Briefly génère des résumés IA de vos newsletters.',
  faq_free_limit_q: 'Quelle est la limite du tier gratuit ?',
  faq_free_limit_a: 'Le tier gratuit vous permet de suivre jusqu\'à 5 newsletters.',
  faq_no_summaries_q: 'Je ne reçois pas mes résumés, que faire ?',
  faq_no_summaries_a: 'Vérifiez que vous vous êtes bien abonné.',
  faq_cancel_q: 'Comment annuler mon abonnement Premium ?',
  faq_cancel_a: 'Rendez-vous dans Paramètres → Facturation.',
  faq_personal_email_q: 'Briefly accède-t-il à mes emails personnels ?',
  faq_personal_email_a: 'Non, jamais.',
  faq_delete_account_q: 'Comment supprimer mon compte ?',
  faq_delete_account_a: 'Allez dans Paramètres → Zone de danger.',
  contact_prompt: "Vous n'avez pas trouvé votre réponse ?",
  contact_link: 'Contactez notre équipe →',
}

const enTranslations: Record<string, string> = {
  meta_title: 'Help — Briefly',
  meta_description: 'Frequently asked questions about Briefly.',
  title: 'Help Center',
  subtitle: 'Frequently asked questions about Briefly',
  section_how_it_works: 'How does it work?',
  section_email_issues: 'Email ingestion issues',
  section_billing: 'Billing',
  section_gdpr: 'GDPR',
  faq_how_it_works_q: 'How does Briefly work?',
  faq_how_it_works_a: 'Briefly generates AI summaries of your newsletters.',
  faq_free_limit_q: 'What is the free tier limit?',
  faq_free_limit_a: 'The free tier lets you follow up to 5 newsletters.',
  faq_no_summaries_q: "I'm not receiving my summaries, what should I do?",
  faq_no_summaries_a: 'Make sure you subscribed using your Briefly address.',
  faq_cancel_q: 'How do I cancel my Premium subscription?',
  faq_cancel_a: 'Go to Settings → Billing.',
  faq_personal_email_q: 'Does Briefly access my personal emails?',
  faq_personal_email_a: 'No, never.',
  faq_delete_account_q: 'How do I delete my account?',
  faq_delete_account_a: 'Go to Settings → Danger zone.',
  contact_prompt: "Didn't find your answer?",
  contact_link: 'Contact our team →',
}

// Mock next-intl — track locale set by setRequestLocale
let currentLocale = 'fr'
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockImplementation((arg: string | { locale: string }) => {
    const locale = typeof arg === 'string' ? currentLocale : arg.locale
    const translations = locale === 'en' ? enTranslations : frTranslations
    return Promise.resolve((key: string) => translations[key] ?? key)
  }),
  setRequestLocale: vi.fn().mockImplementation((locale: string) => {
    currentLocale = locale
  }),
}))

// Mock accordion (client component)
vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="accordion" {...props}>{children}</div>
  ),
  AccordionItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <div data-testid={`accordion-item-${value}`}>{children}</div>
  ),
  AccordionTrigger: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  AccordionContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))

describe('HelpPage', () => {
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
    it('should have correct French title', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })
      expect(metadata.title).toBe('Aide — Briefly')
    })

    it('should have correct English title', async () => {
      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })
      expect(metadata.title).toBe('Help — Briefly')
    })

    it('should have correct French description', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })
      expect(metadata.description).toBe(
        'Questions fréquentes sur Briefly, le service de résumés de newsletters IA.'
      )
    })

    it('should include canonical and alternate URLs', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })
      expect(metadata.alternates?.canonical).toContain('/fr/help')
    })

    it('should include OpenGraph metadata', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })
      expect(metadata.openGraph?.type).toBe('website')
      expect(metadata.openGraph?.siteName).toBe('Briefly')
    })
  })

  describe('Page Content - French', () => {
    it('should render the help page heading', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await HelpPage({ params }))
      expect(screen.getByText("Centre d'aide")).toBeDefined()
    })

    it('should render all 4 FAQ sections', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await HelpPage({ params }))
      expect(screen.getByText('Comment ça marche ?')).toBeDefined()
      expect(screen.getByText("Problèmes d'ingestion email")).toBeDefined()
      expect(screen.getByText('Facturation')).toBeDefined()
      expect(screen.getByText('RGPD')).toBeDefined()
    })

    it('should render all 6 FAQ questions', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      render(await HelpPage({ params }))
      expect(screen.getByText('Comment fonctionne Briefly ?')).toBeDefined()
      expect(screen.getByText('Quelle est la limite du tier gratuit ?')).toBeDefined()
      expect(screen.getByText('Je ne reçois pas mes résumés, que faire ?')).toBeDefined()
      expect(screen.getByText('Comment annuler mon abonnement Premium ?')).toBeDefined()
      expect(screen.getByText('Briefly accède-t-il à mes emails personnels ?')).toBeDefined()
      expect(screen.getByText('Comment supprimer mon compte ?')).toBeDefined()
    })

    it('should render contact link pointing to help/contact', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await HelpPage({ params }))
      const contactLink = container.querySelector('a[href="/fr/help/contact"]')
      expect(contactLink).not.toBeNull()
      expect(contactLink?.textContent).toBe('Contactez notre équipe →')
    })
  })

  describe('Page Content - English', () => {
    it('should render English heading', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await HelpPage({ params }))
      expect(screen.getByText('Help Center')).toBeDefined()
    })

    it('should render English section titles', async () => {
      const params = Promise.resolve({ locale: 'en' })
      render(await HelpPage({ params }))
      expect(screen.getByText('How does it work?')).toBeDefined()
      expect(screen.getByText('Billing')).toBeDefined()
      expect(screen.getByText('GDPR')).toBeDefined()
    })

    it('should render contact link with English locale', async () => {
      const params = Promise.resolve({ locale: 'en' })
      const { container } = render(await HelpPage({ params }))
      const contactLink = container.querySelector('a[href="/en/help/contact"]')
      expect(contactLink).not.toBeNull()
    })
  })
})
