import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockCreate } }
  },
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { summarizeWithOpenAI } from './openai.provider'

describe('summarizeWithOpenAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
  })

  it('retourne un SummaryResult structuré pour tier basic', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Newsletter Résumée',
              keyPoints: ['Point 1', 'Point 2'],
              sourceUrl: 'https://example.com',
            }),
          },
        },
      ],
      usage: { prompt_tokens: 150, completion_tokens: 80 },
    })

    const result = await summarizeWithOpenAI('Contenu test', 'basic')

    expect(result.title).toBe('Newsletter Résumée')
    expect(result.keyPoints).toEqual(['Point 1', 'Point 2'])
    expect(result.sourceUrl).toBe('https://example.com')
    expect(result.llmTier).toBe('basic')
    expect(result.provider).toBe('openai')
    expect(result.tokensInput).toBe(150)
    expect(result.tokensOutput).toBe(80)
    expect(result.generatedAt).toBeTruthy()
  })

  it('utilise gpt-4o-nano pour tier basic', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithOpenAI('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-nano' })
    )
  })

  it('utilise gpt-4o-mini pour tier premium', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithOpenAI('test', 'premium')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-mini' })
    )
  })

  it('limite max_tokens à 800', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithOpenAI('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 800 })
    )
  })

  it('utilise response_format json_object', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithOpenAI('test', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        response_format: { type: 'json_object' },
      })
    )
  })

  it('propage les erreurs API', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API rate limit'))

    await expect(summarizeWithOpenAI('test', 'basic')).rejects.toThrow(
      'API rate limit'
    )
  })

  it('rejette si content est null (réponse LLM vide)', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    })

    await expect(summarizeWithOpenAI('test', 'basic')).rejects.toThrow(
      'LLM returned empty response'
    )
  })

  it('rejette si le JSON LLM est invalide', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'not json at all' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    })

    await expect(summarizeWithOpenAI('test', 'basic')).rejects.toThrow(
      'LLM returned invalid JSON'
    )
  })
})
