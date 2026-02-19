# Story 6.1 : Feed Quotidien des Résumés

**Epic :** Epic 6 - Interface de Lecture & Feed de Résumés
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** authenticated user,
**I want** to see my daily newsletter summaries in a clean feed,
**so that** I can quickly catch up on my newsletters in under 2 minutes.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/summaries` affiche les résumés du jour, plus récents en premier
2. ✅ `GET /api/summaries` retourne les résumés paginés (20 par page)
3. ✅ Filtre optionnel par `newsletter_id` via query param
4. ✅ Compteur de nouveaux résumés non-lus visible (`{count} nouveaux`)
5. ✅ État vide affiché si aucun résumé : "Vos premiers résumés arriveront demain matin !"
6. ✅ Loading skeleton pendant le chargement initial
7. ✅ TanStack Query utilisé pour le data fetching (cache + revalidation)

---

## Technical Notes

### API Route

```typescript
// src/app/api/summaries/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { searchParams } = new URL(req.url)
  const newsletterId = searchParams.get('newsletterId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('summaries')
    .select(`
      id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails!inner ( sender_email, subject )
    `)
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (newsletterId) {
    query = query.eq('raw_emails.newsletter_id', newsletterId)
  }

  const { data, error, count } = await query

  if (error) return apiError('DB_ERROR', 'Erreur de récupération', 500)

  return apiResponse({
    summaries: data ?? [],
    unreadCount: data?.filter(s => !s.read_at).length ?? 0,
    page,
    hasMore: (data?.length ?? 0) === limit,
  })
}
```

### Page (Server Component avec hydration TanStack Query)

```typescript
// src/app/[locale]/(dashboard)/summaries/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { SummariesFeed } from '@/features/summaries/components/SummariesFeed'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'

export default async function SummariesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const t = await getTranslations('summaries')
  const queryClient = new QueryClient()

  // Prefetch initial data
  await queryClient.prefetchQuery({
    queryKey: ['summaries', { page: 1 }],
    queryFn: () => fetch('/api/summaries').then(r => r.json()),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('title', { defaultValue: 'Mes résumés' })}</h1>
        <SummariesFeed />
      </div>
    </HydrationBoundary>
  )
}
```

### `SummariesFeed` (Client Component)

```typescript
// src/features/summaries/components/SummariesFeed.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { SummaryCard } from './SummaryCard'
import { SummaryCardSkeleton } from './SummaryCardSkeleton'
import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SummariesFeed() {
  const t = useTranslations('summaries')

  const { data, isLoading } = useQuery({
    queryKey: ['summaries', { page: 1 }],
    queryFn: () => fetch('/api/summaries').then(r => r.json()),
    staleTime: 60 * 1000, // 1 minute
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const summaries = data?.data?.summaries ?? []
  const unreadCount = data?.data?.unreadCount ?? 0

  if (summaries.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('newCount', { count: unreadCount })}
        </p>
      )}
      {summaries.map((summary: any) => (
        <SummaryCard key={summary.id} summary={summary} />
      ))}
    </div>
  )
}
```

### Installation TanStack Query

```bash
npm install @tanstack/react-query
```

```typescript
// src/app/[locale]/layout.tsx — Provider
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function LocaleLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## Dependencies

**Requires :**
- Story 5.2 : Table `summaries` peuplée
- Story 6.5 : Navigation dashboard (la page est dans `(dashboard)`)

**Blocks :**
- Story 6.2 : SummaryCard (consommé par ce feed)
- Story 6.4 : Marquage comme lu (bouton dans les cards)

---

## Definition of Done

- [ ] `GET /api/summaries` retourne les résumés paginés
- [ ] `SummariesFeed` avec TanStack Query, skeleton, état vide
- [ ] Compteur unread visible
- [ ] Page accessible sur `/fr/summaries`

---

## Testing Strategy

- **Manuel :** Visiter `/fr/summaries` → voir le feed ou l'état vide
- **Manuel :** Vérifier les skeletons au chargement (throttle réseau dans DevTools)
- **Manuel :** `GET /api/summaries?page=2` → vérifier la pagination

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `GET /api/summaries` avec pagination et filtre
- [ ] Créer `src/app/[locale]/(dashboard)/summaries/page.tsx`
- [ ] Créer `SummariesFeed` et `SummaryCardSkeleton`
- [ ] Configurer TanStack Query provider dans layout

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
