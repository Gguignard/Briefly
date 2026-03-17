# Story 8.1 : CRUD Catégories

**Epic :** Epic 8 - Catégorisation Personnalisée
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to create, rename, and delete custom categories,
**so that** I can organize my newsletters according to my personal interests.

---

## Acceptance Criteria

1. ✅ `POST /api/categories` : créer une catégorie (nom + couleur optionnelle)
2. ✅ `PATCH /api/categories/:id` : renommer
3. ✅ `DELETE /api/categories/:id` : supprimer (newsletters associées → `category_id = null`)
4. ✅ `GET /api/categories` : lister les catégories de l'utilisateur
5. ✅ Limite : 3 catégories pour tier gratuit, illimitées pour tier payant
6. ✅ RLS Supabase : accès uniquement aux propres catégories

---

## Technical Notes

### Schema Supabase

```sql
-- supabase/migrations/20250115_categories.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',  -- couleur hex
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  USING (user_id = auth.jwt() ->> 'sub');
```

### Routes API

```typescript
// src/app/api/categories/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { z } from 'zod'

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')

  return apiResponse(data ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const body = await req.json()
  const parsed = CreateCategorySchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = await createClient()

  // Vérifier limite tier gratuit
  const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single()
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (user?.tier === 'free' && (count ?? 0) >= 3) {
    return apiError('LIMIT_REACHED', 'Limite de 3 catégories (tier gratuit)', 403)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, ...parsed.data })
    .select()
    .single()

  if (error) return apiError('DB_ERROR', 'Erreur de création', 500)
  return apiResponse(data, 201)
}
```

```typescript
// src/app/api/categories/[id]/route.ts
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()

  // Désassigner les newsletters
  await supabase
    .from('newsletters')
    .update({ category_id: null })
    .eq('category_id', params.id)
    .eq('user_id', userId)

  await supabase.from('categories').delete().eq('id', params.id).eq('user_id', userId)
  return apiResponse({ deleted: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { name, color } = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .update({ name, color })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return apiError('DB_ERROR', 'Erreur de mise à jour', 500)
  return apiResponse(data)
}
```

---

## Dependencies

**Requires :**
- Story 1.2 : Supabase configuré

**Blocks :**
- Story 8.2 : Assigner catégorie aux newsletters
- Story 8.3 : Filtrer par catégorie

---

## Definition of Done

- [x] Migration `categories` créée avec RLS
- [x] `GET/POST /api/categories` et `PATCH/DELETE /api/categories/[id]` créés
- [x] Limite 3 catégories pour tier gratuit en place

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer migration `categories`
- [x] Créer les routes API CRUD
- [x] Ajouter limite tier gratuit

### Completion Notes
- Migration `010_categories.sql` : table `categories` avec RLS (4 policies CRUD), index sur `user_id`, FK `newsletters.category_id → categories.id ON DELETE SET NULL`, contrainte unicité `(user_id, name)`
- `GET /api/categories` : liste les catégories de l'utilisateur triées par `created_at`
- `POST /api/categories` : création avec validation Zod (nom 1-50 chars, couleur hex optionnelle), limite 3 pour tier gratuit, vérification doublon nom
- `PATCH /api/categories/[id]` : mise à jour nom et/ou couleur avec validation UUID, scope user_id, retourne 404 si catégorie non trouvée
- `DELETE /api/categories/[id]` : vérifie existence, désassigne newsletters (avec gestion erreur), puis supprime, retourne 404 si non trouvée
- Adaptations vs story spec : `createAdminClient()` (pattern projet), `user_id TEXT REFERENCES users(clerk_id)` (cohérence newsletters), `params: Promise<{id}>` (Next.js 15), validation JSON body robuste
- Logging Pino sur toutes les opérations CRUD (cohérence avec newsletters)
- 30 tests unitaires couvrant : auth 401, validation 400/UUID, CRUD succès, limite tier gratuit 403, doublon nom 409, 404 catégorie non trouvée, erreur unassign newsletters, erreurs DB 500

### File List
- `supabase/migrations/010_categories.sql` (nouveau)
- `src/app/api/categories/route.ts` (nouveau)
- `src/app/api/categories/[id]/route.ts` (nouveau)
- `src/app/api/categories/__tests__/route.test.ts` (nouveau)
- `src/app/api/categories/[id]/__tests__/route.test.ts` (nouveau)

### Change Log
- 2026-03-16 : Code review (Claude Opus 4.6) — 6 issues corrigées :
  - [H2] DELETE retourne 404 si catégorie inexistante (au lieu de faux 200)
  - [H3] PATCH retourne 404 si catégorie inexistante (au lieu de 500)
  - [M1] Ajout logging Pino (cohérence architecture rule #6)
  - [M2] Gestion erreur unassign newsletters dans DELETE
  - [M3] Validation UUID sur paramètre `id` (PATCH/DELETE)
  - [M4] Contrainte unicité `(user_id, name)` en migration + vérification applicative POST
  - Tests : 24 → 30 (+6 nouveaux cas : 404, UUID invalide, doublon, erreur unassign)

### Debug Log
- 30/30 tests passent (PASS)
- Suite complète : 471 PASS, 7 FAIL pré-existants (tests d'intégration Supabase + settings — non liés à cette story)
