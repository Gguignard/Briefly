---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-Briefly-2026-02-15.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/prd-validation-report.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-18'
project_name: 'Briefly'
user_name: 'Greg'
date: '2026-02-17'
---

# Architecture Decision Document — Briefly

**Auteur :** Greg
**Date :** 2026-02-17

_Ce document est construit de manière collaborative à travers une découverte étape par étape. Les sections sont ajoutées au fur et à mesure que nous travaillons ensemble sur chaque décision architecturale._

---

## Analyse du Contexte Projet

### Vue d'ensemble des Exigences

**Exigences Fonctionnelles :**
76 FR couvrant 11 domaines : Authentification (FR1-7), Configuration newsletters (FR8-15), Moteur IA (FR16-24), Lecture résumés (FR25-31), Filtrage (FR32-35), Catégorisation custom (FR36-40), Paiements Stripe (FR41-49), Admin Dashboard (FR50-59), Support (FR60-63), SEO/Public (FR64-70), Responsive/Accessibilité (FR71-76).

**Exigences Non-Fonctionnelles :**
- Performance : FCP <1.5s, LCP <2.5s, génération résumé <2s, bundle <200KB gzipped
- Sécurité : JWT sessions, TLS 1.3, chiffrement at-rest, CORS strict, rate limiting
- Fiabilité : ≥99% uptime, retry LLM (3 tentatives), sauvegardes quotidiennes
- Coûts LLM : gratuit <0.5€/user/mois, payant <1.5€/user/mois, marge nette ≥60%
- Conformité : GDPR complet (export Article 20 + suppression Article 17), WCAG 2.1 AA
- Internationalisation : Français + Anglais dès MVP

**Échelle & Complexité :**
- Domaine principal : Full-Stack Web (Next.js App Router, SPA + SSR/SSG hybride)
- Niveau de complexité : Low-Medium (greenfield, solo dev, 500 users max à 12 mois)
- Contrainte critique : 1 développeur, ~10h/semaine, 3 mois MVP (~120h totales)
- Pas de temps réel requis (pas de WebSockets, pas de SSE — polling suffit)
- Pas d'app native MVP (responsive web uniquement)

### Contraintes Techniques & Dépendances

