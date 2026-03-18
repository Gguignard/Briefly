import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { CostBreakdown } from '../CostBreakdown'
import type { LlmCostRow } from '../../admin.types'

const makeCost = (overrides: Partial<LlmCostRow> = {}): LlmCostRow => ({
  id: crypto.randomUUID(),
  user_id: 'user_1',
  provider: 'openai',
  model: 'gpt-4o',
  cost_cents: 500,
  tokens_input: 800,
  tokens_output: 200,
  created_at: '2026-03-01T00:00:00Z',
  summaries: { llm_tier: 'free' },
  ...overrides,
})

describe('CostBreakdown', () => {
  afterEach(cleanup)

  it('renders provider breakdown with totals in EUR', () => {
    const costs = [
      makeCost({ provider: 'openai', cost_cents: 1000 }),
      makeCost({ provider: 'openai', cost_cents: 500 }),
      makeCost({ provider: 'anthropic', cost_cents: 300 }),
    ]
    render(<CostBreakdown costs={costs} />)

    expect(screen.getByText('Ventilation des coûts')).toBeInTheDocument()
    expect(screen.getByText('openai')).toBeInTheDocument()
    expect(screen.getByText('15.00€')).toBeInTheDocument()
    expect(screen.getByText('anthropic')).toBeInTheDocument()
    expect(screen.getByText('3.00€')).toBeInTheDocument()
  })

  it('renders tier breakdown', () => {
    const costs = [
      makeCost({ cost_cents: 1000, summaries: { llm_tier: 'free' } }),
      makeCost({ cost_cents: 500, summaries: { llm_tier: 'premium' } }),
    ]
    render(<CostBreakdown costs={costs} />)

    expect(screen.getByText('Par tier')).toBeInTheDocument()
    expect(screen.getByText('free')).toBeInTheDocument()
    expect(screen.getByText('premium')).toBeInTheDocument()
  })

  it('renders empty state when no costs', () => {
    render(<CostBreakdown costs={[]} />)
    expect(screen.getByText('Aucun coût ce mois')).toBeInTheDocument()
  })

  it('renders export CSV button', () => {
    render(<CostBreakdown costs={[makeCost()]} />)
    expect(screen.getByRole('link', { name: /exporter csv/i })).toBeInTheDocument()
  })

  it('handles costs without summary (unknown tier)', () => {
    const costs = [makeCost({ summaries: null })]
    render(<CostBreakdown costs={costs} />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
