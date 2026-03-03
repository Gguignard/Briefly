# Story 5.1 : Service LLM Abstrait (OpenAI + Anthropic)

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** a unified LLM service abstracting OpenAI and Anthropic APIs,
**so that** the summarization pipeline can switch between providers transparently with automatic fallback.

---

## Acceptance Criteria

1. ✅ `LLMService.summarize()` accepte un contenu texte et retourne un résumé structuré
2. ✅ Sélection du modèle selon le tier : `gpt-4o-nano` (basic) ou `claude-haiku-4-5` (premium)
3. ✅ Retry x3 avec backoff exponentiel sur les erreurs API
4. ✅ Fallback automatique : si le modèle primaire échoue après 3 retries → modèle secondaire
5. ✅ Output limité à 800 tokens
6. ✅ Prompt système versionné dans un fichier de configuration
7. ✅ Coûts loggés (tokens input/output + provider) après chaque appel

---

## Technical Notes

### Installation

```bash
npm install openai @anthropic-ai/sdk
```

### `src/lib/llm/types.ts`

```typescript
export type LLMTier = 'basic' | 'premium'
export type LLMProvider = 'openai' | 'anthropic'

export interface SummaryResult {
  title: string
  keyPoints: string[]
  sourceUrl: string | null
  llmTier: LLMTier
  provider: LLMProvider
  tokensInput: number
  tokensOutput: number
  generatedAt: string
}

export interface LLMCallOptions {
  tier: LLMTier
  maxTokens?: number
}
```

### `src/lib/llm/prompts.ts`

```typescript
export const SUMMARY_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la synthèse de newsletters.
Génère un résumé structuré en JSON avec ce format exact :
{
  "title": "Titre accrocheur (max 80 chars)",
  "keyPoints": ["Point clé 1", "Point clé 2", "Point clé 3"],
  "sourceUrl": "URL de la newsletter si présente, sinon null"
}
Sois concis. Maximum 3 points clés. Chaque point max 120 chars. Réponds uniquement en JSON valide.`

export const SUMMARY_USER_TEMPLATE = (content: string) =>
  `Résume cette newsletter :\n\n${content.slice(0, 6000)}`
```

### `src/lib/llm/openai.ts`

```typescript
import OpenAI from 'openai'
import { SummaryResult } from './types'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function summarizeWithOpenAI(
  content: string,
  tier: 'basic' | 'premium'
): Promise<SummaryResult> {
  const model = tier === 'premium' ? 'gpt-4o-mini' : 'gpt-4o-nano'

  const response = await client.chat.completions.create({
    model,
    max_tokens: 800,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      { role: 'user', content: SUMMARY_USER_TEMPLATE(content) },
    ],
  })

  const parsed = JSON.parse(response.choices[0].message.content ?? '{}')

  return {
    ...parsed,
    llmTier: tier,
    provider: 'openai',
    tokensInput: response.usage?.prompt_tokens ?? 0,
    tokensOutput: response.usage?.completion_tokens ?? 0,
    generatedAt: new Date().toISOString(),
  }
}
```

### `src/lib/llm/anthropic.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_TEMPLATE } from './prompts'
import { SummaryResult } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function summarizeWithAnthropic(
  content: string,
  tier: 'basic' | 'premium'
): Promise<SummaryResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: SUMMARY_USER_TEMPLATE(content) }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const parsed = JSON.parse(text)

  return {
    ...parsed,
    llmTier: tier,
    provider: 'anthropic',
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
    generatedAt: new Date().toISOString(),
  }
}
```

### `src/lib/llm/service.ts` — Service principal avec retry + fallback

```typescript
import { summarizeWithOpenAI } from './openai'
import { summarizeWithAnthropic } from './anthropic'
import { LLMCallOptions, SummaryResult } from './types'
import logger, { logError } from '@/lib/utils/logger'

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function summarize(
  content: string,
  options: LLMCallOptions
): Promise<SummaryResult> {
  const { tier, maxTokens = 800 } = options

  // Modèle primaire selon le tier
  const primaryProvider = tier === 'premium' ? 'anthropic' : 'openai'
  const fallbackProvider = tier === 'premium' ? 'openai' : 'anthropic'

  const primaryFn = primaryProvider === 'anthropic'
    ? () => summarizeWithAnthropic(content, tier)
    : () => summarizeWithOpenAI(content, tier)

  const fallbackFn = fallbackProvider === 'anthropic'
    ? () => summarizeWithAnthropic(content, tier)
    : () => summarizeWithOpenAI(content, tier)

  try {
    return await withRetry(primaryFn)
  } catch (primaryErr) {
    logger.warn({ tier, primaryProvider }, 'Primary LLM failed, trying fallback')
    try {
      return await withRetry(fallbackFn)
    } catch (fallbackErr) {
      logError(fallbackErr as Error, { tier, primaryProvider, fallbackProvider })
      throw fallbackErr
    }
  }
}
```

### Variables d'environnement

```bash
# .env.local
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
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

