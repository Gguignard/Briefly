# Story 9.5 : Feature Flags Simples (Env Vars)

**Epic :** Epic 9 - Dashboard Admin & Contrôle Opérationnel
**Priority :** P2 (Medium)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** developer/operator,
**I want** simple feature flags via environment variables,
**so that** I can enable or disable features without deploying new code.

---

## Acceptance Criteria

1. ✅ `src/lib/flags.ts` exporte un objet de feature flags booléens
2. ✅ Flags configurables via variables d'environnement (`FEATURE_XXX=true/false`)
3. ✅ Flags documentés dans `.env.example`
4. ✅ Au moins 3 flags utiles : `FEATURE_SIGNUP_ENABLED`, `FEATURE_PREMIUM_ENABLED`, `FEATURE_MAINTENANCE_MODE`
5. ✅ Middleware vérifie `FEATURE_MAINTENANCE_MODE` et affiche une page de maintenance si activé

---

## Technical Notes

### `src/lib/flags.ts`

```typescript
export const featureFlags = {
  signupEnabled: process.env.FEATURE_SIGNUP_ENABLED !== 'false',
  premiumEnabled: process.env.FEATURE_PREMIUM_ENABLED !== 'false',
  maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === 'true',
  llmEnabled: process.env.FEATURE_LLM_ENABLED !== 'false',
  emailIngestionEnabled: process.env.FEATURE_EMAIL_INGESTION_ENABLED !== 'false',
}
```

### Utilisation dans le middleware

```typescript
// Extension de src/middleware.ts
import { featureFlags } from './lib/flags'

export default clerkMiddleware(async (auth, req) => {
  // Mode maintenance
  if (featureFlags.maintenanceMode && !req.url.includes('/admin')) {
    return new Response(
      '<html><body><h1>Briefly est en maintenance. Revenez dans quelques minutes.</h1></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }
  // ...
})
```

### Utilisation dans les routes API

```typescript
// Dans POST /api/billing/checkout
import { featureFlags } from '@/lib/flags'

if (!featureFlags.premiumEnabled) {
  return apiError('FEATURE_DISABLED', 'Abonnements Premium temporairement désactivés', 503)
}
```

### Variables d'environnement

```bash
# .env.example — Feature flags (tous activés par défaut)
FEATURE_SIGNUP_ENABLED=true
FEATURE_PREMIUM_ENABLED=true
FEATURE_MAINTENANCE_MODE=false
FEATURE_LLM_ENABLED=true
FEATURE_EMAIL_INGESTION_ENABLED=true
```

---

## Dependencies

**Requires :**
- Story 1.5 : Middleware (à étendre)

**Blocks :**
- Rien (transversal)

---

## Definition of Done

- [x] `src/lib/flags.ts` créé
- [x] Mode maintenance fonctionnel via env var
- [x] Flags documentés dans `.env.example`

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `src/lib/flags.ts`
- [x] Étendre le middleware pour le mode maintenance
- [x] Documenter les flags dans `.env.example`

### Completion Notes
- `src/lib/flags.ts` : 5 feature flags booléens (signupEnabled, premiumEnabled, maintenanceMode, llmEnabled, emailIngestionEnabled) avec valeurs par défaut sûres (activés par défaut sauf maintenanceMode)
- Middleware étendu : vérification de `maintenanceMode` avant toute autre logique. Retourne 503 HTML sauf pour les routes `/admin`
- `.env.example` documenté avec les 5 variables FEATURE_*
- 13 tests unitaires pour `flags.ts` couvrant valeurs par défaut, opt-out (=false), opt-in (=true), et valeurs arbitraires
- 4 tests ajoutés au middleware existant couvrant : page maintenance sur route publique, blocage route protégée, accès admin autorisé, et mode normal

### File List
- `src/lib/flags.ts` (nouveau — getters dynamiques, case-insensitive)
- `src/lib/__tests__/flags.test.ts` (nouveau — 18 tests)
- `src/middleware.ts` (modifié — maintenance i18n + signup gate)
- `src/__tests__/middleware.test.ts` (modifié — 30 tests incl. maintenance i18n + signup disabled)
- `.env.example` (modifié — ajout section Feature Flags)
- `src/app/api/billing/checkout/route.ts` (modifié — gate premiumEnabled)
- `src/app/api/webhooks/email/route.ts` (modifié — gate emailIngestionEnabled)
- `src/workers/summary.worker.ts` (modifié — gate llmEnabled)

### Code Review Fixes (2026-03-19)
- **H1**: Intégré les 4 flags non utilisés : `premiumEnabled` → checkout, `emailIngestionEnabled` → email webhook, `llmEnabled` → summary worker, `signupEnabled` → middleware sign-up gate
- **H2**: Converti flags statiques en getters dynamiques (lecture env var à chaque accès)
- **H3**: Page maintenance améliorée : HTML complet, i18n fr/en, styling, header Retry-After
- **M2**: Tests flags simplifiés (plus besoin de `vi.resetModules()`)
- **M3**: Comparaison case-insensitive des env vars (`toLowerCase()`)
- Tests : 48 tests passent (18 flags + 30 middleware)

### Debug Log
- `require.resolve` ne fonctionne pas dans Vitest ESM → remplacé par `vi.resetModules()` + dynamic import
- 4 fichiers de test pré-existants en échec (supabase, email worker, settings page, categories) — non liés à cette story
