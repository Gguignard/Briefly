# Story 8.3 : Filtrer le Feed par Catégorie

**Epic :** Epic 8 - Catégorisation Personnalisée
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to filter my summaries feed by category,
**so that** I can focus on a specific topic (e.g., only Tech newsletters) when I'm short on time.

---

## Acceptance Criteria

1. ✅ Barre de filtres visible au-dessus du feed de résumés (story 6.1)
2. ✅ Filtre "Toutes" (sélectionné par défaut) + un bouton par catégorie
3. ✅ Clic sur une catégorie → query param `?categoryId=xxx` dans l'URL
4. ✅ Feed mis à jour avec seulement les résumés de newsletters de cette catégorie
5. ✅ Filtre actif persisté dans l'URL (navigable, partageable)

---

## Technical Notes

### Composant `CategoryFilter`

```typescript
// src/features/categories/components/CategoryFilter.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategoryId = searchParams.get('categoryId')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()).then(r => r.data),
  })

  const handleFilter = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('categoryId', categoryId)
    } else {
      params.delete('categoryId')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleFilter(null)}
        className={cn(
          'px-3 py-1 rounded-full text-sm border transition-colors',
          !activeCategoryId
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background hover:bg-muted border-input'
        )}
      >
        Toutes
      </button>
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(cat.id)}
          className={cn(
            'px-3 py-1 rounded-full text-sm border transition-colors flex items-center gap-1.5',
            activeCategoryId === cat.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-input'
          )}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          {cat.name}
        </button>
      ))}
    </div>
  )
}
```

### Intégration dans `SummariesFeed`

```typescript
// Modifier SummariesFeed (story 6.1) pour lire le query param
const searchParams = useSearchParams()
const categoryId = searchParams.get('categoryId')

const { data, isLoading } = useQuery({
  queryKey: ['summaries', { page: 1, categoryId }],
  queryFn: () => {
    const params = new URLSearchParams({ page: '1' })
    if (categoryId) params.set('categoryId', categoryId)
    return fetch(`/api/summaries?${params}`).then(r => r.json())
  },
})
```

### Extension `GET /api/summaries` (story 6.1)

L'API existante supporte déjà `?categoryId` via le join avec `raw_emails` et les `newsletters` :

```typescript
// Extension du filtre dans GET /api/summaries
if (categoryId) {
  // Join via raw_emails → newsletters → category_id
  query = query.eq('raw_emails.newsletters.category_id', categoryId)
}
```

---

## Dependencies

**Requires :**
- Story 6.1 : Feed (à étendre avec le filtre)
- Story 8.1 : Table `categories`
- Story 8.2 : Newsletters avec `category_id`

**Blocks :**
- Rien

---

## Definition of Done

- [x] `CategoryFilter` composant créé et intégré dans la page summaries
- [x] Query param `?categoryId` persisté dans l'URL
- [x] Feed filtré selon la catégorie sélectionnée

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `CategoryFilter` component
- [x] Intégrer dans `SummariesFeed` avec query param
- [x] Étendre `GET /api/summaries` pour le filtre categoryId

### Completion Notes
- `CategoryFilter` : composant avec boutons pill (Toutes + catégories utilisateur), indicateurs couleur, gestion URL via `useSearchParams`/`useRouter`. Masqué si aucune catégorie. Traductions i18n (`summaries.allCategories`).
- `SummariesFeed` : lit `categoryId` depuis les search params, l'inclut dans la queryKey et le fetch API.
- `GET /api/summaries` : filtre conditionnel via inner join `raw_emails.newsletters.category_id` quand `categoryId` est présent. Select dynamique pour éviter le filtrage inner join quand non nécessaire.
- Corrigé test `PATCH /api/newsletters/[id]` : mock manquant pour la vérification catégorie (`supabase.from('categories').select`).
- Corrigé tests `NewsletterList` : ajout `QueryClientProvider` wrapper manquant après ajout de `useQuery` pour les catégories (story 8.2).
- Tests : CategoryFilter 5/5, SummariesFeed 3/3, API summaries 7/7, route newsletters 19/19, NewsletterList 11/11.

### File List
- src/features/categories/components/CategoryFilter.tsx (nouveau)
- src/features/categories/components/__tests__/CategoryFilter.test.tsx (nouveau)
- src/features/summaries/components/SummariesFeed.tsx (modifié)
- src/features/summaries/components/__tests__/SummariesFeed.test.tsx (nouveau)
- src/app/api/summaries/route.ts (modifié)
- src/app/api/summaries/__tests__/route.test.ts (nouveau — review)
- src/app/[locale]/(dashboard)/summaries/page.tsx (modifié)
- src/app/api/newsletters/[id]/route.ts (modifié — validation catégorie)
- src/app/api/newsletters/[id]/__tests__/route.test.ts (modifié)
- src/features/newsletters/components/NewsletterCard.tsx (modifié — color-mix CSS)
- src/features/newsletters/components/NewsletterList.tsx (modifié — useQuery catégories)
- src/features/newsletters/components/__tests__/NewsletterList.test.tsx (modifié)
- messages/en.json (modifié)
- messages/fr.json (modifié)

### Change Log (Code Review — 2026-03-17)
- **H1** : Corrigé `CategoryFilter` — URL trailing `?` quand aucun paramètre restant. Ajout condition `qs ? pathname?qs : pathname`.
- **H2** : Ajouté validation UUID + vérification appartenance utilisateur pour `categoryId` dans `GET /api/summaries`. Import `zod`.
- **H3** : Complété File List avec 3 fichiers manquants (`route.ts newsletters`, `NewsletterCard.tsx`, `NewsletterList.tsx`).
- **M1** : Créé `src/app/api/summaries/__tests__/route.test.ts` — 6 tests couvrant auth, validation, ownership, pagination, filtrage.
- **M2** : Ajouté vérification `r.ok` dans `SummariesFeed` fetch pour propager correctement les erreurs HTTP vers React Query.

### Debug Log
- Test `PATCH /api/newsletters/[id] updates categoryId successfully` échouait : le mock `mockFrom.mockReturnValue` ne gérait pas l'appel `supabase.from('categories')` pour la vérification d'appartenance. Corrigé avec `mockFrom.mockImplementation` table-aware.
- 11 tests `NewsletterList` échouaient : `No QueryClient set` — le composant utilise `useQuery` pour les catégories (ajouté en 8.2) mais les tests ne wrappaient pas avec `QueryClientProvider`. Ajout du wrapper à tous les renders.
