# Story 8.2 : Assigner une Catégorie à une Newsletter

**Epic :** Epic 8 - Catégorisation Personnalisée
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** authenticated user,
**I want** to assign a category to each newsletter I follow,
**so that** my summaries are automatically organized by topic.

---

## Acceptance Criteria

1. ✅ `PATCH /api/newsletters/:id` accepte `categoryId` (déjà supporté en story 4.2)
2. ✅ Dropdown de sélection de catégorie dans `NewsletterCard`
3. ✅ La catégorie est affichée visuellement sur la `NewsletterCard` (badge coloré)
4. ✅ Désassignation possible (sélectionner "Aucune catégorie")

---

## Technical Notes

### Extension de `PATCH /api/newsletters/:id`

Le handler existant (story 4.2) supporte déjà `category_id` en update. Il suffit d'ajouter la validation :

```typescript
// Extension de story-4.2 : ajouter categoryId dans le PATCH body
const { active, categoryId } = await req.json()
const updates: Record<string, unknown> = {}
if (active !== undefined) updates.active = active
if (categoryId !== undefined) updates.category_id = categoryId || null // null = désassigner

const { data } = await supabase
  .from('newsletters')
  .update(updates)
  .eq('id', params.id)
  .eq('user_id', userId)
  .select()
  .single()
```

### Composant `CategorySelect`

```typescript
// src/features/categories/components/CategorySelect.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  currentCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategorySelect({ currentCategoryId, onSelect }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()).then(r => r.data),
  })

  return (
    <Select
      value={currentCategoryId ?? 'none'}
      onValueChange={v => onSelect(v === 'none' ? null : v)}
    >
      <SelectTrigger className="w-36 h-7 text-xs">
        <SelectValue placeholder="Catégorie..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Aucune</SelectItem>
        {categories.map((cat: any) => (
          <SelectItem key={cat.id} value={cat.id}>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Intégration dans `NewsletterCard`

```typescript
// Ajouter dans NewsletterCard (story 4.6)
import { CategorySelect } from '@/features/categories/components/CategorySelect'

const handleCategoryChange = async (categoryId: string | null) => {
  await fetch(`/api/newsletters/${newsletter.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ categoryId }),
  })
  // Update local state
}

// Dans le JSX :
<CategorySelect
  currentCategoryId={newsletter.category_id}
  onSelect={handleCategoryChange}
/>
```

---

## Dependencies

**Requires :**
- Story 4.2 : PATCH newsletter (déjà supporte `category_id`)
- Story 4.6 : `NewsletterCard`
- Story 8.1 : Table `categories`

**Blocks :**
- Story 8.3 : Filtrer par catégorie

---

## Definition of Done

- [x] `CategorySelect` composant créé
- [x] Intégré dans `NewsletterCard`
- [x] Assigner / désassigner fonctionnel

---

## Dev Agent Record

### Status
review

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `CategorySelect` component
- [x] Intégrer dans `NewsletterCard`

### Completion Notes
- Extended `PatchNewsletterSchema` to accept optional `categoryId` (UUID nullable) alongside `active`
- Built dynamic `updates` object to support partial PATCH (active only, categoryId only, or both)
- Created `Select` UI component (Radix UI based, consistent with project's UI pattern)
- Created `CategorySelect` component with i18n support ("None"/"Aucune" placeholder)
- Updated `NewsletterCard` to display colored category badge and include `CategorySelect` dropdown
- Updated `NewsletterList` to fetch categories on mount and pass `onCategoryChange` handler
- Added i18n keys for both fr.json and en.json
- Added `categories` table to Supabase types.ts
- Created `Category` type alias
- All 43 story-related tests pass (18 route + 10 card + 11 list + 4 CategorySelect)
- No regressions introduced (488/495 pass, 7 pre-existing failures unrelated)

### File List
- `src/lib/supabase/types.ts` — added `categories` table definition
- `src/types/category.ts` — new Category type
- `src/components/ui/select.tsx` — new Select UI component (Radix UI)
- `src/features/categories/components/CategorySelect.tsx` — new CategorySelect component
- `src/features/newsletters/components/NewsletterCard.tsx` — added category badge + CategorySelect
- `src/features/newsletters/components/NewsletterList.tsx` — added categories fetch + onCategoryChange
- `src/app/api/newsletters/[id]/route.ts` — extended PATCH schema for categoryId
- `messages/fr.json` — added categoryPlaceholder, noCategory keys
- `messages/en.json` — added categoryPlaceholder, noCategory keys
- `src/app/api/newsletters/[id]/__tests__/route.test.ts` — added 3 categoryId tests
- `src/features/newsletters/components/__tests__/NewsletterCard.test.tsx` — updated props + category tests
- `src/features/newsletters/components/__tests__/NewsletterList.test.tsx` — updated mocks + category test
- `src/features/categories/components/__tests__/CategorySelect.test.tsx` — new 4 tests

### Debug Log
_Aucun problème majeur rencontré._
