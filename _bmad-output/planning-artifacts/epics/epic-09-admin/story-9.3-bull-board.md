# Story 9.3 : Bull Board — Monitoring des Queues BullMQ

**Epic :** Epic 9 - Dashboard Admin & Contrôle Opérationnel
**Priority :** P2 (Medium)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** admin,
**I want** a visual queue dashboard to monitor BullMQ job status,
**so that** I can identify stuck jobs, retry failures, and monitor throughput.

---

## Acceptance Criteria

1. ✅ Bull Board accessible sur `/admin/queues`
2. ✅ Affiche les queues `email.process`, `summary.generate`, `cleanup`
3. ✅ Pour chaque queue : jobs en attente, actifs, réussis, échoués
4. ✅ Possibilité de relancer un job échoué depuis l'UI
5. ✅ Accès protégé par le rôle admin

---

## Technical Notes

### Installation

```bash
npm install @bull-board/api @bull-board/hono
# ou avec l'adapter Express pour une route Next.js custom
npm install @bull-board/api @bull-board/express
```

### Route Next.js avec adapter Express

```typescript
// src/app/admin/queues/[[...slug]]/route.ts
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import express from 'express'
import { emailQueue } from '@/lib/queue/email.queue'
import { summaryQueue } from '@/lib/queue/summary.queue'
import { cleanupQueue } from '@/lib/queue/cleanup.queue'
import { auth } from '@clerk/nextjs/server'
import { apiError } from '@/lib/utils/apiResponse'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(summaryQueue),
    new BullMQAdapter(cleanupQueue),
  ],
  serverAdapter,
})

const app = express()
app.use('/admin/queues', serverAdapter.getRouter())

export async function GET(req: Request) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Accès refusé', 403)
  }
  // Forward to express handler
  return new Response('Bull Board', { status: 200 })
}
```

> **Note :** L'intégration Bull Board avec Next.js App Router nécessite une approche légèrement différente. Alternative recommandée : exposer Bull Board sur un port séparé (ex: `:3001`) en dev, ou utiliser la route handler avec le package `@bull-board/hono`.

### Alternative : Port séparé en développement

```typescript
// src/workers/bull-board.ts (démarré avec `npm run workers`)
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import express from 'express'
import { emailQueue } from '@/lib/queue/email.queue'
import { summaryQueue } from '@/lib/queue/summary.queue'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/queues')

createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(summaryQueue)],
  serverAdapter,
})

const app = express()
app.use('/queues', serverAdapter.getRouter())
app.listen(3001, () => console.log('Bull Board: http://localhost:3001/queues'))
```

---

## Dependencies

**Requires :**
- Story 4.4 : BullMQ queues configurées
- Story 9.1 : Accès admin sécurisé

**Blocks :**
- Rien

---

## Definition of Done

- [x] Bull Board accessible (sur `/admin/queues` ou port `:3001`)
- [x] Queues `email.process`, `summary.generate`, `cleanup` visibles
- [x] Jobs échoués retryables depuis l'UI

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Installer `@bull-board/api` et adapter
- [x] Configurer Bull Board avec les 3 queues
- [x] Protéger l'accès

### Completion Notes
- Installé `@bull-board/api`, `@bull-board/express`, `express`, `@types/express`
- Bull Board intégré dans le workers process (`src/workers/bull-board.ts`) sur port configurable (`BULL_BOARD_PORT`, défaut 3001)
- Protection par token (`BULL_BOARD_TOKEN`) via query param ou header `x-bull-board-token`
- Page admin `/admin/queues` avec iframe Bull Board (protégée par le layout admin Clerk existant)
- `BULL_BOARD_URL` env var pour configurer l'URL Bull Board côté Next.js
- 18 tests ajoutés (12 bull-board server + 6 page admin queues), tous passent
- Traductions FR/EN ajoutées pour la page queues

### File List
- `src/workers/bull-board.ts` (nouveau) — serveur Express Bull Board avec auth token
- `src/workers/index.ts` (modifié) — import et démarrage de Bull Board
- `src/app/[locale]/admin/queues/page.tsx` (nouveau) — page admin avec iframe
- `src/workers/__tests__/bull-board.test.ts` (nouveau) — 12 tests unitaires
- `src/app/[locale]/admin/queues/__tests__/page.test.tsx` (nouveau) — 6 tests unitaires
- `messages/fr.json` (modifié) — traductions admin.queues
- `messages/en.json` (modifié) — traductions admin.queues
- `package.json` (modifié) — nouvelles dépendances

### Change Log
- 2026-03-18 : Implémentation complète story 9.3 — Bull Board monitoring des queues BullMQ
- 2026-03-19 : Code review fixes — graceful shutdown Bull Board, token per-request, try/catch URL invalide, token non exposé dans lien externe, @types/express en devDependencies, tests ajoutés (12+6)

### Debug Log
- Mock ExpressAdapter/BullMQAdapter : nécessite des classes (pas des fonctions) pour `new` en vitest
- happy-dom fetch incompatible avec serveurs Express réels — tests restructurés en unit tests avec mocks
