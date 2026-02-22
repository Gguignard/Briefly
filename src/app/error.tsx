'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capturer l'erreur avec Sentry (Story 1.6)
    Sentry.captureException(error)

    // Log en développement pour debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Une erreur est survenue</h2>
      <Button onClick={() => reset()}>Réessayer</Button>
    </div>
  )
}
