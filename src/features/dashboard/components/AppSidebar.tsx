'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  FileText,
  Mail,
  FolderOpen,
  Settings,
  CreditCard,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { key: 'summaries', href: '/summaries', icon: FileText },
  { key: 'newsletters', href: '/newsletters', icon: Mail },
  { key: 'categories', href: '/categories', icon: FolderOpen },
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'billing', href: '/billing', icon: CreditCard },
] as const

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale()
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ key, href, icon: Icon }) => {
          const fullHref = `/${locale}${href}`
          const isActive = pathname.startsWith(fullHref)

          return (
            <Link
              key={key}
              href={fullHref}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </>
  )
}

export function AppSidebar() {
  const locale = useLocale()

  return (
    <aside className="hidden md:flex flex-col h-full w-64 border-r border-sidebar-border bg-sidebar">
      <div className="p-4 border-b">
        <Link href={`/${locale}`} className="text-xl font-bold">
          Briefly
        </Link>
      </div>
      <SidebarContent />
    </aside>
  )
}

export function MobileNav() {
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex md:hidden items-center justify-between p-4 border-b border-sidebar-border bg-sidebar">
      <Link href={`/${locale}`} className="text-xl font-bold">
        Briefly
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="p-4 border-b text-xl font-bold">
            Briefly
          </SheetTitle>
          <div className="flex flex-col h-[calc(100%-57px)]">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
