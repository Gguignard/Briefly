import { createAdminClient } from '@/lib/supabase/admin'
import type { SummaryResult } from './types'
import logger, { logError } from '@/lib/utils/logger'

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'gpt-5-nano': { input: 0.00005, output: 0.0002 },
  'gpt-5-mini': { input: 0.00025, output: 0.001 },
  'qwen-3-32b': { input: 0.0001, output: 0.0004 },
  'llama-3.1-8b-instant': { input: 0.00003, output: 0.0001 },
}

const DEFAULT_RATE = { input: 0.0001, output: 0.0004 }

export async function trackLLMCost(userId: string, result: SummaryResult): Promise<void> {
  const totalTokens = result.tokensInput + result.tokensOutput
  const rate = COST_PER_1K_TOKENS[result.model] ?? DEFAULT_RATE
  const costUsd =
    (result.tokensInput / 1000) * rate.input + (result.tokensOutput / 1000) * rate.output

  const supabase = createAdminClient()
  const { error } = await supabase.from('llm_costs').insert({
    user_id: userId,
    provider: result.provider,
    model: result.model,
    tokens_used: totalTokens,
    cost_usd: costUsd,
  })

  if (error) {
    logError(new Error(`Failed to track LLM cost: ${error.message}`), { userId })
  } else {
    logger.info({ userId, model: result.model, costUsd }, 'LLM cost tracked')
  }
}
