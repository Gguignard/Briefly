import OpenAI from 'openai'
import { SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_TEMPLATE } from '../prompts'
import { SummaryResult } from '../types'
import { parseLLMResponse } from '../validation'
import logger from '@/lib/utils/logger'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}

export async function summarizeWithOpenAI(
  content: string,
  tier: 'basic' | 'premium'
): Promise<SummaryResult> {
  const model = tier === 'premium' ? 'gpt-4o-mini' : 'gpt-4o-nano'

  const response = await getClient().chat.completions.create({
    model,
    max_tokens: 800,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      { role: 'user', content: SUMMARY_USER_TEMPLATE(content) },
    ],
  })

  const tokensInput = response.usage?.prompt_tokens ?? 0
  const tokensOutput = response.usage?.completion_tokens ?? 0
  const parsed = parseLLMResponse(response.choices[0].message.content)

  logger.info(
    { provider: 'openai', model, tier, tokensInput, tokensOutput },
    'LLM call completed'
  )

  return {
    title: parsed.title,
    keyPoints: parsed.keyPoints,
    sourceUrl: parsed.sourceUrl,
    llmTier: tier,
    provider: 'openai',
    tokensInput,
    tokensOutput,
    generatedAt: new Date().toISOString(),
  }
}
