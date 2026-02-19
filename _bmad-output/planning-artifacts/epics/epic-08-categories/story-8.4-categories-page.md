# Story 8.4 : Page de Gestion des Catégories

**Epic :** Epic 8 - Catégorisation Personnalisée
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** a dedicated page to create, rename, recolor, and delete my categories,
**so that** I have a centralized place to manage my organizational system.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/categories` liste les catégories existantes
2. ✅ Formulaire "Ajouter" avec champ nom + color picker
3. ✅ Renommer une catégorie via un champ inline
4. ✅ Supprimer avec confirmation
5. ✅ Compteur de newsletters par catégorie affiché
6. ✅ Bannière upgrade si tier gratuit à la limite (3/3 catégories)

---

## Technical Notes

### Route

```
src/app/[locale]/(dashboard)/categories/page.tsx
```

### Page (Server Component)

```typescript
// src/app/[locale]/(dashboard)/categories/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoriesList } from '@/features/categories/components/CategoriesList'

export default async function CategoriesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createClient()

  const [{ data: categories }, { data: user }] = await Promise.all([
    supabase
      .from('categories')
      .select(`*, newsletters(count)`)
      .eq('user_id', userId)
      .order('created_at'),
    supabase.from('users').select('tier').eq('id', userId).single(),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Catégories</h1>
      <CategoriesList
        initialCategories={categories ?? []}
        userTier={user?.tier ?? 'free'}
      />
    </div>
  )
}
```

### `CategoriesList` (Client Component)

```typescript
// src/features/categories/components/CategoriesList.tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryRow } from './CategoryRow'
import { AddCategoryForm } from './AddCategoryForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface Category {
  id: string
  name: string
  color: string
  newsletters: { count: number }[]
}

interface Props {
  initialCategories: Category[]
  userTier: 'free' | 'paid'
}

export function CategoriesList({ initialCategories, userTier }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const locale = useLocale()

  const atLimit = userTier === 'free' && categories.length >= 3
  const canAdd = !atLimit

  const handleAdd = (cat: Category) => {
    setCategories(prev => [...prev, cat])
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length}{userTier === 'free' ? '/3' : ''} catégorie(s)
        </p>
        <Button size="sm" disabled={!canAdd} onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {atLimit && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Limite de 3 catégories atteinte.{' '}
            <Link href={`/${locale}/billing`} className="font-medium underline">
              Passez au Premium
            </Link>{' '}
            pour des catégories illimitées.
          </AlertDescription>
        </Alert>
      )}

      {showForm && (
        <AddCategoryForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-2">
        {categories.map(cat => (
          <CategoryRow
            key={cat.id}
            category={cat}
            newsletterCount={cat.newsletters?.[0]?.count ?? 0}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {categories.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">
          Aucune catégorie. Créez-en une pour organiser vos newsletters.
        </p>
      )}
    </div>
  )
}
```

---

## Dependencies

**Requires :**
- Story 8.1 : CRUD catégories (API)

**Blocks :**
- Story 8.2 : Assigner catégorie (utilise les catégories créées ici)

---

## Definition of Done

- [ ] Page `/[locale]/categories` créée
- [ ] `CategoriesList`, `CategoryRow`, `AddCategoryForm` créés
- [ ] Compteur newsletters par catégorie affiché
- [ ] Bannière upgrade visible à 3/3 pour tier gratuit

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(dashboard)/categories/page.tsx`
- [ ] Créer `CategoriesList`, `CategoryRow`, `AddCategoryForm`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
