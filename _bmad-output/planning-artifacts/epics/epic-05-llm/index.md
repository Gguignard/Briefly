# Epic 5 : Moteur de Résumés IA

**Epic ID :** epic-05-llm
**Priority :** P0 (Critical)
**Domain :** AI Summarization, LLM Pipeline

---

## Objectif

Implémenter le moteur de génération de résumés par IA : service LLM abstrait (OpenAI + Anthropic), worker BullMQ `summary.generate`, système dual-tier (1 résumé premium/jour pour les gratuits, tous premium pour les payants), stockage des résumés, et contrôle des coûts.

---

## Stories

| Story | Titre | Priority | Complexity | Effort |
|-------|-------|----------|------------|--------|
| [5.1](./story-5.1-llm-service.md) | Service LLM abstrait (OpenAI + Anthropic) | P0 | Medium (3 pts) | 1 day |
| [5.2](./story-5.2-summary-worker.md) | Worker `summary.generate` | P0 | Medium (3 pts) | 1 day |
| [5.3](./story-5.3-dual-tier-llm.md) | Logique dual-tier : premium vs basic | P0 | Low (2 pts) | 0.5 day |
| [5.4](./story-5.4-summary-storage.md) | Stockage et rétention des résumés (90j) | P1 | Low (2 pts) | 0.5 day |
| [5.5](./story-5.5-cost-tracker.md) | Tracker de coûts LLM | P1 | Low (1 pt) | 0.25 day |

**Total :** 11 pts, ~3.25 days

---

## FRs couverts

- FR17 : Génération de résumé à la réception d'un email
- FR18 : Résumé en moins de 30 secondes (P95)
- FR19 : Résumé structuré : titre, points clés, lien source
- FR20 : Tier gratuit → 1 résumé premium/jour, reste en basic LLM
- FR21 : Tier payant → tous les résumés en LLM premium
- FR22 : Fallback : si OpenAI fail → Anthropic (retry x3)
- FR23 : Output max 800 tokens par résumé
- FR24 : Coût cible ≤ 0.5€/mois/utilisateur gratuit, ≤ 1.5€/mois/utilisateur payant

---

## Architecture

```
BullMQ: summary.generate job
         ↓
  LLMService.summarize()
  ├── Vérifier tier + quota daily premium
  ├── Sélectionner modèle (basic: gpt-5-nano / premium: claude-haiku-3-5)
  ├── Générer résumé (retry x3, fallback)
  └── Stocker dans summaries table
         ↓
  Notification (Epic 6)
```

---

## Modèles LLM utilisés

| Tier | Modèle principal | Fallback |
|------|-----------------|---------|
| Basic | OpenAI `gpt-5-nano` | Anthropic `claude-haiku-3-5` |
| Premium | Anthropic `claude-haiku-3-5` | OpenAI `gpt-5-nano` |
