import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/utils/logger'
import type { LLMTier } from './types'

const DAILY_PREMIUM_LIMIT_FREE = 1

export async function getLLMTierForUser(
  userId: string,
  userTier: 'free' | 'paid'
): Promise<LLMTier> {
  if (userTier === 'paid') return 'premium'

  const supabase = createAdminClient()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('summaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('llm_tier', 'premium')
    .gte('generated_at', todayStart.toISOString())

  if (error) {
    logger.error({ error, userId }, 'Failed to query premium summary count, defaulting to basic')
    return 'basic'
  }

  if ((count ?? 0) < DAILY_PREMIUM_LIMIT_FREE) {
    return 'premium'
  }

  return 'basic'
}
