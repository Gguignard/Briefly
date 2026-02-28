'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { DataExportButton } from './DataExportButton'

export function AccountSection() {
  const { user } = useUser()
  const t = useTranslations('settings.account')

  return (
    <section className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
        <div>
          <p className="font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('edit_hint')}</p>
      <div className="pt-4 border-t space-y-2">
        <p className="text-sm font-medium">{t('gdpr.title')}</p>
        <DataExportButton />
      </div>
    </section>
  )
}
