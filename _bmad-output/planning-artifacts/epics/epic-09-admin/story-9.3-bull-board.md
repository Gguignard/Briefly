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

- [ ] Bull Board accessible (sur `/admin/queues` ou port `:3001`)
- [ ] Queues `email.process`, `summary.generate`, `cleanup` visibles
- [ ] Jobs échoués retryables depuis l'UI

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Installer `@bull-board/api` et adapter
- [ ] Configurer Bull Board avec les 3 queues
- [ ] Protéger l'accès

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
