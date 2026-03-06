import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { trackLLMCost } from './cost-tracker'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/utils/logger'
import type { SummaryResult } from './types'

describe('trackLLMCost', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn(),
  }

  const baseSummaryResult: SummaryResult = {
    title: 'Test',
    keyPoints: ['A'],
    sourceUrl: null,
    llmTier: 'basic',
    provider: 'openai',
    model: 'gpt-5-nano',
    tokensInput: 500,
    tokensOutput: 100,
    generatedAt: '2026-03-01T12:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never)
    mockSupabase.from.mockReturnThis()
  })

  it('insère le coût dans llm_costs', async () => {
    mockSupabase.insert.mockResolvedValueOnce({ error: null })

    await trackLLMCost('user-123', baseSummaryResult)

    expect(mockSupabase.from).toHaveBeenCalledWith('llm_costs')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: 'user-123',
      provider: 'openai',
      model: 'gpt-5-nano',
      tokens_used: 600,
      cost_usd: expect.closeTo(0.000045, 6),
    })
  })

  it('log une erreur si l\'insertion échoue', async () => {
    mockSupabase.insert.mockResolvedValueOnce({
      error: { message: 'Insert failed' },
    })

    await trackLLMCost('user-123', baseSummaryResult)

    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Failed to track LLM cost') }),
      { userId: 'user-123' },
    )
  })

  it('utilise un taux par défaut pour un modèle inconnu', async () => {
    mockSupabase.insert.mockResolvedValueOnce({ error: null })

    await trackLLMCost('user-123', { ...baseSummaryResult, model: 'unknown-model' })

    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        cost_usd: expect.closeTo(0.00009, 6),
      }),
    )
  })
})
