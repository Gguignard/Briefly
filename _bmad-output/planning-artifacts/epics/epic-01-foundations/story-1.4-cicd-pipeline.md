# Story 1.4 : Pipeline CI/CD GitHub Actions + Déploiement Kamal

**Epic :** Epic 1 - Fondations du Projet & Infrastructure
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** developer,
**I want** an automated CI/CD pipeline that lints, builds, tests, and deploys on every push to `main`,
**so that** every code change is validated and deployed to production automatically without manual intervention.

---

## Acceptance Criteria

1. ✅ `.github/workflows/ci.yml` s'exécute sur chaque push vers `main` et sur chaque PR
2. ✅ Étapes en ordre : lint → type-check → test → build → deploy
3. ✅ Lint ou build qui échoue bloque le déploiement
4. ✅ Kamal déploie l'image Docker sur le VPS OVH sans downtime (rolling deploy)
5. ✅ L'application répond correctement sur le domaine de production après chaque déploiement
6. ✅ Les logs du déploiement sont visibles dans l'onglet Actions de GitHub
7. ✅ Secrets GitHub configurés : `VPS_SSH_KEY`, `VPS_HOST`, `KAMAL_REGISTRY_PASSWORD`, toutes les env vars

---

## Technical Notes

### Structure du workflow CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check      # ajout script dans package.json
      - run: npm run test            # Vitest
      - run: npm run build

  deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
      - run: gem install kamal
      - run: kamal deploy
        env:
          KAMAL_REGISTRY_PASSWORD: ${{ secrets.KAMAL_REGISTRY_PASSWORD }}
          # ... toutes les env vars de production
```

### Scripts à ajouter dans `package.json`

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Configuration Kamal (`config/deploy.yml`)

```yaml
service: briefly
image: ghcr.io/GITHUB_USERNAME/briefly

servers:
  web:
    - VPS_IP_ADDRESS

registry:
  server: ghcr.io
  username: GITHUB_USERNAME
  password:
    - KAMAL_REGISTRY_PASSWORD

env:
  clear:
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_..."
    NEXT_PUBLIC_SUPABASE_URL: "https://..."
  secret:
    - CLERK_SECRET_KEY
    - SUPABASE_SERVICE_ROLE_KEY
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY
    - SENTRY_DSN
    - CLOUDFLARE_EMAIL_WEBHOOK_SECRET
    - REDIS_URL

builder:
  dockerfile: Dockerfile
  multiarch: false

proxy:
  ssl: true
  host: briefly.app
```

### Dockerfile pour Next.js standalone

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Ajouter dans `next.config.ts` :
```typescript
const nextConfig = {
  output: 'standalone',
}
```

### Secrets GitHub à configurer manuellement

Dans `Settings > Secrets and variables > Actions` du repo GitHub :
- `VPS_SSH_KEY` : clé SSH privée pour accès au VPS OVH
- `VPS_HOST` : IP ou hostname du VPS
- `KAMAL_REGISTRY_PASSWORD` : token GitHub (ghcr.io) avec permission `write:packages`
- Toutes les variables d'env de production (voir `config/deploy.yml`)

---

## Dependencies

**Requires :**
- Story 1.1 : Projet Next.js initialisé (pour lint/build/test)
- Story 1.3 : VPS configuré avec Docker (cible du déploiement)

**Blocks :**
- Tous les déploiements futurs en production

---

## Definition of Done

- [ ] `.github/workflows/ci.yml` créé et fonctionnel
- [ ] `config/deploy.yml` Kamal configuré
- [ ] `Dockerfile` créé avec `output: 'standalone'` dans `next.config.ts`
- [ ] Script `type-check` ajouté dans `package.json`
- [ ] Premier déploiement réussi visible dans GitHub Actions
- [ ] L'app répond sur le domaine de production après déploiement
- [ ] Un commit sur une PR déclenche CI sans déploiement
- [ ] Un merge sur `main` déclenche CI + déploiement

---

## Testing Strategy

- **Manuel :** Créer une PR avec une modification triviale, vérifier que CI passe sans déploiement
- **Manuel :** Merger sur `main`, vérifier que le déploiement s'exécute et que l'app fonctionne en production
- **Négatif :** Introduire une erreur TypeScript, vérifier que le pipeline bloque le déploiement

---

## References

- [Kamal docs](https://kamal-deploy.org)
- [GitHub Actions Node.js](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- Architecture doc : section "Infrastructure & Déploiement"

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `Dockerfile` avec build multi-stage
- [ ] Ajouter `output: 'standalone'` dans `next.config.ts`
- [ ] Créer `.github/workflows/ci.yml`
- [ ] Créer `config/deploy.yml` (Kamal)
- [ ] Ajouter script `type-check` dans `package.json`
- [ ] Documenter les secrets GitHub dans le README
- [ ] Tester le build Docker localement

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
