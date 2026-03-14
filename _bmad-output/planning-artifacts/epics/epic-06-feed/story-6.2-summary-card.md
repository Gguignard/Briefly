# Story 6.2 : Composant SummaryCard avec Badges

**Epic :** Epic 6 - Interface de Lecture & Feed de Résumés
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** each summary displayed as a clean card with title, key points, source link, and LLM tier badge,
**so that** I can quickly assess the content and quality of each summary at a glance.

---

## Acceptance Criteria

1. ✅ Card affiche : titre, source newsletter, bullet points clés (max 3), date
2. ✅ Badge "Premium" (violet) si `llm_tier = 'premium'`, discret/absent si basic
3. ✅ Lien "Lire la newsletter complète" vers `source_url` (si présent) → nouvel onglet
4. ✅ Indicateur visuel non-lu (ring ou fond légèrement coloré)
5. ✅ Indicateur visuel lu (opacité réduite ou check)
6. ✅ Card cliquable → page détail résumé (story 6.3)
7. ✅ Accessible (WCAG 2.1 AA) : alt text, focus visible, contraste

---

## Technical Notes

### `SummaryCard`

```typescript
// src/features/summaries/components/SummaryCard.tsx
'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMarkAsRead } from '../hooks/useMarkAsRead'

interface SummaryCardProps {
  summary: {
    id: string
    title: string
    key_points: string[]
    source_url: string | null
    llm_tier: 'basic' | 'premium'
    read_at: string | null
    generated_at: string
    raw_emails: {
      sender_email: string
      subject: string
    }
  }
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const locale = useLocale()
  const { markAsRead } = useMarkAsRead(summary.id)
  const isRead = !!summary.read_at

  return (
    <article
      className={cn(
        'border rounded-xl p-4 space-y-3 transition-all hover:shadow-sm',
        isRead
          ? 'bg-card opacity-75'
          : 'bg-card ring-2 ring-primary/10'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/${locale}/summaries/${summary.id}`}
            className="font-semibold text-base hover:underline line-clamp-2"
            onClick={markAsRead}
          >
            {summary.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {summary.raw_emails.sender_email} · {formatRelativeDate(summary.generated_at)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {summary.llm_tier === 'premium' && (
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs">
              Premium
            </Badge>
          )}
          {isRead && (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" aria-label="Lu" />
          )}
        </div>
      </div>

      {/* Key points */}
      <ul className="space-y-1">
        {summary.key_points.slice(0, 3).map((point, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-primary/60 shrink-0">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {summary.source_url && (
        <a
          href={summary.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          onClick={markAsRead}
        >
          Lire la newsletter complète
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </article>
  )
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000)

  if (diffHours < 1) return 'À l\'instant'
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffHours < 48) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
```

### `SummaryCardSkeleton`

```typescript
// src/features/summaries/components/SummaryCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function SummaryCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  )
}
```

---

## Dependencies

**Requires :**
- Story 6.1 : Feed (consomme SummaryCard)
- Story 6.4 : `useMarkAsRead` hook

**Blocks :**
- Story 6.3 : Page détail (lien depuis la card)

---

## Definition of Done

- [x] `SummaryCard` avec badge Premium, indicateur lu/non-lu, lien source
- [x] `SummaryCardSkeleton` créé
- [x] Card accessible (aria-label, focus visible)
- [x] Test visuel : card non-lue vs card lue (couvert par tests unitaires)

---

## Testing Strategy

- **Manuel :** Vérifier le badge "Premium" sur les résumés premium
- **Manuel :** Vérifier l'indicateur visuel non-lu vs lu
- **Manuel :** Vérifier que le lien "Lire la newsletter" ouvre dans un nouvel onglet

---

## Dev Agent Record

### Status
review

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `SummaryCard` avec tous les éléments visuels
- [x] Créer `SummaryCardSkeleton`
- [x] Intégrer dans `SummariesFeed`

### Completion Notes
- `SummaryCard` réécrit avec : titre cliquable vers page détail (`/{locale}/summaries/{id}`), badge Premium violet (`Badge` shadcn), indicateur lu (opacité + `CheckCircle2` icon) / non-lu (ring), max 3 key points, lien source `target="_blank"`, date relative i18n via `formatRelativeDate`
- `SummaryCardSkeleton` amélioré avec `aria-busy` et `aria-label` pour l'accessibilité
- Accessibilité WCAG 2.1 AA : `focus-visible:ring-2` sur liens, `aria-label` sur icône lu, `aria-hidden` sur décoratifs, `article` sémantique
- Type `SummaryCardData` exporté depuis l'index pour réutilisation
- `useMarkAsRead` non intégré (dépendance Story 6.4) — remplacé par `onNavigate` callback
- Clés i18n ajoutées : `readIndicator`, `justNow`, `hoursAgo`, `yesterday` (fr + en)
- 20 tests unitaires : 17 pour SummaryCard + 3 pour SummaryCardSkeleton — tous passent

### File List
- `src/features/summaries/components/SummaryCard.tsx` (modifié)
- `src/features/summaries/components/SummaryCardSkeleton.tsx` (modifié)
- `src/features/summaries/index.ts` (modifié)
- `src/features/summaries/components/__tests__/SummaryCard.test.tsx` (créé)
- `src/features/summaries/components/__tests__/SummaryCardSkeleton.test.tsx` (créé)
- `messages/fr.json` (modifié — clés i18n ajoutées)
- `messages/en.json` (modifié — clés i18n ajoutées)

### Debug Log
- Aucun problème rencontré
- 7 tests pré-existants en échec (Supabase integration + SettingsPage) — non liés à cette story
