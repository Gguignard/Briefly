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

1. ✅ Utilisateurs payants : tous les résumés en LLM premium (`qwen-3-32b` via Groq)
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
  - Résumé 1 du jour → premium (qwen-3-32b via Groq) ← teaser
  - Résumés 2+ du jour → basic (gpt-5-nano)

Utilisateur PAID :
  - Tous les résumés → premium (qwen-3-32b via Groq)
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

- [x] `src/lib/llm/tier-selector.ts` créé
- [x] Test : utilisateur free, 0 résumé premium aujourd'hui → retourne 'premium'
- [x] Test : utilisateur free, 1 résumé premium aujourd'hui → retourne 'basic'
- [x] Test : utilisateur paid → retourne toujours 'premium'

---

## Testing Strategy

- **Test unitaire (Vitest) :** Mocker la requête Supabase, tester les 3 cas
- **Manuel :** Déclencher 2 emails pour un utilisateur free le même jour → vérifier les tiers dans `summaries`

---

## Dev Agent Record

### Status
Complete

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/lib/llm/tier-selector.ts` — async avec requête Supabase pour compter les résumés premium du jour
- [x] Écrire tests unitaires Vitest — 5 tests couvrant paid, free 0 premium, free 1+ premium, count null
- [x] Adapter `summary.worker.ts` — await sur getLLMTierForUser
- [x] Adapter `summary.worker.test.ts` — mockReturnValue → mockResolvedValue

### Completion Notes
- La fonction `getLLMTierForUser` est passée de sync à async pour interroger la table `summaries`
- Utilisateurs paid : retour immédiat `premium` sans requête DB
- Utilisateurs free : requête Supabase count sur summaries filtrée par user_id, llm_tier=premium, generated_at >= minuit UTC
- Le worker `summary.worker.ts` a été adapté avec `await`
- Les mocks dans `summary.worker.test.ts` ont été mis à jour (mockResolvedValue)
- 13 tests passent (7 tier-selector + 6 summary worker)

### Code Review Fixes (2026-03-06)
- **H1** : AC1 corrigé — `claude-haiku-3-5` → `qwen-3-32b` (Groq) pour refléter la migration
- **H2+H3** : Ajout gestion d'erreur Supabase dans `tier-selector.ts` — fail-closed (retourne `basic` en cas d'erreur DB)
- **M1** : Note ajoutée — `src/workers/index.ts` modifié dans le working directory mais relève de la story 5.4
- **M2** : Nouveau test vérifiant les arguments Supabase (table, userId, llm_tier, date UTC minuit)
- **M3** : Mocks refactorisés avec `mockFrom` pour meilleure isolation
- **+** : Nouveau test fail-closed vérifiant le comportement en cas d'erreur Supabase

### File List
- `src/lib/llm/tier-selector.ts` — implémentation async dual-tier avec fail-closed error handling
- `src/lib/llm/tier-selector.test.ts` — 7 tests unitaires (dont vérification arguments Supabase et UTC midnight)
- `src/workers/summary.worker.ts` — await getLLMTierForUser
- `src/workers/__tests__/summary.worker.test.ts` — mocks async

> **Note (review):** `src/workers/index.ts` est modifié dans le working directory (ajout cleanup worker) mais ce changement relève d'une autre story (5.4), pas de la 5.3.

### Debug Log
Aucun problème rencontré.
