import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RecentSummaries } from '../RecentSummaries'
import type { RecentSummaryRow } from '../../admin.types'

const makeSummary = (overrides: Partial<RecentSummaryRow> = {}): RecentSummaryRow => ({
  id: crypto.randomUUID(),
  title: 'Morning Brew #42',
  user_id: 'user_1',
  llm_tier: 'free',
  llm_provider: 'openai',
  generated_at: '2026-03-15T08:00:00Z',
  ...overrides,
})

describe('RecentSummaries', () => {
  afterEach(cleanup)

  it('renders the heading', () => {
    render(<RecentSummaries summaries={[]} />)
    expect(screen.getByText('10 derniers résumés')).toBeInTheDocument()
  })

  it('renders summary rows with title, tier, and provider', () => {
    const summaries = [
      makeSummary({ title: 'Tech Digest', llm_tier: 'premium', llm_provider: 'anthropic' }),
      makeSummary({ title: 'Finance Daily', llm_tier: 'free', llm_provider: 'openai' }),
    ]
    render(<RecentSummaries summaries={summaries} />)

    expect(screen.getByText('Tech Digest')).toBeInTheDocument()
    expect(screen.getByText('Finance Daily')).toBeInTheDocument()
    expect(screen.getByText('premium')).toBeInTheDocument()
    expect(screen.getByText('anthropic')).toBeInTheDocument()
  })

  it('renders empty state when no summaries', () => {
    render(<RecentSummaries summaries={[]} />)
    expect(screen.getByText('Aucun résumé récent')).toBeInTheDocument()
  })

  it('renders user_id for each row', () => {
    const summaries = [makeSummary({ user_id: 'user_abc' })]
    render(<RecentSummaries summaries={summaries} />)
    expect(screen.getByText('user_abc')).toBeInTheDocument()
  })
})
