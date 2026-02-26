import React from 'react'
import { AppSidebar, MobileNav } from '@/features/dashboard/components/AppSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <MobileNav />
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
