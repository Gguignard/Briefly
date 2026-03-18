import type { ReactNode } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId, sessionClaims } = await auth()
  const locale = await getLocale()

  if (!userId) {
    redirect(`/${locale}/sign-in`)
  }

  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    redirect(`/${locale}`)
  }

  const t = await getTranslations('admin')

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background px-6 py-3">
        <p className="text-sm font-medium">{t('title')}</p>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
