# Story 5.4 : Stockage et Rétention des Résumés (90 jours)

**Epic :** Epic 5 - Moteur de Résumés IA
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** system,
**I want** summaries to be stored for 90 days and then automatically purged,
**so that** storage costs are controlled and the database doesn't grow unboundedly.

---

## Acceptance Criteria

1. ✅ Les résumés sont accessibles pendant 90 jours depuis leur date de génération
2. ✅ Un job de nettoyage quotidien supprime les résumés de plus de 90 jours
3. ✅ Les `raw_emails` de plus de 90 jours sont également purgés
4. ✅ La purge est loggée (nombre d'enregistrements supprimés)
5. ✅ Index Supabase sur `created_at` pour les performances de requête

---

## Technical Notes

### Index de performance (dans la migration existante)

```sql
-- Déjà présent dans story 5.2, rappel :
CREATE INDEX idx_summaries_user_id_created ON summaries(user_id, created_at DESC);
CREATE INDEX idx_summaries_created_at ON summaries(created_at);  -- Pour la purge
CREATE INDEX idx_raw_emails_created_at ON raw_emails(created_at); -- Pour la purge
```

### Job de purge via BullMQ (cron)

```typescript
// src/lib/queue/cleanup.queue.ts
import { Queue } from 'bullmq'
import { getRedis } from './redis'

export const cleanupQueue = new Queue('cleanup', {
  connection: getRedis(),
})

// Planifier le job quotidien (cron à minuit UTC)
await cleanupQueue.add(
  'purge-old-data',
  {},
  {
    repeat: { pattern: '0 0 * * *' }, // Minuit UTC
    jobId: 'daily-purge',             // ID fixe pour éviter les doublons
  }
)
```

### Worker de purge

```typescript
// src/workers/cleanup.worker.ts
import { Worker } from 'bullmq'
import { getRedis } from '@/lib/queue/redis'
import { createAdminClient } from '@/lib/supabase/admin'
import logger from '@/lib/utils/logger'

const RETENTION_DAYS = 90

export const cleanupWorker = new Worker(
  'cleanup',
  async () => {
    const supabase = createAdminClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
    const cutoff = cutoffDate.toISOString()

    // Supprimer les résumés anciens
    const { count: summaryCount } = await supabase
      .from('summaries')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff)

    // Supprimer les emails bruts anciens
    const { count: emailCount } = await supabase
      .from('raw_emails')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff)

    logger.info(
      { summaryCount, emailCount, cutoff },
      'Daily purge completed'
    )
  },
  { connection: getRedis() }
)
```

### Intégration dans `src/workers/index.ts`

```typescript
import './email.worker'
import './summary.worker'
import './cleanup.worker'
import { cleanupQueue } from '@/lib/queue/cleanup.queue'

// Enregistrer le cron au démarrage
await cleanupQueue.add('purge-old-data', {}, {
  repeat: { pattern: '0 0 * * *' },
  jobId: 'daily-purge',
})
```

---

## Dependencies

**Requires :**
- Story 4.4 : BullMQ infrastructure
- Story 5.2 : Tables `summaries` et `raw_emails`

**Blocks :**
- Rien (cleanup autonome)

---

## Definition of Done

- [ ] Index `created_at` sur `summaries` et `raw_emails`
- [ ] Worker `cleanup.worker.ts` créé
- [ ] Cron job `0 0 * * *` enregistré au démarrage
- [ ] Test : créer des données > 90 jours → vérifier suppression
- [ ] Log de purge vérifié

---

## Testing Strategy

- **Manuel :** Insérer un résumé avec `created_at` = 91 jours en arrière → déclencher le worker manuellement → vérifier suppression
- **Manuel :** Vérifier les logs après exécution du cleanup worker

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Ajouter index `created_at` dans les migrations
- [ ] Créer `src/lib/queue/cleanup.queue.ts`
- [ ] Créer `src/workers/cleanup.worker.ts`
- [ ] Intégrer dans `src/workers/index.ts`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