- **Framework** : Next.js (App Router) — SSG pages marketing, SSR pages SEO, SPA zone app
- **Base de données** : PostgreSQL via Supabase (free tier MVP, upgrade si croissance)
- **Hébergement** : VPS OVH (~10€/mois) + Cloudflare CDN (gratuit) devant
- **Paiements** : Stripe — abonnements récurrents, webhooks lifecycle
- **Auth** : Clerk — OAuth Google/Microsoft pour identité uniquement (pas d'accès inbox)
- **Email ingestion** : Adresse dédiée par utilisateur (@mail.briefly.app) via Cloudflare Email Routing → webhook Next.js → BullMQ
- **LLM** : Multi-providers (OpenAI `gpt-5-nano` primaire + Anthropic `claude-haiku-3-5` fallback) derrière une couche d'abstraction
- **Jobs asynchrones** : BullMQ + Redis (self-hosted sur VPS)
- **Reverse proxy** : Caddy (HTTPS automatique + proxy vers Next.js)

### Décisions Architecturales Majeures Actées

#### 1. Ingestion Email : Adresse dédiée vs OAuth inbox

**Décision :** Adresse email dédiée par utilisateur (`{uuid}@mail.briefly.app`) via Cloudflare Email Routing.

**Rejeté :** OAuth Gmail/Outlook pour accès inbox (FR1-FR5 du PRD initial révisés).

**Justification :**
- Sécurité perçue supérieure : "Briefly ne voit que ce que vous lui envoyez"
- Élimine la complexité OAuth email (token refresh, quotas API Google/Microsoft)
- Fonctionne avec n'importe quel provider email (pas limité Gmail + Outlook)
- Compatible avec tous les fournisseurs de newsletters
- Coût : 0€ (Cloudflare Email Routing gratuit) → webhook HTTP vers API Next.js

**Impact UX :** Onboarding légèrement plus manuel (l'utilisateur configure une règle de transfert Gmail pour chaque newsletter). Mitigé par guides visuels clairs dans l'application.

**Note :** L'authentification (login) reste via Clerk avec Google/Microsoft OAuth — c'est distinct de l'accès inbox.

#### 2. Authentification : Clerk

**Décision :** Clerk pour toute la gestion auth.

**Justification :**
- Gère OAuth Google/Microsoft pour login (identité uniquement, pas accès emails)
- Sessions JWT, user management, pre-built UI components
- Intégration Stripe native (sync users ↔ Stripe customers)
- Free tier : 10 000 MAU — largement suffisant pour target 500 users
- Économise 2-3 semaines de développement vs implémentation custom

#### 3. Hébergement : VPS OVH vs Vercel

**Décision :** VPS OVH + Cloudflare CDN.

**Justification :**
- Coût : ~10€/mois vs ~50-70€/mois (Vercel Pro + managed DB)
- Pas de contraintes de timeout serverless pour les appels LLM
- Background workers sans limites (BullMQ tourne en continu)
- Cloudflare (déjà prévu pour Email Routing) joue le rôle de CDN global pour les assets statiques SSG
- Hébergeur français (OVH) → GDPR natif, latence optimale pour utilisateurs FR, souveraineté des données EU

**Stack VPS :**
```
Caddy (reverse proxy + HTTPS auto)
Next.js (next start, mode standalone)
Redis (BullMQ job queue)
```

**Déploiement recommandé :** Docker Compose + Kamal (déploiement Git-push style Vercel).

#### 4. Base de données : Supabase (PostgreSQL managé)

**Décision :** Supabase free tier pour le MVP.

**Justification :**
- PostgreSQL managé = sauvegardes, monitoring, pas de gestion ops DB
- Free tier suffisant MVP (500 MB, largement suffisant pour résumés textuels + users)
- Évite de gérer PostgreSQL self-hosted sur le VPS (réduit charge ops solo dev)
- Upgrade Pro ($25/mois) si dépassement — signal positif de croissance

#### 5. Jobs asynchrones : BullMQ + Redis (self-hosted)

**Décision :** BullMQ + Redis sur le VPS, pas de service SaaS externe (Inngest/Trigger.dev).

**Justification :**
- Pipeline : email reçu → webhook → job enqueued → traitement background → LLM → DB
- Pas de timeout serverless à gérer (VPS = process long-running OK)
- Coût : 0€ (Redis sur le même VPS)
- Simplifie les dépendances externes

#### 6. Framework : Next.js App Router

**Décision :** Next.js avec App Router.

**Rejeté :** Astro (excellent pour sites content-only, pas adapté au dashboard interactif complexe pour un solo dev).

**Justification :**
- SSG natif pour pages marketing → Cloudflare cache globalement (SEO optimal)
- SSR pour pages dynamiques SEO
- React Server Components → HTML minimal envoyé au client
- SPA naturel pour dashboard authentifié (état partagé, routing client)
- `next/image` + Sharp sur VPS → optimisation images
- Un seul codebase pour solo dev = moins de charge cognitive

### Préoccupations Transversales Identifiées

1. **Auth/Authorization** : 3 rôles (free / paid / admin) avec enforcement strict des limites
2. **Abstraction LLM** : couche de switching providers (OpenAI ↔ Anthropic) + tracking coûts par user en temps réel
3. **Ingestion email** : pipeline asynchrone Cloudflare Email Routing → BullMQ → LLM → Supabase
4. **Internationalisation** : FR + EN sur toutes les surfaces utilisateur (next-intl ou similar)
5. **GDPR** : isolation données stricte par user, endpoint export, suppression complète en cascade
6. **Performance mobile** : Core Web Vitals, bundle splitting par route, lazy loading, Cloudflare CDN

### Architecture Stack Finale

```
VPS OVH (~10€/mois)
├── Caddy              → HTTPS automatique + reverse proxy
├── Next.js (App Router)
│   ├── SSG            → landing, pricing, blog (HTML statique)
│   ├── SSR            → pages SEO dynamiques
│   └── SPA            → dashboard authentifié (RSC + Client Components)
├── Redis              → BullMQ (jobs: email entrant → LLM → DB)
└── Docker Compose     → orchestration services

Supabase (free tier → upgrade si besoin)
└── PostgreSQL         → users, newsletters, summaries, categories, subscriptions

Cloudflare (gratuit)
├── CDN                → cache pages SSG + assets statiques
├── DNS
├── Email Routing      → réception newsletters → webhook Next.js
└── Protection DDoS

Services externes
├── Clerk              → auth (Google/Microsoft login pour identité)
├── Stripe             → abonnements récurrents (intégré Clerk)
├── OpenAI             → gpt-5-nano (primaire, reasoning: minimal)
└── Anthropic          → claude-haiku-3-5 (fallback) — couche d'abstraction multi-provider
```

---

## Starter Template

### Domaine Technologique Principal

Full-Stack Web Application — Next.js App Router (SSG + SSR + SPA hybride), identifié à partir de l'analyse des exigences projet.

### Options Évaluées

| Starter | Verdict | Raison |
|---|---|---|
| T3 Stack (`create-t3-app`) | ❌ Rejeté | Prisma + NextAuth → conflits avec Supabase client + Clerk |
| Vercel Supabase Starter | ❌ Rejeté | Supabase Auth → conflit avec Clerk, optimisé Vercel |
| next-supabase-stripe-starter | ❌ Rejeté | Supabase Auth à démonter, couplé Vercel |
| Bedrock / NextBase (payant) | ❌ Rejeté | Prisma + Vercel-focused, 149$ sans valeur ajoutée ici |
| OpenSaaS | ❌ Rejeté | Framework Wasp, trop opinionated |

**Conclusion :** Le stack Briefly (Clerk + Supabase client + BullMQ + VPS OVH) est suffisamment spécifique pour qu'aucun starter opinionated ne soit adapté sans travail de désassemblage. Le starter officiel vierge est le choix le plus sain.

### Starter Sélectionné : `create-next-app@latest` + `shadcn/ui`

**Justification :**
- Aucune couche auth concurrente à Clerk à retirer
- Aucun ORM en conflit avec le client Supabase
- TypeScript + Tailwind v4 + App Router + Turbopack activés par défaut
- shadcn/ui : composants Radix UI + Tailwind, bundle minimal, copy-paste, idéal solo dev
- Plein contrôle pour intégrer Clerk, Supabase, Stripe SDK, BullMQ proprement

### Commandes d'Initialisation

```bash
# 1. Créer le projet
npx create-next-app@latest briefly \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir

# 2. Ajouter shadcn/ui
cd briefly
npx shadcn@latest init
```

> **Note :** L'exécution de ces commandes constitue la première story d'implémentation.

### Décisions Architecturales Fournies par le Starter

**Langage & Runtime :** TypeScript strict, Node.js 20.9+

**Styling :** Tailwind CSS v4 — configuration CSS-first via `@theme`, détection automatique du contenu, pas de `tailwind.config.js`

**Build Tooling :** Turbopack (développement), Next.js build optimisé (production) — bundle splitting par route, `next/image`, Sharp

**Linting :** ESLint avec configuration Next.js opinionée

**Organisation du code :**
```
src/
├── app/                   # App Router (layouts, pages, route handlers)
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/               # Route Handlers (webhook email, Stripe, etc.)
├── components/
│   └── ui/                # shadcn/ui components (Button, Card, etc.)
└── lib/                   # Utilitaires partagés
```

**Composants UI :** shadcn/ui — composants Radix UI + Tailwind, alias `@/components/ui/`, indépendants et tree-shakeable

**Dev Experience :** Hot reload Turbopack, alias `@/*` → `./src/*`, TypeScript path resolution, React Compiler (optionnel)

### Choix LLM Finalisés

| Rôle | Modèle | Mode | Prix input | Prix input caché |
|---|---|---|---|---|
| **Primaire** | `gpt-5-nano` | reasoning: `minimal` | $0.05/1M | $0.005/1M |
| **Fallback** | `claude-haiku-3-5` | standard | $0.80/1M | — |
| **Premium (futur)** | `gpt-5-mini` | standard | $0.25/1M | $0.025/1M |

**Architecture de la couche LLM :**
```
LLMService (abstraction)
├── Provider: OpenAI   → gpt-5-nano, reasoning: minimal  (primary)
├── Provider: Anthropic → claude-haiku-3-5               (fallback)
├── Retry logic        → 3 tentatives (NFR)
├── Cost tracker       → tokens consommés par user → Supabase
└── Rate limiter       → plafond mensuel par tier (free / paid)
```

**Estimation coût réelle (20 newsletters/mois/user) :**
- ~35 000 tokens input + ~5 000 tokens output
- Avec `gpt-5-nano` + cache system prompt : **~0.002$/user/mois**
- Budget NFR (<0.5€/user/mois gratuit, <1.5€/user/mois payant) : largement respecté

---

## Décisions Architecturales Fondamentales

### Analyse de Priorité

**Décisions Critiques (bloquent l'implémentation) :**
- Enforcement des rôles : Hybride Clerk metadata + DB Supabase
- Rate limiting LLM : Redis local (protection coûts directe)
- Vérification signatures webhooks : tous endpoints entrants

**Décisions Importantes (structurent l'architecture) :**
- Accès données : Supabase client direct (pas d'ORM)
- State management : TanStack Query + `useState`
- Error handling : JSON standardisé + `apiResponse()`
- Monitoring : Sentry + Pino

**Décisions Différées (post-MVP) :**
- Caching applicatif avancé (Redis) : uniquement si perf mesurée insuffisante
- Option résumé "premium" (gpt-5-mini) : si différenciateur produit validé

### Architecture des Données

- **Accès DB :** Supabase client direct — query builder natif, RLS intégrée, zéro dépendance ORM
- **Validation :** Zod — schemas partagés client/serveur, validation webhooks et inputs API
- **Migrations :** Supabase CLI — fichiers SQL versionnés dans `supabase/migrations/`
- **Caching :** Redis local (VPS OVH) — déjà présent pour BullMQ, doublé en cache applicatif si besoin

### Authentification & Sécurité

- **Enforcement rôles :** Hybride — Clerk Edge Middleware pour routing (zéro DB call), Supabase DB pour limites métier fines (newsletters count, feature gates)
- **Sync rôles :** Stripe webhook → update DB `users.tier` + Clerk `publicMetadata.tier`
- **Rate limiting :** Double couche — Caddy (flood/DDoS réseau) + Redis local dans Route Handlers critiques (quota LLM par user/mois)
- **Sécurité webhooks :** Signature verification obligatoire sur tous les endpoints entrants
  - Stripe : `stripe.webhooks.constructEvent()`
  - Cloudflare Email Routing : header secret partagé
  - Clerk : vérification signature Svix

### API & Communication

- **Pattern :** Route Handlers Next.js App Router (REST)
- **Error handling :** Format JSON uniforme via helper `apiResponse()`

```ts
// Succès : { data: {...}, error: null }
// Erreur  : { data: null, error: { code: "UNAUTHORIZED", message: "..." } }
```

- **Communication interne :** Next.js → BullMQ via enqueue direct (même process VPS)

### Architecture Frontend

- **Data fetching côté client :** TanStack Query — cache, invalidation, polling statut jobs (traitement email en cours)
- **État UI local :** `useState` React — filtres, sélections, modals
- **Stratégie :** RSC pour toutes les pages rendues serveur, TanStack Query uniquement pour les données dynamiques post-auth

### Infrastructure & Déploiement

- **CI/CD :** GitHub Actions + Kamal — lint → build → test → deploy sur push `main` vers VPS OVH
- **Monitoring erreurs :** Sentry (free tier) — capture exceptions runtime, alertes LLM failures, jobs BullMQ ratés
- **Logging :** Pino — logs JSON structurés, légers, compatibles VPS

### Séquence d'Implémentation Recommandée

1. Init projet (`create-next-app` + shadcn/ui)
2. Configuration Clerk (middleware + routes protégées)
3. Configuration Supabase (client + migrations initiales)
4. Pipeline email (Cloudflare Email Routing → webhook → BullMQ)
5. Couche LLM (LLMService + gpt-5-nano + fallback)
6. Intégration Stripe (abonnements + webhooks sync rôles)
7. Dashboard (TanStack Query + composants shadcn/ui)
8. CI/CD (GitHub Actions + Kamal)
9. Monitoring (Sentry + Pino)

---

## Patterns d'Implémentation & Règles de Cohérence

### Points de Friction Identifiés : 7 zones à risque de conflits entre agents

### Conventions de Nommage

**Base de données (PostgreSQL/Supabase) :**
- Tables : `snake_case` pluriel → `users`, `newsletters`, `summaries`, `categories`, `subscriptions`
- Colonnes : `snake_case` → `user_id`, `created_at`, `is_active`
- Clés étrangères : `{table_singulier}_id` → `user_id`, `newsletter_id`
- Index : `idx_{table}_{colonne}` → `idx_summaries_user_id`

**API & JSON :**
- Champs JSON : `camelCase` côté JS/TS → `userId`, `createdAt`, `isActive`
- Endpoints REST : kebab-case pluriel → `/api/newsletters`, `/api/summaries`
- Paramètres query : camelCase → `?userId=`, `?pageSize=`
- Mapping : types Supabase générés (`snake_case`) → types applicatifs (`camelCase`) dans la couche service

**Code TypeScript :**
- Variables/fonctions : `camelCase` → `getUserSummaries`, `newsletterId`
- Composants React : `PascalCase` → `SummaryCard`, `NewsletterList`
- Fichiers composants : `PascalCase.tsx` → `SummaryCard.tsx`
- Fichiers utilitaires/services : `camelCase.ts` → `llmService.ts`, `apiResponse.ts`
- Types/Interfaces : `PascalCase` → `UserSummary`, `Newsletter`
- Constantes : `SCREAMING_SNAKE_CASE` → `MAX_NEWSLETTERS_FREE`

**Jobs BullMQ :**
- Convention : `domaine.action` → `email.process`, `summary.generate`, `summary.retry`

### Patterns de Structure

**Organisation des fichiers :**
```
src/
├── app/                        # App Router Next.js
│   ├── (marketing)/            # Route Group pages publiques (SSG)
│   ├── (dashboard)/            # Route Group dashboard authentifié
│   │   └── [feature]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   └── api/                    # Route Handlers
│       ├── webhooks/
│       │   ├── email/route.ts
│       │   ├── stripe/route.ts
│       │   └── clerk/route.ts
│       └── [feature]/route.ts
├── features/                   # Domaines métier
│   ├── newsletter/
│   │   ├── newsletter.service.ts
│   │   ├── newsletter.types.ts
│   │   ├── newsletter.service.test.ts
│   │   └── components/
│   ├── summary/
│   ├── billing/
│   ├── auth/
│   └── admin/
├── components/
│   └── ui/                     # shadcn/ui uniquement
├── lib/
│   ├── supabase/               # Client Supabase + types générés
│   ├── llm/                    # LLMService (abstraction multi-provider)
│   ├── queue/                  # BullMQ workers + job definitions
│   └── utils/                  # Helpers partagés (apiResponse, etc.)
└── types/                      # Types globaux partagés
```

**Tests :** Co-localisés avec le fichier source — `*.test.ts` / `*.test.tsx`

### Patterns de Format

**Réponse API (via `apiResponse()`) :**
```ts
// Succès
{ data: { userId: "...", summaries: [...] }, error: null }

// Erreur
{ data: null, error: { code: "UNAUTHORIZED", message: "Accès refusé" } }
```

**Codes d'erreur standardisés :** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`

**Dates :** ISO 8601 strings dans toutes les APIs (`"2026-02-18T10:30:00Z"`), formatage client via `Intl.DateTimeFormat`

**Variables d'environnement :**
- Client : `NEXT_PUBLIC_*` obligatoire
- Serveur : `SERVICE_VARIABLE` (ex: `CLERK_SECRET_KEY`, `OPENAI_API_KEY`)

### Patterns de Communication

**Jobs BullMQ — payload standard :**
```ts
{ jobId: string, userId: string, payload: {...}, createdAt: string }
```

**Events nommage :** `domaine.action` → `email.process`, `summary.generate`

### Patterns de Process

**Error Boundaries :** `error.tsx` par route App Router + root error boundary globale

**Loading States :** `loading.tsx` App Router (navigation) + `isLoading`/`isPending` TanStack Query (fetches client). États locaux uniquement, pas de spinner global.

**Validation :** Zod à la frontière système (Route Handlers, webhooks). Pas de validation redondante dans les services internes.

**Auth checks :** Clerk middleware pour les routes (Edge), `auth()` Clerk dans les Server Components pour les données user-specific.

### Règles Obligatoires pour Tous les Agents

1. **Toujours** utiliser `apiResponse()` dans les Route Handlers
2. **Toujours** vérifier la signature des webhooks avant tout traitement
3. **Toujours** nommer les jobs BullMQ en `domaine.action`
4. **Jamais** exposer de données d'un autre user (RLS Supabase + vérification `userId`)
5. **Jamais** appeler le LLM directement depuis un Route Handler (passer par BullMQ)
6. **Toujours** logger avec Pino, jamais `console.log` en production

---

## Structure Projet & Frontières

> **Note :** Les Route Groups Next.js `(marketing)`, `(dashboard)`, `(admin)` sont des conventions d'organisation fichiers uniquement — ils n'apparaissent **jamais** dans les URLs.

### Arborescence Complète

```
briefly/
├── .github/
│   └── workflows/
│       └── ci.yml                         # GitHub Actions: lint → build → test → deploy (Kamal)
├── .gitignore
├── .env.local                             # Variables locales (non commitées)
├── .env.example                           # Template (commité)
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                        # shadcn/ui config
├── config/
│   └── kamal.yml                          # Config déploiement VPS OVH
├── docker/
│   ├── docker-compose.yml                 # Services: Next.js + Redis + Caddy
│   └── Caddyfile                          # Reverse proxy config
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql         # users, sessions
│   │   ├── 002_newsletters.sql
│   │   ├── 003_summaries.sql
│   │   ├── 004_categories.sql
│   │   └── 005_subscriptions.sql
│   └── seed.sql
├── public/
│   ├── icons/
│   ├── images/
│   └── locales/
│       ├── fr/common.json
│       └── en/common.json
└── src/
    ├── middleware.ts                       # Clerk Edge Middleware (protection routes)
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx                     # Root layout + providers (Clerk, TanStack Query)
    │   ├── error.tsx                      # Global error boundary
    │   ├── not-found.tsx
    │   ├── (marketing)/                   # SSG — pages publiques (URLs: /, /pricing, /blog/...)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx                   # Landing page (FR64-70)
    │   │   ├── pricing/page.tsx
    │   │   ├── blog/
    │   │   │   ├── page.tsx
    │   │   │   └── [slug]/page.tsx
    │   │   └── legal/
    │   │       ├── privacy/page.tsx
    │   │       └── terms/page.tsx
    │   ├── (auth)/                        # Clerk hosted UI (URLs: /sign-in, /sign-up)
    │   │   ├── sign-in/[[...sign-in]]/page.tsx
    │   │   └── sign-up/[[...sign-up]]/page.tsx
    │   ├── (dashboard)/                   # SPA authentifiée (URLs: /summaries, /newsletters...)
    │   │   ├── layout.tsx                 # Nav + sidebar
    │   │   ├── summaries/
    │   │   │   ├── page.tsx               # Liste résumés + filtres (FR25-35)
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── newsletters/
    │   │   │   ├── page.tsx               # Config newsletters (FR8-15)
    │   │   │   ├── loading.tsx
    │   │   │   └── error.tsx
    │   │   ├── categories/
    │   │   │   ├── page.tsx               # Catégories custom (FR36-40)
    │   │   │   └── loading.tsx
    │   │   ├── settings/
    │   │   │   └── page.tsx               # Compte + export RGPD + suppression (FR1-7)
    │   │   └── billing/
    │   │       └── page.tsx               # Abonnement + portail Stripe (FR41-49)
    │   ├── (admin)/                       # Admin (URL: /admin — role admin uniquement)
    │   │   ├── layout.tsx                 # Guard rôle admin
    │   │   └── admin/
    │   │       ├── page.tsx               # Dashboard métriques (FR50-59)
    │   │       ├── users/page.tsx
    │   │       ├── costs/page.tsx
    │   │       └── support/page.tsx       # Tickets (FR60-63)
    │   └── api/
    │       ├── webhooks/
    │       │   ├── email/route.ts         # Cloudflare → BullMQ (email.process)
    │       │   ├── stripe/route.ts        # Sync rôles + abonnements
    │       │   └── clerk/route.ts         # Sync users
    │       ├── newsletters/route.ts
    │       ├── summaries/route.ts
    │       ├── categories/route.ts
    │       └── admin/route.ts
    ├── features/
    │   ├── auth/
    │   │   ├── auth.types.ts
    │   │   ├── auth.utils.ts              # isAdmin(), isPaid(), getRole()
    │   │   ├── auth.utils.test.ts
    │   │   └── components/UserMenu.tsx
    │   ├── newsletter/
    │   │   ├── newsletter.service.ts      # CRUD + adresse @mail.briefly.app
    │   │   ├── newsletter.types.ts
    │   │   ├── newsletter.service.test.ts
    │   │   └── components/
    │   │       ├── NewsletterList.tsx
    │   │       ├── NewsletterCard.tsx
    │   │       └── AddNewsletterForm.tsx
    │   ├── summary/
    │   │   ├── summary.service.ts         # Lecture + filtres (FR25-35)
    │   │   ├── summary.types.ts
    │   │   ├── summary.service.test.ts
    │   │   └── components/
    │   │       ├── SummaryList.tsx
    │   │       ├── SummaryCard.tsx
    │   │       ├── SummaryFilters.tsx
    │   │       └── SummaryDetail.tsx
    │   ├── category/
    │   │   ├── category.service.ts
    │   │   ├── category.types.ts
    │   │   ├── category.service.test.ts
    │   │   └── components/
    │   │       ├── CategoryList.tsx
    │   │       └── CategoryForm.tsx
    │   ├── billing/
    │   │   ├── billing.service.ts
    │   │   ├── billing.types.ts
    │   │   ├── billing.service.test.ts
    │   │   └── components/
    │   │       ├── PricingTable.tsx
    │   │       └── BillingPortalButton.tsx
    │   ├── admin/
    │   │   ├── admin.service.ts
    │   │   ├── admin.types.ts
    │   │   └── components/
    │   │       ├── UsersTable.tsx
    │   │       ├── CostsDashboard.tsx
    │   │       └── SystemMetrics.tsx
    │   └── support/
    │       ├── support.service.ts
    │       ├── support.types.ts
    │       └── components/SupportForm.tsx
    ├── components/
    │   └── ui/                            # shadcn/ui uniquement
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts                  # Client browser
    │   │   ├── server.ts                  # Client RSC/Server Actions
    │   │   └── types.ts                   # Types générés (supabase gen types)
    │   ├── llm/
    │   │   ├── llmService.ts              # Abstraction multi-provider + retry
    │   │   ├── llmService.test.ts
    │   │   ├── providers/
    │   │   │   ├── openai.provider.ts     # gpt-5-nano, reasoning: minimal
    │   │   │   └── anthropic.provider.ts  # claude-haiku-3-5 (fallback)
    │   │   └── costTracker.ts             # Tokens/coûts → Supabase par user
    │   ├── queue/
    │   │   ├── bullmq.client.ts
    │   │   ├── workers/
    │   │   │   ├── email.worker.ts        # Job: email.process
    │   │   │   └── summary.worker.ts      # Job: summary.generate
    │   │   └── jobs/
    │   │       ├── email.job.ts
    │   │       └── summary.job.ts
    │   ├── rate-limit/
    │   │   └── rateLimiter.ts             # Redis sliding window par user
    │   └── utils/
    │       ├── apiResponse.ts
    │       ├── apiResponse.test.ts
    │       └── logger.ts                  # Pino
    └── types/
        └── index.ts
```

### Mapping FR → Structure

| Domaine FR | Fichiers principaux |
|---|---|
| Auth & RGPD (FR1-7) | `features/auth/`, `middleware.ts`, `(dashboard)/settings/` |
| Config newsletters (FR8-15) | `features/newsletter/`, `(dashboard)/newsletters/`, `api/newsletters/` |
| Moteur IA (FR16-24) | `lib/llm/`, `lib/queue/`, `api/webhooks/email/` |
| Lecture résumés (FR25-31) | `features/summary/`, `(dashboard)/summaries/` |
| Filtrage (FR32-35) | `features/summary/components/SummaryFilters.tsx` |
| Catégories custom (FR36-40) | `features/category/`, `(dashboard)/categories/` |
| Paiements Stripe (FR41-49) | `features/billing/`, `api/webhooks/stripe/` |
| Admin Dashboard (FR50-59) | `features/admin/`, `(admin)/admin/` |
| Support (FR60-63) | `features/support/`, `(admin)/admin/support/` |
| SEO/Public (FR64-70) | `(marketing)/` |
| Responsive/A11y (FR71-76) | Transversal — shadcn/ui (WCAG natif) + Tailwind |

### Flux de Données Principal

```
Email newsletter reçu
  → Cloudflare Email Routing
  → POST /api/webhooks/email          (vérif. header secret CF)
  → BullMQ enqueue: email.process
  → email.worker.ts → parse contenu
  → BullMQ enqueue: summary.generate
  → summary.worker.ts → llmService.ts → gpt-5-nano (reasoning: minimal)
  → costTracker.ts → Supabase (tokens consommés par user)
  → Supabase INSERT summaries
  → TanStack Query invalidation → UI mise à jour
```

### Frontières d'Intégration

| Frontière | Règle |
|---|---|
| **Auth** | `middleware.ts` protège `(dashboard)` et `(admin)` — aucune exception |
| **LLM** | Appels uniquement via `lib/llm/llmService.ts` — jamais depuis Route Handlers |
| **DB** | Accès uniquement via `lib/supabase/server.ts` ou `client.ts` — jamais direct |
| **Queue** | Jobs uniquement via `lib/queue/bullmq.client.ts` |
| **Webhooks** | Signature vérifiée avant tout traitement — rejet 401 sinon |

---

## Résultats de Validation de l'Architecture

### Validation de Cohérence ✅

**Compatibilité des décisions :** Toutes les technologies s'assemblent sans conflit — Clerk (identité) et Supabase (DB) ne se chevauchent pas, BullMQ tourne sans timeout sur VPS OVH, TanStack Query v5 est pleinement compatible avec App Router, Kamal déploie sur tout VPS Linux.

**Cohérence des patterns :** camelCase/snake_case mapping clair, organisation par feature alignée avec les 11 domaines FR, conventions BullMQ et API uniformes.

**Alignement structure :** Route Groups Next.js bien utilisés (invisibles en URL), frontières LLM/DB/Queue clairement définies.

### Couverture des Exigences ✅

11/11 domaines FR couverts. Tous les NFR adressés architecturalement.

| Domaine FR | Couvert par | Statut |
|---|---|---|
| Auth/RGPD (FR1-7) | Clerk + settings page + RLS Supabase | ✅ |
| Config newsletters (FR8-15) | feature/newsletter + email dédié | ✅ |
| Moteur IA (FR16-24) | lib/llm + lib/queue + workers | ✅ |
| Lecture résumés (FR25-31) | feature/summary | ✅ |
| Filtrage (FR32-35) | SummaryFilters.tsx | ✅ |
| Catégories (FR36-40) | feature/category | ✅ |
| Paiements (FR41-49) | feature/billing + webhooks/stripe | ✅ |
| Admin (FR50-59) | feature/admin + route group (admin) | ✅ |
| Support (FR60-63) | feature/support | ✅ |
| SEO/Public (FR64-70) | (marketing) SSG + Cloudflare CDN | ✅ |
| Responsive/A11y (FR71-76) | shadcn/ui WCAG 2.1 AA + Tailwind | ✅ |

### Gaps Identifiés et Résolus

| Gap | Décision |
|---|---|
| Bibliothèque i18n (FR+EN MVP) | **`next-intl`** — App Router natif, RSC-compatible |
| Framework de tests | **Vitest** — ESM natif, Turbopack-compatible, config minimale |

### Stack Final Complet

```
Frontend & Framework
├── Next.js (App Router) — TypeScript, Turbopack
├── Tailwind CSS v4
├── shadcn/ui (Radix UI + Tailwind)
├── TanStack Query v5
└── next-intl (i18n FR + EN)

Backend & Infrastructure (VPS OVH)
├── Caddy (reverse proxy + TLS auto)
├── BullMQ + Redis (jobs asynchrones)
└── Docker Compose + Kamal (déploiement)

Data & Auth
├── Supabase (PostgreSQL managé)
├── Clerk (auth Google/Microsoft OAuth)
└── Zod (validation)

Services Externes
├── Stripe (abonnements + webhooks)
├── Cloudflare (CDN + Email Routing + DNS + DDoS)
├── OpenAI gpt-5-nano reasoning:minimal (LLM primaire)
└── Anthropic claude-haiku-3-5 (LLM fallback)

Observabilité & Qualité
├── Sentry (monitoring erreurs)
├── Pino (logging structuré)
└── Vitest (tests unitaires co-localisés)
```

### Checklist de Complétude

**✅ Analyse du Contexte**
- [x] Contexte projet analysé (76 FR, 11 domaines)
- [x] Échelle et complexité évaluées (solo dev, 500 users MVP)
- [x] Contraintes techniques identifiées
- [x] Préoccupations transversales mappées (RGPD, i18n, perf, sécurité)

**✅ Décisions Architecturales**
- [x] Stack complet décidé avec versions vérifiées
- [x] 6 décisions majeures documentées avec justifications
- [x] Patterns d'intégration définis
- [x] Coûts LLM validés (~0.002$/user/mois)

**✅ Patterns d'Implémentation**
- [x] Conventions de nommage établies (7 zones couvertes)
- [x] Patterns de structure définis
- [x] Patterns de communication spécifiés (BullMQ, API)
- [x] Règles obligatoires agents documentées (6 règles)

**✅ Structure Projet**
- [x] Arborescence complète définie
- [x] Frontières d'intégration établies (5 frontières)
- [x] Mapping FR → fichiers complet (11 domaines)
- [x] Flux de données principal documenté

### Évaluation de Maturité

**Statut global : PRÊT POUR L'IMPLÉMENTATION**

**Niveau de confiance : Élevé**

**Points forts :**
- Stack minimaliste et cohérent pour un solo dev (zéro sur-ingénierie)
- Coûts opérationnels maîtrisés (~10€/mois VPS + 0€ tiers gratuits)
- Coûts LLM très en dessous des budgets NFR (~0.002$/user/mois)
- Pas de dépendances circulaires entre features
- RGPD adressé architecturalement (RLS Supabase + isolation stricte par user)

**À surveiller post-MVP :**
- Montée en charge Redis (BullMQ) si volume emails explose
- Upgrade Supabase free → Pro si 500 MB atteint
- Activation cache Redis applicatif si latence mesurée insuffisante

### Première Action d'Implémentation

```bash
npx create-next-app@latest briefly \
  --typescript --tailwind --eslint --app --src-dir
cd briefly && npx shadcn@latest init
```
