import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import LandingPage from '../page'

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}))

// Mock components
vi.mock('@/components/marketing/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}))

vi.mock('@/components/marketing/FeaturesSection', () => ({
  default: () => <div data-testid="features-section">Features</div>,
}))

vi.mock('@/components/marketing/SocialProofSection', () => ({
  default: () => <div data-testid="social-proof-section">Social Proof</div>,
}))

vi.mock('@/components/marketing/CtaSection', () => ({
  default: () => <div data-testid="cta-section">CTA</div>,
}))

describe('LandingPage', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://briefly.app'
  })

  describe('JSON-LD structured data', () => {
    it('should include JSON-LD script tag', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeDefined()
    })

    it('should contain valid JSON-LD data', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@graph']).toBeDefined()
      expect(Array.isArray(jsonLd['@graph'])).toBe(true)
      expect(jsonLd['@graph'].length).toBe(3)
    })

    it('should include WebSite schema', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      const website = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'WebSite')
      expect(website).toBeDefined()
      expect(website['@id']).toBe('https://briefly.app/#website')
      expect(website.url).toBe('https://briefly.app')
      expect(website.name).toBe('Briefly')
      expect(website.description).toBeDefined()
    })

    it('should include Organization schema', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      const organization = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'Organization')
      expect(organization).toBeDefined()
      expect(organization['@id']).toBe('https://briefly.app/#organization')
      expect(organization.name).toBe('Briefly')
      expect(organization.url).toBe('https://briefly.app')
    })

    it('should include SoftwareApplication schema', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      const softwareApp = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'SoftwareApplication')
      expect(softwareApp).toBeDefined()
      expect(softwareApp.name).toBe('Briefly')
      expect(softwareApp.applicationCategory).toBe('ProductivityApplication')
    })

    it('should include Offer in SoftwareApplication', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      const softwareApp = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'SoftwareApplication')
      expect(softwareApp.offers).toBeDefined()
      expect(softwareApp.offers['@type']).toBe('Offer')
      expect(softwareApp.offers.price).toBe('0')
      expect(softwareApp.offers.priceCurrency).toBe('EUR')
    })

    it('should use NEXT_PUBLIC_BASE_URL environment variable', async () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom-domain.com'

      const params = Promise.resolve({ locale: 'fr' })
      const { container } = render(await LandingPage({ params }))

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML ?? '{}')

      const website = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'WebSite')
      expect(website.url).toBe('https://custom-domain.com')
    })
  })

})
