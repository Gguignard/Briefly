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

- [ ] `PATCH /api/summaries/[id]/read` créé
- [ ] Hook `useMarkAsRead` avec optimistic update
- [ ] Intégré dans `SummaryCard` (clic sur titre ou lien externe)
- [ ] Test : cliquer sur une card → indicateur visuel "lu" immédiat

---

## Testing Strategy

- **Manuel :** Cliquer sur une card → vérifier l'indicateur visuel "lu" en temps réel
- **Manuel :** Vérifier `read_at` dans Supabase après le clic
- **Manuel :** Re-cliquer → pas d'erreur (idempotent)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `PATCH /api/summaries/[id]/read`
- [ ] Créer `useMarkAsRead` hook
- [ ] Intégrer dans `SummaryCard`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
