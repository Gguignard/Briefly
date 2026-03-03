import { summarizeWithOpenAI } from './providers/openai.provider'
import { summarizeWithAnthropic } from './providers/anthropic.provider'
import { LLMCallOptions, SummaryResult } from './types'
import logger, { logError } from '@/lib/utils/logger'

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, delay * Math.pow(2, attempt - 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function summarize(
  content: string,
  options: LLMCallOptions
): Promise<SummaryResult> {
  const { tier } = options

  const primaryProvider = tier === 'premium' ? 'anthropic' : 'openai'
  const fallbackProvider = tier === 'premium' ? 'openai' : 'anthropic'

  const primaryFn =
    primaryProvider === 'anthropic'
      ? () => summarizeWithAnthropic(content, tier)
      : () => summarizeWithOpenAI(content, tier)

  const fallbackFn =
    fallbackProvider === 'anthropic'
      ? () => summarizeWithAnthropic(content, tier)
      : () => summarizeWithOpenAI(content, tier)

  try {
    return await withRetry(primaryFn)
  } catch (primaryErr) {
    logger.warn(
      { tier, primaryProvider },
      'Primary LLM failed, trying fallback'
    )
    try {
      return await withRetry(fallbackFn)
    } catch (fallbackErr) {
      logError(fallbackErr as Error, { tier, primaryProvider, fallbackProvider })
      throw fallbackErr
    }
  }
}
