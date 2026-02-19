# Story 1.3 : Infrastructure VPS avec Docker Compose et Caddy

**Epic :** Epic 1 - Foundations
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** developer,
**I want** the VPS infrastructure configured with Docker Compose, Caddy reverse proxy, and Redis,
**so that** the application is deployable in production with automatic HTTPS.

---

## Acceptance Criteria

1. ✅ `docker/docker-compose.yml` définit les services : `app` (Next.js standalone), `redis`, `caddy`
2. ✅ Caddy sert HTTPS avec certificat TLS automatique via Let's Encrypt
3. ✅ Redis accessible sur port 6379 (non exposé publiquement, réseau Docker interne)
4. ✅ Next.js buildé en mode `standalone` (config `next.config.ts` : `output: 'standalone'`)
5. ✅ `docker/Caddyfile` configure le reverse proxy vers `app:3000`
6. ✅ `config/kamal.yml` configuré pour déployer sur VPS OVH
7. ✅ `docker compose up -d` démarre tous les services sans erreur
8. ✅ L'application répond sur le domaine de production via HTTPS

---

## Technical Notes

### Structure des fichiers Docker

```
docker/
├── docker-compose.yml
├── Caddyfile
└── Dockerfile          # Multi-stage build Next.js standalone
config/
└── kamal.yml
```

### next.config.ts — Mode Standalone

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // ... autres configs
}

export default nextConfig
```

### Dockerfile Multi-Stage

```dockerfile
# docker/Dockerfile

# ---- Stage 1: Dépendances ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
# docker/docker-compose.yml
version: '3.8'

networks:
  briefly-net:
    driver: bridge

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: briefly-app
    restart: unless-stopped
    env_file:
      - ../.env.production
    networks:
      - briefly-net
    depends_on:
      - redis
    expose:
      - "3000"

  redis:
    image: redis:7-alpine
    container_name: briefly-redis
    restart: unless-stopped
    networks:
      - briefly-net
    # Port 6379 NON exposé publiquement — réseau interne uniquement
    # Pas de persistence au MVP

  caddy:
    image: caddy:2-alpine
    container_name: briefly-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - briefly-net
    depends_on:
      - app

volumes:
  caddy_data:
  caddy_config:
```

### Caddyfile

```caddyfile
# docker/Caddyfile
briefly.yourdomain.com {
    reverse_proxy app:3000

    encode gzip

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }

    log {
        output stdout
        format json
    }
}
```

### config/kamal.yml

```yaml
# config/kamal.yml
service: briefly
image: briefly-app

servers:
  web:
    - IP_VPS_OVH

registry:
  server: ghcr.io
  username:
    - KAMAL_REGISTRY_USERNAME
  password:
    - KAMAL_REGISTRY_PASSWORD

builder:
  dockerfile: docker/Dockerfile
  context: .

env:
  clear:
    NODE_ENV: production
    PORT: "3000"
  secret:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY
    - CLERK_SECRET_KEY
    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    - REDIS_URL
    - SENTRY_DSN

proxy:
  ssl: true
  host: briefly.yourdomain.com
```

### Variables d'environnement

```bash
# .env.example (section infrastructure)
REDIS_URL=redis://briefly-redis:6379
```

### Files to Create/Modify

- `docker/Dockerfile` (créer)
- `docker/docker-compose.yml` (créer)
- `docker/Caddyfile` (créer)
- `config/kamal.yml` (créer)
- `next.config.ts` (modifier — ajouter `output: 'standalone'`)
- `.env.example` (modifier — ajouter `REDIS_URL`)

---

## Dependencies

**Requires :**
- Story 1.1 : Initialisation du Projet Next.js

**Blocks :**
- Story 1.4 : Pipeline CI/CD GitHub Actions + Déploiement Kamal

---

## Definition of Done

- [ ] `docker/Dockerfile` multi-stage construit une image sans erreur (`docker build -f docker/Dockerfile .`)
- [ ] `next.config.ts` contient `output: 'standalone'`
- [ ] `docker/docker-compose.yml` démarre les 3 services sans erreur (`docker compose -f docker/docker-compose.yml up -d`)
- [ ] Le service `redis` est accessible depuis `app` sur `redis://briefly-redis:6379`
- [ ] Le port 6379 de Redis n'est PAS exposé publiquement (pas de mapping `ports:` pour redis)
- [ ] Caddy répond en HTTPS sur le domaine configuré avec certificat Let's Encrypt valide
- [ ] `config/kamal.yml` configuré avec l'IP du VPS OVH et les bons registry credentials
- [ ] `kamal deploy` (ou `kamal setup` en premier) s'exécute sans erreur
- [ ] L'application répond sur `https://briefly.yourdomain.com`
- [ ] Les headers de sécurité HTTP sont présents dans les réponses Caddy

---

## Testing Strategy

- Build local de l'image Docker : `docker build -f docker/Dockerfile -t briefly-test .`
- `docker run -p 3000:3000 briefly-test` et vérifier `http://localhost:3000`
- `docker compose -f docker/docker-compose.yml up -d` en local (sans Caddy SSL en dev)
- Vérifier les logs de chaque service : `docker compose logs -f`
- Test de connectivité Redis depuis le container `app` : `docker exec briefly-app node -e "const r = require('redis'); const c = r.createClient({url: 'redis://briefly-redis:6379'}); c.connect().then(() => { console.log('Redis OK'); c.quit(); })"`
- En production : vérifier le certificat TLS via `curl -I https://briefly.yourdomain.com`

---

## References

- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Kamal Deploy Documentation](https://kamal-deploy.org/)
- [Caddy Docker Documentation](https://hub.docker.com/_/caddy)
- [Redis Alpine Docker](https://hub.docker.com/_/redis)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Modifier `next.config.ts` pour ajouter `output: 'standalone'`
- [ ] Créer `docker/Dockerfile` avec build multi-stage (deps → builder → runner)
- [ ] Créer `docker/docker-compose.yml` avec services `app`, `redis`, `caddy`
- [ ] Créer `docker/Caddyfile` avec reverse proxy et headers sécurité
- [ ] Créer `config/kamal.yml` avec config VPS OVH
- [ ] Mettre à jour `.env.example` avec `REDIS_URL`
- [ ] Tester le build Docker local
- [ ] Tester `docker compose up -d`
- [ ] Vérifier la connectivité entre services

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
