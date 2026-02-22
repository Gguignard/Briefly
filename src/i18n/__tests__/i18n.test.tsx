import { describe, it, expect } from 'vitest'
import { routing, locales, type Locale } from '../routing'

describe('i18n configuration', () => {
  it('should have correct locales configured', () => {
    expect(routing.locales).toEqual(['fr', 'en'])
  })

  it('should have French as default locale', () => {
    expect(routing.defaultLocale).toBe('fr')
  })

  it('should use localePrefix: always', () => {
    expect(routing.localePrefix).toBe('always')
  })

  it('should export locales array and Locale type', () => {
    expect(locales).toEqual(['fr', 'en'])
    // Type check: this would fail at compile time if Locale type is wrong
    const testLocale: Locale = 'fr'
    expect(testLocale).toBe('fr')
  })
})

describe('translation files', () => {
  const expectedNamespaces = [
    'common',
    'home',
    'metadata',
    'nav',
    'auth',
    'summaries',
    'newsletters',
  ]

  it('should load French translations with all namespaces', async () => {
    const fr = await import('../../../messages/fr.json')
    const messages = fr.default as Record<string, Record<string, string>>
    expect(messages).toBeDefined()

    for (const namespace of expectedNamespaces) {
      expect(messages[namespace]).toBeDefined()
    }

    expect(fr.default.common.loading).toBe('Chargement...')
  })

  it('should load English translations with all namespaces', async () => {
    const en = await import('../../../messages/en.json')
    const messages = en.default as Record<string, Record<string, string>>
    expect(messages).toBeDefined()

    for (const namespace of expectedNamespaces) {
      expect(messages[namespace]).toBeDefined()
    }

    expect(en.default.common.loading).toBe('Loading...')
  })

  it('should have matching top-level keys in both languages', async () => {
    const fr = await import('../../../messages/fr.json')
    const en = await import('../../../messages/en.json')

    const frKeys = Object.keys(fr.default)
    const enKeys = Object.keys(en.default)

    expect(frKeys.sort()).toEqual(enKeys.sort())
  })

  it('should have matching nested keys for all namespaces', async () => {
    const fr = await import('../../../messages/fr.json')
    const en = await import('../../../messages/en.json')
    const frMessages = fr.default as Record<string, Record<string, string>>
    const enMessages = en.default as Record<string, Record<string, string>>

    for (const namespace of expectedNamespaces) {
      const frNsKeys = Object.keys(frMessages[namespace]).sort()
      const enNsKeys = Object.keys(enMessages[namespace]).sort()
      expect(frNsKeys).toEqual(enNsKeys)
    }
  })

  it('should use ICU plural syntax for count messages', async () => {
    const fr = await import('../../../messages/fr.json')
    const en = await import('../../../messages/en.json')

    // Both should use ICU MessageFormat for plurals
    expect(fr.default.summaries.newCount).toContain('plural')
    expect(en.default.summaries.newCount).toContain('plural')
  })
})
