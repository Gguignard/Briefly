---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
sharded: true
status: complete
---

# Briefly - Epic Breakdown

## Overview

Ce document fournit la décomposition complète en épics et stories pour **Briefly**, en décomposant les exigences du PRD, de la spécification UX et de l'Architecture en stories implémentables.

Les exigences complètes sont dans [requirements.md](./requirements.md).

Chaque épic est dans son propre dossier avec un fichier par story, contenant des détails d'implémentation complets (code TypeScript, fichiers, patterns, DoD, Dev Agent Record).

---

## FR Coverage Map

FR1: Epic 3 — Création de compte OAuth Gmail
FR2: Epic 3 — Création de compte OAuth Outlook
FR3: Epic 3 — Connexion sécurisée au compte
FR4: Epic 3 — Déconnexion du compte
FR5: Epic 3 — Révocation et reconnexion OAuth
FR6: Epic 3 — Consultation des paramètres de compte
FR7: Epic 3 — Sessions JWT sécurisées
FR8: Epic 4 — Ajout manuel de newsletters
FR9: Epic 4 — Liste des newsletters configurées
FR10: Epic 4 — Modification des newsletters configurées
FR11: Epic 4 — Suppression de newsletters
FR12: Epic 4 — Validation format email newsletter
FR13: Epic 4 — Détection doublons newsletters
FR14: Epic 4 — Limite 5 newsletters tier gratuit
FR15: Epic 4 — Newsletters illimitées tier payant
FR16: Epic 4 — Détection automatique nouvelles newsletters
FR17: Epic 5 — Génération résumé LLM basique
FR18: Epic 5 — Génération résumé LLM premium
FR19: Epic 5 — 1 résumé premium/jour pour gratuit, reste basique
FR20: Epic 5 — Tous résumés premium pour payant
FR21: Epic 5 — Format structuré (texte + bullet points)
FR22: Epic 5 — Longueur résumé adaptée (respect limite tokens)
FR23: Epic 5 — Génération on-demand dans cibles performance
FR24: Epic 5 — Premiers résumés disponibles J+1
FR25: Epic 6 — Feed chronologique de résumés
FR26: Epic 6 — Lecture résumés individuels en cards
FR27: Epic 6 — Accès newsletter originale complète
FR28: Epic 6 — Badge LLM (basique vs premium)
FR29: Epic 6 — Titre newsletter et date de réception
FR30: Epic 6 — Historique complet de résumés (rétention illimitée)
FR31: Epic 6 — Navigation chronologique dans l'historique
FR32: Epic 6 — Filtrage par newsletter spécifique
FR33: Epic 6 — Feed unifié toutes newsletters (vue par défaut)
FR34: Epic 8 — Filtrage par catégories personnalisées (payant)
FR35: Epic 6 — Basculer entre vues filtrées
FR36: Epic 8 — Création catégories illimitées (payant)
FR37: Epic 8 — Assignation newsletters à catégories
FR38: Epic 8 — Modification noms et assignations catégories
FR39: Epic 8 — Suppression catégories
FR40: Epic 8 — Absence fonctionnalité catégorisation pour gratuit
FR41: Epic 7 — Vue tiers d'abonnement (gratuit vs payant)
FR42: Epic 7 — Upgrade tier gratuit → payant
FR43: Epic 7 — Finalisation paiement via Stripe
FR44: Epic 7 — Gestion abonnement (statut, paiement, factures)
FR45: Epic 7 — Annulation abonnement payant
FR46: Epic 7 — Mise à jour moyen de paiement
FR47: Epic 7 — Traitement paiements récurrents Stripe
FR48: Epic 7 — Gestion webhooks Stripe (cycle de vie abonnements)
FR49: Epic 7 — Enforcement limites par tier d'abonnement
FR50: Epic 9 — Comptage utilisateurs actifs et payants
FR51: Epic 9 — MRR (Monthly Recurring Revenue)
FR52: Epic 9 — Coûts LLM agrégés et par utilisateur
FR53: Epic 9 — Métriques funnel de conversion
FR54: Epic 9 — Configuration providers LLM (switch GPT ↔ Claude)
FR55: Epic 9 — Limites tokens par résumé (contrôle coûts)
FR56: Epic 9 — Alertes automatiques anomalies de coûts
FR57: Epic 9 — Logs détaillés utilisateurs (OAuth, erreurs, usage)
FR58: Epic 9 — Soumissions formulaire contact support
FR59: Epic 9 — Actions manuelles admin (reset OAuth, remboursement)
FR60: Epic 10 — Formulaire contact support (email, sujet, description)
FR61: Epic 10 — Upload screenshot optionnel demande support
FR62: Epic 10 — Accès logs d'activité utilisateurs pour debug admin
FR63: Epic 10 — Notifications demandes support vers inbox admin
FR64: Epic 2 — Landing page optimisée (valeur proposition Briefly)
FR65: Epic 2 — Page pricing (gratuit vs payant)
FR66: Epic 2 — Pages marketing multilingues (FR + EN)
FR67: Epic 2 — Inscription depuis la landing page
FR68: Epic 2 — Métadonnées SEO optimales (titres, descriptions, données structurées)
FR69: Epic 2 — Sitemap XML pour moteurs de recherche
FR70: Epic 2 — Pages marketing servies en SSR/SSG
FR71: Epic 1/Transversal — Accès mobile (320px-767px) — toutes fonctionnalités
FR72: Epic 1/Transversal — Accès tablette (768px-1023px) — toutes fonctionnalités
FR73: Epic 1/Transversal — Accès desktop (1024px+) — toutes fonctionnalités
FR74: Epic 1/Transversal — Navigation clavier complète
FR75: Epic 1/Transversal — Compatibilité lecteurs d'écran
FR76: Epic 1/Transversal — Conformité WCAG 2.1 Level AA

