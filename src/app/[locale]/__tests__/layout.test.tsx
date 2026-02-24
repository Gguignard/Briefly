import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMetadata } from '../layout'

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
    className: 'geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
    className: 'geist-mono',
  }),
}))

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  getMessages: vi.fn().mockResolvedValue({}),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@clerk/localizations', () => ({
  frFR: {},
  enUS: {},
}))

describe('LocaleLayout metadata', () => {
  describe('generateMetadata', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://briefly.app'
    })

    it('should include metadataBase', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.metadataBase).toBeDefined()
      expect(metadata.metadataBase?.toString()).toBe('https://briefly.app/')
    })

    it('should include canonical URL with locale', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.alternates?.canonical).toBe('https://briefly.app/fr')
    })

    it('should include language alternates for both locales', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.alternates?.languages).toBeDefined()
      expect(metadata.alternates?.languages?.fr).toBe('https://briefly.app/fr')
      expect(metadata.alternates?.languages?.en).toBe('https://briefly.app/en')
    })

    it('should set OpenGraph properties', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.openGraph).toBeDefined()
      if (metadata.openGraph && 'type' in metadata.openGraph) {
        expect(metadata.openGraph.type).toBe('website')
      }
      if (metadata.openGraph && 'siteName' in metadata.openGraph) {
        expect(metadata.openGraph.siteName).toBe('Briefly')
      }
    })

    it('should set correct OpenGraph locale for French', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.openGraph?.locale).toBe('fr_FR')
      expect(metadata.openGraph?.alternateLocale).toBe('en_US')
    })

    it('should set correct OpenGraph locale for English', async () => {
      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })

      expect(metadata.openGraph?.locale).toBe('en_US')
      expect(metadata.openGraph?.alternateLocale).toBe('fr_FR')
    })

    it('should use NEXT_PUBLIC_BASE_URL environment variable', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_BASE_URL
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom-domain.com'

      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.metadataBase?.toString()).toBe('https://custom-domain.com/')
      expect(metadata.alternates?.canonical).toBe('https://custom-domain.com/fr')

      // Restore
      process.env.NEXT_PUBLIC_BASE_URL = originalEnv
    })

    it('should include title from translations', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.title).toBeDefined()
    })

    it('should include description from translations', async () => {
      const params = Promise.resolve({ locale: 'fr' })
      const metadata = await generateMetadata({ params })

      expect(metadata.description).toBeDefined()
    })
  })
})
