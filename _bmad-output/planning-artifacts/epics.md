---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Briefly - Epic Breakdown

## Overview

Ce document fournit la décomposition complète en épics et stories pour **Briefly**, en décomposant les exigences du PRD, de la spécification UX et de l'Architecture en stories implémentables.

## Requirements Inventory

### Functional Requirements

FR1: Les utilisateurs peuvent créer un compte via OAuth 2.0 avec Gmail
FR2: Les utilisateurs peuvent créer un compte via OAuth 2.0 avec Outlook
FR3: Les utilisateurs peuvent se connecter à leur compte existant de manière sécurisée
FR4: Les utilisateurs peuvent se déconnecter de leur compte
FR5: Les utilisateurs peuvent révoquer et reconnecter l'accès OAuth à leur fournisseur email
FR6: Les utilisateurs peuvent consulter leurs paramètres de compte (email, statut abonnement)
FR7: Le système maintient des sessions utilisateur sécurisées via JWT tokens
FR8: Les utilisateurs peuvent ajouter manuellement des newsletters en fournissant l'adresse email de l'expéditeur
FR9: Les utilisateurs peuvent voir la liste de toutes leurs newsletters configurées
FR10: Les utilisateurs peuvent modifier les détails d'une newsletter configurée
FR11: Les utilisateurs peuvent supprimer des newsletters de leur configuration
FR12: Le système valide le format des adresses email des newsletters
FR13: Le système détecte et empêche les doublons de newsletters
FR14: Les utilisateurs du tier gratuit sont limités à un maximum de 5 newsletters
FR15: Les utilisateurs du tier payant peuvent configurer un nombre illimité de newsletters
FR16: Le système détecte automatiquement les nouvelles newsletters des expéditeurs configurés dans la boîte email de l'utilisateur
FR17: Le système génère des résumés IA via un modèle LLM basique (GPT-3.5 Turbo / Claude Haiku)
FR18: Le système génère des résumés IA via un modèle LLM premium (GPT-4o / Claude Sonnet)
FR19: Les utilisateurs du tier gratuit reçoivent 1 résumé premium par jour, les autres étant générés avec le LLM basique
FR20: Les utilisateurs du tier payant reçoivent tous leurs résumés via le LLM premium
FR21: Le système génère les résumés dans un format structuré (texte + bullet points avec insights clés et données chiffrées)
FR22: Le système adapte la longueur des résumés à la longueur de la newsletter source dans la limite des tokens configurés
FR23: Le système génère les résumés on-demand dans les limites de performance cibles
FR24: Les nouveaux utilisateurs reçoivent leurs premiers résumés le lendemain de la création du compte (J+1)
FR25: Les utilisateurs peuvent voir un feed chronologique de résumés (les plus récents en premier)
FR26: Les utilisateurs peuvent lire des résumés individuels présentés sous forme de cards visuelles
FR27: Les utilisateurs peuvent accéder à la newsletter originale complète depuis un résumé
FR28: Les utilisateurs peuvent voir quel modèle LLM a généré chaque résumé (badge basique vs premium)
FR29: Les utilisateurs peuvent voir le titre de la newsletter et la date de réception pour chaque résumé
FR30: Les utilisateurs peuvent accéder à l'intégralité de leur historique de résumés (rétention illimitée)
FR31: Les utilisateurs peuvent naviguer chronologiquement dans leur historique de résumés
FR32: Les utilisateurs peuvent filtrer les résumés pour afficher le contenu d'une newsletter spécifique
FR33: Les utilisateurs peuvent voir toutes les newsletters dans un feed unifié par défaut
FR34: Les utilisateurs du tier payant peuvent filtrer les résumés par catégories personnalisées créées
FR35: Les utilisateurs peuvent basculer entre les différentes vues filtrées de leur contenu
FR36: Les utilisateurs du tier payant peuvent créer des catégories personnalisées illimitées avec des noms définis par l'utilisateur
FR37: Les utilisateurs du tier payant peuvent assigner des newsletters à une ou plusieurs catégories
FR38: Les utilisateurs du tier payant peuvent modifier les noms et assignations de catégories
FR39: Les utilisateurs du tier payant peuvent supprimer des catégories
FR40: Les utilisateurs du tier gratuit n'ont pas accès aux fonctionnalités de catégorisation
FR41: Les utilisateurs peuvent voir les tiers d'abonnement disponibles (Gratuit vs Payant) et leurs fonctionnalités
FR42: Les utilisateurs du tier gratuit peuvent passer au tier payant
FR43: Les utilisateurs peuvent finaliser le paiement via l'intégration Stripe
FR44: Les utilisateurs peuvent gérer leur abonnement (voir le statut, moyen de paiement, historique de facturation)
FR45: Les utilisateurs peuvent annuler leur abonnement payant
FR46: Les utilisateurs peuvent mettre à jour leur moyen de paiement
FR47: Le système traite les paiements d'abonnement récurrents via Stripe
FR48: Le système gère les webhooks Stripe pour les événements du cycle de vie des abonnements (créé, annulé, paiement échoué)
FR49: Le système applique les limites de fonctionnalités en fonction du tier d'abonnement
FR50: Les admins peuvent voir le nombre total d'utilisateurs actifs et payants
FR51: Les admins peuvent voir le MRR (Monthly Recurring Revenue) actuel
FR52: Les admins peuvent voir les coûts LLM agrégés et la ventilation par utilisateur
FR53: Les admins peuvent voir les métriques du funnel de conversion (inscriptions → actifs → payants)
FR54: Les admins peuvent configurer les paramètres du fournisseur LLM (basculer entre GPT-4, Claude, etc.)
FR55: Les admins peuvent définir les limites de tokens par résumé pour contrôler les coûts
FR56: Les admins peuvent configurer des alertes automatiques pour les anomalies de coûts (par utilisateur ou à l'échelle du système)
FR57: Les admins peuvent consulter les logs détaillés des utilisateurs (statut OAuth, erreurs API, patterns d'usage)
FR58: Les admins peuvent voir les soumissions du formulaire de contact support
FR59: Les admins peuvent effectuer des actions manuelles sur les utilisateurs (réinitialiser OAuth, émettre des remboursements, etc.)
FR60: Les utilisateurs peuvent soumettre des demandes de support via un formulaire de contact (email, sujet, description)
FR61: Les utilisateurs peuvent joindre des captures d'écran (optionnel) aux demandes de support
FR62: Les admins peuvent accéder aux logs d'activité des utilisateurs pour diagnostiquer et résoudre des problèmes
FR63: Le système envoie des notifications de demande de support à la boîte de réception support admin
FR64: Les visiteurs publics peuvent consulter une landing page optimisée décrivant la proposition de valeur de Briefly
FR65: Les visiteurs publics peuvent consulter les informations tarifaires comparant les tiers Gratuit et Payant
FR66: Les visiteurs publics peuvent accéder aux pages marketing en plusieurs langues (français et anglais minimum)
FR67: Les visiteurs publics peuvent s'inscrire depuis la landing page
FR68: Le système sert les pages marketing avec des métadonnées SEO optimales (titres, descriptions, données structurées)
FR69: Le système génère et maintient un sitemap XML pour les moteurs de recherche
FR70: Le système sert les pages marketing en SSR ou SSG pour la performance
FR71: Les utilisateurs peuvent accéder à toutes les fonctionnalités de l'application sur appareils mobiles (viewport 320px-767px)
FR72: Les utilisateurs peuvent accéder à toutes les fonctionnalités de l'application sur tablettes (viewport 768px-1023px)
FR73: Les utilisateurs peuvent accéder à toutes les fonctionnalités de l'application sur desktop (viewport 1024px+)
FR74: Les utilisateurs peuvent naviguer dans toute l'application en utilisant uniquement le clavier
FR75: Les utilisateurs utilisant des lecteurs d'écran peuvent accéder à tout le contenu et les fonctionnalités
FR76: Le système maintient la conformité accessibilité WCAG 2.1 Level AA

### NonFunctional Requirements

**Performance (NFR-P) :**
NFR-P1: Génération de résumés IA complétée en ≤2 secondes pour 95% des requêtes
NFR-P2: Chargement page (First Contentful Paint) en ≤1.5 secondes
NFR-P3: Largest Contentful Paint (LCP) en ≤2.5 secondes
NFR-P4: Time to Interactive (TTI) en ≤3.5 secondes
NFR-P5: Navigation SPA entre vues en ≤100ms
NFR-P6: Scrolling du feed maintenu à 60 images par seconde
NFR-P7: Taille du bundle initial (gzippé) ≤200KB
NFR-P8: Flux d'authentification OAuth complété en ≤5 secondes
NFR-P9: Actions de configuration newsletter (ajout/édition/suppression) répondent en ≤500ms
NFR-P10: Opérations de filtre et de catégorie répondent en ≤300ms
NFR-P11: Score Google PageSpeed Insights ≥90 pour les pages clés
NFR-P12: Core Web Vitals dans les seuils "Good" (LCP <2.5s, FID <100ms, CLS <0.1)

**Sécurité (NFR-S) :**
NFR-S1: Toute authentification utilise le protocole standard OAuth 2.0
NFR-S2: Sessions utilisateur via JWT tokens sécurisés avec expiration
NFR-S3: Tokens OAuth stockés de manière sécurisée, jamais exposés côté client
NFR-S4: Les utilisateurs peuvent révoquer l'accès OAuth à tout moment
NFR-S5: Toutes les transmissions de données utilisent HTTPS/TLS 1.3
NFR-S6: Données sensibles (contenu email, info utilisateur) chiffrées au repos en DB
NFR-S7: Données de paiement gérées exclusivement par Stripe (PCI-DSS), jamais stockées localement
NFR-S8: Les utilisateurs n'accèdent qu'à leurs propres newsletters et résumés (isolation stricte)
NFR-S9: Dashboard admin nécessite une authentification séparée avec privilèges élevés
NFR-S10: Endpoints API appliquent un rate limiting (max 100 req/min par utilisateur)
NFR-S11: Le système est conforme aux exigences GDPR pour les utilisateurs européens
NFR-S12: Les utilisateurs peuvent demander un export complet de leurs données (GDPR Article 20)
NFR-S13: Les utilisateurs peuvent demander la suppression de compte avec toutes les données supprimées sous 30 jours (GDPR Article 17)
NFR-S14: Politique de confidentialité documentant clairement l'utilisation, le stockage et le partage des données
NFR-S15: Toutes les entrées utilisateur sont validées et assainies pour prévenir les attaques XSS
NFR-S16: Protection injection SQL via requêtes paramétrées ou ORM
NFR-S17: Configuration CORS restreint l'accès API aux origines autorisées uniquement

**Fiabilité & Disponibilité (NFR-R) :**
NFR-R1: Système maintient ≥99% uptime (max 7.3h downtime/mois)
NFR-R2: Fenêtres de maintenance planifiées en dehors des heures de pointe (6h-10h UTC)
NFR-R3: Services critiques (OAuth, génération résumés, paiement) à ≥99.5% uptime
NFR-R4: Gestion gracieuse des échecs OAuth avec messages clairs et options de retry
NFR-R5: Échecs API LLM déclenchent un retry automatique (3 tentatives) avant d'afficher une erreur
NFR-R6: Échecs webhooks Stripe loggés et relancés automatiquement
NFR-R7: Toutes les erreurs critiques loggées avec contexte suffisant pour le débogage
NFR-R8: Transactions DB garantissent la cohérence des données (propriétés ACID)
NFR-R9: Sauvegardes automatiques quotidiennes avec rétention de 30 jours
NFR-R10: Récupération des sauvegardes testée trimestriellement
NFR-R11: Erreurs système déclenchent des alertes en temps réel à l'admin
NFR-R12: Anomalies métriques critiques (uptime <95%, taux d'erreur >5%) déclenchent des alertes automatiques
NFR-R13: Toutes les erreurs de production trackées dans un système de monitoring (Sentry)

**Scalabilité (NFR-SC) :**
NFR-SC1: Architecture supporte une croissance 10x (50 → 500 users) avec <10% de dégradation performance
NFR-SC2: Schéma DB et index supportent des requêtes efficaces à 5000+ utilisateurs
NFR-SC3: Appels API LLM mis en queue et rate-limités pour prévenir la surcharge
NFR-SC4: Infrastructure serveur scale horizontalement (ajout instances) vs verticalement
NFR-SC5: Assets statiques servis via CDN pour la performance globale
NFR-SC6: Connection pooling DB prévient l'épuisement des ressources sous charge
NFR-SC7: Système gère 2x le trafic normal durant les heures de pointe (7h-10h) sans dégradation
NFR-SC8: Rate limiting API prévient les utilisateurs individuels de consommer des ressources excessives

**Accessibilité (NFR-A) :**
NFR-A1: Tout le texte maintient un ratio de contraste minimum de 4.5:1 (texte normal) et 3:1 (grand texte)
NFR-A2: Tous les éléments interactifs sont accessibles au clavier avec indicateurs de focus visibles
NFR-A3: Toutes les images et icônes ont un texte alternatif descriptif
NFR-A4: Tous les formulaires ont des labels associés et des messages d'erreur clairs
NFR-A5: Éléments HTML5 sémantiques utilisés partout (header, nav, main, article, etc.)
NFR-A6: Labels ARIA fournis où le HTML sémantique est insuffisant
NFR-A7: Pas de pièges clavier dans les modals, dropdowns ou autres composants interactifs
NFR-A8: Toutes les fonctionnalités utilisables avec NVDA, JAWS et VoiceOver
NFR-A9: Changements de contenu dynamiques annoncés aux lecteurs d'écran via régions ARIA live
NFR-A10: Skip links fournis pour navigation rapide vers le contenu principal
NFR-A11: Tests d'accessibilité automatisés (axe-core, Lighthouse) exécutés dans le pipeline CI/CD
NFR-A12: Tests de navigation clavier manuels pour toutes les nouvelles fonctionnalités
NFR-A13: Tests lecteur d'écran manuels trimestriels

**Intégrations (NFR-I) :**
NFR-I1: Intégration OAuth Gmail maintient ≥95% de taux de succès
NFR-I2: Intégration OAuth Outlook maintient ≥95% de taux de succès
NFR-I3: Rafraîchissement des tokens OAuth géré automatiquement
NFR-I4: Polling boîte email complété dans les 5 minutes suivant l'arrivée de la newsletter
NFR-I5: Livraison webhook Stripe acquittée dans les 5 secondes
NFR-I6: Retries paiements échoués gérés automatiquement selon le calendrier Stripe
NFR-I7: Changements de statut abonnement reflétés dans le compte utilisateur dans les 30 secondes
NFR-I8: Erreurs API Stripe loggées avec contexte suffisant pour réconciliation manuelle
NFR-I9: Appels API LLM en timeout après 30 secondes avec retry automatique
NFR-I10: Échecs fournisseur LLM (rate limits, downtime) déclenchent un fallback vers le fournisseur alternatif
NFR-I11: Tracking des coûts LLM mis à jour en temps réel après chaque génération de résumé
NFR-I12: Multiples fournisseurs LLM supportés avec switch de configuration runtime (GPT, Claude)
NFR-I13: Toutes les intégrations API externes gèrent les changements de version avec compatibilité ascendante
NFR-I14: Changements breaking des APIs intégrées détectés via monitoring et traités sous 48h

**Efficacité des Coûts (NFR-C) :**
NFR-C1: Coût LLM moyen par utilisateur tier gratuit ≤0.5€/mois
NFR-C2: Coût LLM moyen par utilisateur tier payant ≤1.5€/mois
NFR-C3: Limite tokens par résumé appliquée (max 800 tokens) pour prévenir les dépassements
NFR-C4: Dashboard admin affiche les coûts LLM en temps réel (agrégés et par utilisateur)
NFR-C5: Alertes automatiques si un utilisateur individuel dépasse 1.8€/mois de coût LLM
NFR-C6: Alertes automatiques si les coûts LLM mensuels totaux dépassent le seuil budgétaire
NFR-C7: Coûts d'hébergement (VPS OVH) ≤50€/mois pour 500 utilisateurs
NFR-C8: Coûts DB (PostgreSQL/Supabase) ≤30€/mois pour 500 utilisateurs
NFR-C9: Coûts CDN et bande passante ≤20€/mois pour 500 utilisateurs
NFR-C10: Marge brute tier payant (revenu - LLM - infra) maintient ≥60%
NFR-C11: Coûts opérationnels totaux couverts par le revenu à partir de ≥20 utilisateurs payants

**Utilisabilité (NFR-U) :**
NFR-U1: Tous les flux core utilisateur réalisables sur mobile (320px) sans scroll horizontal
NFR-U2: Zones tactiles (boutons, liens) minimum 44x44px
NFR-U3: Formulaires optimisés pour saisie mobile (types de clavier appropriés, autocomplete)
NFR-U4: Navigation mobile accessible via hamburger menu ou barre d'onglets
NFR-U5: Layout s'adapte seamlessly aux breakpoints (mobile 320-767px, tablette 768-1023px, desktop 1024px+)
NFR-U6: Typographie scale appropriément (minimum 16px sur mobile)
NFR-U7: Images et médias utilisent un dimensionnement responsive (srcset, éléments picture)
NFR-U8: Tous les messages d'erreur sont user-friendly (sans jargon technique) et actionnables
NFR-U9: États de chargement indiquent clairement les processus en cours (spinners, skeleton screens)
NFR-U10: Confirmations de succès fournies pour toutes les actions utilisateur (toast, messages succès)
NFR-U11: Nouveaux utilisateurs peuvent compléter leur première génération de résumé dans les 5 minutes suivant l'inscription
NFR-U12: Onboarding ≤3 étapes pour la première valeur (OAuth → configurer newsletters → voir résumés)
NFR-U13: États vides fournissent des indications claires sur les prochaines actions
NFR-U14: Tout le texte utilisateur supporte les variantes linguistiques français et anglais
NFR-U15: Formats date et heure s'adaptent à la locale utilisateur
NFR-U16: La devise s'affiche correctement selon le contexte régional (€ EU, $ US)

### Additional Requirements

**Exigences architecturales (depuis Architecture.md) :**

- **Starter Template :** `create-next-app@latest --typescript --tailwind --eslint --app --src-dir` + `npx shadcn@latest init` — Epic 1 Story 1 = initialisation du projet avec ces commandes exactes
- Infrastructure VPS OVH (~10€/mois) avec Caddy (reverse proxy + HTTPS auto), Docker Compose, déploiement via Kamal
- Ingestion email : adresse dédiée `{uuid}@mail.briefly.app` via Cloudflare Email Routing → webhook Next.js → BullMQ (pas OAuth inbox) — l'onboarding doit guider l'utilisateur à configurer un transfert Gmail
- Authentification : Clerk (Google/Microsoft OAuth pour identité uniquement), intégration Stripe native Clerk
- Base de données : Supabase free tier PostgreSQL, client direct (pas ORM), RLS activée, migrations SQL versionnées dans `supabase/migrations/`
- Jobs asynchrones : BullMQ + Redis self-hosted (pipeline email.process → summary.generate)
- Pipeline LLM : OpenAI `gpt-5-nano` (primaire, reasoning: minimal) + Anthropic `claude-haiku-3-5` (fallback) derrière couche d'abstraction LLMService
- State management : TanStack Query (data fetching) + `useState` (état UI local)
- i18n : `next-intl` (FR + EN, App Router natif)
- Tests : Vitest (co-localisés avec sources)
- CI/CD : GitHub Actions + Kamal (lint → build → test → deploy sur push main)
- Monitoring : Sentry (erreurs) + Pino (logging structuré JSON)
- Validation : Zod (schemas partagés client/serveur, frontières système uniquement)
- Enforcement rôles : Hybride Clerk Edge Middleware (routing) + Supabase DB (limites métier)
- Rate limiting : Double couche Caddy (réseau) + Redis local (quota LLM par user/mois)
- Sécurité webhooks : Signature verification obligatoire (Stripe, Cloudflare, Clerk)

**Exigences UX (depuis UX Design Specification) :**

- Interface cards inspirée Instagram/Pinterest/Notion : scrolling vertical fluide, hiérarchie visuelle claire
- Distinction lu/non-lu NON-anxiogène (pas de compteur rouge culpabilisant, badge visuel discret)
- Messages OAuth ultra-explicites : "Briefly accède uniquement à tes newsletters, jamais tes emails personnels"
- Badge LLM visible sur chaque card résumé (basique vs premium) pour transparence qualité
- Ton rassurant anti-FOMO : "3 nouveaux résumés disponibles" (positif) vs "Tu as 3 newsletters à lire!" (culpabilisant)
- Feed chronologique simple, pas d'inbox zero gamifié
- Formulaire contact support : champs email + sujet + description + upload screenshot optionnel
- États vides avec guidance claire ("Ajoutez votre première newsletter")
- Skeleton screens / loading states pour tous les chargements asynchrones
- Messages erreur actionnables avec instructions étape par étape

### FR Coverage Map

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

## Epic List

### Epic 1 : Fondations du Projet & Infrastructure
Les développeurs disposent d'un projet Next.js configuré avec shadcn/ui, déployé sur VPS OVH via Docker Compose et Kamal, avec CI/CD GitHub Actions, monitoring Sentry/Pino, i18n next-intl (FR+EN), et base Supabase opérationnelle — socle technique sur lequel tous les autres épics s'appuient.
**FRs couverts :** FR71, FR72, FR73, FR74, FR75, FR76 (transversaux — appliqués à tous les épics)
**NFRs couverts :** NFR-S5, NFR-R7, NFR-R11-R13, NFR-SC4-5, NFR-A1-A13, NFR-U5-U7, NFR-U14-U16

### Epic 2 : Pages Publiques & Acquisition SEO
Les visiteurs publics peuvent découvrir Briefly via une landing page SSG optimisée, comparer les offres gratuites et payantes, s'inscrire, et l'application est correctement indexée par les moteurs de recherche en français et en anglais.
**FRs couverts :** FR64, FR65, FR66, FR67, FR68, FR69, FR70

### Epic 3 : Authentification & Gestion de Compte
Les utilisateurs peuvent créer un compte via OAuth Google/Microsoft avec Clerk, se connecter et déconnecter de manière sécurisée, gérer leurs paramètres de compte, et exercer leurs droits RGPD (export et suppression des données).
**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7

### Epic 4 : Configuration des Newsletters & Ingestion Email
Les utilisateurs peuvent ajouter et gérer leurs newsletters manuellement, recevoir une adresse email dédiée `@mail.briefly.app`, et le pipeline d'ingestion complet (Cloudflare Email Routing → webhook → BullMQ) fonctionne de bout en bout avec les limites par tier appliquées.
**FRs couverts :** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

### Epic 5 : Moteur de Résumés IA
Le système génère automatiquement des résumés structurés (texte + bullet points) pour chaque newsletter ingérée, en utilisant le modèle LLM approprié selon le tier utilisateur (basique vs premium), dans les limites de performance (<2s) et de coût configurées.
**FRs couverts :** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24

### Epic 6 : Interface de Lecture & Feed de Résumés
Les utilisateurs peuvent consulter leur feed chronologique de résumés sous forme de cards visuelles, lire les résumés avec badge LLM visible, accéder aux newsletters originales, naviguer dans leur historique complet, et filtrer par newsletter ou par vue.
**FRs couverts :** FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR35

### Epic 7 : Abonnement & Monétisation Freemium
Les utilisateurs peuvent voir les offres disponibles, upgrader vers le tier payant via Stripe, gérer leur abonnement (annulation, mise à jour moyen de paiement, historique de facturation), et le système applique strictement les limites par tier avec synchronisation Stripe en temps réel.
**FRs couverts :** FR41, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR49

### Epic 8 : Catégorisation Personnalisée (Feature Payante)
Les utilisateurs du tier payant peuvent créer des catégories personnalisées illimitées, assigner leurs newsletters à ces catégories, les modifier et les supprimer, et filtrer leur feed par catégorie — différenciateur clé de conversion gratuit→payant.
**FRs couverts :** FR34, FR36, FR37, FR38, FR39, FR40

### Epic 9 : Dashboard Admin & Contrôle Opérationnel
L'administrateur peut monitorer les métriques business clés (users actifs/payants, MRR, coûts LLM par utilisateur), configurer les providers LLM et limites de tokens, recevoir des alertes de coûts automatiques, accéder aux logs utilisateurs pour debug, et effectuer des actions administratives manuelles.
**FRs couverts :** FR50, FR51, FR52, FR53, FR54, FR55, FR56, FR57, FR58, FR59

### Epic 10 : Support Utilisateur
Les utilisateurs peuvent soumettre des demandes de support via un formulaire simple (avec upload screenshot optionnel), l'admin reçoit des notifications et peut accéder aux logs de debug pour diagnostiquer et résoudre rapidement les problèmes utilisateurs.
**FRs couverts :** FR60, FR61, FR62, FR63

---

## Epic 1 : Fondations du Projet & Infrastructure

Les développeurs disposent d'un projet Next.js configuré avec shadcn/ui, déployé sur VPS OVH via Docker Compose et Kamal, avec CI/CD GitHub Actions, monitoring Sentry/Pino, i18n next-intl (FR+EN), et base Supabase PostgreSQL opérationnelle — socle technique sur lequel tous les autres épics s'appuient.

### Story 1.1 : Initialisation du Projet Next.js avec shadcn/ui

En tant que développeur,
je veux initialiser le projet Briefly avec Next.js App Router, TypeScript, Tailwind CSS v4 et shadcn/ui configurés,
afin d'avoir une base de code fonctionnelle avec toutes les conventions d'architecture définies en place.

**Acceptance Criteria:**

**Given** un environnement de développement Node.js 20.9+ disponible
**When** les commandes `npx create-next-app@latest briefly --typescript --tailwind --eslint --app --src-dir` et `npx shadcn@latest init` sont exécutées
**Then** le projet démarre sans erreur avec `npm run dev` sur `localhost:3000`
**And** la structure de dossiers `src/app/`, `src/components/ui/`, `src/lib/`, `src/features/`, `src/types/` existe
**And** l'alias `@/*` → `./src/*` est configuré dans `tsconfig.json`
**And** Tailwind CSS v4 est opérationnel (CSS-first via `@theme`, pas de `tailwind.config.js`)
**And** les composants shadcn/ui de base (Button, Card) sont installables via `npx shadcn@latest add`
**And** ESLint passe sans erreur sur le code de base généré
**And** Turbopack est actif en développement (`next dev --turbo`)

### Story 1.2 : Configuration Supabase et Schéma de Base de Données Initial

En tant que développeur,
je veux configurer le client Supabase et créer le schéma initial de la base de données,
afin d'avoir une base de données PostgreSQL opérationnelle avec les tables fondamentales et les utilitaires d'accès en place.

**Acceptance Criteria:**

**Given** un projet Supabase créé (free tier)
**When** le client Supabase est configuré et les migrations initiales exécutées
**Then** `lib/supabase/client.ts` (client browser) et `lib/supabase/server.ts` (client RSC/Server Actions) existent
**And** les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont documentées dans `.env.example`
**And** la migration `supabase/migrations/001_initial_schema.sql` crée la table `users` (`id`, `clerk_id`, `email`, `tier`, `created_at`, `updated_at`)
**And** la Row Level Security (RLS) est activée sur la table `users`
**And** la commande `supabase gen types typescript` génère `lib/supabase/types.ts` sans erreur
**And** la connexion à Supabase est vérifiable depuis un Server Component sans erreur

### Story 1.3 : Infrastructure VPS avec Docker Compose et Caddy

En tant que développeur,
je veux configurer l'infrastructure de déploiement sur VPS OVH avec Docker Compose, Caddy comme reverse proxy, et Redis pour BullMQ,
afin que l'application soit déployable en production avec HTTPS automatique.

**Acceptance Criteria:**

**Given** un VPS OVH avec Docker et Docker Compose installés
**When** `docker compose up -d` est exécuté dans le dossier `docker/`
**Then** Caddy sert l'application Next.js sur HTTPS avec certificat TLS automatique (Let's Encrypt)
**And** Redis est accessible localement sur le port 6379 (non exposé publiquement)
**And** Next.js tourne en mode standalone (`next start`) et répond sur le port 3000
**And** les fichiers `docker/docker-compose.yml` et `docker/Caddyfile` sont commités dans le repo
**And** `config/kamal.yml` est configuré pour le déploiement vers le VPS OVH
**And** `.env.example` documente toutes les variables d'environnement requises

### Story 1.4 : Pipeline CI/CD GitHub Actions + Déploiement Kamal

En tant que développeur,
je veux un pipeline CI/CD automatisé qui lint, build, teste et déploie l'application sur push vers `main`,
afin que chaque changement de code soit validé et déployé automatiquement sur le VPS OVH.

**Acceptance Criteria:**

**Given** le repository GitHub configuré avec les secrets nécessaires (SSH key, variables env)
**When** un push est effectué sur la branche `main`
**Then** le workflow GitHub Actions `.github/workflows/ci.yml` s'exécute automatiquement
**And** les étapes lint → build → test → deploy s'exécutent dans cet ordre
**And** si le lint ou le build échoue, le déploiement est bloqué
**And** Kamal déploie l'image Docker sur le VPS OVH sans downtime (rolling deploy)
**And** l'application répond correctement sur le domaine de production après déploiement
**And** les logs du déploiement sont visibles dans GitHub Actions

### Story 1.5 : Internationalisation avec next-intl (FR + EN)

En tant que développeur,
je veux configurer `next-intl` pour supporter le français et l'anglais dans toute l'application,
afin que tous les textes utilisateur soient externalisés et prêts pour les deux langues.

**Acceptance Criteria:**

**Given** le package `next-intl` installé et configuré avec App Router
**When** un utilisateur accède à l'application
**Then** les fichiers de traduction `public/locales/fr/common.json` et `public/locales/en/common.json` sont chargés
**And** le middleware de détection de langue redirige vers `/fr` ou `/en` selon les préférences navigateur
**And** la locale active est accessible via le hook `useTranslations()` dans les Client Components
**And** les Server Components accèdent aux traductions via `getTranslations()`
**And** le changement de langue est persisté (localStorage ou cookie)
**And** `next-intl` est compatible avec les React Server Components (App Router)

### Story 1.6 : Monitoring et Logging avec Sentry et Pino

En tant que développeur,
je veux configurer Sentry pour le tracking des erreurs et Pino pour le logging structuré,
afin que les erreurs de production soient capturées et que les logs soient exploitables pour le debugging.

**Acceptance Criteria:**

**Given** un projet Sentry créé (free tier) et Pino installé
**When** une erreur non gérée survient en production
**Then** Sentry capture l'erreur avec la stack trace complète et notifie l'admin
**And** `lib/utils/logger.ts` exporte un logger Pino configuré (JSON structuré, level basé sur `NODE_ENV`)
**And** `console.log` est remplacé par `logger.info/warn/error` dans tout le code de base
**And** les Route Handlers loggent les requêtes entrantes et les erreurs avec Pino
**And** Sentry est configuré pour les erreurs client (browser) et serveur (Node.js)
**And** les variables `SENTRY_DSN` et `SENTRY_AUTH_TOKEN` sont documentées dans `.env.example`

---

## Epic 2 : Pages Publiques & Acquisition SEO

Les visiteurs publics peuvent découvrir Briefly via une landing page SSG optimisée, comparer les offres gratuites et payantes, s'inscrire, et l'application est correctement indexée par les moteurs de recherche en français et en anglais.

### Story 2.1 : Landing Page Principale (FR + EN)

En tant que visiteur public,
je veux voir une landing page claire et convaincante décrivant la valeur de Briefly,
afin de comprendre rapidement comment l'application résout mon problème de surcharge de newsletters et d'être incité à m'inscrire.

**Acceptance Criteria:**

**Given** un visiteur accède à `/`, `/fr` ou `/en`
**When** la page se charge
**Then** le hero section présente le problème (surcharge newsletters) et la solution (résumés IA) de façon claire
**And** les fonctionnalités clés différenciatrices sont mises en avant (cards visuelles, dual-tier LLM, catégorisation custom)
**And** un CTA fort "Essayer gratuitement" est visible sans scroll (above the fold)
**And** la page est servie en SSG (HTML statique pré-rendu) avec LCP < 2.5s
**And** la page est disponible en français (`/fr`) et en anglais (`/en`) avec contenus traduits via next-intl
**And** les balises `<title>`, `<meta description>` et Open Graph sont optimisées pour le SEO
**And** les hreflang tags (`<link rel="alternate" hreflang="fr">` et `hreflang="en"`) sont présents
**And** la page respecte WCAG 2.1 AA (contraste, navigation clavier, alt texts)

### Story 2.2 : Page Pricing avec Comparaison des Tiers

En tant que visiteur public,
je veux voir une page de tarification claire comparant l'offre gratuite et l'offre payante avec le ROI explicite,
afin de prendre une décision éclairée sur l'upgrade et de comprendre la valeur de chaque tier.

**Acceptance Criteria:**

**Given** un visiteur accède à `/pricing` (ou `/fr/pricing`, `/en/pricing`)
**When** la page se charge
**Then** le tier Gratuit et le tier Payant sont présentés côte à côte avec leurs fonctionnalités respectives
**And** le ROI est explicitement mentionné ("5h/semaine économisées >> 5€/mois")
**And** la limite de 5 newsletters du tier gratuit est clairement visible
**And** les CTAs "Commencer gratuitement" et "Passer au payant" sont présents avec lien vers inscription
**And** la page est servie en SSG avec métadonnées SEO optimisées
**And** la page est disponible en FR et EN via next-intl

### Story 2.3 : Formulaire d'Inscription depuis la Landing Page

En tant que visiteur public,
je veux pouvoir m'inscrire directement depuis la landing page ou la page pricing,
afin de démarrer mon utilisation de Briefly sans friction supplémentaire.

**Acceptance Criteria:**

**Given** un visiteur clique sur "S'inscrire" ou "Essayer gratuitement"
**When** il est redirigé vers la page d'inscription
**Then** la page `/sign-up` (Clerk hosted UI) s'affiche avec les options OAuth Google et Microsoft
**And** après inscription réussie, l'utilisateur est redirigé vers `/summaries` (dashboard)
**And** le flow d'inscription est complétable en moins de 60 secondes
**And** des messages de sécurité rassurants sont visibles ("Connexion sécurisée OAuth 2.0")
**And** la page d'inscription est responsive sur mobile (320px) et desktop

### Story 2.4 : SEO Technique — Sitemap XML, Robots.txt et Structured Data

En tant que moteur de recherche,
je veux accéder à un sitemap XML complet, un robots.txt bien configuré et des données structurées JSON-LD,
afin d'indexer correctement et efficacement les pages de Briefly.

**Acceptance Criteria:**

**Given** l'application est déployée en production
**When** un moteur de recherche (Google, Bing) crawle le site
**Then** `/sitemap.xml` liste toutes les pages publiques (landing, pricing, legal) avec leurs URL canoniques et hreflang
**And** `/robots.txt` autorise l'indexation des pages marketing et bloque `/summaries/`, `/newsletters/`, `/admin/`, `/api/`
**And** la landing page contient du structured data JSON-LD (`WebSite`, `Organization`, `SoftwareApplication`)
**And** le sitemap XML est généré automatiquement via Next.js App Router (`app/sitemap.ts`)
**And** les Core Web Vitals de la landing page atteignent le seuil "Good" (LCP < 2.5s, CLS < 0.1)

### Story 2.5 : Pages Légales (Politique de Confidentialité + CGU)

En tant que visiteur public,
je veux accéder à la politique de confidentialité et aux conditions générales d'utilisation,
afin de comprendre comment mes données sont traitées et de faire confiance à Briefly.

**Acceptance Criteria:**

**Given** un visiteur accède à `/legal/privacy` ou `/legal/terms`
**When** la page se charge
**Then** la politique de confidentialité décrit clairement les données collectées, leur usage, et les droits RGPD (Articles 17 et 20)
**And** les CGU couvrent les conditions d'utilisation du service
**And** les deux pages sont disponibles en FR et EN
**And** les pages sont servies en SSG (performance maximale)
**And** un lien vers ces pages est visible dans le footer de toutes les pages publiques

---

## Epic 3 : Authentification & Gestion de Compte

Les utilisateurs peuvent créer un compte via OAuth Google/Microsoft avec Clerk, se connecter et déconnecter de manière sécurisée, gérer leurs paramètres de compte, et exercer leurs droits RGPD (export et suppression des données).

### Story 3.1 : Inscription et Connexion OAuth (Google + Microsoft)

En tant qu'utilisateur,
je veux créer un compte et me connecter via mon compte Google ou Microsoft,
afin d'accéder à Briefly sans avoir à créer et mémoriser un nouveau mot de passe.

**Acceptance Criteria:**

**Given** un visiteur non connecté accède à `/sign-up` ou `/sign-in`
**When** il clique sur "Continuer avec Google" ou "Continuer avec Microsoft"
**Then** le flow OAuth Clerk s'ouvre et demande uniquement les permissions d'identité (email, nom)
**And** après autorisation réussie, un compte Briefly est créé automatiquement
**And** l'utilisateur est redirigé vers `/summaries` (dashboard)
**And** un enregistrement `users` est créé dans Supabase avec `clerk_id`, `email`, `tier: 'free'`
**And** le flow complet (clic → dashboard) se complète en moins de 60 secondes
**And** les messages affichés sont rassurants : "Briefly accède uniquement à votre identité, jamais à vos emails"

### Story 3.2 : Protection des Routes et Middleware d'Authentification

En tant que système,
je veux que toutes les routes du dashboard soient protégées et accessibles uniquement aux utilisateurs connectés,
afin qu'aucune donnée utilisateur ne soit accessible sans authentification valide.

**Acceptance Criteria:**

**Given** `src/middleware.ts` configure Clerk Edge Middleware
**When** un utilisateur non connecté tente d'accéder à `/summaries`, `/newsletters`, `/categories`, `/settings`, `/billing` ou `/admin`
**Then** il est automatiquement redirigé vers `/sign-in`
**And** après connexion réussie, il est redirigé vers la page initialement demandée
**And** les routes publiques (`/`, `/pricing`, `/legal/*`, `/sign-in`, `/sign-up`) restent accessibles sans authentification
**And** le middleware s'exécute à la Edge (sans accès DB) pour des performances maximales
**And** la route `/admin` nécessite en plus le rôle `admin` (vérifié via Clerk `publicMetadata.role`)

### Story 3.3 : Déconnexion et Gestion de Session

En tant qu'utilisateur connecté,
je veux pouvoir me déconnecter de mon compte,
afin que ma session soit terminée proprement et que mes données restent sécurisées.

**Acceptance Criteria:**

**Given** un utilisateur est connecté et accède au menu utilisateur
**When** il clique sur "Se déconnecter"
**Then** la session Clerk est invalidée immédiatement
**And** l'utilisateur est redirigé vers la landing page `/`
**And** l'accès aux routes protégées est immédiatement bloqué après déconnexion
**And** aucune donnée sensible n'est conservée dans le localStorage ou les cookies après déconnexion

### Story 3.4 : Page des Paramètres de Compte

En tant qu'utilisateur connecté,
je veux consulter et gérer les informations de mon compte,
afin de voir mon email, mon statut d'abonnement et d'accéder aux options de gestion.

**Acceptance Criteria:**

**Given** un utilisateur connecté accède à `/settings`
**When** la page se charge
**Then** l'email de compte, le tier actuel (Gratuit / Payant) et la date d'inscription sont affichés
**And** un lien vers la gestion de l'abonnement Stripe est visible pour les utilisateurs payants
**And** les options "Exporter mes données" (RGPD Art. 20) et "Supprimer mon compte" (RGPD Art. 17) sont présentes
**And** la page est responsive (mobile + desktop) et respecte WCAG 2.1 AA

### Story 3.5 : Export des Données Utilisateur (RGPD Article 20)

En tant qu'utilisateur connecté,
je veux pouvoir exporter toutes mes données personnelles,
afin d'exercer mon droit à la portabilité des données conformément au RGPD.

**Acceptance Criteria:**

**Given** un utilisateur accède à `/settings` et clique sur "Exporter mes données"
**When** la demande est soumise
**Then** un fichier JSON est généré contenant toutes les données utilisateur (profil, newsletters configurées, résumés, catégories)
**And** le téléchargement du fichier démarre automatiquement dans le navigateur
**And** les données d'un autre utilisateur ne sont jamais incluses (isolation stricte par `userId`)
**And** l'export se complète en moins de 10 secondes pour un utilisateur standard

### Story 3.6 : Suppression de Compte (RGPD Article 17)

En tant qu'utilisateur connecté,
je veux pouvoir supprimer définitivement mon compte et toutes mes données,
afin d'exercer mon droit à l'effacement conformément au RGPD.

**Acceptance Criteria:**

**Given** un utilisateur accède à `/settings` et clique sur "Supprimer mon compte"
**When** il confirme la suppression dans le modal de confirmation (saisie du mot "SUPPRIMER" requise)
**Then** le compte Clerk est supprimé
**And** toutes les données Supabase associées (newsletters, résumés, catégories, abonnement) sont supprimées en cascade
**And** si l'utilisateur a un abonnement Stripe actif, il est annulé automatiquement
**And** l'utilisateur est redirigé vers la landing page avec un message de confirmation
**And** la suppression complète s'effectue dans les 30 jours (confirmation immédiate + nettoyage asynchrone)

---

## Epic 4 : Configuration des Newsletters & Ingestion Email

Les utilisateurs peuvent ajouter et gérer leurs newsletters manuellement, recevoir une adresse email dédiée `@mail.briefly.app`, et le pipeline d'ingestion complet (Cloudflare Email Routing → webhook → BullMQ) fonctionne de bout en bout avec les limites par tier appliquées.

### Story 4.1 : Schéma Base de Données et API CRUD Newsletters

En tant que développeur,
je veux créer le schéma DB pour les newsletters et les endpoints API correspondants,
afin que les opérations CRUD de newsletters soient disponibles avec isolation stricte par utilisateur.

**Acceptance Criteria:**

**Given** les migrations Supabase sont exécutées
**When** le schéma est appliqué
**Then** la migration `supabase/migrations/002_newsletters.sql` crée la table `newsletters` (`id`, `user_id`, `sender_email`, `display_name`, `dedicated_address`, `is_active`, `created_at`)
**And** un index `idx_newsletters_user_id` est créé sur `user_id`
**And** la RLS Supabase garantit qu'un utilisateur ne peut lire/modifier que ses propres newsletters
**And** `features/newsletter/newsletter.service.ts` expose les fonctions `getNewsletters(userId)`, `createNewsletter(userId, data)`, `updateNewsletter(userId, id, data)`, `deleteNewsletter(userId, id)`
**And** `GET/POST /api/newsletters` et `PATCH/DELETE /api/newsletters/[id]` utilisent `apiResponse()` et retournent le format standardisé `{ data, error }`

### Story 4.2 : Ajout Manuel de Newsletter avec Adresse Dédiée

En tant qu'utilisateur connecté,
je veux ajouter une newsletter en renseignant l'adresse email de l'expéditeur et recevoir une adresse dédiée Briefly,
afin de configurer le transfert Gmail et commencer à recevoir mes résumés.

**Acceptance Criteria:**

**Given** un utilisateur connecté accède à `/newsletters` et clique sur "Ajouter une newsletter"
**When** il saisit l'adresse email de l'expéditeur (ex : `newsletter@stratechery.com`) et valide
**Then** le format email est validé (regex RFC 5322)
**And** les doublons pour cet utilisateur sont détectés et bloqués avec un message clair
**And** une adresse dédiée unique `{uuid}@mail.briefly.app` est générée et associée à cette newsletter
**And** la newsletter apparaît dans la liste avec l'adresse dédiée et des instructions de transfert Gmail claires
**And** la création répond en ≤ 500ms (NFR-P9)
**And** un état vide avec guidance s'affiche si aucune newsletter n'est configurée ("Ajoutez votre première newsletter")

### Story 4.3 : Gestion de la Liste de Newsletters (Édition + Suppression)

En tant qu'utilisateur connecté,
je veux pouvoir modifier le nom d'affichage et supprimer mes newsletters configurées,
afin de maintenir ma liste à jour selon mes besoins.

**Acceptance Criteria:**

**Given** un utilisateur accède à `/newsletters` avec au moins une newsletter configurée
**When** il clique sur "Modifier" pour une newsletter
**Then** il peut modifier le nom d'affichage (pas l'adresse email expéditeur)
**And** la modification est sauvegardée en ≤ 500ms avec confirmation toast
**When** il clique sur "Supprimer" pour une newsletter
**Then** un modal de confirmation s'affiche avant la suppression définitive
**And** la newsletter et tous ses résumés associés sont supprimés de Supabase
**And** la liste se met à jour immédiatement après suppression

### Story 4.4 : Enforcement des Limites de Tier (5 newsletters gratuit / illimité payant)

En tant que système,
je veux appliquer la limite de 5 newsletters pour les utilisateurs gratuits,
afin de créer une incitation naturelle à l'upgrade vers le tier payant.

**Acceptance Criteria:**

**Given** un utilisateur du tier gratuit a déjà 5 newsletters configurées
**When** il tente d'en ajouter une 6ème
**Then** l'API retourne une erreur `FORBIDDEN` avec le message "Limite de 5 newsletters atteinte sur le tier gratuit"
**And** l'interface affiche un message d'upgrade avec lien vers `/billing` ("Passez au tier payant pour des newsletters illimitées")
**And** le bouton "Ajouter" est désactivé visuellement avec indication de la limite atteinte
**And** un utilisateur du tier payant peut ajouter des newsletters sans limite
**And** le compteur "X/5 newsletters" est visible pour les utilisateurs gratuits

### Story 4.5 : Pipeline d'Ingestion Email (Cloudflare → Webhook → BullMQ)

En tant que système,
je veux recevoir les emails transférés vers les adresses dédiées et les mettre en queue pour traitement,
afin que chaque newsletter reçue déclenche automatiquement la génération d'un résumé.

**Acceptance Criteria:**

**Given** Cloudflare Email Routing est configuré pour router `*@mail.briefly.app` vers `POST /api/webhooks/email`
**When** un email est reçu sur une adresse dédiée `{uuid}@mail.briefly.app`
**Then** le webhook vérifie le header secret Cloudflare avant tout traitement (rejet 401 si absent/invalide)
**And** l'email est parsé (expéditeur, sujet, contenu HTML/texte) et associé à la newsletter correspondante via l'adresse dédiée
**And** un job BullMQ `email.process` est enqueued avec le payload `{ jobId, userId, newsletterId, emailContent, createdAt }`
**And** le webhook répond 200 en ≤ 2 secondes (traitement asynchrone via BullMQ)
**And** un event `email_events` est loggé dans Supabase (statut: `received`)
**And** si l'adresse dédiée ne correspond à aucune newsletter active, l'email est ignoré silencieusement avec log

### Story 4.6 : Worker BullMQ de Traitement Email

En tant que système,
je veux qu'un worker BullMQ traite les emails en queue et prépare les données pour la génération de résumé,
afin que le contenu de la newsletter soit extrait et prêt pour le moteur IA.

**Acceptance Criteria:**

**Given** un job `email.process` est présent dans la queue BullMQ
**When** le worker `lib/queue/workers/email.worker.ts` traite le job
**Then** le contenu HTML de l'email est nettoyé (suppression balises de tracking, images, CSS inline)
**And** le texte brut extrait est tronqué si nécessaire pour respecter les limites de tokens LLM
**And** un job BullMQ `summary.generate` est enqueued avec le contenu nettoyé
**And** le statut de `email_events` est mis à jour en `processing` dans Supabase
**And** en cas d'échec, le job est retenté automatiquement (3 tentatives) avec backoff exponentiel
**And** après 3 échecs, le job est marqué `failed` et loggé via Pino + Sentry

---

## Epic 5 : Moteur de Résumés IA

Le système génère automatiquement des résumés structurés (texte + bullet points) pour chaque newsletter ingérée, en utilisant le modèle LLM approprié selon le tier utilisateur (basique vs premium), dans les limites de performance (<2s) et de coût configurées.

### Story 5.1 : Schéma Base de Données des Résumés

En tant que développeur,
je veux créer le schéma DB pour les résumés IA,
afin de stocker et récupérer efficacement les résumés générés par utilisateur.

**Acceptance Criteria:**

**Given** les migrations Supabase sont exécutées
**When** le schéma est appliqué
**Then** la migration `supabase/migrations/003_summaries.sql` crée la table `summaries` (`id`, `user_id`, `newsletter_id`, `email_event_id`, `content_text`, `content_bullets` JSONB, `llm_provider`, `llm_model`, `tokens_used`, `is_premium`, `is_read`, `received_at`, `created_at`)
**And** les index `idx_summaries_user_id`, `idx_summaries_newsletter_id`, `idx_summaries_received_at` sont créés
**And** la RLS Supabase garantit qu'un utilisateur ne peut lire que ses propres résumés
**And** `features/summary/summary.service.ts` expose `getSummaries(userId, filters)` et `markAsRead(userId, summaryId)`

### Story 5.2 : Couche d'Abstraction LLM (LLMService)

En tant que développeur,
je veux une couche d'abstraction multi-provider pour les appels LLM,
afin de pouvoir switcher entre OpenAI et Anthropic sans modifier le code métier et de gérer retry + tracking des coûts de façon centralisée.

**Acceptance Criteria:**

**Given** les packages `openai` et `@anthropic-ai/sdk` sont installés
**When** `lib/llm/llmService.ts` est implémenté
**Then** `LLMService.generate(prompt, options)` accepte `{ provider: 'openai' | 'anthropic', model, maxTokens, userId }`
**And** le provider OpenAI utilise `gpt-5-nano` avec `reasoning: 'minimal'` par défaut
**And** le provider Anthropic utilise `claude-haiku-3-5` comme fallback
**And** en cas d'échec du provider primaire, le fallback Anthropic est tenté automatiquement
**And** chaque appel réussi enregistre `{ userId, tokensUsed, cost, provider, model, createdAt }` dans Supabase (table `llm_costs`)
**And** un timeout de 30 secondes est appliqué sur chaque appel LLM (NFR-I9)
**And** `lib/llm/llmService.test.ts` couvre les cas : succès primaire, fallback, timeout, retry x3

### Story 5.3 : Worker BullMQ de Génération de Résumé

En tant que système,
je veux qu'un worker BullMQ génère les résumés IA pour chaque newsletter reçue,
afin que les utilisateurs trouvent leurs résumés prêts lors de leur prochaine visite.

**Acceptance Criteria:**

**Given** un job BullMQ `summary.generate` est en queue avec `{ userId, newsletterId, emailContent, createdAt }`
**When** le worker `lib/queue/workers/summary.worker.ts` traite le job
**Then** le tier utilisateur est récupéré depuis Supabase pour déterminer le modèle LLM à utiliser
**And** le prompt optimisé est construit (instructions résumé structuré : texte introductif + 3-5 bullet points avec chiffres clés)
**And** `LLMService.generate()` est appelé avec le modèle approprié (basique tier gratuit / premium tier payant)
**And** le résumé généré est inséré dans la table `summaries` avec `is_premium` selon le tier
**And** le statut `email_events` est mis à jour en `completed`
**And** en cas d'échec après 3 tentatives, le statut passe à `failed` et une alerte Sentry est déclenchée

### Story 5.4 : Logique Dual-Tier LLM (1 Résumé Premium/Jour pour Gratuit)

En tant que système,
je veux appliquer la règle du teaser premium (1 résumé premium/jour pour les utilisateurs gratuits),
afin de leur donner un aperçu de la qualité premium et les inciter à upgrader.

**Acceptance Criteria:**

**Given** un utilisateur du tier gratuit reçoit une newsletter
**When** le worker détermine quel modèle utiliser
**Then** si l'utilisateur n'a pas encore reçu de résumé premium aujourd'hui (UTC), le modèle premium est utilisé et `is_premium: true`
**And** si l'utilisateur a déjà eu son résumé premium quotidien, le modèle basique est utilisé et `is_premium: false`
**And** les utilisateurs du tier payant reçoivent toujours le modèle premium (`is_premium: true`)
**And** la vérification du quota journalier interroge la table `summaries` : `COUNT WHERE is_premium=true AND DATE(created_at)=today AND user_id=X`
**And** la logique de sélection est couverte par des tests unitaires Vitest

### Story 5.5 : Rate Limiting LLM et Contrôle des Coûts

En tant que système,
je veux appliquer des limites de tokens et des alertes de coûts pour chaque utilisateur,
afin de garantir que les coûts LLM restent dans les budgets cibles (≤ 0.5€/gratuit, ≤ 1.5€/payant).

**Acceptance Criteria:**

**Given** un résumé est en cours de génération
**When** le prompt est envoyé au LLM
**Then** `maxTokens` est limité à 800 tokens en sortie (configurable via variable d'environnement `LLM_MAX_OUTPUT_TOKENS`)
**And** après chaque génération, le coût cumulé mensuel de l'utilisateur est mis à jour dans `llm_costs`
**And** si le coût mensuel d'un utilisateur dépasse 1.8€, une alerte est loggée via Pino et envoyée à Sentry
**And** `lib/llm/costTracker.ts` expose `getUserMonthlyCost(userId)` et `checkCostThreshold(userId)`
**And** le rate limiter Redis bloque temporairement les générations si un utilisateur atteint un quota abusif (> 50 résumés/jour)

