import { describe, it, expect } from 'vitest'
import { SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_TEMPLATE } from './prompts'
import type { SummaryResult, LLMCallOptions, LLMTier, LLMProvider } from './types'

describe('LLM Types', () => {
  it('SummaryResult respecte la structure attendue', () => {
    const result: SummaryResult = {
      title: 'Test Title',
      keyPoints: ['point 1', 'point 2'],
      sourceUrl: null,
      llmTier: 'basic',
      provider: 'openai',
      tokensInput: 100,
      tokensOutput: 50,
      generatedAt: '2026-01-01T00:00:00.000Z',
    }

    expect(result.title).toBe('Test Title')
    expect(result.keyPoints).toHaveLength(2)
    expect(result.sourceUrl).toBeNull()
    expect(result.llmTier).toBe('basic')
    expect(result.provider).toBe('openai')
    expect(result.tokensInput).toBe(100)
    expect(result.tokensOutput).toBe(50)
    expect(result.generatedAt).toBeTruthy()
  })

  it('LLMCallOptions accepte tier basic et premium', () => {
    const basicOpts: LLMCallOptions = { tier: 'basic' }
    const premiumOpts: LLMCallOptions = { tier: 'premium' }

    expect(basicOpts.tier).toBe('basic')
    expect(premiumOpts.tier).toBe('premium')
  })

  it('LLMTier accepte basic et premium', () => {
    const tiers: LLMTier[] = ['basic', 'premium']
    expect(tiers).toContain('basic')
    expect(tiers).toContain('premium')
  })

  it('LLMProvider accepte openai et anthropic', () => {
    const providers: LLMProvider[] = ['openai', 'anthropic']
    expect(providers).toContain('openai')
    expect(providers).toContain('anthropic')
  })
})

describe('LLM Prompts', () => {
  it('SUMMARY_SYSTEM_PROMPT contient les instructions JSON', () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain('JSON')
    expect(SUMMARY_SYSTEM_PROMPT).toContain('title')
    expect(SUMMARY_SYSTEM_PROMPT).toContain('keyPoints')
    expect(SUMMARY_SYSTEM_PROMPT).toContain('sourceUrl')
  })

  it('SUMMARY_SYSTEM_PROMPT limite à 3 points clés max', () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain('Maximum 3 points clés')
  })

  it('SUMMARY_USER_TEMPLATE génère le prompt utilisateur', () => {
    const content = 'Contenu de test'
    const result = SUMMARY_USER_TEMPLATE(content)

    expect(result).toContain('Résume cette newsletter')
    expect(result).toContain('Contenu de test')
  })

  it('SUMMARY_USER_TEMPLATE tronque à 6000 caractères', () => {
    const longContent = 'x'.repeat(10000)
    const result = SUMMARY_USER_TEMPLATE(longContent)

    expect(result).toContain('x'.repeat(6000))
    expect(result).not.toContain('x'.repeat(6001))
  })
})
