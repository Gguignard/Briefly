# Story 1.6 : Monitoring et Logging avec Sentry et Pino

**Epic :** Epic 1 - Fondations du Projet & Infrastructure
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** developer,
**I want** Sentry configured for error tracking and Pino for structured logging,
**so that** production errors are captured automatically and logs are queryable for debugging.

---

## Acceptance Criteria

1. ✅ Sentry installé et configuré pour erreurs client (browser) et serveur (Node.js)
2. ✅ `lib/utils/logger.ts` exporte un logger Pino (JSON structuré, level par `NODE_ENV`)
3. ✅ Aucun `console.log` dans le code — remplacé par `logger.info/warn/error`
4. ✅ Les Route Handlers loggent les requêtes entrantes et les erreurs via Pino
5. ✅ Une erreur non gérée en production est capturée par Sentry avec stack trace complète
6. ✅ `SENTRY_DSN` et `SENTRY_AUTH_TOKEN` documentés dans `.env.example`
7. ✅ Source maps uploadées sur Sentry au build (via `@sentry/nextjs`)

---

## Technical Notes

### Installation

```bash
npm install @sentry/nextjs pino pino-pretty
```

### Configuration Sentry (wizard automatique)

```bash
npx @sentry/wizard@latest -i nextjs
```

Cela crée automatiquement :
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Modifie `next.config.ts` avec `withSentryConfig`

### `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
})
```

### `src/lib/utils/logger.ts`

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
})

export default logger

// Helper pour logger les erreurs + les envoyer à Sentry
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({ err: error, ...context }, error.message)
  if (process.env.NODE_ENV === 'production') {
    import('@sentry/nextjs').then(({ captureException }) => {
      captureException(error, { extra: context })
    })
  }
}
```

### Pattern de logging dans les Route Handlers

```typescript
// app/api/newsletters/route.ts
import { NextResponse } from 'next/server'
import logger, { logError } from '@/lib/utils/logger'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function GET(req: Request) {
  const requestId = crypto.randomUUID()
  logger.info({ requestId, path: '/api/newsletters' }, 'GET /api/newsletters')

  try {
    // ... logique métier
    logger.info({ requestId, count: data.length }, 'Newsletters fetched')
    return apiResponse(data)
  } catch (error) {
    logError(error as Error, { requestId, path: '/api/newsletters' })
    return apiError('INTERNAL_ERROR', 'Erreur serveur', 500)
  }
}
```

### Variables d'environnement

```bash
# .env.example
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
SENTRY_AUTH_TOKEN=sntrys_xxx   # Pour upload des source maps
SENTRY_ORG=briefly
SENTRY_PROJECT=briefly-nextjs
```

### `next.config.ts` avec Sentry

```typescript
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  output: 'standalone',
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})
```

---

## Dependencies

**Requires :**
- Story 1.1 : Projet Next.js initialisé

**Blocks :**
- Toutes les stories backend/API (pattern de logging à suivre)

---

## Definition of Done

- [ ] `@sentry/nextjs` et `pino` installés
- [ ] `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` créés
- [ ] `src/lib/utils/logger.ts` créé et exporté
- [ ] `logError()` helper créé pour erreurs Sentry + Pino combinés
- [ ] Route Handler example utilise le pattern de logging
- [ ] Test manuel : déclencher une erreur → apparaît dans Sentry dashboard
- [ ] `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` dans `.env.example`
- [ ] Source maps uploadées sur Sentry lors du build CI

---

## Testing Strategy

- **Manuel :** Ajouter `throw new Error('test sentry')` dans une page, visiter la page, vérifier que l'erreur apparaît dans Sentry
- **Manuel :** `NODE_ENV=development` → logs pino-pretty colorisés dans le terminal
- **Manuel :** `NODE_ENV=production` → logs JSON structurés

---

## References

- [Sentry Next.js docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Pino docs](https://getpino.io)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Installer `@sentry/nextjs` et `pino`
- [ ] Exécuter `npx @sentry/wizard@latest -i nextjs`
- [ ] Créer `src/lib/utils/logger.ts` avec helper `logError`
- [ ] Mettre à jour `next.config.ts` avec `withSentryConfig`
- [ ] Ajouter variables dans `.env.example`
- [ ] Tester une erreur en développement

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
