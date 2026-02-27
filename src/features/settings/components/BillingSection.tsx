'use client'

import { useUser } from '@clerk/nextjs'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function BillingSection() {
  const { user } = useUser()
  const locale = useLocale()
  const t = useTranslations('settings.billing')

  const tier = (user?.publicMetadata?.tier as string) ?? 'free'
  const tierLabel = t(tier as 'free' | 'starter' | 'pro', { defaultValue: tier })

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">{t('title')}</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t('current_tier')}</p>
          <p className="font-medium capitalize">{tierLabel}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${locale}/billing`}>{t('manage')}</Link>
        </Button>
      </div>
    </section>
  )
}
