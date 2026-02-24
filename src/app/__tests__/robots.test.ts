import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { MetadataRoute } from 'next'
import robots from '../robots'

describe('robots.ts', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://briefly.app'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalEnv
  })

  describe('robots configuration', () => {
    it('should return a valid robots configuration', () => {
      const result = robots()

      expect(result).toHaveProperty('rules')
      expect(result).toHaveProperty('sitemap')
    })

    it('should include rules for all user agents', () => {
      const result = robots()

      expect(result.rules).toBeDefined()
      expect(Array.isArray(result.rules)).toBe(true)

      const rules = result.rules as Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>
      expect(rules.length).toBeGreaterThan(0)

      const firstRule = rules[0]
      expect(firstRule.userAgent).toBe('*')
    })

    it('should allow access to public routes', () => {
      const result = robots()

      const rules = result.rules as Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>
      const firstRule = rules[0]

      const allowedPaths = firstRule.allow!

      expect(allowedPaths).toContain('/')
      expect(allowedPaths).toContain('/fr/')
      expect(allowedPaths).toContain('/en/')
    })

    it('should disallow access to private routes', () => {
      const result = robots()

      const rules = result.rules as Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>
      const firstRule = rules[0]

      const disallowedPaths = firstRule.disallow!

      expect(disallowedPaths).toContain('/summaries/')
      expect(disallowedPaths).toContain('/newsletters/')
      expect(disallowedPaths).toContain('/categories/')
      expect(disallowedPaths).toContain('/settings/')
      expect(disallowedPaths).toContain('/billing/')
      expect(disallowedPaths).toContain('/admin/')
      expect(disallowedPaths).toContain('/api/')
    })

    it('should reference the sitemap at correct URL', () => {
      const result = robots()

      expect(result.sitemap).toBe('https://briefly.app/sitemap.xml')
    })

    it('should use NEXT_PUBLIC_BASE_URL environment variable for sitemap', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://custom-domain.com'

      const result = robots()

      expect(result.sitemap).toBe('https://custom-domain.com/sitemap.xml')
    })

    it('should have exactly 7 disallowed paths', () => {
      const result = robots()

      const rules = result.rules as Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>
      const firstRule = rules[0]

      expect(firstRule.disallow).toHaveLength(7)
    })

    it('should have exactly 3 allowed paths', () => {
      const result = robots()

      const rules = result.rules as Array<{ userAgent: string; allow?: string[]; disallow?: string[] }>
      const firstRule = rules[0]

      expect(firstRule.allow).toHaveLength(3)
    })
  })
})
