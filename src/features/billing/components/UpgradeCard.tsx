'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckIcon, Zap } from 'lucide-react'

const FEATURE_KEYS = [
  'unlimited',
  'premium_llm',
  'categories',
  'support',
] as const

export function UpgradeCard() {
  const t = useTranslations('billing.upgrade')

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {t('title')}
        </CardTitle>
        <p className="text-2xl font-bold">{t('price')}</p>
        <p className="text-sm text-green-700 font-medium">
          {t('roi')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <CheckIcon className="h-4 w-4 text-primary" />
              {t(`features.${key}`)}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href="/api/billing/checkout">
            {t('cta')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
