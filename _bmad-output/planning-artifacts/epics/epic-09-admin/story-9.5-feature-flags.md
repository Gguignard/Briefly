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

- [ ] `src/lib/flags.ts` créé
- [ ] Mode maintenance fonctionnel via env var
- [ ] Flags documentés dans `.env.example`

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/lib/flags.ts`
- [ ] Étendre le middleware pour le mode maintenance
- [ ] Documenter les flags dans `.env.example`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
