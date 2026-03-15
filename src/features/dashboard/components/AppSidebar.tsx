'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { UserButton, useUser } from '@clerk/nextjs'
import { NAV_ITEMS } from './navConfig'

export function AppSidebar() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { user, isLoaded } = useUser()

  return (
    <div className="flex flex-col h-full p-3">
      {/* Logo */}
      <Link href={`/${locale}/summaries`} className="px-3 py-2 mb-4">
        <span className="text-lg font-bold">Briefly</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label={t('mainNav')}>
        {NAV_ITEMS.map(({ key, icon: Icon, path }) => {
          const href = `/${locale}${path}`
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2 px-3 py-1">
          <UserButton afterSignOutUrl={`/${locale}`} />
          <span className="text-xs text-muted-foreground truncate">
            {isLoaded ? user?.primaryEmailAddress?.emailAddress : '...'}
          </span>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
