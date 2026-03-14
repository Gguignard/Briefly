'use client'

import { useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { SummaryCardData } from '../components/SummaryCard'

interface SummariesQueryData {
  data?: {
    summaries: SummaryCardData[]
    unreadCount: number
  }
}

export function useMarkAsRead(summaryId: string) {
  const queryClient = useQueryClient()
  const markedRef = useRef(false)

  const markAsRead = useCallback(async () => {
    if (markedRef.current) return
    markedRef.current = true

    // Optimistic update on all summaries queries
    queryClient.setQueriesData<SummariesQueryData>(
      { queryKey: ['summaries'] },
      (old) => {
        if (!old?.data?.summaries) return old
        const target = old.data.summaries.find((s) => s.id === summaryId)
        const wasUnread = target && !target.read_at
        return {
          ...old,
          data: {
            ...old.data,
            summaries: old.data.summaries.map((s) =>
              s.id === summaryId
                ? { ...s, read_at: s.read_at ?? new Date().toISOString() }
                : s
            ),
            unreadCount: wasUnread
              ? Math.max(0, old.data.unreadCount - 1)
              : old.data.unreadCount,
          },
        }
      }
    )

    // Fire-and-forget API call with rollback on failure
    fetch(`/api/summaries/${summaryId}/read`, { method: 'PATCH' })
      .then((res) => {
        if (!res.ok) throw new Error('mark-as-read failed')
      })
      .catch(() => {
        markedRef.current = false
        queryClient.invalidateQueries({ queryKey: ['summaries'] })
      })
  }, [summaryId, queryClient])

  return { markAsRead }
}
