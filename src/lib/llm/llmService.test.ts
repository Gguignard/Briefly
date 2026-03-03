import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockOpenAI, mockAnthropic } = vi.hoisted(() => ({
  mockOpenAI: vi.fn(),
  mockAnthropic: vi.fn(),
}))

vi.mock('./providers/openai.provider', () => ({
  summarizeWithOpenAI: mockOpenAI,
}))

vi.mock('./providers/anthropic.provider', () => ({
  summarizeWithAnthropic: mockAnthropic,
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

  it('utilise OpenAI comme primaire pour tier basic', async () => {
    const expected = makeSummaryResult({ provider: 'openai' })
    mockOpenAI.mockResolvedValueOnce(expected)

    const result = await summarize('test content', { tier: 'basic' })

    expect(result.provider).toBe('openai')
    expect(mockOpenAI).toHaveBeenCalledWith('test content', 'basic')
    expect(mockAnthropic).not.toHaveBeenCalled()
  })

  it('utilise Anthropic comme primaire pour tier premium', async () => {
    const expected = makeSummaryResult({ provider: 'anthropic' })
    mockAnthropic.mockResolvedValueOnce(expected)

    const result = await summarize('test content', { tier: 'premium' })

    expect(result.provider).toBe('anthropic')
    expect(mockAnthropic).toHaveBeenCalledWith('test content', 'premium')
    expect(mockOpenAI).not.toHaveBeenCalled()
  })

  it('retente 3 fois le primaire avant fallback (tier basic)', async () => {
    mockOpenAI
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
    const fallbackResult = makeSummaryResult({ provider: 'anthropic' })
    mockAnthropic.mockResolvedValueOnce(fallbackResult)

    const promise = summarize('test', { tier: 'basic' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('anthropic')
    expect(mockOpenAI).toHaveBeenCalledTimes(3)
    expect(mockAnthropic).toHaveBeenCalledTimes(1)
  })

  it('fallback vers OpenAI si Anthropic échoue (tier premium)', async () => {
    mockAnthropic
      .mockRejectedValueOnce(new Error('Anthropic down'))
      .mockRejectedValueOnce(new Error('Anthropic down'))
      .mockRejectedValueOnce(new Error('Anthropic down'))
    const fallbackResult = makeSummaryResult({ provider: 'openai' })
    mockOpenAI.mockResolvedValueOnce(fallbackResult)

    const promise = summarize('test', { tier: 'premium' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('openai')
    expect(mockAnthropic).toHaveBeenCalledTimes(3)
    expect(mockOpenAI).toHaveBeenCalledTimes(1)
  })

  it('propage l\'erreur si primaire ET fallback échouent', async () => {
    mockOpenAI
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
      .mockRejectedValueOnce(new Error('OpenAI down'))
    mockAnthropic
      .mockRejectedValueOnce(new Error('Anthropic down'))
      .mockRejectedValueOnce(new Error('Anthropic down'))
      .mockRejectedValueOnce(new Error('Anthropic down'))

    const promise = summarize('test', { tier: 'basic' }).catch((e: Error) => e)
    await vi.runAllTimersAsync()
    const error = await promise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Anthropic down')
  })

  it('réussit au 2e retry sans fallback', async () => {
    const expected = makeSummaryResult({ provider: 'openai' })
    mockOpenAI
      .mockRejectedValueOnce(new Error('temporary'))
      .mockResolvedValueOnce(expected)

    const promise = summarize('test', { tier: 'basic' })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.provider).toBe('openai')
    expect(mockOpenAI).toHaveBeenCalledTimes(2)
    expect(mockAnthropic).not.toHaveBeenCalled()
  })
})
