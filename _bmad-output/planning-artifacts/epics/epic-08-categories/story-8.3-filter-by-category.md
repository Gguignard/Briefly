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

- [ ] `CategoryFilter` composant créé et intégré dans la page summaries
- [ ] Query param `?categoryId` persisté dans l'URL
- [ ] Feed filtré selon la catégorie sélectionnée

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `CategoryFilter` component
- [ ] Intégrer dans `SummariesFeed` avec query param
- [ ] Étendre `GET /api/summaries` pour le filtre categoryId

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
