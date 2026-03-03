import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate, capturedConfig } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  capturedConfig: { baseURL: '' },
}))

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockCreate } }
    constructor(config: { baseURL?: string }) {
      capturedConfig.baseURL = config.baseURL ?? ''
    }
  },
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { summarizeWithGroq } from './groq.provider'

describe('summarizeWithGroq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GROQ_API_KEY', 'test-groq-key')
  })

  it('retourne un SummaryResult structuré avec provider groq', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Résumé Groq',
              keyPoints: ['A', 'B'],
              sourceUrl: null,
            }),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    })

    const result = await summarizeWithGroq('Contenu test', 'qwen-3-32b', 'premium')

    expect(result.title).toBe('Résumé Groq')
    expect(result.keyPoints).toEqual(['A', 'B'])
    expect(result.llmTier).toBe('premium')
    expect(result.provider).toBe('groq')
    expect(result.model).toBe('qwen-3-32b')
    expect(result.tokensInput).toBe(100)
    expect(result.tokensOutput).toBe(50)
  })

  it('utilise le baseURL Groq', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithGroq('test', 'llama-3.1-8b-instant', 'basic')

    expect(capturedConfig.baseURL).toBe('https://api.groq.com/openai/v1')
  })

  it('passe le modèle spécifié à l\'API', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithGroq('test', 'llama-3.1-8b-instant', 'basic')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'llama-3.1-8b-instant' })
    )
  })

  it('limite max_tokens à 800', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"t","keyPoints":[],"sourceUrl":null}' } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    })

    await summarizeWithGroq('test', 'qwen-3-32b', 'premium')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 800 })
    )
  })

  it('propage les erreurs API', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Groq rate limit'))

    await expect(summarizeWithGroq('test', 'qwen-3-32b', 'premium')).rejects.toThrow(
      'Groq rate limit'
    )
  })

  it('rejette si content est null (réponse LLM vide)', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    })

    await expect(summarizeWithGroq('test', 'qwen-3-32b', 'premium')).rejects.toThrow(
      'LLM returned empty response'
    )
  })
})
