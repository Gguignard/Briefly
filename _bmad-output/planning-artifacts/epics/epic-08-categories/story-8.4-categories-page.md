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

- [x] Page `/[locale]/categories` créée
- [x] `CategoriesList`, `CategoryRow`, `AddCategoryForm` créés
- [x] Compteur newsletters par catégorie affiché
- [x] Bannière upgrade visible à 3/3 pour tier gratuit

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/app/[locale]/(dashboard)/categories/page.tsx`
- [x] Créer `CategoriesList`, `CategoryRow`, `AddCategoryForm`

### Completion Notes
- Page server component `/[locale]/categories` créée avec auth Clerk, fetch des catégories avec compteur newsletters via join, et récupération du tier utilisateur
- `CategoriesList` : composant client gérant l'état local des catégories, affichage du compteur avec/sans limite selon tier, bannière upgrade amber pour free tier à 3/3, bouton ajouter désactivé à la limite, état vide
- `CategoryRow` : renommage inline via input avec PATCH API au blur, color picker natif HTML avec PATCH API, suppression avec AlertDialog de confirmation et appel DELETE API
- `AddCategoryForm` : formulaire inline avec input nom + color picker natif, appel POST API, validation bouton désactivé si vide
- Traductions i18n ajoutées dans fr.json et en.json (section `categoriesPage`)
- 18 tests unitaires créés et passants (CategoriesList: 8, CategoryRow: 6, AddCategoryForm: 4)
- 0 régression introduite (7 échecs préexistants : settings page mock + supabase ECONNREFUSED)

### File List
- `src/app/[locale]/(dashboard)/categories/page.tsx` (nouveau)
- `src/features/categories/components/CategoriesList.tsx` (nouveau)
- `src/features/categories/components/CategoryRow.tsx` (nouveau)
- `src/features/categories/components/AddCategoryForm.tsx` (nouveau)
- `src/features/categories/components/__tests__/CategoriesList.test.tsx` (nouveau)
- `src/features/categories/components/__tests__/CategoryRow.test.tsx` (nouveau)
- `src/features/categories/components/__tests__/AddCategoryForm.test.tsx` (nouveau)
- `src/app/api/categories/[id]/route.ts` (modifié - ajout vérification unicité nom au rename)
- `messages/fr.json` (modifié - ajout section categoriesPage + clés manquantes)
- `messages/en.json` (modifié - ajout section categoriesPage + clés manquantes)

### Code Review Fixes (2026-03-18)
- **H1** : Ajouté 4 clés i18n manquantes (`save`, `cancel`, `confirm`, `delete`) dans fr.json et en.json
- **H2** : Color picker sauvegarde désormais sur `onBlur` au lieu de chaque `onChange` (évite spam API)
- **M1** : Ajouté toast d'erreur (sonner) dans CategoryRow et AddCategoryForm au lieu de catch vides
- **M2** : Requêtes Supabase parallélisées avec `Promise.all` dans page.tsx
- **M3** : Ajouté vérification d'unicité du nom dans l'API PATCH categories/[id]
- **M4** : Ajouté support touche Enter pour déclencher le rename (blur on Enter)
- **L1** : Corrigé fuite mock `global.fetch` dans AddCategoryForm.test.tsx (déplacé dans `beforeEach`)
- Tests mis à jour : 31 tests passants, 0 échecs

### Code Review #2 Fixes (2026-03-18)
- **H1** : Toast d'erreur couleur utilisait `renameError` → nouvelle clé `colorError` dans CategoryRow + i18n
- **H2** : Ajouté `aria-label` au color input dans CategoryRow (cohérence avec AddCategoryForm)
- **H3** : Extrait constante `FREE_CATEGORY_LIMIT = 3` dans CategoriesList (supprime hardcode `>= 3`)
- **M1** : Ajouté gestion touche Escape pour annuler le renommage inline (revert + blur)
- **M2** : Ajouté `aria-label` au champ nom dans CategoryRow (`categoryNameLabel`)
- Nouvelles clés i18n ajoutées : `colorError`, `categoryNameLabel` dans fr.json et en.json
- Tests mis à jour : 31 tests passants, 0 échecs

### Debug Log
- `@testing-library/user-event` non installé dans le projet → utilisation de `fireEvent` à la place
- Texte bannière upgrade réparti entre éléments enfants → regex matching dans les tests
- Fuite de mock `global.fetch` entre tests → résolu avec `beforeEach` pour recréer le mock
