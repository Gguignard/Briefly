# Deployment Guide

## CI/CD Pipeline

Le pipeline CI/CD est configuré via GitHub Actions (`.github/workflows/ci.yml`).

### Workflow

1. **Sur chaque PR vers `main`**: lint → type-check → test → build
2. **Sur chaque push vers `main`**: lint → type-check → test → build → deploy

### Jobs

- **CI Job**: Validation du code (lint, types, tests, build)
- **Deploy Job**: Déploiement via Kamal sur VPS OVH (uniquement sur `main`)

---

## Secrets GitHub Actions

Configurer dans: `Settings > Secrets and variables > Actions`

### Infrastructure & Registry

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Clé SSH privée pour accès au VPS OVH |
| `VPS_HOST` | IP ou hostname du VPS (ex: `51.91.xxx.xxx`) |
| `KAMAL_REGISTRY_USERNAME` | Username GitHub pour ghcr.io |
| `KAMAL_REGISTRY_PASSWORD` | Token GitHub avec permission `write:packages` |
| `REDIS_URL` | URL Redis (ex: `redis://briefly-redis:6379`) |
| `SENTRY_DSN` | DSN Sentry pour monitoring |

### Supabase

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (admin) |

### Clerk Authentication

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `CLERK_SECRET_KEY` | Clé secrète Clerk |

### Stripe Billing

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |

### LLM APIs

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | Clé API OpenAI |
| `ANTHROPIC_API_KEY` | Clé API Anthropic |

---

## Configuration Kamal

Le fichier `config/deploy.yml` contient la configuration Kamal.

### Avant premier déploiement

1. Remplacer `IP_VPS_OVH` par l'IP du VPS
2. Remplacer `GITHUB_USERNAME` par votre username GitHub
3. Remplacer `briefly.yourdomain.com` par le domaine de production
4. Configurer tous les secrets GitHub Actions ci-dessus

### Commandes Kamal

```bash
# Premier déploiement (setup + deploy)
kamal setup

# Déploiements suivants
kamal deploy

# Pousser les secrets sur le serveur
kamal env push

# Voir les logs
kamal logs

# Rollback
kamal rollback
```

---

## Health Check

L'endpoint `/api/health` est utilisé par Kamal pour vérifier la santé de l'application.

### Mode basique (défaut)

```bash
curl https://briefly.yourdomain.com/api/health
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Mode détaillé (avec vérification dépendances)

```bash
curl https://briefly.yourdomain.com/api/health?detailed=true
# {"status":"ok","timestamp":"...","checks":{"redis":"ok"}}
```

---

## Troubleshooting

### Build échoue

1. Vérifier les logs GitHub Actions
2. S'assurer que `NEXT_PUBLIC_*` vars sont configurées
3. Tester localement: `npm run build`

### Deploy échoue

1. Vérifier que `VPS_SSH_KEY` est correcte
2. Vérifier que le VPS est accessible: `ssh user@VPS_HOST`
3. Vérifier les logs Kamal: `kamal logs`

### Health check échoue

1. Vérifier que l'app démarre: `kamal logs`
2. Tester le endpoint: `curl http://localhost:3000/api/health`
3. Mode détaillé pour diagnostiquer: `curl http://localhost:3000/api/health?detailed=true`
