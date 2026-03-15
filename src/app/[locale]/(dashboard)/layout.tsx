import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { AppSidebar } from '@/features/dashboard/components/AppSidebar'
import { MobileNav } from '@/features/dashboard/components/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) {
    const locale = await getLocale()
    redirect(`/${locale}/sign-in`)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r">
        <AppSidebar />
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Navigation mobile (bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50" aria-label="Mobile navigation">
        <MobileNav />
      </nav>
    </div>
  )
}
