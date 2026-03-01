import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppSidebar, MobileNav } from '@/features/dashboard/components/AppSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <MobileNav />
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
    </div>
  )
}
