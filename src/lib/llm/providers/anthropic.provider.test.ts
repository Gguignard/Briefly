import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { summarizeWithAnthropic } from './anthropic.provider'

describe('summarizeWithAnthropic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
  })

  it('retourne un SummaryResult structuré', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            title: 'Résumé Anthropic',
            keyPoints: ['A', 'B', 'C'],
            sourceUrl: null,
          }),
        },
      ],
      usage: { input_tokens: 200, output_tokens: 100 },
    })

    const result = await summarizeWithAnthropic('Contenu test', 'premium')

    expect(result.title).toBe('Résumé Anthropic')
    expect(result.keyPoints).toEqual(['A', 'B', 'C'])
    expect(result.sourceUrl).toBeNull()
    expect(result.llmTier).toBe('premium')
    expect(result.provider).toBe('anthropic')
    expect(result.tokensInput).toBe(200)
    expect(result.tokensOutput).toBe(100)
    expect(result.generatedAt).toBeTruthy()
  })

  it('utilise le modèle claude-haiku-4-5', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"title":"t","keyPoints":[],"sourceUrl":null}' }],
      usage: { input_tokens: 0, output_tokens: 0 },
    })

    await summarizeWithAnthropic('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-haiku-4-5' })
    )
  })

  it('limite max_tokens à 800', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"title":"t","keyPoints":[],"sourceUrl":null}' }],
      usage: { input_tokens: 0, output_tokens: 0 },
    })

    await summarizeWithAnthropic('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 800 })
    )
  })

  it('passe le system prompt correctement', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"title":"t","keyPoints":[],"sourceUrl":null}' }],
      usage: { input_tokens: 0, output_tokens: 0 },
    })

    await summarizeWithAnthropic('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('JSON'),
      })
    )
  })

  it('propage les erreurs API', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Anthropic error'))

    await expect(summarizeWithAnthropic('test', 'basic')).rejects.toThrow(
      'Anthropic error'
    )
  })

  it('rejette si content non-text (réponse LLM vide)', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'image', text: undefined }],
      usage: { input_tokens: 5, output_tokens: 3 },
    })

    await expect(summarizeWithAnthropic('test', 'basic')).rejects.toThrow(
      'LLM returned empty response'
    )
  })
})
