import { BookOpen, Mail, Tag, Settings, CreditCard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  key: string
  icon: LucideIcon
  path: string
  mobileVisible: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'summaries', icon: BookOpen, path: '/summaries', mobileVisible: true },
  { key: 'newsletters', icon: Mail, path: '/newsletters', mobileVisible: true },
  { key: 'categories', icon: Tag, path: '/categories', mobileVisible: true },
  { key: 'settings', icon: Settings, path: '/settings', mobileVisible: true },
  { key: 'billing', icon: CreditCard, path: '/billing', mobileVisible: false },
]
