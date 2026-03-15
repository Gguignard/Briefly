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

- [x] `src/app/[locale]/(dashboard)/layout.tsx` créé
- [x] `AppSidebar` desktop fonctionnel avec lien actif
- [x] `MobileNav` bottom bar mobile fonctionnelle
- [x] Test responsive : sidebar visible ≥ 768px, bottom nav visible < 768px

---

## Testing Strategy

- **Manuel :** Naviguer entre les pages → vérifier le link actif dans la sidebar
- **Manuel :** Réduire viewport à 375px → vérifier la bottom nav
- **Manuel :** Vérifier la disparition de la sidebar sur mobile

---

## Dev Agent Record

### Status
Complete

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/app/[locale]/(dashboard)/layout.tsx` — layout responsive avec sidebar desktop + bottom nav mobile
- [x] Créer `AppSidebar` component — navigation 5 items, UserButton + email, SignOutButton, lien actif bg-primary/10
- [x] Créer `MobileNav` component — bottom bar 4 items (icônes + labels), lien actif text-primary

### Completion Notes
- Refactored layout existant pour correspondre aux AC : sidebar `w-56` fixe desktop, bottom bar fixe mobile, `overflow-hidden` sur container, padding `pb-20` mobile pour compenser la bottom nav
- `MobileNav` séparé dans son propre fichier (`MobileNav.tsx`) au lieu d'être co-localisé dans `AppSidebar.tsx` — meilleure séparation des responsabilités
- Icônes alignées sur la spec : `BookOpen` (résumés), `Mail` (newsletters), `Tag` (catégories), `Settings`, `CreditCard` (facturation)
- `UserButton` Clerk + email utilisateur ajoutés en bas de sidebar desktop (AC6)
- MobileNav n'inclut pas Facturation (4 items au lieu de 5) — espace limité en bottom bar mobile
- 19 tests unitaires écrits et passent (11 AppSidebar + 8 MobileNav)
- 7 échecs de tests préexistants (Supabase integration, Settings, etc.) — non liés à cette story

### File List
- `src/app/[locale]/(dashboard)/layout.tsx` — modifié
- `src/features/dashboard/components/AppSidebar.tsx` — réécrit
- `src/features/dashboard/components/MobileNav.tsx` — créé
- `src/features/dashboard/components/navConfig.ts` — créé (config nav partagée)
- `src/features/dashboard/index.ts` — modifié (export MobileNav)
- `src/features/dashboard/components/__tests__/AppSidebar.test.tsx` — créé
- `src/features/dashboard/components/__tests__/MobileNav.test.tsx` — créé
- `messages/en.json` — modifié (ajout clé `nav.mainNav`)
- `messages/fr.json` — modifié (ajout clé `nav.mainNav`)

### Code Review (AI) — 2026-03-15
**Reviewer:** Claude Opus 4.6
**Issues trouvées:** 2 HIGH, 4 MEDIUM, 2 LOW
**Issues corrigées:** 2 HIGH, 4 MEDIUM (6 total)

#### Corrections appliquées :
1. **[H1] redirect sans locale** — Ajout `getLocale()` + préfixe locale dans `redirect()` du layout
2. **[H2] aria-current manquant** — Ajout `aria-current="page"` sur les liens actifs (AppSidebar + MobileNav)
3. **[M1] Scope contamination** — Documenté (package.json/pnpm-lock.yaml = dépendances Stripe, hors scope 6.5)
4. **[M2] Duplication NAV_ITEMS** — Extraction dans `navConfig.ts` partagé avec flag `mobileVisible`
5. **[M3] Landmarks nav sans aria-label** — Ajout `aria-label` sur `<nav>` desktop et mobile
6. **[M4] Loading state useUser** — Ajout fallback `'...'` pendant chargement Clerk

#### Issues LOW non corrigées (par choix) :
- [L1] Double mécanisme sign-out (UserButton + SignOutButton) — choix UX intentionnel
- [L2] `startsWith` matching trop large — risque faible avec les routes actuelles

### Debug Log
Aucun problème rencontré. Implémentation directe à partir de la spec.
