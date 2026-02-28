'use client'

import { useTranslations } from 'next-intl'
import { DeleteAccountDialog } from './DeleteAccountDialog'

export function DangerZoneSection() {
  const t = useTranslations('settings.account.danger_zone')

  return (
    <section className="bg-destructive/5 border border-destructive/30 rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold text-destructive">{t('title')}</h2>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <DeleteAccountDialog />
    </section>
  )
}
