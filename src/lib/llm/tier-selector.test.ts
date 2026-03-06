import { describe, it, expect } from 'vitest'
import { getLLMTierForUser } from './tier-selector'

describe('getLLMTierForUser', () => {
  it('retourne premium pour les utilisateurs paid', () => {
    expect(getLLMTierForUser('user-1', 'paid')).toBe('premium')
  })

  it('retourne basic pour les utilisateurs free', () => {
    expect(getLLMTierForUser('user-1', 'free')).toBe('basic')
  })

  it('retourne basic pour un tier inconnu', () => {
    expect(getLLMTierForUser('user-1', 'unknown')).toBe('basic')
  })
})
