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

- [ ] `CategorySelect` composant créé
- [ ] Intégré dans `NewsletterCard`
- [ ] Assigner / désassigner fonctionnel

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `CategorySelect` component
- [ ] Intégrer dans `NewsletterCard`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
