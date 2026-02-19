# Story 4.2 : CRUD Newsletters (Ajout / Suppression / Activation)

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to add, remove, and toggle newsletters I follow,
**so that** I control exactly which newsletters Briefly processes for me.

---

## Acceptance Criteria

1. ✅ `POST /api/newsletters` : créer une newsletter (nom + email source)
2. ✅ `DELETE /api/newsletters/:id` : supprimer une newsletter
3. ✅ `PATCH /api/newsletters/:id` : activer / désactiver (toggle)
4. ✅ `GET /api/newsletters` : lister les newsletters de l'utilisateur
5. ✅ Validation Zod sur les inputs (nom requis, email valide)
6. ✅ RLS Supabase : un utilisateur ne peut accéder qu'à ses propres newsletters

---

## Technical Notes

### Schema Supabase

```sql
-- supabase/migrations/20250115_newsletters.sql
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sender_email TEXT,           -- email de l'expéditeur (optionnel, pour filtrage)
  category_id UUID REFERENCES categories(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own newsletters"
  ON newsletters FOR ALL
  USING (user_id = auth.jwt() ->> 'sub');

CREATE INDEX idx_newsletters_user_id ON newsletters(user_id);
```

### Route Handler `/api/newsletters`

```typescript
// src/app/api/newsletters/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { z } from 'zod'
import logger from '@/lib/utils/logger'

const CreateNewsletterSchema = z.object({
  name: z.string().min(1).max(100),
  senderEmail: z.string().email().optional(),
  categoryId: z.string().uuid().optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return apiError('DB_ERROR', 'Erreur de récupération', 500)
  return apiResponse(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const body = await req.json()
  const parsed = CreateNewsletterSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = await createClient()

  // Vérifier la limite tier gratuit (story 4.5)
  const { count } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('active', true)

  // Récupérer le tier utilisateur
  const { data: user } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single()

  if (user?.tier === 'free' && (count ?? 0) >= 5) {
    return apiError('LIMIT_REACHED', 'Limite de 5 newsletters atteinte (tier gratuit)', 403)
  }

  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      sender_email: parsed.data.senderEmail,
      category_id: parsed.data.categoryId,
    })
    .select()
    .single()

  if (error) return apiError('DB_ERROR', 'Erreur de création', 500)
  logger.info({ userId, newsletterId: data.id }, 'Newsletter created')
  return apiResponse(data, 201)
}
```

### Route Handler `/api/newsletters/[id]`

```typescript
// src/app/api/newsletters/[id]/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId) // RLS + double check

  if (error) return apiError('DB_ERROR', 'Erreur de suppression', 500)
  return apiResponse({ deleted: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { active } = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('newsletters')
    .update({ active })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return apiError('DB_ERROR', 'Erreur de mise à jour', 500)
  return apiResponse(data)
}
```

### Types TypeScript

```typescript
// src/types/newsletter.ts
export interface Newsletter {
  id: string
  user_id: string
  name: string
  sender_email: string | null
  category_id: string | null
  active: boolean
  created_at: string
}
```

---

## Dependencies

**Requires :**
- Story 4.1 : Table `users` avec `inbox_address`
- Story 1.2 : Supabase configuré

**Blocks :**
- Story 4.5 : Limite newsletters (utilise le comptage)
- Story 4.6 : Interface liste (consomme ces API routes)

---

## Definition of Done

- [ ] Migration SQL `newsletters` créée avec RLS
- [ ] `GET /api/newsletters` retourne les newsletters de l'utilisateur
- [ ] `POST /api/newsletters` crée une newsletter (avec validation Zod)
- [ ] `DELETE /api/newsletters/:id` supprime
- [ ] `PATCH /api/newsletters/:id` toggle actif/inactif
- [ ] Test : accès à une newsletter d'un autre utilisateur → 404 ou 403

---

## Testing Strategy

- **Manuel :** `POST /api/newsletters` → vérifier création en base
- **Manuel :** `DELETE /api/newsletters/:id` d'une newsletter d'un autre user → vérifier rejet
- **Manuel :** `PATCH /api/newsletters/:id` avec `{ active: false }` → vérifier toggle

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer migration `newsletters` table
- [ ] Créer `GET/POST /api/newsletters`
- [ ] Créer `DELETE/PATCH /api/newsletters/[id]`
- [ ] Créer type `Newsletter`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
