import { simpleParser } from 'mailparser'

export async function extractTextFromEmail(rawEmail: string): Promise<{
  text: string
  html: string | null
}> {
  const parsed = await simpleParser(rawEmail)
  return {
    text: parsed.text ?? '',
    html: parsed.html || null,
  }
}
