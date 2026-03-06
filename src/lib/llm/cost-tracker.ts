import { createAdminClient } from '@/lib/supabase/admin'
import type { SummaryResult } from './types'
import logger, { logError } from '@/lib/utils/logger'

// Tarifs en centimes d'euro pour 1000 tokens
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'gpt-5-nano': { input: 0.005, output: 0.02 },
  'gpt-5-mini': { input: 0.025, output: 0.1 },
  'qwen-3-32b': { input: 0.01, output: 0.04 },
  'llama-3.1-8b-instant': { input: 0.003, output: 0.01 },
}

const DEFAULT_RATE = { input: 0.01, output: 0.04 }

const FREE_USER_MONTHLY_THRESHOLD_CENTS = 80 // 0.8€

export function calculateCostCents(
  model: string,
  tokensInput: number,
  tokensOutput: number,
): number {
  const rate = COST_PER_1K_TOKENS[model] ?? DEFAULT_RATE
  return (tokensInput / 1000) * rate.input + (tokensOutput / 1000) * rate.output
}

export async function trackLLMCost(
  userId: string,
  result: SummaryResult,
  summaryId?: string,
  userTier: 'free' | 'paid' = 'free',
): Promise<void> {
  const costCents = calculateCostCents(result.model, result.tokensInput, result.tokensOutput)

  const supabase = createAdminClient()
  const { error } = await supabase.from('llm_costs').insert({
    user_id: userId,
    summary_id: summaryId ?? null,
    provider: result.provider,
    model: result.model,
    tokens_input: result.tokensInput,
    tokens_output: result.tokensOutput,
    cost_cents: costCents,
  })

  if (error) {
    logError(new Error(`Failed to track LLM cost: ${error.message}`), { userId })
    return
  }

  logger.info({ userId, model: result.model, costCents }, 'LLM cost tracked')

  // Vérifier le seuil mensuel uniquement pour les utilisateurs gratuits (AC5)
  if (userTier === 'free') {
    await checkMonthlyThreshold(userId)
  }
}

async function checkMonthlyThreshold(userId: string): Promise<void> {
  const monthlyCost = await getMonthlyUserCost(userId)
  if (monthlyCost > FREE_USER_MONTHLY_THRESHOLD_CENTS) {
    logger.warn({ userId, monthlyCost }, 'Free user exceeding LLM cost threshold (0.8€/month)')
  }
}

export async function getMonthlyUserCost(userId: string): Promise<number> {
  const supabase = createAdminClient()
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('llm_costs')
    .select('cost_cents')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  if (error) {
    logError(new Error(`Failed to query monthly cost: ${error.message}`), { userId })
    return 0
  }

  return (data ?? []).reduce((sum, r) => sum + Number(r.cost_cents), 0)
}
