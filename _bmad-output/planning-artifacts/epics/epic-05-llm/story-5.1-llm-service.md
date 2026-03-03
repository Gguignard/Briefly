# Story 5.1 : Service LLM Abstrait (OpenAI + Groq)

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** a unified LLM service abstracting OpenAI and Groq APIs,
**so that** the summarization pipeline can switch between providers transparently with automatic fallback.

---

## Acceptance Criteria

1. ✅ `LLMService.summarize()` accepte un contenu texte et retourne un résumé structuré
2. ✅ Sélection du modèle selon le tier : `gpt-5-nano` (basic primary) / `llama-3.1-8b-instant` (basic fallback) ou `qwen-3-32b` (premium primary) / `gpt-5-mini` (premium fallback)
3. ✅ Retry x3 avec backoff exponentiel sur les erreurs API
4. ✅ Fallback automatique : si le modèle primaire échoue après 3 retries → modèle secondaire
5. ✅ Output limité à 800 tokens
6. ✅ Prompt système versionné dans un fichier de configuration
7. ✅ Coûts loggés (tokens input/output + provider) après chaque appel

---

## Technical Notes

### Installation

```bash
pnpm add openai
```

> **Note :** Groq utilise le SDK `openai` avec un `baseURL` différent. Pas de dépendance supplémentaire.

### `src/lib/llm/types.ts`

```typescript
export type LLMTier = 'basic' | 'premium'
export type LLMProvider = 'openai' | 'groq'

export interface LLMModelConfig {
  model: string
  provider: LLMProvider
}

export const MODEL_CONFIG: Record<LLMTier, { primary: LLMModelConfig; fallback: LLMModelConfig }> = {
  basic: {
    primary:  { model: 'gpt-5-nano', provider: 'openai' },
    fallback: { model: 'llama-3.1-8b-instant', provider: 'groq' },
  },
  premium: {
    primary:  { model: 'qwen-3-32b', provider: 'groq' },
    fallback: { model: 'gpt-5-mini', provider: 'openai' },
  },
}

export interface SummaryResult {
  title: string
  keyPoints: string[]
  sourceUrl: string | null
  llmTier: LLMTier
  provider: LLMProvider
  model: string
  tokensInput: number
  tokensOutput: number
  generatedAt: string
}

export interface LLMCallOptions {
  tier: LLMTier
}
```

### Variables d'environnement

```bash
# .env.local
OPENAI_API_KEY=sk-xxx
GROQ_API_KEY=gsk_xxx
```

---

## Dependencies

**Requires :**
- Story 1.1 : Projet Next.js (installation packages)
- Story 1.6 : Logger Pino (logError)

**Blocks :**
- Story 5.2 : Worker summary (utilise `summarize()`)

---

## Definition of Done

- [x] `src/lib/llm/llmService.ts`, `providers/openai.provider.ts`, `providers/groq.provider.ts`, `types.ts`, `prompts.ts`, `validation.ts` créés
- [x] Retry x3 + fallback fonctionnel (testé avec mock)
- [x] Output JSON parsé correctement
- [x] Tokens loggés après chaque appel
- [x] Variables API keys dans `.env.example`

---

## Testing Strategy

- **Manuel :** Appeler `summarize(content, { tier: 'basic' })` → vérifier la structure retournée
- **Manuel :** Simuler une erreur OpenAI → vérifier le fallback Anthropic
- **Test unitaire (Vitest) :** Mocker les clients API, vérifier retry logic

---

## References

