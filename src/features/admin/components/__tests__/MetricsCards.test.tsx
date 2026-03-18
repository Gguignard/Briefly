import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MetricsCards } from '../MetricsCards'

describe('MetricsCards', () => {
  afterEach(cleanup)

  it('renders active users count', () => {
    render(
      <MetricsCards activeUsers={42} avgSummariesPerDay={3.5} totalCostEuros={15.5} />
    )
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Users actifs (7j)')).toBeInTheDocument()
  })

  it('renders average summaries per day', () => {
    render(
      <MetricsCards activeUsers={0} avgSummariesPerDay={8.3} totalCostEuros={0} />
    )
    expect(screen.getByText('8.3')).toBeInTheDocument()
    expect(screen.getByText('Résumés/jour (moy)')).toBeInTheDocument()
  })

  it('renders cost formatted with 2 decimals in EUR', () => {
    render(
      <MetricsCards activeUsers={0} avgSummariesPerDay={0} totalCostEuros={23.456} />
    )
    expect(screen.getByText('23.46€')).toBeInTheDocument()
    expect(screen.getByText('Coût LLM ce mois')).toBeInTheDocument()
  })

  it('renders zero values correctly', () => {
    render(
      <MetricsCards activeUsers={0} avgSummariesPerDay={0} totalCostEuros={0} />
    )
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0.0')).toBeInTheDocument()
    expect(screen.getByText('0.00€')).toBeInTheDocument()
  })
})
