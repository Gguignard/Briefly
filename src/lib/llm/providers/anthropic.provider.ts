import Anthropic from '@anthropic-ai/sdk'
import { SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_TEMPLATE } from '../prompts'
import { SummaryResult } from '../types'
import { parseLLMResponse } from '../validation'
import logger from '@/lib/utils/logger'

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export async function summarizeWithAnthropic(
  content: string,
  tier: 'basic' | 'premium'
): Promise<SummaryResult> {
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: SUMMARY_USER_TEMPLATE(content) }],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : null
  const tokensInput = response.usage.input_tokens
  const tokensOutput = response.usage.output_tokens
  const parsed = parseLLMResponse(text)

  logger.info(
    { provider: 'anthropic', model: 'claude-haiku-4-5', tier, tokensInput, tokensOutput },
    'LLM call completed'
  )

  return {
    title: parsed.title,
    keyPoints: parsed.keyPoints,
    sourceUrl: parsed.sourceUrl,
    llmTier: tier,
    provider: 'anthropic',
    tokensInput,
    tokensOutput,
    generatedAt: new Date().toISOString(),
  }
}
