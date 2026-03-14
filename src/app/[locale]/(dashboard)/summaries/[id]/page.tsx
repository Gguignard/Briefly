import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function SummaryDetailPage({ params }: Props) {
  const { id, locale } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('summaries')
  const supabase = await createClient()

  const { data: summary, error } = await supabase
    .from('summaries')
    .select(`
      id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails ( sender_email, subject, received_at )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !summary) notFound()

  // Marquer comme lu si pas encore fait
  if (!summary.read_at) {
    await supabase
      .from('summaries')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
  }

  const email = summary.raw_emails as { sender_email: string; subject: string; received_at: string } | null

  return (
    <article className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Navigation retour */}
      <Link
        href={`/${locale}/summaries`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToSummaries')}
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {summary.llm_tier === 'premium' && (
            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
              {t('badgePremium')}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(summary.generated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{summary.title}</h1>
        {email && (
          <p className="text-sm text-muted-foreground">
            {t('source', { sender: email.sender_email })}
          </p>
        )}
      </div>

      {/* Points cles */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('keyPointsHeading')}</h2>
        <ul className="space-y-3">
          {(summary.key_points as string[]).map((point: string, i: number) => (
            <li key={i} className="flex gap-3 text-base">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA vers newsletter originale */}
      {summary.source_url && (
        <div className="pt-4 border-t">
          <Button asChild variant="outline">
            <a href={summary.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('readOriginal')}
            </a>
          </Button>
        </div>
      )}
    </article>
  )
}