- [OpenAI Node SDK](https://github.com/openai/openai-node)
- [Groq API](https://console.groq.com/docs/openai) (compatible OpenAI SDK)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/lib/llm/types.ts`, `prompts.ts`
- [x] Créer `src/lib/llm/providers/openai.provider.ts` et `providers/groq.provider.ts`
- [x] Créer `src/lib/llm/llmService.ts` avec retry + fallback + MODEL_CONFIG routing
- [x] Ajouter `OPENAI_API_KEY` et `GROQ_API_KEY` dans `.env.example`
- [x] Migration Anthropic → Groq (suppression `@anthropic-ai/sdk`)

### Completion Notes
- Implémenté le service LLM abstrait avec providers OpenAI et Groq
- `types.ts` : types `LLMTier`, `LLMProvider`, `SummaryResult`, `LLMCallOptions`, `MODEL_CONFIG` centralisé
- `prompts.ts` : prompt système versionné + template utilisateur (troncature à 6000 chars)
- `providers/openai.provider.ts` : provider OpenAI avec lazy init, accepte model en paramètre
- `providers/groq.provider.ts` : provider Groq via SDK OpenAI (`baseURL: https://api.groq.com/openai/v1`), lazy init
- `validation.ts` : `parseLLMResponse()` — validation JSON + extraction typée (pas de spread aveugle)
- `llmService.ts` : `withRetry()` (3 tentatives, backoff exponentiel) + `summarize()` avec routing `MODEL_CONFIG[tier]` et fallback automatique
- Config modèles : basic (OpenAI `gpt-5-nano` → Groq `llama-3.1-8b-instant`), premium (Groq `qwen-3-32b` → OpenAI `gpt-5-mini`)
- 41 tests unitaires co-localisés couvrant : types, prompts, validation, providers, retry, fallback 4 modèles
- Dépendance unique : `openai@6.25.0` (Groq réutilise le même SDK)
- `@anthropic-ai/sdk` supprimé — plus de dépendance Anthropic
- 0 régressions introduites (7 échecs pré-existants dans Supabase/Settings)

### Review Follow-ups (AI)
- [x] [AI-Review][MEDIUM] M1 — Noms de modèles alignés avec implémentation réelle
- [x] [AI-Review][MEDIUM] M2 — Structure fichiers réorganisée : `providers/`, tests co-localisés, barrel `index.ts`
- [x] [AI-Review][MEDIUM] M3 — Résolu par migration Groq : diversification providers complète
- [x] [AI-Review][MEDIUM] M4 — `withRetry` rendu privé (non exporté), barrel `index.ts` expose uniquement `summarize` + types
- [x] [Post-Review] Migration Anthropic → Groq : suppression `@anthropic-ai/sdk`, ajout Groq provider, 4 modèles configurés via `MODEL_CONFIG`

### File List
- `src/lib/llm/index.ts` (nouveau — barrel export)
- `src/lib/llm/types.ts` (nouveau)
- `src/lib/llm/types.test.ts` (nouveau — co-localisé)
- `src/lib/llm/prompts.ts` (nouveau)
- `src/lib/llm/validation.ts` (nouveau — ajouté par review)
- `src/lib/llm/validation.test.ts` (nouveau — co-localisé)
- `src/lib/llm/llmService.ts` (nouveau)
- `src/lib/llm/llmService.test.ts` (nouveau — co-localisé)
- `src/lib/llm/providers/openai.provider.ts` (nouveau)
- `src/lib/llm/providers/openai.provider.test.ts` (nouveau — co-localisé)
- `src/lib/llm/providers/groq.provider.ts` (nouveau)
- `src/lib/llm/providers/groq.provider.test.ts` (nouveau — co-localisé)
- `package.json` (modifié — ajout openai, suppression @anthropic-ai/sdk)
- `pnpm-lock.yaml` (modifié)
- `.env.example` (modifié — GROQ_API_KEY remplace ANTHROPIC_API_KEY)

### Debug Log
- Mock `vi.fn().mockImplementation()` ne fonctionne pas comme constructeur pour `new OpenAI()` / `new Anthropic()` → résolu avec `class MockOpenAI` dans `vi.mock()`
- `const mockCreate = vi.fn()` hoisté après `vi.mock()` → résolu avec `vi.hoisted()`
- Tests retry timeout 5s dû au backoff réel (1s+2s × 2 providers) → résolu avec `vi.useFakeTimers()` + `vi.runAllTimersAsync()`
- Unhandled promise rejection sur test double-échec → résolu en attachant `.catch()` avant `runAllTimersAsync()`

### Senior Developer Review (AI)

**Reviewer :** Greg (via Claude Opus 4.6)
**Date :** 2026-03-03

**Résultat : APPROVED avec corrections appliquées**

**Issues corrigées (3 HIGH) :**
- H1 — Ajout `validation.ts` : parse et validation explicite de la sortie LLM (try/catch JSON.parse, extraction de champs typés, rejet des arrays/primitives). Élimine le spread aveugle `...parsed` de données non-fiables.
- H2 — Lazy initialization des clients OpenAI/Groq : validation de la présence des env vars au premier appel (plus de crash à l'import), suppression des assertions non-null `!`.
- H3 — Suppression de `maxTokens` inutilisé dans `LLMCallOptions` (code mort).

**Issues MEDIUM corrigées (4) :**
- M1 — ACs et epic index alignés avec les noms de modèles réels
- M2 — Fichiers réorganisés selon conventions architecture : `providers/`, `llmService.ts`, tests co-localisés, barrel `index.ts`
- M3 — Résolu par migration Groq : diversification providers complète (4 modèles distincts)
- M4 — `withRetry` rendu privé, barrel `index.ts` n'expose que l'API publique (`summarize` + types)

**Migration post-review : Anthropic → Groq**
- Suppression `@anthropic-ai/sdk`, création `groq.provider.ts` (SDK OpenAI avec `baseURL` Groq)
- `MODEL_CONFIG` centralisé : basic (OpenAI→Groq), premium (Groq→OpenAI)
- Premium fallback (`gpt-5-mini`) clairement supérieur au basic primary (`gpt-5-nano`)

**Tests :** 41 tests passent (structure co-localisée). 0 régression (7 échecs pré-existants Supabase/Settings inchangés).

**Fichiers ajoutés/réorganisés par review :**
- `src/lib/llm/validation.ts` — module de validation sortie LLM
- `src/lib/llm/index.ts` — barrel export API publique
- `src/lib/llm/providers/groq.provider.ts` — provider Groq via SDK OpenAI
- Tests co-localisés avec les sources (suppression `__tests__/`)
