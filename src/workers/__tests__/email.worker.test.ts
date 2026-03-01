import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/queue/summary.queue', () => ({
  summaryQueue: { add: vi.fn() },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/email/extractor', () => ({
  extractTextFromEmail: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { processEmailJob } from '../email.processor'
import { summaryQueue } from '@/lib/queue/summary.queue'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractTextFromEmail } from '@/lib/email/extractor'

const LONG_TEXT =
  'Contenu texte assez long pour passer le seuil de 100 caractères. Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.'

describe('processEmailJob', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  const baseJobData = {
    userId: 'user-123',
    userTier: 'paid' as const,
    from: 'newsletter@example.com',
    subject: 'Test Newsletter',
    rawEmail: 'raw email content...',
    receivedAt: '2026-03-01T12:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as never)
    // Reset chain methods
    mockSupabase.from.mockReturnThis()
    mockSupabase.insert.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
  })

  it('parse l\'email, stocke dans raw_emails et enqueue summary', async () => {
    vi.mocked(extractTextFromEmail).mockResolvedValue({
      text: LONG_TEXT,
      html: '<p>HTML content</p>',
    })
    // 1st .single() = newsletter lookup (found)
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'newsletter-uuid-456' },
      error: null,
    })
    // 2nd .single() = raw_emails insert
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'raw-email-uuid-123' },
      error: null,
    })

    await processEmailJob('job-1', baseJobData)

    // Verify newsletter lookup
    expect(mockSupabase.from).toHaveBeenCalledWith('newsletters')
    // Verify raw_emails insert
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_emails')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: 'user-123',
      newsletter_id: 'newsletter-uuid-456',
      sender_email: 'newsletter@example.com',
      subject: 'Test Newsletter',
      content_text: LONG_TEXT,
      content_html: '<p>HTML content</p>',
      received_at: '2026-03-01T12:00:00Z',
    })

    expect(summaryQueue.add).toHaveBeenCalledWith('generate', {
      rawEmailId: 'raw-email-uuid-123',
      userId: 'user-123',
      userTier: 'paid',
      subject: 'Test Newsletter',
    })
  })

  it('insère avec newsletter_id null si newsletter non trouvée', async () => {
    vi.mocked(extractTextFromEmail).mockResolvedValue({
      text: LONG_TEXT,
      html: null,
    })
    // Newsletter lookup returns null
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    })
    // raw_emails insert
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'raw-email-uuid-789' },
      error: null,
    })

    await processEmailJob('job-1b', baseJobData)

    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({ newsletter_id: null }),
    )
  })

  it('skip les emails avec contenu trop court (< 100 chars)', async () => {
    vi.mocked(extractTextFromEmail).mockResolvedValue({
      text: 'Court.',
      html: null,
    })

    await processEmailJob('job-2', { ...baseJobData, userTier: 'free' })

    expect(mockSupabase.from).not.toHaveBeenCalled()
    expect(summaryQueue.add).not.toHaveBeenCalled()
  })

  it('skip les emails avec texte vide', async () => {
    vi.mocked(extractTextFromEmail).mockResolvedValue({
      text: '',
      html: null,
    })

    await processEmailJob('job-3', baseJobData)

    expect(mockSupabase.from).not.toHaveBeenCalled()
    expect(summaryQueue.add).not.toHaveBeenCalled()
  })

  it('throw si le stockage Supabase échoue', async () => {
    vi.mocked(extractTextFromEmail).mockResolvedValue({
      text: LONG_TEXT,
      html: null,
    })
    // Newsletter lookup
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: null,
    })
    // raw_emails insert fails
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    })

    await expect(processEmailJob('job-4', baseJobData)).rejects.toThrow(
      'Failed to store raw email: Database error',
    )

    expect(summaryQueue.add).not.toHaveBeenCalled()
  })
})
