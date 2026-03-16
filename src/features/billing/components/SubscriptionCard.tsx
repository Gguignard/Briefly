'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface SubscriptionCardProps {
  currentPeriodEnd: string | null
}

export function SubscriptionCard({ currentPeriodEnd }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const locale = useLocale()
  const t = useTranslations('billing.subscription')

  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US' }

  const handlePortal = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) {
        setError(true)
        return
      }
      const { data } = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t('title')}
          </span>
          <Badge className="bg-violet-100 text-violet-700">{t('badge')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            {t('renewalDate', {
              date: new Date(currentPeriodEnd).toLocaleDateString(localeMap[locale] ?? locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            })}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive">{t('error')}</p>
        )}
        <Button variant="outline" onClick={handlePortal} disabled={loading}>
          {loading ? t('loading') : t('manage')}
        </Button>
      </CardContent>
    </Card>
  )
}
