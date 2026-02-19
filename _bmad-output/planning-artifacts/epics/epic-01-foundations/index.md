# Epic 1 : Fondations du Projet & Infrastructure

**Statut :** Prêt pour développement
**FRs couverts :** FR71-76 (transversaux — responsive + accessibilité WCAG 2.1 AA)
**NFRs couverts :** NFR-S5, NFR-R7, NFR-R11-13, NFR-SC4-5, NFR-A1-13, NFR-U5-7, NFR-U14-16

## Objectif

Les développeurs disposent d'un projet Next.js configuré avec shadcn/ui, déployé sur VPS OVH via Docker Compose et Kamal, avec CI/CD GitHub Actions, monitoring Sentry/Pino, i18n next-intl (FR+EN), et base Supabase PostgreSQL opérationnelle — socle technique sur lequel tous les autres épics s'appuient.

## Stories

| Story | Titre | Priorité | Complexité |
|---|---|---|---|
| [1.1](./story-1.1-nextjs-setup.md) | Initialisation Next.js + shadcn/ui | P0 | Low (2 pts) |
| [1.2](./story-1.2-supabase-setup.md) | Configuration Supabase + schéma initial | P0 | Low (2 pts) |
| [1.3](./story-1.3-vps-infrastructure.md) | Infrastructure VPS + Docker Compose + Caddy | P0 | Medium (3 pts) |
| [1.4](./story-1.4-cicd-pipeline.md) | Pipeline CI/CD GitHub Actions + Kamal | P0 | Medium (3 pts) |
| [1.5](./story-1.5-i18n.md) | Internationalisation next-intl (FR + EN) | P1 | Low (2 pts) |
| [1.6](./story-1.6-monitoring.md) | Monitoring Sentry + Logging Pino | P1 | Low (2 pts) |
