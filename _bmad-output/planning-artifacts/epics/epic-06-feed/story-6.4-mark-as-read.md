# Story 6.4 : Marquage Résumé comme Lu

**Epic :** Epic 6 - Interface de Lecture & Feed de Résumés
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** authenticated user,
**I want** summaries to be marked as read when I open them or manually mark them,
**so that** I can track which summaries I've already consumed.

---

## Acceptance Criteria

1. ✅ `PATCH /api/summaries/:id/read` met à jour `read_at` avec la date actuelle
2. ✅ Appelé automatiquement à l'ouverture de la page détail (story 6.3)
3. ✅ Appelé au clic sur un lien externe dans la SummaryCard
4. ✅ La mise à jour est reflétée immédiatement dans l'UI (optimistic update)
5. ✅ Un résumé déjà lu peut être re-marqué comme lu (idempotent)

---

## Technical Notes

### API Route

```typescript
// src/app/api/summaries/[id]/read/route.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = await createClient()

  const { error } = await supabase
    .from('summaries')
    .update({ read_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', userId) // RLS + sécurité

  if (error) return apiError('DB_ERROR', 'Erreur de mise à jour', 500)
  return apiResponse({ read: true })
}
```

### Hook `useMarkAsRead`

```typescript
// src/features/summaries/hooks/useMarkAsRead.ts
'use client'

import { useQueryClient } from '@tanstack/react-query'

export function useMarkAsRead(summaryId: string) {
  const queryClient = useQueryClient()

  const markAsRead = async () => {
    // Optimistic update local
    queryClient.setQueryData(
      ['summaries', { page: 1 }],
      (old: any) => {
        if (!old?.data?.summaries) return old
        return {
          ...old,
          data: {
            ...old.data,
            summaries: old.data.summaries.map((s: any) =>
              s.id === summaryId
                ? { ...s, read_at: new Date().toISOString() }
                : s
            ),
            unreadCount: Math.max(0, (old.data.unreadCount ?? 1) - 1),
          },
        }
      }
    )

    // Appel API en arrière-plan
    await fetch(`/api/summaries/${summaryId}/read`, { method: 'PATCH' })
  }

  return { markAsRead }
}
```

---

## Dependencies

**Requires :**
- Story 6.1 : Feed (TanStack Query cache)
- Story 6.2 : SummaryCard (déclenche `markAsRead` au clic)

**Blocks :**
- Rien (feature atomique)

---

## Definition of Done

- [x] `PATCH /api/summaries/[id]/read` créé
- [x] Hook `useMarkAsRead` avec optimistic update
- [x] Intégré dans `SummaryCard` (clic sur titre ou lien externe)
- [x] Test : cliquer sur une card → indicateur visuel "lu" immédiat

---

## Testing Strategy

- **Manuel :** Cliquer sur une card → vérifier l'indicateur visuel "lu" en temps réel
- **Manuel :** Vérifier `read_at` dans Supabase après le clic
- **Manuel :** Re-cliquer → pas d'erreur (idempotent)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `PATCH /api/summaries/[id]/read`
- [x] Créer `useMarkAsRead` hook
- [x] Intégrer dans `SummaryCard`

### Completion Notes
- Route API `PATCH /api/summaries/[id]/read` créée avec auth Clerk, lookup user par `clerk_id`, update `read_at` idempotent via `createAdminClient` (cohérent avec le pattern existant de `GET /api/summaries`)
- Hook `useMarkAsRead` avec optimistic update typé (`SummariesQueryData`), guard idempotent via `useRef`, rollback automatique via `invalidateQueries` en cas d'échec réseau
- Intégration dans `SummaryCard` : `handleNavigate` déclenche `markAsRead()` + `onNavigate?.()` sur clic titre et lien externe
- 40 tests passent (7 API route, 9 hook, 24 SummaryCard dont 3 nouveaux pour markAsRead)
- 0 régression introduite
- Lint clean sur tous les fichiers modifiés

### Code Review Fixes (2026-03-14)
- **[H1] Tests API route corrigés** : utilisation de UUIDs valides au lieu de `sum-1`, ajout helpers `setupUserLookup`/`setupUpdate`, ajout test validation UUID invalide et test 404 résumé introuvable
- **[H2] Optimistic update `unreadCount` conditionnel** : ne décrémente plus le compteur si le résumé est déjà lu (`wasUnread` check)
- **[M1] Rollback sur réponse HTTP non-ok** : ajout `.then(res => { if (!res.ok) throw })` pour rollback sur 4xx/5xx, pas seulement erreurs réseau
- **Tests ajoutés** : 2 nouveaux tests hook (unreadCount non décrémenté si déjà lu, rollback sur HTTP 500)

### File List
- `src/app/api/summaries/[id]/read/route.ts` (nouveau)
- `src/app/api/summaries/[id]/read/__tests__/route.test.ts` (nouveau)
- `src/features/summaries/hooks/useMarkAsRead.ts` (nouveau)
- `src/features/summaries/hooks/__tests__/useMarkAsRead.test.ts` (nouveau)
- `src/features/summaries/components/SummaryCard.tsx` (modifié — import + handleNavigate)
- `src/features/summaries/components/__tests__/SummaryCard.test.tsx` (modifié — mock useMarkAsRead + 3 tests)
- `src/features/summaries/index.ts` (modifié — export useMarkAsRead)

### Debug Log
- Choix `createAdminClient` au lieu de `createClient` (server) pour cohérence avec le pattern existant dans `GET /api/summaries`
- Ajout lookup user par `clerk_id` → `user.id` pour filtrer par `user_id` (même pattern que la route summaries existante)
- Typage `SummariesQueryData` dans le hook pour éliminer les erreurs lint `no-explicit-any`
- `setQueriesData` (plural) au lieu de `setQueryData` pour couvrir tous les query keys commençant par `['summaries']`
