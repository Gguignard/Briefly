# Story 5.5 : Tracker de Coûts LLM

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** developer/operator,
**I want** LLM API costs tracked per user and per provider,
**so that** I can monitor spending and validate the ≤ 0.5€/month/free and ≤ 1.5€/month/paid cost targets.

---

## Acceptance Criteria

1. ✅ Chaque appel LLM stocke `tokens_input`, `tokens_output`, `provider` dans `summaries`
2. ✅ `trackLLMCost()` calcule le coût en centimes et l'ajoute dans `llm_costs` table
3. ✅ Coûts calculés selon les tarifs OpenAI et Anthropic actuels
4. ✅ Requête d'agrégat disponible : coût total par utilisateur sur le mois en cours
5. ✅ Seuil d'alerte : si un utilisateur gratuit dépasse 0.8€/mois → log warning

---

## Technical Notes

### Schema `llm_costs`

```sql
-- supabase/migrations/20250115_llm_costs.sql
CREATE TABLE llm_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_id UUID REFERENCES summaries(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INTEGER NOT NULL,
  tokens_output INTEGER NOT NULL,
  cost_cents NUMERIC(10, 4) NOT NULL,  -- coût en centimes d'euro
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_llm_costs_user_month ON llm_costs(user_id, created_at);
```

### `src/lib/llm/cost-tracker.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { SummaryResult } from './types'
import logger from '@/lib/utils/logger'

// Tarifs en centimes pour 1000 tokens (à mettre à jour selon pricing)
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'openai/gpt-4o-nano':  { input: 0.015, output: 0.06 },   // ~$0.15/$0.60 per 1M
  'openai/gpt-4o-mini':  { input: 0.015, output: 0.06 },
  'anthropic/claude-haiku-4-5': { input: 0.025, output: 0.125 }, // ~$0.25/$1.25 per 1M
}

function calculateCost(
  provider: string,
  model: string,
  tokensInput: number,
  tokensOutput: number
): number {
  const key = `${provider}/${model}`
  const rates = COST_PER_1K_TOKENS[key] ?? { input: 0.05, output: 0.15 } // fallback
  return (tokensInput / 1000) * rates.input + (tokensOutput / 1000) * rates.output
}

export async function trackLLMCost(userId: string, result: SummaryResult): Promise<void> {
  const costCents = calculateCost(
    result.provider,
    result.llmTier === 'premium' ? 'claude-haiku-4-5' : 'gpt-4o-nano',
    result.tokensInput,
    result.tokensOutput
  )

  const supabase = createAdminClient()
  await supabase.from('llm_costs').insert({
    user_id: userId,
    provider: result.provider,
    model: result.llmTier === 'premium' ? 'claude-haiku-4-5' : 'gpt-4o-nano',
    tokens_input: result.tokensInput,
    tokens_output: result.tokensOutput,
    cost_cents: costCents,
  })

  // Vérifier le seuil mensuel (utilisateurs gratuits)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('llm_costs')
    .select('cost_cents')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  const monthlyCost = (data ?? []).reduce((sum, r) => sum + Number(r.cost_cents), 0)

  if (monthlyCost > 80) { // 80 centimes = 0.8€
    logger.warn({ userId, monthlyCost }, 'User exceeding LLM cost threshold')
  }
}
```

### Requête d'agrégat (admin)

```typescript
// Utilisé dans l'admin dashboard (Epic 9)
const { data } = await supabase
  .from('llm_costs')
  .select('user_id, cost_cents')
  .gte('created_at', monthStart.toISOString())

// Grouper par user_id en JS ou via RPC Supabase
```

---

## Dependencies

**Requires :**
- Story 5.2 : Worker summary (appelle `trackLLMCost`)

**Blocks :**
- Story 9.2 : Dashboard admin (métriques de coûts)

---

## Definition of Done

- [ ] Migration `llm_costs` créée
- [ ] `src/lib/llm/cost-tracker.ts` créé
- [ ] Log warning si seuil 0.8€/mois dépassé pour un user free
- [ ] Test : vérifier l'insertion dans `llm_costs` après génération d'un résumé

---

## Testing Strategy

- **Manuel :** Générer un résumé → vérifier l'insertion dans `llm_costs` (Supabase)
- **Manuel :** Simuler un coût > 80 centimes → vérifier le log warning

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer migration `llm_costs`
- [ ] Créer `src/lib/llm/cost-tracker.ts`
- [ ] Intégrer dans `summary.worker.ts`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
