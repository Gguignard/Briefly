# Monitoring et Logging - Guide de Configuration

Ce guide documente la configuration de Sentry et Pino pour le monitoring et le logging de Briefly (Story 1.6).

## Configuration Sentry

### 1. Créer un compte et un projet Sentry

1. Créer un compte sur [sentry.io](https://sentry.io)
2. Créer un nouveau projet pour Next.js
3. Récupérer le DSN du projet

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env.local` et remplir :

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
SENTRY_AUTH_TOKEN=sntrys_xxx   # Pour upload des source maps (optionnel en dev)
SENTRY_ORG=briefly
SENTRY_PROJECT=briefly-nextjs
```

### 3. Générer un token d'authentification Sentry (pour CI/CD)

Pour que les source maps soient uploadées automatiquement lors du build :

1. Aller dans Settings > Auth Tokens
2. Créer un nouveau token avec le scope `project:releases`
3. Ajouter le token dans `.env.local` comme `SENTRY_AUTH_TOKEN`

## Test de l'implémentation

### Test 1 : Vérifier les logs Pino en développement

```bash
npm run dev
```

Les logs devraient apparaître en couleur avec pino-pretty.

### Test 2 : Tester la capture d'erreur Sentry

Créer une page de test pour déclencher une erreur :

```typescript
// src/app/test-error/page.tsx
export default function TestErrorPage() {
  throw new Error('Test Sentry error capture')
}
```

Visiter http://localhost:3000/test-error et vérifier que l'erreur apparaît dans le dashboard Sentry.

### Test 3 : Vérifier les logs API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health?detailed=true
```

Les logs devraient apparaître dans le terminal avec :
- `requestId`
- `path`
- `status`

### Test 4 : Logs en production (format JSON)

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Les logs devraient être au format JSON structuré (pas de couleurs).

## Fichiers créés

- `sentry.client.config.ts` - Configuration Sentry client-side
- `sentry.server.config.ts` - Configuration Sentry server-side
- `sentry.edge.config.ts` - Configuration Sentry edge runtime
- `src/lib/utils/logger.ts` - Logger Pino et helper logError

## Fichiers modifiés

- `next.config.ts` - Ajout de withSentryConfig
- `.env.example` - Variables d'environnement Sentry
- `src/app/api/health/route.ts` - Exemple d'utilisation du pattern de logging
- `src/app/error.tsx` - Capture d'erreur avec Sentry

## Pattern de logging recommandé

```typescript
import logger, { logError } from '@/lib/utils/logger'

export async function GET(req: Request) {
  const requestId = crypto.randomUUID()
  logger.info({ requestId, path: '/api/example' }, 'GET /api/example')

  try {
    // ... logique métier
    logger.info({ requestId, data: result }, 'Success')
    return NextResponse.json(result)
  } catch (error) {
    logError(error as Error, { requestId, path: '/api/example' })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Notes

- En développement, les logs utilisent `pino-pretty` pour un affichage colorisé
- En production, les logs sont au format JSON pour être facilement parsés
- Les erreurs sont automatiquement envoyées à Sentry en production
- Le helper `logError` combine le logging Pino et la capture Sentry