---

## Epic List

| Epic | Dossier | FRs couverts | Stories | Points | Effort |
|---|---|---|---|---|---|
| Epic 1 : Fondations du Projet & Infrastructure | [epic-01-foundations/](./epic-01-foundations/) | FR71-76 | 6 | 13 pts | ~3.5 days |
| Epic 2 : Pages Publiques & Acquisition SEO | [epic-02-public-pages/](./epic-02-public-pages/) | FR64-70 | 5 | 8 pts | ~2.25 days |
| Epic 3 : Authentification & Gestion de Compte | [epic-03-auth/](./epic-03-auth/) | FR1-7 | 6 | 9 pts | ~2.5 days |
| Epic 4 : Configuration Newsletters & Ingestion Email | [epic-04-newsletters/](./epic-04-newsletters/) | FR8-16 | 6 | 14 pts | ~4.25 days |
| Epic 5 : Moteur de Résumés IA | [epic-05-llm/](./epic-05-llm/) | FR17-24 | 5 | 11 pts | ~3.25 days |
| Epic 6 : Interface de Lecture & Feed de Résumés | [epic-06-feed/](./epic-06-feed/) | FR25-33, FR35 | 5 | 10 pts | ~2.75 days |
| Epic 7 : Abonnement & Monétisation Freemium | [epic-07-billing/](./epic-07-billing/) | FR41-49 | 5 | 12 pts | ~3.75 days |
| Epic 8 : Catégorisation Personnalisée | [epic-08-categories/](./epic-08-categories/) | FR34, FR36-40 | 4 | 7 pts | ~1.75 days |
| Epic 9 : Dashboard Admin & Contrôle Opérationnel | [epic-09-admin/](./epic-09-admin/) | FR50-59 | 5 | 9 pts | ~2.5 days |
| Epic 10 : Support Utilisateur | [epic-10-support/](./epic-10-support/) | FR60-63 | 4 | 6 pts | ~1.5 days |

**Total :** 51 stories · 99 points · ~27.75 days

---

## Ordre d'implémentation recommandé

```
Epic 1 (Fondations) → Epic 3 (Auth) → Epic 4 (Newsletters) → Epic 5 (LLM)
→ Epic 6 (Feed) → Epic 2 (Public Pages) → Epic 7 (Billing)
→ Epic 8 (Categories) → Epic 9 (Admin) → Epic 10 (Support)
```

Les dépendances critiques :
- **Epic 1** est un prérequis pour tout
- **Epic 3** (Auth) doit précéder toutes les features utilisateur
- **Epic 4** (Newsletters) → **Epic 5** (LLM) → **Epic 6** (Feed) : pipeline séquentiel
- **Epic 7** (Billing) nécessite Epic 3 et optionnellement Epic 6
