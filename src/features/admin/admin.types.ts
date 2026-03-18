export interface LlmCostRow {
  id: string
  user_id: string
  provider: string
  model: string
  cost_cents: number
  tokens_input: number
  tokens_output: number
  created_at: string
  summaries: { llm_tier: string } | null
}

export interface RecentSummaryRow {
  id: string
  title: string
  user_id: string
  llm_tier: string
  llm_provider: string
  generated_at: string
}
