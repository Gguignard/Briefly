export type LLMTier = 'basic' | 'premium'
export type LLMProvider = 'openai' | 'anthropic'

export interface SummaryResult {
  title: string
  keyPoints: string[]
  sourceUrl: string | null
  llmTier: LLMTier
  provider: LLMProvider
  tokensInput: number
  tokensOutput: number
  generatedAt: string
}

export interface LLMCallOptions {
  tier: LLMTier
}
