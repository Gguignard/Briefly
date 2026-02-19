# Story 6.5 : Navigation Dashboard (Sidebar + Mobile)

**Epic :** Epic 6 - Interface de Lecture & Feed de Résumés
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** a consistent navigation that works on both desktop and mobile,
**so that** I can easily move between Summaries, Newsletters, Settings, and Billing.

---

## Acceptance Criteria

1. ✅ Sidebar fixe sur desktop (≥ 768px) avec les liens de navigation
2. ✅ Barre de navigation en bas sur mobile (< 768px) avec icônes
3. ✅ Items de navigation : Résumés, Newsletters, Catégories, Paramètres, Facturation
4. ✅ Link actif mis en évidence (fond, couleur)
5. ✅ Logo Briefly en haut de la sidebar
6. ✅ Avatar utilisateur + email en bas de sidebar (desktop) ou dans un menu sur mobile
7. ✅ Bouton "Se déconnecter" accessible (story 3.3)

---

## Technical Notes

### Layout dashboard

```typescript
// src/app/[locale]/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/features/dashboard/components/AppSidebar'
import { MobileNav } from '@/features/dashboard/components/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <MobileNav />
      </nav>
    </div>
  )
}
```

### `AppSidebar` (desktop)

```typescript
// src/features/dashboard/components/AppSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  BookOpen, Mail, Tag, Settings, CreditCard
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'summaries', icon: BookOpen, path: '/summaries' },
  { key: 'newsletters', icon: Mail, path: '/newsletters' },
  { key: 'categories', icon: Tag, path: '/categories' },
  { key: 'settings', icon: Settings, path: '/settings' },
  { key: 'billing', icon: CreditCard, path: '/billing' },
]

export function AppSidebar() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <div className="flex flex-col h-full p-3">
      {/* Logo */}
      <Link href={`/${locale}/summaries`} className="px-3 py-2 mb-4">
        <span className="text-lg font-bold">Briefly</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ key, icon: Icon, path }) => {
          const href = `/${locale}${path}`
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={key}
              href={href}
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
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
```

### `MobileNav` (bottom bar)

```typescript
// src/features/dashboard/components/MobileNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { BookOpen, Mail, Tag, Settings } from 'lucide-react'

const MOBILE_NAV = [
  { icon: BookOpen, path: '/summaries', label: 'Résumés' },
  { icon: Mail, path: '/newsletters', label: 'Newsletters' },
  { icon: Tag, path: '/categories', label: 'Catégories' },
  { icon: Settings, path: '/settings', label: 'Paramètres' },
]

export function MobileNav() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex justify-around items-center h-16 px-2">
      {MOBILE_NAV.map(({ icon: Icon, path, label }) => {
        const href = `/${locale}${path}`
        const isActive = pathname.startsWith(href)

        return (
          <Link
            key={path}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
```

---

## Dependencies

**Requires :**
- Story 1.5 : next-intl (traductions nav)
- Story 3.3 : SignOutButton

**Blocks :**
- Toutes les pages du dashboard (nécessitent ce layout)

---

## Definition of Done

- [ ] `src/app/[locale]/(dashboard)/layout.tsx` créé
- [ ] `AppSidebar` desktop fonctionnel avec lien actif
- [ ] `MobileNav` bottom bar mobile fonctionnelle
- [ ] Test responsive : sidebar visible ≥ 768px, bottom nav visible < 768px

---

## Testing Strategy

- **Manuel :** Naviguer entre les pages → vérifier le link actif dans la sidebar
- **Manuel :** Réduire viewport à 375px → vérifier la bottom nav
- **Manuel :** Vérifier la disparition de la sidebar sur mobile

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(dashboard)/layout.tsx`
- [ ] Créer `AppSidebar` component
- [ ] Créer `MobileNav` component

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
