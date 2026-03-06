import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { trackLLMCost, calculateCostCents, getMonthlyUserCost } from './cost-tracker'
import { createAdminClient } from '@/lib/supabase/admin'
import logger, { logError } from '@/lib/utils/logger'
import type { SummaryResult } from './types'

describe('calculateCostCents', () => {
  it('calcule le coût pour gpt-5-nano', () => {
    // 500 input * 0.005/1000 + 100 output * 0.02/1000
    const cost = calculateCostCents('gpt-5-nano', 500, 100)
    expect(cost).toBeCloseTo(0.0045, 6)
  })

  it('calcule le coût pour qwen-3-32b', () => {
    // 1000 input * 0.01/1000 + 200 output * 0.04/1000
    const cost = calculateCostCents('qwen-3-32b', 1000, 200)
    expect(cost).toBeCloseTo(0.018, 6)
  })

  it('calcule le coût pour gpt-5-mini', () => {
    // 1000 input * 0.025/1000 + 200 output * 0.1/1000
    const cost = calculateCostCents('gpt-5-mini', 1000, 200)
    expect(cost).toBeCloseTo(0.045, 6)
  })

  it('calcule le coût pour llama-3.1-8b-instant', () => {
    // 1000 input * 0.003/1000 + 200 output * 0.01/1000
    const cost = calculateCostCents('llama-3.1-8b-instant', 1000, 200)
    expect(cost).toBeCloseTo(0.005, 6)
  })

  it('utilise le taux par défaut pour un modèle inconnu', () => {
    // 500 input * 0.01/1000 + 100 output * 0.04/1000
    const cost = calculateCostCents('unknown-model', 500, 100)
    expect(cost).toBeCloseTo(0.009, 6)
  })
})

describe('trackLLMCost', () => {
  const mockInsert = vi.fn()
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockGte = vi.fn()

  const mockSupabase = {
    from: vi.fn(),
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

    // Default: insert succeeds, monthly query returns empty
    mockInsert.mockResolvedValue({ error: null })
    mockGte.mockResolvedValue({ data: [], error: null })

    mockSupabase.from.mockImplementation(() => ({
      insert: mockInsert,
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          gte: mockGte,
        }),
      }),
    }))
  })

  it('insère le coût en centimes dans llm_costs avec tokens_input/output', async () => {
    await trackLLMCost('user-123', baseSummaryResult, 'summary-uuid-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('llm_costs')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      summary_id: 'summary-uuid-1',
      provider: 'openai',
      model: 'gpt-5-nano',
      tokens_input: 500,
      tokens_output: 100,
      cost_cents: expect.closeTo(0.0045, 6),
    })
  })

  it('passe summary_id null si non fourni', async () => {
    await trackLLMCost('user-123', baseSummaryResult)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ summary_id: null }),
    )
  })

  it('log une erreur si l\'insertion échoue', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })

    await trackLLMCost('user-123', baseSummaryResult)

    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Failed to track LLM cost') }),
      { userId: 'user-123' },
    )
  })

  it('ne vérifie pas le seuil si l\'insertion échoue', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })

    await trackLLMCost('user-123', baseSummaryResult)

    // select should not have been called (monthly check skipped)
    expect(mockSelect).not.toHaveBeenCalled()
  })

  it('log un warning si le coût mensuel dépasse 80 centimes pour un user free', async () => {
    // Monthly query returns costs totaling > 80 cents
    mockGte.mockResolvedValueOnce({
      data: [{ cost_cents: 50 }, { cost_cents: 35 }],
      error: null,
    })

    await trackLLMCost('user-123', baseSummaryResult, undefined, 'free')

    expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-123', monthlyCost: 85 }),
      'Free user exceeding LLM cost threshold (0.8€/month)',
    )
  })

  it('ne log pas de warning si le coût mensuel est sous le seuil', async () => {
    mockGte.mockResolvedValueOnce({
      data: [{ cost_cents: 10 }, { cost_cents: 5 }],
      error: null,
    })

    await trackLLMCost('user-123', baseSummaryResult, undefined, 'free')

    expect(vi.mocked(logger.warn)).not.toHaveBeenCalled()
  })

  it('ne vérifie pas le seuil mensuel pour un user paid', async () => {
    await trackLLMCost('user-123', baseSummaryResult, 'summary-uuid-1', 'paid')

    // select should not have been called (monthly check skipped for paid users)
    expect(mockSelect).not.toHaveBeenCalled()
  })
})

describe('getMonthlyUserCost', () => {
  const mockGte = vi.fn()
  const mockSupabase = {
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never)

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: mockGte,
        }),
      }),
    })
  })

  it('retourne le coût total mensuel pour un utilisateur', async () => {
    mockGte.mockResolvedValueOnce({
      data: [{ cost_cents: 10.5 }, { cost_cents: 20.3 }, { cost_cents: 5.2 }],
      error: null,
    })

    const cost = await getMonthlyUserCost('user-123')
    expect(cost).toBeCloseTo(36, 1)
  })

  it('retourne 0 si aucun coût trouvé', async () => {
    mockGte.mockResolvedValueOnce({ data: [], error: null })

    const cost = await getMonthlyUserCost('user-123')
    expect(cost).toBe(0)
  })

  it('retourne 0 et log une erreur en cas d\'échec de requête', async () => {
    mockGte.mockResolvedValueOnce({ data: null, error: { message: 'Query failed' } })

    const cost = await getMonthlyUserCost('user-123')
    expect(cost).toBe(0)
    expect(logError).toHaveBeenCalled()
  })
})
