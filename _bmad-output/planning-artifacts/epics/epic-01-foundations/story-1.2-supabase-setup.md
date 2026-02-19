# Story 1.2 : Configuration Supabase et Schéma Initial

**Epic :** Epic 1 - Foundations
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** developer,
**I want** Supabase configured with initial DB schema,
**so that** user data can be stored and retrieved with proper RLS isolation.

---

## Acceptance Criteria

1. ✅ Client Supabase browser (`lib/supabase/client.ts`) et server (`lib/supabase/server.ts`) configurés
2. ✅ Migration `supabase/migrations/001_initial_schema.sql` crée table `users` (id UUID PK, clerk_id TEXT UNIQUE, email TEXT, tier TEXT DEFAULT 'free', created_at, updated_at)
3. ✅ Migration crée table `llm_costs` (id UUID PK, user_id UUID FK→users, tokens_used INT, cost_usd DECIMAL, provider TEXT, model TEXT, created_at)
4. ✅ RLS activée sur toutes les tables avec policies par `auth.uid()` (ou vérification clerk_id)
5. ✅ `supabase gen types typescript --local > src/lib/supabase/types.ts` fonctionne
6. ✅ Variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` documentées dans `.env.example`
7. ✅ Connexion testable depuis un Server Component (fetch users)
8. ✅ `SUPABASE_SERVICE_ROLE_KEY` documenté pour les usages serveur uniquement

---

## Technical Notes

### Client Supabase (Browser)

Utiliser `createBrowserClient` de `@supabase/ssr` — ne PAS utiliser `@supabase/supabase-js` directement.

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Client Supabase (Server)

Utiliser `createServerClient` de `@supabase/ssr` avec cookies Next.js.

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré dans les Server Components (lecture seule)
          }
        },
      },
    }
  )
}
```

### Migration SQL Initiale

```sql
-- supabase/migrations/001_initial_schema.sql

-- Table users
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table llm_costs
CREATE TABLE IF NOT EXISTS public.llm_costs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tokens_used INT NOT NULL,
  cost_usd    DECIMAL(10, 6) NOT NULL,
  provider    TEXT NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_costs ENABLE ROW LEVEL SECURITY;

-- Policy users : lecture de son propre profil via clerk_id
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy llm_costs : via user_id lié au clerk_id
CREATE POLICY "llm_costs_select_own" ON public.llm_costs
  FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Variables d'environnement

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Serveur uniquement, jamais exposé
```

### Génération des types TypeScript

```bash
supabase gen types typescript --local > src/lib/supabase/types.ts
```

### Seed de développement

```sql
-- supabase/seed.sql
INSERT INTO public.users (clerk_id, email, tier)
VALUES
  ('user_test_001', 'test@example.com', 'free'),
  ('user_test_002', 'pro@example.com', 'pro')
ON CONFLICT (clerk_id) DO NOTHING;
```

### Files to Create/Modify

- `src/lib/supabase/client.ts` (créer)
- `src/lib/supabase/server.ts` (créer)
- `src/lib/supabase/types.ts` (généré via CLI)
- `supabase/migrations/001_initial_schema.sql` (créer)
- `supabase/seed.sql` (créer)
- `.env.example` (modifier — ajouter les variables Supabase)

---

## Dependencies

**Requires :**
- Story 1.1 : Initialisation du Projet Next.js

**Blocks :**
- Story 3.1 : Authentification Clerk (sync user → Supabase)
- Story 4.1 : Newsletters CRUD (tables DB requises)
- Story 5.1 : Pipeline LLM (table llm_costs requise)

---

## Definition of Done

- [ ] `src/lib/supabase/client.ts` créé et exportant `createClient()`
- [ ] `src/lib/supabase/server.ts` créé et exportant `createClient()` async
- [ ] Migration `001_initial_schema.sql` appliquée sans erreur via `supabase db push`
- [ ] Tables `users` et `llm_costs` visibles dans le dashboard Supabase local
- [ ] RLS activée sur les deux tables avec policies fonctionnelles
- [ ] `supabase gen types typescript --local` génère `src/lib/supabase/types.ts` sans erreur
- [ ] `.env.example` contient les 3 variables Supabase documentées
- [ ] Un Server Component peut requêter la table `users` sans erreur
- [ ] `supabase/seed.sql` peuple la DB locale avec des données de test
- [ ] Aucun `console.log` ajouté (utiliser Pino quand disponible)

---

## Testing Strategy

- Vérification manuelle dans le dashboard Supabase local (`supabase studio`)
- Test d'un Server Component qui fetch depuis `users` et affiche le résultat
- Vérifier que les policies RLS bloquent les accès non autorisés (test avec un JWT différent)
- `supabase db reset` pour valider que la migration tourne de zéro sans erreur
- Tests unitaires Vitest sur les fonctions utilitaires supabase si elles contiennent de la logique

---

## References

- [Supabase SSR avec Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase integration](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase CLI migrations](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Supabase type generation](https://supabase.com/docs/reference/cli/supabase-gen-types)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Installer `@supabase/ssr` (`npm install @supabase/ssr`)
- [ ] Créer `src/lib/supabase/client.ts`
- [ ] Créer `src/lib/supabase/server.ts`
- [ ] Créer `supabase/migrations/001_initial_schema.sql`
- [ ] Créer `supabase/seed.sql`
- [ ] Appliquer la migration (`supabase db push` ou `supabase db reset`)
- [ ] Générer les types TypeScript (`supabase gen types typescript --local > src/lib/supabase/types.ts`)
- [ ] Mettre à jour `.env.example` avec les variables Supabase
- [ ] Vérifier la connexion depuis un Server Component

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
