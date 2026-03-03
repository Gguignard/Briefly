import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockOpenAI, mockGroq } = vi.hoisted(() => ({
  mockOpenAI: vi.fn(),
  mockGroq: vi.fn(),
}))

vi.mock('./providers/openai.provider', () => ({
  summarizeWithOpenAI: mockOpenAI,
}))

vi.mock('./providers/groq.provider', () => ({
  summarizeWithGroq: mockGroq,
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { summarize } from './llmService'
import type { SummaryResult } from './types'

const makeSummaryResult = (
  overrides: Partial<SummaryResult> = {}
): SummaryResult => ({
  title: 'Test',
  keyPoints: ['A'],
  sourceUrl: null,
  llmTier: 'basic',
  provider: 'openai',
  model: 'gpt-5-nano',
  tokensInput: 10,
  tokensOutput: 5,
  generatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('summarize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- Basic tier: OpenAI primary → Groq fallback ---

  it('utilise OpenAI gpt-5-nano comme primaire pour tier basic', async () => {
    const expected = makeSummaryResult({ provider: 'openai', model: 'gpt-5-nano' })
    mockOpenAI.mockResolvedValueOnce(expected)

    const result = await summarize('test content', { tier: 'basic' })

    expect(result.provider).toBe('openai')
    expect(result.model).toBe('gpt-5-nano')
    expect(mockOpenAI).toHaveBeenCalledWith('test content', 'gpt-5-nano', 'basic')
    expect(mockGroq).not.toHaveBeenCalled()
  })

  it('fallback vers Groq llama-3.1-8b-instant si OpenAI échoue (tier basic)', async () => {
    mockOpenAI
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
    const fallbackResult = makeSummaryResult({ provider: 'groq', model: 'llama-3.1-8b-instant' })
    mockGroq.mockResolvedValueOnce(fallbackResult)

    const promise = summarize('test', { tier: 'basic' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('groq')
    expect(result.model).toBe('llama-3.1-8b-instant')
    expect(mockOpenAI).toHaveBeenCalledTimes(3)
    expect(mockGroq).toHaveBeenCalledWith('test', 'llama-3.1-8b-instant', 'basic')
  })

  // --- Premium tier: Groq primary → OpenAI fallback ---

  it('utilise Groq qwen-3-32b comme primaire pour tier premium', async () => {
    const expected = makeSummaryResult({ provider: 'groq', model: 'qwen-3-32b' })
    mockGroq.mockResolvedValueOnce(expected)

    const result = await summarize('test content', { tier: 'premium' })

    expect(result.provider).toBe('groq')
    expect(result.model).toBe('qwen-3-32b')
    expect(mockGroq).toHaveBeenCalledWith('test content', 'qwen-3-32b', 'premium')
    expect(mockOpenAI).not.toHaveBeenCalled()
  })

  it('fallback vers OpenAI gpt-5-mini si Groq échoue (tier premium)', async () => {
    mockGroq
      .mockRejectedValueOnce(new Error('Groq down'))
      .mockRejectedValueOnce(new Error('Groq down'))
      .mockRejectedValueOnce(new Error('Groq down'))
    const fallbackResult = makeSummaryResult({ provider: 'openai', model: 'gpt-5-mini' })
    mockOpenAI.mockResolvedValueOnce(fallbackResult)

    const promise = summarize('test', { tier: 'premium' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('openai')
    expect(result.model).toBe('gpt-5-mini')
    expect(mockGroq).toHaveBeenCalledTimes(3)
    expect(mockOpenAI).toHaveBeenCalledWith('test', 'gpt-5-mini', 'premium')
  })

  // --- Retry & error handling ---

  it('propage l\'erreur si primaire ET fallback échouent', async () => {
    mockOpenAI
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
    mockGroq
      .mockRejectedValueOnce(new Error('Groq down'))
      .mockRejectedValueOnce(new Error('Groq down'))
      .mockRejectedValueOnce(new Error('Groq down'))

    const promise = summarize('test', { tier: 'basic' }).catch((e: Error) => e)
    await vi.runAllTimersAsync()
    const error = await promise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Groq down')
  })

  it('réussit au 2e retry sans fallback', async () => {
    const expected = makeSummaryResult({ provider: 'openai', model: 'gpt-5-nano' })
    mockOpenAI
      .mockRejectedValueOnce(new Error('temporary'))
      .mockResolvedValueOnce(expected)

    const promise = summarize('test', { tier: 'basic' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('openai')
    expect(mockOpenAI).toHaveBeenCalledTimes(2)
    expect(mockGroq).not.toHaveBeenCalled()
  })
})
