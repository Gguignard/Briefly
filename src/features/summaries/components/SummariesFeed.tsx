'use client'

import { useQuery } from '@tanstack/react-query'
import { SummaryCard } from './SummaryCard'
import { SummaryCardSkeleton } from './SummaryCardSkeleton'
import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SummariesFeed() {
  const t = useTranslations('summaries')

  const { data, isLoading } = useQuery({
    queryKey: ['summaries', { page: 1 }],
    queryFn: () => fetch('/api/summaries').then((r) => r.json()),
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const summaries = data?.data?.summaries ?? []
  const unreadCount = data?.data?.unreadCount ?? 0

  if (summaries.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('newCount', { count: unreadCount })}
        </p>
      )}
      {summaries.map((summary: any) => (
        <SummaryCard key={summary.id} summary={summary} />
      ))}
    </div>
  )
}
