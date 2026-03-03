export type LLMTier = 'basic' | 'premium'
export type LLMProvider = 'openai' | 'groq'

export interface LLMModelConfig {
  model: string
  provider: LLMProvider
}

export const MODEL_CONFIG: Record<LLMTier, { primary: LLMModelConfig; fallback: LLMModelConfig }> = {
  basic: {
    primary:  { model: 'gpt-5-nano', provider: 'openai' },
    fallback: { model: 'llama-3.1-8b-instant', provider: 'groq' },
  },
  premium: {
    primary:  { model: 'qwen-3-32b', provider: 'groq' },
    fallback: { model: 'gpt-5-mini', provider: 'openai' },
  },
}

export interface SummaryResult {
  title: string
  keyPoints: string[]
  sourceUrl: string | null
  llmTier: LLMTier
  provider: LLMProvider
  model: string
  tokensInput: number
  tokensOutput: number
  generatedAt: string
}

export interface LLMCallOptions {
  tier: LLMTier
}
