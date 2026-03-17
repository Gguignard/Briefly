'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { SummaryCard, type SummaryCardData } from './SummaryCard'
import { SummaryCardSkeleton } from './SummaryCardSkeleton'
import { Mail, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SummariesFeed() {
  const t = useTranslations('summaries')
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('categoryId')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['summaries', { page: 1, categoryId }],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1' })
      if (categoryId) params.set('categoryId', categoryId)
      return fetch(`/api/summaries?${params}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
    },
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

  if (isError || data?.error) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive/60" />
        <p className="text-muted-foreground">{t('error')}</p>
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
      {summaries.map((summary: SummaryCardData) => (
        <SummaryCard key={summary.id} summary={summary} />
      ))}
    </div>
  )
}
