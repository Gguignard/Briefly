'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'

export const FREE_NEWSLETTER_LIMIT = 5

interface Props {
  count: number
  tier: 'free' | 'paid'
}

export function NewsletterLimitBanner({ count, tier }: Props) {
  const locale = useLocale()
  const t = useTranslations('newsletters')

  if (tier === 'paid') return null

  const atLimit = count >= FREE_NEWSLETTER_LIMIT

  return (
    <div className="space-y-3">
      <span
        className={
          atLimit
            ? 'text-sm text-destructive font-medium'
            : 'text-sm text-muted-foreground'
        }
      >
        {t('limitReached', { count })}
      </span>
      {atLimit && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <p>
            {t('limitMessage')}{' '}
            <Link
              href={`/${locale}/billing`}
              className="font-medium underline"
            >
              {t('upgrade')}
            </Link>{' '}
            {t('upgradeDetail')}
          </p>
        </div>
      )}
    </div>
  )
}
