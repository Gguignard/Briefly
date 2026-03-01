import { describe, it, expect } from 'vitest'
import { extractTextFromEmail } from '../extractor'

describe('extractTextFromEmail', () => {
  it('extrait le texte brut d\'un email simple', async () => {
    const rawEmail = [
      'From: sender@example.com',
      'To: user@briefly.email',
      'Subject: Newsletter Test',
      'Content-Type: text/plain',
      '',
      'Ceci est le contenu texte de la newsletter.',
    ].join('\r\n')

    const result = await extractTextFromEmail(rawEmail)

    expect(result.text).toContain('Ceci est le contenu texte de la newsletter.')
    expect(result.html).toBeNull()
  })

  it('extrait le texte et HTML d\'un email multipart', async () => {
    const boundary = '----=_Part_123'
    const rawEmail = [
      'From: sender@example.com',
      'To: user@briefly.email',
      'Subject: Newsletter HTML',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      'Version texte de la newsletter.',
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      '<html><body><h1>Newsletter</h1><p>Version HTML.</p></body></html>',
      '',
      `--${boundary}--`,
    ].join('\r\n')

    const result = await extractTextFromEmail(rawEmail)

    expect(result.text).toContain('Version texte de la newsletter.')
    expect(result.html).toContain('<h1>Newsletter</h1>')
  })

  it('retourne texte vide et html null pour un email vide', async () => {
    const rawEmail = [
      'From: sender@example.com',
      'To: user@briefly.email',
      'Subject: Empty',
      'Content-Type: text/plain',
      '',
      '',
    ].join('\r\n')

    const result = await extractTextFromEmail(rawEmail)

    expect(result.text).toBe('')
    expect(result.html).toBeNull()
  })
})
