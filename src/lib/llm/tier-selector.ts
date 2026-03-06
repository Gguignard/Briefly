import type { LLMTier } from './types'

/**
 * Determines the LLM tier for a user based on their subscription.
 * Story 5.3 will enhance this with more sophisticated logic.
 */
export function getLLMTierForUser(userId: string, userTier: string): LLMTier {
  // Story 5.3 will use userId for daily premium quota check
  return userTier === 'paid' ? 'premium' : 'basic'
}
