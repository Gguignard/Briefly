'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Une erreur critique est survenue</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Notre équipe a été notifiée.</p>
          <button
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '0.375rem',
              border: '1px solid #ccc',
              background: '#000',
              color: '#fff',
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  )
}
