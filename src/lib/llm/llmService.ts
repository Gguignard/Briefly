import { summarizeWithOpenAI } from './providers/openai.provider'
import { summarizeWithGroq } from './providers/groq.provider'
import { LLMCallOptions, LLMModelConfig, MODEL_CONFIG, SummaryResult } from './types'
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

function callProvider(
  config: LLMModelConfig,
  content: string,
  tier: LLMCallOptions['tier']
): Promise<SummaryResult> {
  switch (config.provider) {
    case 'openai':
      return summarizeWithOpenAI(content, config.model, tier)
    case 'groq':
      return summarizeWithGroq(content, config.model, tier)
  }
}

export async function summarize(
  content: string,
  options: LLMCallOptions
): Promise<SummaryResult> {
  const { tier } = options
  const { primary, fallback } = MODEL_CONFIG[tier]

  try {
    return await withRetry(() => callProvider(primary, content, tier))
  } catch (primaryErr) {
    logger.warn(
      { tier, primary: `${primary.provider}/${primary.model}` },
      'Primary LLM failed, trying fallback'
    )
    try {
      return await withRetry(() => callProvider(fallback, content, tier))
    } catch (fallbackErr) {
      logError(fallbackErr as Error, {
        tier,
        primary: `${primary.provider}/${primary.model}`,
        fallback: `${fallback.provider}/${fallback.model}`,
      })
      throw fallbackErr
    }
  }
}
