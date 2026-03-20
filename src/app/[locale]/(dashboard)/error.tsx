'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  const locale = useLocale()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-4">
      <div className="space-y-2">
        <p className="text-5xl font-bold text-muted-foreground/30">500</p>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Quelque chose s&apos;est mal passé. Notre équipe a été notifiée.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono">
            Référence : {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Recharger</Button>
        <Button variant="outline" onClick={() => window.location.href = `/${locale}/summaries`}>
          Retour aux résumés
        </Button>
      </div>
    </div>
  )
}
