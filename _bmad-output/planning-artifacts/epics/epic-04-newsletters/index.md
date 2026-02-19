# Epic 4 : Configuration des Newsletters & Ingestion Email

**Epic ID :** epic-04-newsletters
**Priority :** P0 (Critical)
**Domain :** Email Ingestion, Newsletter Management

---

## Objectif

Permettre aux utilisateurs d'ajouter des newsletters à Briefly via une adresse email dédiée `{uuid}@mail.briefly.app`, et de gérer leur liste de newsletters (ajout, suppression, activation). Mettre en place le pipeline d'ingestion email : Cloudflare Email Routing → webhook → BullMQ.

---

## Stories

| Story | Titre | Priority | Complexity | Effort |
|-------|-------|----------|------------|--------|
| [4.1](./story-4.1-newsletter-inbox.md) | Adresse email dédiée par utilisateur | P0 | Medium (3 pts) | 1 day |
| [4.2](./story-4.2-newsletter-crud.md) | CRUD newsletters (ajout / suppression / activation) | P0 | Low (2 pts) | 0.5 day |
| [4.3](./story-4.3-email-webhook.md) | Webhook d'ingestion email Cloudflare | P0 | Medium (3 pts) | 1 day |
| [4.4](./story-4.4-bullmq-queue.md) | Pipeline BullMQ : queue email.process | P0 | Medium (3 pts) | 1 day |
| [4.5](./story-4.5-newsletter-limit.md) | Enforcement limite 5 newsletters (tier gratuit) | P1 | Low (1 pt) | 0.25 day |
| [4.6](./story-4.6-newsletter-list-ui.md) | Interface liste des newsletters | P1 | Low (2 pts) | 0.5 day |

**Total :** 14 pts, ~4.25 days

---

## FRs couverts

- FR8 : Email dédié `{uuid}@mail.briefly.app` généré à l'inscription
- FR9 : Forwarding newsletter vers l'adresse dédiée
- FR10 : Webhook `/api/webhooks/email` reçoit les emails entrants
- FR11 : Validation HMAC des webhooks Cloudflare
- FR12 : Ajout de newsletter via dashboard
- FR13 : Suppression de newsletter
- FR14 : Activation/désactivation newsletter
- FR15 : Limite 5 newsletters pour le tier gratuit
- FR16 : Compteur newsletters actives visible dans l'UI

---

## Architecture

```
Cloudflare Email Routing
       ↓
{uuid}@mail.briefly.app
       ↓
POST /api/webhooks/email (HMAC validation)
       ↓
BullMQ Queue: email.process
       ↓
Worker: parse email → extract content
       ↓
BullMQ Queue: summary.generate (Epic 5)
```
