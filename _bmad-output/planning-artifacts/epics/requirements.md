# Briefly - Requirements Inventory

## Functional Requirements

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

---

## NonFunctional Requirements

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

---

## Additional Requirements

**Exigences architecturales (depuis Architecture.md) :**

- **Starter Template :** `create-next-app@latest --typescript --tailwind --eslint --app --src-dir` + `npx shadcn@latest init`
- Infrastructure VPS OVH (~10€/mois) avec Caddy (reverse proxy + HTTPS auto), Docker Compose, déploiement via Kamal
- Ingestion email : adresse dédiée `{uuid}@mail.briefly.app` via Cloudflare Email Routing → webhook Next.js → BullMQ (pas OAuth inbox)
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
