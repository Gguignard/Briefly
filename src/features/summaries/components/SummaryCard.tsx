'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMarkAsRead } from '../hooks/useMarkAsRead'

export type SummaryCardData = {
  id: string
  title: string
  key_points: string[]
  source_url: string | null
  llm_tier: 'basic' | 'premium'
  read_at: string | null
  generated_at: string
  raw_emails: {
    sender_email: string
    subject: string
    newsletter_id: string | null
  }
}

interface SummaryCardProps {
  summary: SummaryCardData
  onNavigate?: () => void
}

export function SummaryCard({ summary, onNavigate }: SummaryCardProps) {
  const locale = useLocale()
  const t = useTranslations('summaries')
  const isRead = !!summary.read_at
  const { markAsRead } = useMarkAsRead(summary.id)

  const handleNavigate = () => {
    markAsRead()
    onNavigate?.()
  }

  return (
    <article
      className={cn(
        'border rounded-xl p-4 space-y-3 transition-all hover:shadow-sm',
        isRead
          ? 'bg-card opacity-75'
          : 'bg-card ring-2 ring-primary/10'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/${locale}/summaries/${summary.id}`}
            className="font-semibold text-base hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm line-clamp-2"
            onClick={handleNavigate}
          >
            {summary.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {summary.raw_emails.sender_email} · {formatRelativeDate(summary.generated_at, t, locale)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {summary.llm_tier === 'premium' && (
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs">
              {t('badgePremium')}
            </Badge>
          )}
          {isRead && (
            <CheckCircle2
              className="h-4 w-4 text-muted-foreground/50"
              aria-label={t('readIndicator')}
            />
          )}
        </div>
      </div>

      {/* Key points (max 3) */}
      <ul className="space-y-1" aria-label="key points">
        {summary.key_points.slice(0, 3).map((point, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-primary/60 shrink-0" aria-hidden="true">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Source link */}
      {summary.source_url && (
        <a
          href={summary.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          onClick={handleNavigate}
        >
          {t('readMore')}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </article>
  )
}

export function formatRelativeDate(
  dateStr: string,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: string = 'fr'
): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return t('justNow')

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return t('justNow')

  const diffHours = Math.floor(diffMs / 3600000)

  if (diffHours < 1) return t('justNow')
  if (diffHours < 24) return t('hoursAgo', { hours: diffHours })
  if (diffHours < 48) return t('yesterday')

  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US' }
  return date.toLocaleDateString(localeMap[locale] ?? locale, { day: 'numeric', month: 'short' })
}
