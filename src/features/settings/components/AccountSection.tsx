'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'

export function AccountSection() {
  const { user } = useUser()
  const t = useTranslations('settings.account')

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-medium">{t('title')}</h2>
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
    </section>
  )
}
