'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navConfig'

const MOBILE_NAV = NAV_ITEMS.filter((item) => item.mobileVisible)

export function MobileNav() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <div className="flex justify-around items-center h-16 px-2">
      {MOBILE_NAV.map(({ key, icon: Icon, path }) => {
        const href = `/${locale}${path}`
        const isActive = pathname.startsWith(href)

        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{t(key)}</span>
          </Link>
        )
      })}
    </div>
  )
}
