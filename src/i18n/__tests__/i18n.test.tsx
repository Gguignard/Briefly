import { describe, it, expect } from 'vitest'
import { routing } from '../routing'

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
})

describe('translation files', () => {
  it('should load French translations', async () => {
    const fr = await import('../../../messages/fr.json')
    expect(fr.default).toBeDefined()
    expect(fr.default.common).toBeDefined()
    expect(fr.default.common.loading).toBe('Chargement...')
  })

  it('should load English translations', async () => {
    const en = await import('../../../messages/en.json')
    expect(en.default).toBeDefined()
    expect(en.default.common).toBeDefined()
    expect(en.default.common.loading).toBe('Loading...')
  })

  it('should have matching keys in both languages', async () => {
    const fr = await import('../../../messages/fr.json')
    const en = await import('../../../messages/en.json')

    const frKeys = Object.keys(fr.default)
    const enKeys = Object.keys(en.default)

    expect(frKeys.sort()).toEqual(enKeys.sort())

    // Check nested keys for 'common' namespace
    expect(Object.keys(fr.default.common).sort()).toEqual(
      Object.keys(en.default.common).sort()
    )
  })
})
