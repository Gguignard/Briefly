import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/llm/llmService', () => ({
  summarize: vi.fn(),
}))

vi.mock('@/lib/llm/tier-selector', () => ({
  getLLMTierForUser: vi.fn(),
}))

vi.mock('@/lib/llm/cost-tracker', () => ({
  trackLLMCost: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

vi.mock('@/lib/queue/redis', () => ({
  getRedisConnection: vi.fn().mockReturnValue({ host: 'localhost', port: 6379 }),
}))

vi.mock('@/lib/queue/dead-letter.queue', () => ({
  deadLetterQueue: { add: vi.fn() },
}))

vi.mock('bullmq', () => {
  const MockWorker = vi.fn(function (this: Record<string, unknown>) {
    this.on = vi.fn()
    this.close = vi.fn()
  }) as unknown as typeof import('bullmq').Worker
  return { Worker: MockWorker, Job: vi.fn() }
})

import { processSummaryJob } from '../summary.worker'
import { createAdminClient } from '@/lib/supabase/admin'
import { summarize } from '@/lib/llm/llmService'
import { getLLMTierForUser } from '@/lib/llm/tier-selector'
import { trackLLMCost } from '@/lib/llm/cost-tracker'
import type { SummaryJobData } from '@/lib/queue/summary.queue'
import type { SummaryResult } from '@/lib/llm/types'

describe('processSummaryJob', () => {
  // Table-specific chain mocks for proper isolation
  const mockRawEmailsChain = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  const mockSummariesChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'raw_emails') return mockRawEmailsChain
      if (table === 'summaries') return mockSummariesChain
      return {}
    }),
  }

  const baseJobData: SummaryJobData = {
    rawEmailId: 'raw-email-uuid-123',
    userId: 'user-123',
    userTier: 'paid',
    subject: 'Weekly Newsletter',
  }

  const mockSummaryResult: SummaryResult = {
    title: 'Newsletter Recap',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    sourceUrl: 'https://example.com/newsletter',
    llmTier: 'premium',
    provider: 'groq',
    model: 'qwen-3-32b',
    tokensInput: 500,
    tokensOutput: 150,
    generatedAt: '2026-03-01T12:00:00Z',
  }

  // Helper: setup eq to return chain (for .single()) then update result
  function setupEqChain(updateResult: { error: null | { message: string } } = { error: null }) {
    mockRawEmailsChain.eq
      .mockReturnValueOnce(mockRawEmailsChain) // 1st eq: fetch chain → .single()
      .mockResolvedValueOnce(updateResult) // 2nd eq: update chain → { error }
  }

  function setupHappyPath() {
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: { content_text: 'Long newsletter content...', sender_email: 'news@example.com' },
      error: null,
    })
    mockSummariesChain.single.mockResolvedValueOnce({
      data: { id: 'summary-uuid-1' },
      error: null,
    })
    setupEqChain()
    vi.mocked(getLLMTierForUser).mockResolvedValue('premium')
    vi.mocked(summarize).mockResolvedValue(mockSummaryResult)
    vi.mocked(trackLLMCost).mockResolvedValue()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never)
    mockRawEmailsChain.select.mockReturnThis()
    mockRawEmailsChain.update.mockReturnThis()
  })

  it('génère et stocke un résumé pour un email brut', async () => {
    setupHappyPath()

    await processSummaryJob('job-1', baseJobData)

    // Verify raw_email fetch on correct table
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_emails')
    expect(mockRawEmailsChain.select).toHaveBeenCalledWith('content_text, sender_email')
    expect(mockRawEmailsChain.eq).toHaveBeenCalledWith('id', 'raw-email-uuid-123')

    // Verify tier determination
    expect(getLLMTierForUser).toHaveBeenCalledWith('user-123', 'paid')

    // Verify summarize called with email content
    expect(summarize).toHaveBeenCalledWith('Long newsletter content...', { tier: 'premium' })

    // Verify summary stored on correct table
    expect(mockSupabase.from).toHaveBeenCalledWith('summaries')
    expect(mockSummariesChain.insert).toHaveBeenCalledWith({
      user_id: 'user-123',
      raw_email_id: 'raw-email-uuid-123',
      title: 'Newsletter Recap',
      key_points: ['Point 1', 'Point 2', 'Point 3'],
      source_url: 'https://example.com/newsletter',
      llm_tier: 'premium',
      llm_provider: 'groq',
      tokens_input: 500,
      tokens_output: 150,
      generated_at: '2026-03-01T12:00:00Z',
    })

    // Verify raw_email marked as processed
    expect(mockRawEmailsChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ processed_at: expect.any(String) }),
    )

    // Verify cost tracking with summary_id and userTier
    expect(trackLLMCost).toHaveBeenCalledWith('user-123', mockSummaryResult, 'summary-uuid-1', 'paid')
  })

  it('utilise le tier basic pour les utilisateurs free', async () => {
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: { content_text: 'Content...', sender_email: 'news@example.com' },
      error: null,
    })
    mockSummariesChain.single.mockResolvedValueOnce({
      data: { id: 'summary-uuid-2' },
      error: null,
    })
    setupEqChain()

    vi.mocked(getLLMTierForUser).mockResolvedValue('basic')
    vi.mocked(summarize).mockResolvedValue({ ...mockSummaryResult, llmTier: 'basic' })
    vi.mocked(trackLLMCost).mockResolvedValue()

    await processSummaryJob('job-2', { ...baseJobData, userTier: 'free' })

    expect(getLLMTierForUser).toHaveBeenCalledWith('user-123', 'free')
    expect(summarize).toHaveBeenCalledWith('Content...', { tier: 'basic' })
  })

  it('throw si raw_email non trouvé', async () => {
    // eq returns chain for .single() — only 1 eq call in this path
    mockRawEmailsChain.eq.mockReturnValueOnce(mockRawEmailsChain)
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })

    await expect(processSummaryJob('job-3', baseJobData)).rejects.toThrow(
      'raw_email not found: raw-email-uuid-123',
    )

    expect(summarize).not.toHaveBeenCalled()
  })

  it('throw si le stockage du résumé échoue', async () => {
    mockRawEmailsChain.eq.mockReturnValueOnce(mockRawEmailsChain)
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: { content_text: 'Content...', sender_email: 'news@example.com' },
      error: null,
    })
    mockSummariesChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } })

    vi.mocked(getLLMTierForUser).mockResolvedValue('premium')
    vi.mocked(summarize).mockResolvedValue(mockSummaryResult)

    await expect(processSummaryJob('job-4', baseJobData)).rejects.toThrow(
      'Failed to store summary: Insert failed',
    )

    expect(trackLLMCost).not.toHaveBeenCalled()
  })

  it('throw si le LLM échoue', async () => {
    mockRawEmailsChain.eq.mockReturnValueOnce(mockRawEmailsChain)
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: { content_text: 'Content...', sender_email: 'news@example.com' },
      error: null,
    })

    vi.mocked(getLLMTierForUser).mockResolvedValue('premium')
    vi.mocked(summarize).mockRejectedValue(new Error('LLM timeout'))

    await expect(processSummaryJob('job-5', baseJobData)).rejects.toThrow('LLM timeout')

    expect(mockSummariesChain.insert).not.toHaveBeenCalled()
  })

  it('throw si la mise à jour processed_at échoue', async () => {
    mockRawEmailsChain.single.mockResolvedValueOnce({
      data: { content_text: 'Content...', sender_email: 'news@example.com' },
      error: null,
    })
    mockSummariesChain.single.mockResolvedValueOnce({
      data: { id: 'summary-uuid-6' },
      error: null,
    })
    setupEqChain({ error: { message: 'Update failed' } })

    vi.mocked(getLLMTierForUser).mockResolvedValue('premium')
    vi.mocked(summarize).mockResolvedValue(mockSummaryResult)

    await expect(processSummaryJob('job-6', baseJobData)).rejects.toThrow(
      'Failed to update processed_at: Update failed',
    )

    expect(trackLLMCost).not.toHaveBeenCalled()
  })
})
