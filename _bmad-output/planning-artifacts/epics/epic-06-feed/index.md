# Epic 6 : Interface de Lecture & Feed de Résumés

**Epic ID :** epic-06-feed
**Priority :** P0 (Critical)
**Domain :** User Interface, Reading Experience

---

## Objectif

Implémenter l'interface de lecture des résumés : feed quotidien en cards, détail d'un résumé, marquage comme lu, filtre par newsletter/catégorie, et navigation globale du dashboard.

---

## Stories

| Story | Titre | Priority | Complexity | Effort |
|-------|-------|----------|------------|--------|
| [6.1](./story-6.1-summaries-feed.md) | Feed quotidien des résumés (liste cards) | P0 | Medium (3 pts) | 1 day |
| [6.2](./story-6.2-summary-card.md) | Composant SummaryCard avec badges | P1 | Low (2 pts) | 0.5 day |
| [6.3](./story-6.3-summary-detail.md) | Page détail d'un résumé | P1 | Low (2 pts) | 0.5 day |
| [6.4](./story-6.4-mark-as-read.md) | Marquage résumé comme lu | P1 | Low (1 pt) | 0.25 day |
| [6.5](./story-6.5-dashboard-nav.md) | Navigation dashboard (sidebar + mobile) | P0 | Low (2 pts) | 0.5 day |

**Total :** 10 pts, ~2.75 days

---

## FRs couverts

- FR25 : Feed de résumés du jour (les plus récents en premier)
- FR26 : Card résumé : titre, source, points clés, badge LLM tier
- FR27 : Lien "Lire la newsletter complète" → URL source
- FR28 : Marquage lu/non-lu avec indicateur visuel
- FR29 : Filtre par newsletter
- FR30 : Filtre par catégorie (Epic 8)
- FR31 : Compteur de nouveaux résumés non-lus
- FR32 : État vide avec message encourageant
- FR33 : Infinite scroll ou pagination (voir PRD)
- FR35 : Navigation responsive (sidebar desktop, bottom bar mobile)

---

## Design

Basé sur les specs UX :
- Cards interface (pas de table)
- Anti-FOMO : pas de compteur anxiogène, message positif pour l'état vide
- Badge LLM : "Premium" (violet) vs "Basique" (discret, gris)
- Responsive : sidebar fixed desktop, drawer/bottom-nav mobile
