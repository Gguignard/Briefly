import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap.ts', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://briefly.app'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalEnv
  })

  describe('sitemap generation', () => {
    it('should return an array of sitemap entries', () => {
      const result = sitemap()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should generate entries for all static pages and locales', () => {
      const result = sitemap()

      // 2 static pages × 2 locales = 4 entries
      // Note: /legal/privacy and /legal/terms removed until pages are implemented
      expect(result.length).toBe(4)
    })

    it('should include correct URLs for each locale', () => {
      const result = sitemap()

      const frenchEntries = result.filter((entry) => entry.url.includes('/fr'))
      const englishEntries = result.filter((entry) => entry.url.includes('/en'))

      // 2 pages per locale (home, pricing)
      expect(frenchEntries.length).toBe(2)
      expect(englishEntries.length).toBe(2)
    })

    it('should have required properties for each entry', () => {
      const result = sitemap()

      result.forEach((entry) => {
        expect(entry).toHaveProperty('url')
        expect(entry).toHaveProperty('lastModified')
        expect(entry).toHaveProperty('changeFrequency')
        expect(entry).toHaveProperty('priority')
        expect(entry).toHaveProperty('alternates')
      })
    })

    it('should set homepage priority to 1.0 and weekly frequency', () => {
      const result = sitemap()

      const homepageFr = result.find(
        (entry) => entry.url === 'https://briefly.app/fr'
      )
      const homepageEn = result.find(
        (entry) => entry.url === 'https://briefly.app/en'
      )

      expect(homepageFr?.priority).toBe(1.0)
      expect(homepageFr?.changeFrequency).toBe('weekly')
      expect(homepageEn?.priority).toBe(1.0)
      expect(homepageEn?.changeFrequency).toBe('weekly')
    })

    it('should set other pages priority to 0.7 and monthly frequency', () => {
      const result = sitemap()

      const pricingFr = result.find(
        (entry) => entry.url === 'https://briefly.app/fr/pricing'
      )

      expect(pricingFr?.priority).toBe(0.7)
      expect(pricingFr?.changeFrequency).toBe('monthly')
    })

    it('should include alternates with both locales for each entry', () => {
      const result = sitemap()

      result.forEach((entry) => {
        expect(entry.alternates?.languages).toBeDefined()
        expect(entry.alternates?.languages).toHaveProperty('fr')
        expect(entry.alternates?.languages).toHaveProperty('en')
      })
    })

    it('should generate correct alternate URLs', () => {
      const result = sitemap()

      const pricingFr = result.find(
        (entry) => entry.url === 'https://briefly.app/fr/pricing'
      )

      expect(pricingFr?.alternates?.languages?.fr).toBe(
        'https://briefly.app/fr/pricing'
      )
      expect(pricingFr?.alternates?.languages?.en).toBe(
        'https://briefly.app/en/pricing'
      )
    })

    it('should use NEXT_PUBLIC_BASE_URL environment variable', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom-domain.com'

      const result = sitemap()

      expect(result[0].url).toContain('https://custom-domain.com')
    })

    it('should include all expected pages', () => {
      const result = sitemap()

      const urls = result.map((entry) => entry.url)

      // Check that all expected pages are present for fr locale
      expect(urls).toContain('https://briefly.app/fr')
      expect(urls).toContain('https://briefly.app/fr/pricing')
      // Note: /legal/privacy and /legal/terms removed until pages are implemented

      // Check that all expected pages are present for en locale
      expect(urls).toContain('https://briefly.app/en')
      expect(urls).toContain('https://briefly.app/en/pricing')
    })
  })
})
