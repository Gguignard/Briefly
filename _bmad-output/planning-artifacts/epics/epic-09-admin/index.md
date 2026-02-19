# Epic 9 : Dashboard Admin & Contrôle Opérationnel

**Epic ID :** epic-09-admin
**Priority :** P2 (Medium)
**Domain :** Operations, Monitoring

---

## Objectif

Fournir un dashboard d'administration pour surveiller l'activité, gérer les utilisateurs, visualiser les métriques de coûts LLM, et contrôler les queues BullMQ.

---

## Stories

| Story | Titre | Priority | Complexity | Effort |
|-------|-------|----------|------------|--------|
| [9.1](./story-9.1-admin-auth.md) | Accès admin sécurisé (rôle Clerk) | P2 | Low (1 pt) | 0.25 day |
| [9.2](./story-9.2-metrics-dashboard.md) | Dashboard métriques (users, coûts, résumés) | P2 | Medium (3 pts) | 1 day |
| [9.3](./story-9.3-bull-board.md) | Bull Board : monitoring des queues | P2 | Low (2 pts) | 0.5 day |
| [9.4](./story-9.4-user-management.md) | Gestion manuelle des utilisateurs | P2 | Low (2 pts) | 0.5 day |
| [9.5](./story-9.5-feature-flags.md) | Feature flags simples (env vars) | P2 | Low (1 pt) | 0.25 day |

**Total :** 9 pts, ~2.5 days

---

## FRs couverts

- FR50 : Dashboard admin accessible uniquement aux admins (role Clerk)
- FR51 : Métriques : nombre d'utilisateurs actifs, résumés générés/jour
- FR52 : Métriques de coûts LLM par provider et par tier
- FR53 : État des queues BullMQ (Bull Board)
- FR54 : Forcer upgrade/downgrade d'un utilisateur manuellement
- FR55 : Bloquer un utilisateur (suspendre le traitement)
- FR56 : Voir les logs d'erreurs récents
- FR57 : Voir les résumés d'un utilisateur spécifique
- FR58 : Export CSV des métriques
- FR59 : Feature flags pour activer/désactiver des features
