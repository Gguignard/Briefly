import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

vi.mock('@/lib/queue/redis', () => ({
  getRedisConnection: vi.fn().mockReturnValue({ host: 'localhost', port: 6379 }),
}))

vi.mock('bullmq', () => {
  const MockWorker = vi.fn(function (this: Record<string, unknown>) {
    this.on = vi.fn()
    this.close = vi.fn()
  }) as unknown as typeof import('bullmq').Worker
  return { Worker: MockWorker }
})

import { processCleanupJob, RETENTION_DAYS } from '../cleanup.worker'
import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/utils/logger'

describe('processCleanupJob', () => {
  const mockSummariesChain = {
    delete: vi.fn().mockReturnThis(),
    lt: vi.fn(),
  }

  const mockRawEmailsChain = {
    delete: vi.fn().mockReturnThis(),
    lt: vi.fn(),
  }

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'summaries') return mockSummariesChain
      if (table === 'raw_emails') return mockRawEmailsChain
      return {}
    }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never)
  })

  it('RETENTION_DAYS est 90', () => {
    expect(RETENTION_DAYS).toBe(90)
  })

  it('supprime les summaries et raw_emails de plus de 90 jours', async () => {
    mockSummariesChain.lt.mockResolvedValueOnce({ count: 5, error: null })
    mockRawEmailsChain.lt.mockResolvedValueOnce({ count: 3, error: null })

    const result = await processCleanupJob()

    expect(result).toEqual({ summaryCount: 5, emailCount: 3 })

    // Verify delete on summaries
    expect(mockSupabase.from).toHaveBeenCalledWith('summaries')
    expect(mockSummariesChain.delete).toHaveBeenCalledWith({ count: 'exact' })
    expect(mockSummariesChain.lt).toHaveBeenCalledWith('created_at', expect.any(String))

    // Verify delete on raw_emails
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_emails')
    expect(mockRawEmailsChain.delete).toHaveBeenCalledWith({ count: 'exact' })
    expect(mockRawEmailsChain.lt).toHaveBeenCalledWith('created_at', expect.any(String))

    // Verify cutoff date is approximately 90 days ago
    const summariesCutoff = mockSummariesChain.lt.mock.calls[0][1] as string
    const emailsCutoff = mockRawEmailsChain.lt.mock.calls[0][1] as string
    expect(summariesCutoff).toBe(emailsCutoff) // Both tables must use same cutoff

    const cutoffDate = new Date(summariesCutoff)
    const expectedCutoff = new Date()
    expectedCutoff.setDate(expectedCutoff.getDate() - 90)
    const diffMs = Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())
    expect(diffMs).toBeLessThan(5000) // within 5 seconds

    // Verify logs
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ summaryCount: 5 }),
      'Purged old summaries',
    )
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ summaryCount: 5, emailCount: 3 }),
      'Daily purge completed',
    )
  })

  it('throw si la purge summaries echoue', async () => {
    mockSummariesChain.lt.mockResolvedValueOnce({ count: null, error: { message: 'DB error' } })

    await expect(processCleanupJob()).rejects.toThrow('Failed to purge summaries: DB error')
  })

  it('throw si la purge raw_emails echoue et log le succès partiel', async () => {
    mockSummariesChain.lt.mockResolvedValueOnce({ count: 2, error: null })
    mockRawEmailsChain.lt.mockResolvedValueOnce({
      count: null,
      error: { message: 'DB error' },
    })

    await expect(processCleanupJob()).rejects.toThrow('Failed to purge raw_emails: DB error')
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ summaryCount: 2 }),
      'Purged old summaries',
    )
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ summaryCount: 2 }),
      'Partial purge: summaries deleted but raw_emails failed',
    )
  })

  it('fonctionne quand aucun enregistrement a supprimer', async () => {
    mockSummariesChain.lt.mockResolvedValueOnce({ count: 0, error: null })
    mockRawEmailsChain.lt.mockResolvedValueOnce({ count: 0, error: null })

    const result = await processCleanupJob()

    expect(result).toEqual({ summaryCount: 0, emailCount: 0 })
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ summaryCount: 0, emailCount: 0 }),
      'Daily purge completed',
    )
  })
})