- [x] `src/lib/llm/service.ts`, `openai.ts`, `anthropic.ts`, `types.ts`, `prompts.ts` créés
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
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/lib/llm/types.ts`, `prompts.ts`
- [x] Créer `src/lib/llm/openai.ts` et `anthropic.ts`
- [x] Créer `src/lib/llm/service.ts` avec retry + fallback
- [x] Ajouter `OPENAI_API_KEY` et `ANTHROPIC_API_KEY` dans `.env.example` (déjà présent)

### Completion Notes
- Implémenté le service LLM abstrait avec providers OpenAI et Anthropic
- `types.ts` : types `LLMTier`, `LLMProvider`, `SummaryResult`, `LLMCallOptions`
- `prompts.ts` : prompt système versionné + template utilisateur (troncature à 6000 chars)
- `openai.ts` : provider OpenAI avec modèles `gpt-4o-nano` (basic) / `gpt-4o-mini` (premium), max 800 tokens, format JSON, logging tokens
- `anthropic.ts` : provider Anthropic avec `claude-haiku-4-5`, max 800 tokens, logging tokens
- `service.ts` : `withRetry()` (3 tentatives, backoff exponentiel) + `summarize()` avec fallback automatique (basic: OpenAI→Anthropic, premium: Anthropic→OpenAI)
- 31 tests unitaires couvrant : structure des types, prompts, providers (modèle, max_tokens, format, erreurs, content null/non-text), retry logic (succès, échec, backoff), fallback (basic, premium, double échec), comptage retries
- Dépendances installées : `openai@6.25.0`, `@anthropic-ai/sdk@0.78.0`
- `.env.example` contenait déjà les clés API LLM
- 0 régressions introduites (7 échecs pré-existants dans Supabase/Settings)

### Review Follow-ups (AI)
- [x] [AI-Review][MEDIUM] M1 — Noms de modèles alignés : ACs et epic index mis à jour avec `gpt-4o-nano`/`gpt-4o-mini`/`claude-haiku-4-5`
- [x] [AI-Review][MEDIUM] M2 — Structure fichiers réorganisée : `providers/openai.provider.ts`, `providers/anthropic.provider.ts`, `llmService.ts`, tests co-localisés, barrel `index.ts`
- [x] [AI-Review][MEDIUM] M3 — Confirmé by design : Anthropic n'a qu'un modèle (haiku), différenciation côté OpenAI (nano/mini)
- [x] [AI-Review][MEDIUM] M4 — `withRetry` rendu privé (non exporté), barrel `index.ts` expose uniquement `summarize` + types

### File List
- `src/lib/llm/index.ts` (nouveau — barrel export)
- `src/lib/llm/types.ts` (nouveau)
- `src/lib/llm/types.test.ts` (nouveau — co-localisé)
- `src/lib/llm/prompts.ts` (nouveau)
- `src/lib/llm/validation.ts` (nouveau — ajouté par review)
- `src/lib/llm/validation.test.ts` (nouveau — co-localisé)
- `src/lib/llm/llmService.ts` (nouveau — renommé de service.ts)
- `src/lib/llm/llmService.test.ts` (nouveau — co-localisé)
- `src/lib/llm/providers/openai.provider.ts` (nouveau — renommé de openai.ts)
- `src/lib/llm/providers/openai.provider.test.ts` (nouveau — co-localisé)
- `src/lib/llm/providers/anthropic.provider.ts` (nouveau — renommé de anthropic.ts)
- `src/lib/llm/providers/anthropic.provider.test.ts` (nouveau — co-localisé)
- `package.json` (modifié — ajout openai + @anthropic-ai/sdk)
- `pnpm-lock.yaml` (modifié)

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
- H2 — Lazy initialization des clients OpenAI/Anthropic : validation de la présence des env vars au premier appel (plus de crash à l'import), suppression des assertions non-null `!`.
- H3 — Suppression de `maxTokens` inutilisé dans `LLMCallOptions` (code mort).

**Issues MEDIUM corrigées (4) :**
- M1 — ACs et epic index alignés avec les noms de modèles réels (`gpt-4o-nano`/`gpt-4o-mini`/`claude-haiku-4-5`)
- M2 — Fichiers réorganisés selon conventions architecture : `providers/`, `llmService.ts`, tests co-localisés, barrel `index.ts`
- M3 — Confirmé by design : asymétrie Anthropic intentionnelle (un seul modèle haiku)
- M4 — `withRetry` rendu privé, barrel `index.ts` n'expose que l'API publique (`summarize` + types)

**Tests :** 39 tests passent (structure co-localisée). 0 régression (7 échecs pré-existants Supabase/Settings inchangés).

**Fichiers ajoutés/réorganisés par review :**
- `src/lib/llm/validation.ts` — module de validation sortie LLM
- `src/lib/llm/index.ts` — barrel export API publique
- `src/lib/llm/providers/` — providers déplacés selon convention architecture
- Tests co-localisés avec les sources (suppression `__tests__/`)
