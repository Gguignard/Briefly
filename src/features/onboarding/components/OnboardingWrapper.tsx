'use client'

import { useState } from 'react'
import { OnboardingBanner } from './OnboardingBanner'

interface Props {
  inboxAddress: string
}

export function OnboardingWrapper({ inboxAddress }: Props) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = async () => {
    setVisible(false)
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingCompleted: true }),
      })
      if (!res.ok) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }

  if (!visible) return null

  return <OnboardingBanner inboxAddress={inboxAddress} onDismiss={handleDismiss} />
}
