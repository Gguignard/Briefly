export interface LLMParsedSummary {
  title: string
  keyPoints: string[]
  sourceUrl: string | null
}

export function parseLLMResponse(raw: string | null | undefined): LLMParsedSummary {
  if (!raw) {
    throw new Error('LLM returned empty response')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`LLM returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('LLM response is not a JSON object')
  }

  const obj = parsed as Record<string, unknown>

  const title = typeof obj.title === 'string' ? obj.title : ''
  const sourceUrl = typeof obj.sourceUrl === 'string' ? obj.sourceUrl : null

  let keyPoints: string[] = []
  if (Array.isArray(obj.keyPoints)) {
    keyPoints = obj.keyPoints.filter((p): p is string => typeof p === 'string')
  }

  return { title, keyPoints, sourceUrl }
}
