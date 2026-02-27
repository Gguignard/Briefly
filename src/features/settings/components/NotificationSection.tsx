'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Props {
  initialEnabled?: boolean
}

export function NotificationSection({ initialEnabled = true }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const t = useTranslations('settings.notifications')

  const handleToggle = async (value: boolean) => {
    setEnabled(value)
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailySummaryEnabled: value }),
      })
      if (!res.ok) setEnabled(!value)
    } catch {
      setEnabled(!value)
    }
  }

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">{t('title')}</h2>
      <div className="flex items-center justify-between">
        <Label htmlFor="daily-summary">{t('daily_summary')}</Label>
        <Switch
          id="daily-summary"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </section>
  )
}
