import { summaryQueue } from '@/lib/queue/summary.queue'
import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/utils/logger'
import { extractTextFromEmail } from '@/lib/email/extractor'
import type { EmailJobData } from '@/lib/queue/email.queue'

export type { EmailJobData }

export async function processEmailJob(jobId: string | undefined, data: EmailJobData): Promise<void> {
  const { userId, userTier, from, subject, rawEmail, receivedAt } = data
  logger.info({ jobId, userId, subject }, 'Processing email job')

  const supabase = createAdminClient()

  // 0. Vérifier si l'utilisateur est suspendu
  const { data: user } = await supabase
    .from('users')
    .select('suspended')
    .eq('id', userId)
    .single()

  if (user?.suspended) {
    logger.info({ jobId, userId }, 'User suspended, skipping email processing')
    return
  }

  // 1. Extraire le contenu texte de l'email
  const { text, html } = await extractTextFromEmail(rawEmail)

  if (!text || text.length < 100) {
    logger.warn({ jobId }, 'Email content too short, skipping')
    return
  }

  // 2. Résoudre la newsletter correspondante (best-effort)
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('id')
    .eq('user_id', userId)
    .eq('email_address', from)
    .eq('active', true)
    .single()

  // 3. Stocker le contenu brut dans raw_emails
  const { data: rawEmailRecord, error } = await supabase
    .from('raw_emails')
    .insert({
      user_id: userId,
      newsletter_id: newsletter?.id ?? null,
      sender_email: from,
      subject,
      content_text: text,
      content_html: html,
      received_at: receivedAt,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to store raw email: ${error.message}`)

  // 4. Enqueue pour génération de résumé
  await summaryQueue.add('generate', {
    rawEmailId: rawEmailRecord.id,
    userId,
    userTier,
    subject,
  })

  logger.info({ jobId, rawEmailId: rawEmailRecord.id }, 'Email processed')
}
