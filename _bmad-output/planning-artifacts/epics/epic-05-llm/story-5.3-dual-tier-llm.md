# Story 5.3 : Logique Dual-Tier — Premium vs Basic

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** system,
**I want** to apply the correct LLM tier per user and per request (1 premium/day for free users),
**so that** free users get a daily taste of premium quality, while paid users always get the best summarization.

---

## Acceptance Criteria

1. ✅ Utilisateurs payants : tous les résumés en LLM premium (`claude-haiku-3-5`)
2. ✅ Utilisateurs gratuits : 1er résumé de la journée en premium, les suivants en basic
3. ✅ Compteur de résumés premium du jour consulté depuis `summaries` table
4. ✅ La logique est encapsulée dans `getLLMTierForUser(userId, userTier)`
5. ✅ Timezone : le "jour" se remet à zéro à minuit UTC

---

## Technical Notes

### `src/lib/llm/tier-selector.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { LLMTier } from './types'

const DAILY_PREMIUM_LIMIT_FREE = 1

export async function getLLMTierForUser(
  userId: string,
  userTier: 'free' | 'paid'
): Promise<LLMTier> {
  // Les utilisateurs payants ont toujours le premium
  if (userTier === 'paid') return 'premium'

  // Compter les résumés premium générés aujourd'hui pour cet utilisateur
  const supabase = createAdminClient()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('summaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('llm_tier', 'premium')
    .gte('generated_at', todayStart.toISOString())

  if ((count ?? 0) < DAILY_PREMIUM_LIMIT_FREE) {
    return 'premium' // 1er résumé du jour → premium (teaser)
  }

  return 'basic'
}
```

### Visualisation de la logique

```
Utilisateur FREE :
  - Résumé 1 du jour → premium (claude-haiku) ← teaser
  - Résumés 2+ du jour → basic (gpt-5-nano)

Utilisateur PAID :
  - Tous les résumés → premium (claude-haiku)
```

### Badge dans l'UI (story 6.2)

Le résumé stocke son `llm_tier`, ce qui permet à l'UI d'afficher un badge :
- `llm_tier = 'premium'` → badge "Premium" (violet)
- `llm_tier = 'basic'` → rien (ou badge "Basique" discret)

---

## Dependencies

**Requires :**
- Story 5.2 : Table `summaries` (pour compter les résumés premium du jour)

**Blocks :**
- Story 5.2 : Worker summary (appelle `getLLMTierForUser`)

---

## Definition of Done

- [ ] `src/lib/llm/tier-selector.ts` créé
- [ ] Test : utilisateur free, 0 résumé premium aujourd'hui → retourne 'premium'
- [ ] Test : utilisateur free, 1 résumé premium aujourd'hui → retourne 'basic'
- [ ] Test : utilisateur paid → retourne toujours 'premium'

---

## Testing Strategy

- **Test unitaire (Vitest) :** Mocker la requête Supabase, tester les 3 cas
- **Manuel :** Déclencher 2 emails pour un utilisateur free le même jour → vérifier les tiers dans `summaries`

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/lib/llm/tier-selector.ts`
- [ ] Écrire tests unitaires Vitest

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
