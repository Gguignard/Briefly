---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
inputDocuments: ["_bmad-output/planning-artifacts/product-brief-Briefly-2026-02-15.md"]
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: "web_app"
  domain: "general"
  complexity: "low-medium"
  projectContext: "greenfield"
---

# Product Requirements Document - Briefly

**Author:** Greg
**Date:** 2026-02-15

## Success Criteria

### User Success

Les utilisateurs réussissent avec Briefly quand ils **gagnent du temps tout en restant mieux informés** sur les sujets qui les intéressent.

**Moment "Worth It":**
L'utilisateur vient consulter Briefly chaque semaine et peut **suivre toutes ses newsletters** alors qu'avant il ne pouvait pas. Sentiment de contrôle retrouvé et d'exhaustivité sans culpabilité.

**Indicateurs de Succès Utilisateur:**

1. **Volume de Consommation Augmenté**
   - Métrique: 10-15 résumés lus/utilisateur/semaine
   - Baseline: 5-6 newsletters/semaine avant Briefly → 15-20 résumés/semaine avec Briefly
   - Signification: Briefly permet de couvrir large sans effort

2. **Identification Précise de Valeur**
   - Métrique: Taux de redirection vers newsletters complètes
   - Target: 15-25% des résumés lus génèrent un clic
   - Signification: Briefly aide à capter ce qui mérite vraiment attention complète

3. **Formation d'Habitude**
   - Comportement: Briefly remplace "ouvrir Gmail pour newsletters" par "ouvrir Briefly"
   - Fréquence: Au moins 1 session/semaine avec ≥5 résumés lus

4. **Moment "Aha!"**
   - Timing: Première semaine
   - Réalisation: Capturé insights de 15 newsletters en 30-45 min vs 3h+ avant

### Business Success

**Objectifs à 3 Mois (Validation MVP):**
- ✅ **20 utilisateurs payants** convertis
- ✅ **100€ MRR**
- ✅ **Rétention J30 ≥50%**
- ✅ **Taux de conversion gratuit→payant ≥5%**

**Objectifs à 12 Mois (Croissance Stable):**
- ✅ **500 utilisateurs actifs** (WAU: ≥1 session/semaine, ≥5 résumés lus)
- ✅ **100 utilisateurs payants** (~20% taux conversion)
- ✅ **500€ MRR**
- ✅ **Seuil rentabilité dépassé** (200-300€ coûts + 150-200€ profit)
- ✅ **Rétention J90 ≥30%**
- ✅ **10h/semaine maintenance** suffisent (side project viable)

**Décision Go/No-Go @ 3 Mois:**
- **GO**: ≥15 payants + rétention ≥40% + feedback positif → continuer
- **PIVOT**: 5-14 payants + problème identifié → ajuster et re-tester
- **NO-GO**: <5 payants + faible engagement + feedback négatif → arrêter

### Technical Success

**Performance Requirements:**
- ✅ **Temps génération résumé on-demand:** < 2 secondes
- ✅ **Taux succès OAuth email:** > 95%
- ✅ **Disponibilité service:** > 99% uptime

**Cost Efficiency:**
- ✅ **Coût LLM utilisateur gratuit:** < 0.5€/mois/user
- ✅ **Coût LLM utilisateur payant:** < 1.5€/mois/user
- ✅ **Marge nette tier payant:** > 60% (5€ revenu - 1.5€ LLM - 0.5€ infra = 3€ = 60%)

**Quality Metrics:**
- ✅ **Qualité résumés IA:** Validation indirecte via taux clics 15-25% vers newsletter complète
- ✅ **Satisfaction utilisateur:** Feedback qualitatif positif + NPS tracking

### Measurable Outcomes

**Leading Indicators (Prédicteurs de Succès):**
- J1-J7: Utilisateur configure ≥3 newsletters + lit ≥5 résumés → forte probabilité rétention
- J7-J14: Utilisateur atteint limite gratuite (5 newsletters) → forte probabilité conversion
- J14-J30: Utilisateur crée catégories custom → power user, forte LTV

**Engagement Metrics:**
- WAU (Weekly Active Users): 50-100 @ 3 mois, 500 @ 12 mois
- Résumés lus/utilisateur/semaine: Moyenne 10-15
- Taux redirection newsletters complètes: 15-25%

**Retention Metrics:**
- Rétention J7: ≥50%
- Rétention J30: ≥50%
- Rétention J90: ≥30%

**Conversion Metrics:**
- Fenêtre conversion: 1-2 semaines (inscription → payant)
- Taux conversion gratuit→payant: ~20% @ 12 mois
- Churn mensuel: <10%

**Growth Metrics:**
- Nouveaux utilisateurs/mois: 20-30 @ 3 mois, 50-100 @ 12 mois
- CAC (Customer Acquisition Cost): <20€ (priorité organique)
- LTV/CAC ratio: >3:1

Ces critères guident l'expérience utilisateur dans tous les parcours suivants.

## User Journeys

### Journey 1: Marc Tech - L'Apprenant Curieux Submergé

**Persona:** Marc, 32 ans, Product Manager chez une startup fintech parisienne

**Opening Scene - Le Chaos Gmail:**
Marc ouvre Gmail un lundi matin. 47 newsletters non lues depuis le weekend. Il scroll rapidement, culpabilise en voyant "The Pragmatic Engineer", "Stratechery", "AI Alignment Newsletter" qu'il voulait vraiment lire. Il archive tout en se disant "je les lirai plus tard" (spoiler: jamais). Il a 20 newsletters auxquelles il tient vraiment, mais ne lit que 5-6 par semaine. Le reste s'accumule. **800+ newsletters non lues** dans un dossier Gmail qu'il n'ouvre plus.

**Rising Action - Découverte Briefly:**
Un collègue mentionne Briefly sur Slack: "J'ai enfin réussi à suivre mes newsletters tech sans culpabilité". Marc s'inscrit par curiosité.

**Onboarding (2 minutes):**
- Connexion Gmail OAuth (30 secondes)
- Marc configure manuellement ses 5 newsletters préférées pour tester: The Pragmatic Engineer, Stratechery, TLDR Newsletter, AI Alignment, Lenny's Newsletter
- Il voit un message: "Vos premiers résumés seront disponibles demain matin!"

**Climax - Le Moment "Aha!" (J+1, Mardi matin 7h30):**
Marc ouvre Briefly sur son iPhone pendant son café. **Interface cards élégante** - 3 newsletters reçues hier sont déjà résumées:
- The Pragmatic Engineer: "Meta layoffs impact on remote work + IC career paths" (2 min lecture)
- Stratechery: "AI regulation EU vs US approaches + analysis chiffres clés" (2 min lecture)
- TLDR: "5 tools launches + GitHub Copilot pricing changes" (1 min lecture)

**5 minutes totales** pour capter l'essentiel de 3 longues newsletters. Il clique sur Stratechery pour lire l'article complet qui l'intrigue vraiment.

**Sentiment:** "Wow, je viens de couvrir 3 newsletters en 5 min au lieu de 45 min normalement. Et je sais exactement laquelle mérite lecture complète."

**J+7 - Formation de l'Habitude:**
Marc revient quotidiennement. Il a ajouté 3 nouvelles newsletters (atteint limite gratuite à 5). Il réalise qu'il **lit maintenant 12-15 résumés/semaine** vs 5-6 newsletters complètes avant. Il n'a **plus de culpabilité** face à Gmail.

**J+10 - Conversion Payant:**
Marc veut ajouter "Not Boring" et "Milk Road" crypto newsletters. Il voit la limite gratuite (5 max). **Upgrade à 5€/mois** pour newsletters illimitées + catégorisation (il crée: "Tech", "Business", "AI", "Crypto").

**Resolution - Nouvelle Réalité (J+30):**
Briefly est dans sa routine matinale. **10 min chaque matin** sur mobile pendant café = 15-20 résumés scannés. Il suit maintenant **18 newsletters** sans effort vs 5-6 avant. Gmail n'est plus consulté pour newsletters. **Temps économisé: 5h/semaine.** ROI évident: 5€/mois pour 5h/semaine = no-brainer.

Marc recommande Briefly à 3 collègues.

---

### Journey 2: Sophie Multi-Passions - L'Exploratrice Curieuse

**Persona:** Sophie, 29 ans, designer freelance et maman, Lyon

**Opening Scene - Passions Multiples, Temps Limité:**
Sophie adore apprendre sur plein de sujets: food (Bon Appetit newsletter), design (Sidebar, Dense Discovery), parentalité (Brain Child), business (Morning Brew), voyage (The Points Guy). Elle s'abonne à 15+ newsletters par passion, mais entre client work et sa fille de 3 ans, elle lit **seulement 20% de ce qu'elle reçoit**. Le reste s'accumule. Parfois elle se désabonne par frustration, puis regrette.

**Rising Action - Recherche Google:**
Sophie cherche "comment gérer trop de newsletters" sur Google. Trouve article comparatif mentionnant Briefly. S'inscrit.

**Onboarding:**
Configure 5 newsletters favorites gratuitement: Bon Appetit, Dense Discovery, Morning Brew, Brain Child, The Hustle.

**Climax - Micro-Moments (J+3):**
Sophie découvre qu'elle peut consulter Briefly dans **tous ses micro-moments**:
- **Matin réveil (5 min mobile):** Scanne 3 résumés pendant que sa fille prend petit-déj
- **Pause déjeuner (3 min desktop):** Lit 2 résumés food/design
- **Soir (2 min mobile):** Rattrape le business/voyage

**10 min totales dispersées** dans sa journée = **8 résumés lus** vs 2-3 newsletters complètes avant (qui prenaient 30-45 min d'un bloc).

**J+14 - Conversion:**
Sophie veut ajouter ses newsletters voyage, lifestyle, marketing. Upgrade payant pour newsletters illimitées + catégorisation custom ("Food", "Design", "Parentalité", "Business", "Perso").

**Resolution - Liberté Sans Culpabilité (J+45):**
Sophie suit maintenant **22 newsletters** via Briefly. Elle se **réabonne** à des newsletters qu'elle avait quittées (plus de peur de surcharge). Briefly a transformé sa relation avec l'information: **plaisir de découvrir** vs culpabilité d'accumuler.

---

### Journey 3: Greg Admin - L'Opérateur Side Project

**Persona:** Greg (vous!), fondateur Briefly, 10h/semaine disponibles

**Opening Scene - Monitoring Post-Lancement:**
3 semaines après le lancement MVP. 50 utilisateurs inscrits, 8 payants. Greg se connecte à l'**Admin Dashboard Briefly** pour son monitoring hebdomadaire.

**Dashboard Admin - Vue d'Ensemble:**
Interface simple affichant:
- **Utilisateurs:** 50 actifs, 8 payants (16% conversion)
- **Coûts LLM ce mois:** 28€
  - Gratuits: 12€ (42 users x ~0.28€/user)
  - Payants: 16€ (8 users x ~2€/user - au-dessus target 1.5€)
- **MRR:** 40€ (8 x 5€)
- **Marge nette:** 12€ (40€ MRR - 28€ LLM costs - serveur)

**Rising Action - Alerte Coût:**
Greg voit que les **utilisateurs payants coûtent 2€/user** au lieu de la target 1.5€. Il clique sur détails:
- Analyse: Certains power users avec 25+ newsletters génèrent 50+ résumés/semaine
- Résumés très longs (newsletters longues) = tokens élevés

**Climax - Ajustement Modèle:**
Greg utilise l'interface Admin pour ajuster:
1. **Changer modèle LLM payant:** Passe de GPT-4 à Claude Sonnet (meilleur rapport qualité/coût)
2. **Ajuster limite résumé:** Limite tokens résumés à 800 max (était illimité)
3. **Monitoring alerts:** Configure alerte si coût user >1.8€

**Validation rapide (30 min):** Greg teste les résumés avec nouveau modèle sur ses propres newsletters. Qualité équivalente, coût réduit de 25%.

**Resolution - Rentabilité Retrouvée:**
Semaine suivante, coût moyen payant baisse à 1.4€/user. **Marge nette passe à 20€** (meilleure santé économique).

Greg passe **1h/semaine** sur monitoring admin: coûts, usage patterns, feedback users. Le reste du temps: développement features, support.

**Tooling Admin Utilisé:**
- Dashboard métriques (users, MRR, coûts LLM)
- Configuration modèles LLM (switch providers, ajuster limites)
- Alerts monitoring (coûts anomalies, erreurs système)
- Logs système (debug issues utilisateurs)

---

### Journey 4: Emma Support - L'Utilisatrice Bloquée

**Persona:** Emma, utilisatrice gratuite depuis 2 semaines

**Opening Scene - Problème OAuth:**
Emma essaie d'ajouter une 4ème newsletter mais voit message "Erreur: impossible d'accéder à Gmail". Elle a révoqué l'accès OAuth par erreur dans ses paramètres Gmail.

**Rising Action - Contact Support:**
Emma clique sur **"Aide"** dans Briefly → **Formulaire contact simple:**
- Email
- Sujet: "Problème accès Gmail"
- Description: "Je ne peux plus ajouter de newsletters, message d'erreur Gmail"
- Screenshot (optionnel)

**Climax - Résolution Greg:**
Greg reçoit l'email de support (2h plus tard). Il voit dans les logs admin qu'Emma a révoqué OAuth. Il répond:

"Bonjour Emma,

Il semble que l'accès Gmail ait été révoqué. Pour régler ça:
1. Va dans Settings Briefly
2. Clique 'Reconnecter Gmail'
3. Accepte l'autorisation OAuth

Ça devrait résoudre le problème! Dis-moi si ça ne marche pas.

Greg"

**Resolution - Problème Résolu (30 min):**
Emma suit les étapes, reconnecte Gmail. Problème résolu. Elle répond: "Merci! Ça marche maintenant 😊"

**Temps Greg:** 5 min pour diagnostiquer + répondre.

---

### Journey Requirements Summary

Ces journeys révèlent les **capacités requises** suivantes:

**End User Capabilities (Marc & Sophie):**
1. **Onboarding fluide:** OAuth Gmail/Outlook, configuration newsletters manuelle, messaging clair J+1
2. **Interface cards responsive:** Feed chronologique, design Notion-like, mobile-first
3. **Génération résumés on-demand:** <2s, format texte + bullets, badge LLM
4. **Freemium limits:** Hard limit 5 newsletters gratuit, upgrade flow smooth
5. **Catégorisation custom:** Création catégories, assignment newsletters, filtrage (payant only)
6. **Micro-moments optimization:** Performance mobile, quick loading, offline-friendly
7. **Redirection newsletter complète:** Bouton vers email original Gmail

**Admin Capabilities (Greg):**
1. **Dashboard monitoring:** Users actifs/payants, MRR, coûts LLM aggregate + per-user
2. **LLM configuration:** Switch providers (GPT-4, Claude, etc.), ajuster token limits
3. **Alerts système:** Coûts anomalies, erreurs API, usage patterns
4. **Logs & debugging:** Accès logs pour troubleshoot user issues
5. **Analytics:** Conversion funnels, retention cohorts, churn analysis

**Support Capabilities (Emma):**
1. **Contact form simple:** Email, sujet, description, screenshot upload
2. **Admin logs access:** Voir état utilisateur pour debug (OAuth status, erreurs, etc.)
3. **Self-service docs:** FAQ, troubleshooting guides (future)

Les parcours ci-dessus révèlent les exigences techniques suivantes pour une web app performante.

## Web Application Specific Requirements

### Project-Type Overview

Briefly est une **Single Page Application (SPA) responsive** optimisée pour une expérience fluide sur desktop et mobile. L'architecture privilégie la performance et le SEO pour maximiser l'acquisition organique tout en offrant une UX moderne inspirée des meilleures applications web contemporaines.

**Architecture Technique:**
- **Frontend:** SPA avec framework moderne (React/Vue/Svelte)
- **Routing:** Client-side routing pour navigation fluide
- **SEO:** Hybride SSR/SSG pour pages critiques + SPA pour interface applicative
- **Performance:** Optimisée pour micro-moments (chargement rapide, interactions fluides)

### Browser Support Matrix

**Navigateurs Supportés:**

| Plateforme | Navigateur | Versions |
|-----------|-----------|----------|
| Desktop | Chrome | Dernières 2 versions majeures |
| Desktop | Edge | Dernières 2 versions majeures |
| Desktop | Firefox | Dernières 2 versions majeures |
| Desktop | Safari | Dernières 2 versions majeures |
| Mobile iOS | Safari | iOS 15+ |
| Mobile Android | Chrome | Android 10+ |

**Rationale:**
- Focus navigateurs modernes = utilisation APIs web récentes (CSS Grid, Flexbox, ES6+)
- Mobile-first: iPhone/iPad Safari + Chrome Android = 90%+ du trafic mobile
- Pas de support IE11 ou navigateurs legacy (gain développement significatif)

### Responsive Design Strategy

**Breakpoints:**
- **Mobile:** 320px - 767px (prioritaire - micro-moments)
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

**Design Approach:**
- **Mobile-first design:** Interface conçue d'abord pour mobile, enrichie sur desktop
- **Cards layout:** Interface cards fluide (Instagram/Pinterest-like) adaptative
- **Touch-optimized:** Boutons ≥44px, zones tactiles généreuses
- **Performance mobile:** Bundle size optimisé, lazy loading images/components

**Key Responsive Requirements:**
- ✅ Feed résumés scrollable et performant sur mobile
- ✅ Navigation simplifiée sur petits écrans (hamburger menu)
- ✅ Typographie responsive (16px+ sur mobile pour lisibilité)
- ✅ Forms optimisés touch (inputs larges, validation inline)

### SEO Strategy

**Approche Hybride SSR/SSG + SPA:**

**Server-Side Rendering (SSR):**
- **Pages marketing:** Landing page, pricing, about
- **Pages SEO critiques:** Blog, guides, FAQ
- **Bénéfice:** Indexation optimale, Core Web Vitals excellents, référencement international

**Static Site Generation (SSG):**
- **Pages statiques:** Documentation, legal (CGV, privacy policy)
- **Bénéfice:** Performance maximale (CDN), coûts réduits

**SPA (Client-Side):**
- **Interface applicative:** Dashboard, résumés, settings (zone authentifiée)
- **Bénéfice:** UX fluide, interactions rapides

**SEO Requirements:**
- ✅ **Meta tags dynamiques:** Title, description, OG tags par page
- ✅ **Sitemap XML:** Généré automatiquement, soumis Google/Bing
- ✅ **Robots.txt:** Configuration crawling optimale
- ✅ **Structured data:** JSON-LD pour rich snippets
- ✅ **International SEO:** Hreflang tags pour versions linguistiques (français, anglais minimum)
- ✅ **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- ✅ **URLs sémantiques:** /pricing, /blog/[slug], /features (pas de #routes)

**Acquisition Targets:**
- Requêtes cibles: "gérer newsletters", "résumer newsletters", "newsletter overload solution"
- Positionnement international (EN, FR minimum)

### Performance Targets

**Loading Performance:**
- ✅ **First Contentful Paint (FCP):** <1.5s
- ✅ **Largest Contentful Paint (LCP):** <2.5s
- ✅ **Time to Interactive (TTI):** <3.5s
- ✅ **Total Bundle Size:** <200KB (gzipped) pour initial load

**Runtime Performance:**
- ✅ **Génération résumé on-demand:** <2s (expérience utilisateur fluide)
- ✅ **Feed scrolling:** 60fps maintenu (smooth scrolling)
- ✅ **Navigation SPA:** <100ms transition entre vues

**Optimization Strategies:**
- Code splitting par route (lazy loading)
- Image optimization (WebP, lazy loading, responsive images)
- CDN pour assets statiques
- Caching agressif (service workers si PWA future)
- Tree shaking et minification

**Monitoring:**
- Google PageSpeed Insights score >90
- Lighthouse CI dans pipeline deployment
- Real User Monitoring (RUM) via analytics

### Accessibility Level: WCAG 2.1 AA

**Conformité Standard:**
- Briefly vise **WCAG 2.1 Level AA** pour accessibilité professionnelle

**Key Requirements:**

**Perceivable:**
- ✅ Contraste texte/background ≥4.5:1 (texte normal), ≥3:1 (texte large)
- ✅ Alternatives textuelles pour éléments non-textuels
- ✅ Contenu adaptable (structure sémantique HTML5)

**Operable:**
- ✅ Navigation complète au clavier (tab order logique, focus visible)
- ✅ Pas de piège clavier (modals, dropdowns)
- ✅ Temps suffisant (pas de timeout agressif)
- ✅ Skip links pour navigation rapide

**Understandable:**
- ✅ Langue page déclarée (lang="fr" ou "en")
- ✅ Labels formulaires explicites
- ✅ Messages d'erreur clairs et constructifs
- ✅ Navigation cohérente

**Robust:**
- ✅ HTML valide et sémantique
- ✅ ARIA labels où nécessaire (non overuse)
- ✅ Compatible lecteurs d'écran (NVDA, JAWS, VoiceOver)

**Testing Approach:**
- Automated: axe-core, Lighthouse accessibility audit
- Manual: Keyboard navigation testing, screen reader testing
- Validation: WAVE browser extension, manual WCAG checklist

### Real-Time Requirements

**Temps Réel: Non Requis**

Briefly ne nécessite **pas de fonctionnalités temps réel** pour le MVP:
- ❌ Pas de WebSockets
- ❌ Pas de Server-Sent Events (SSE)
- ❌ Pas de streaming IA visible

**Approche Préférée:**
- Polling périodique si nécessaire (check nouveaux résumés toutes les 5-10 min)
- Refresh manuel utilisateur (pull-to-refresh sur mobile)
- Background jobs serveur pour génération résumés (asynchrone)

**Rationale:**
- Simplifie architecture (pas besoin infrastructure WebSocket)
- Réduit coûts serveur (pas de connections persistantes)
- Adéquat pour use case (newsletters arrivent 1x/jour, pas besoin instantanéité)

### Implementation Considerations

**Framework Recommendation:**
- **Next.js** (React) ou **Nuxt.js** (Vue) pour hybride SSR/SSG/SPA
- Permet pages marketing en SSG, app en SPA, flexibilité maximale

**Infrastructure:**
- **Hosting:** Vercel, Netlify, ou similaire (edge functions, CDN global)
- **Database:** PostgreSQL (résumés, users, newsletters config)
- **File Storage:** S3 ou équivalent (si images futures)
- **CDN:** Cloudflare ou intégré hosting (assets, caching)

**Security:**
- HTTPS obligatoire (certificat SSL)
- OAuth 2.0 sécurisé (Gmail/Outlook)
- CORS configuration stricte
- Rate limiting API endpoints
- Input validation & sanitization

**Monitoring & Analytics:**
- Google Analytics ou Plausible (privacy-friendly)
- Error tracking: Sentry ou similaire
- Performance monitoring: Vercel Analytics ou custom

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche MVP: Hybrid Experience + Revenue MVP**

Briefly adopte une stratégie hybride qui équilibre qualité d'expérience et viabilité économique immédiate:

**Experience MVP (UX de Qualité):**
- Interface cards élégante inspirée Notion/Instagram/Pinterest dès le lancement
- Performance optimisée (<2s génération résumés, 60fps scrolling)
- Responsive impeccable desktop + mobile (micro-moments)
- Accessibilité WCAG 2.1 AA professionnelle
- SEO international (SSR/SSG) avec landing page optimisée pour acquisition

**Revenue MVP (Rentabilité Dès Début):**
- Freemium model agressif (5 newsletters max gratuit → conversion rapide)
- Catégorisation custom réservée payant (différenciateur clé)
- 2 LLM (basique/premium) pour optimiser marges
- Stripe intégré dès MVP pour monétisation J1
- Objectif: **Absorber coûts opérationnels dès 3 mois** (20 payants, 100€ MRR)

**Rationale Stratégique:**
- Side project 10h/semaine → doit être **rentable rapidement** pour justifier temps investi
- Marché compétitif (Meco, LaterOn) → UX exceptionnelle = **différenciateur critique**
- Coûts LLM variables → modèle économique doit être **validé tôt** (risque majeur identifié)
- Acquisition organique → **Landing page SEO optimisée = levier acquisition principal**

**Timeline MVP:** **3 mois** de développement (10h/semaine = ~120h totales)

**Ressources Requises:**
- **Développeur Full-Stack:** 1 personne (Greg) - Next.js/React, Node.js, PostgreSQL
- **Skills Nécessaires:** Frontend (React/Next.js), Backend (API design), DevOps (Vercel/deployment), Intégrations (OAuth, Stripe, LLM APIs)
- **Budget Initial:** 200-500€ (LLM APIs testing, domaine, hosting premiers mois)

### MVP Feature Set (Phase 1 - Lancement)

**Philosophie:** Toutes les features documentées restent dans le MVP. Elles constituent les **différenciateurs essentiels** face aux concurrents (Meco, LaterOn) et sont nécessaires pour valider le modèle économique freemium.

#### Core User Journeys Supportés

**MVP supporte 4 types d'utilisateurs:**

1. **Marc Tech (Primary User - Success Path):**
   - Onboarding OAuth Gmail → Configuration 5 newsletters → Premiers résumés J+1 → Lecture quotidienne → Conversion payant J10 (limite atteinte)

2. **Sophie Multi-Passions (Primary User - Multi-Interest):**
   - Configuration passions multiples → Utilisation micro-moments (mobile) → Catégorisation custom (payant) → Retention long-terme

3. **Greg Admin (Operations User):**
   - Monitoring dashboard (users, MRR, coûts LLM) → Configuration LLM providers → Alerts coûts anomalies → Support utilisateurs

4. **Emma Support (Troubleshooting User):**
   - Contact form support → Admin logs debugging → Résolution problème OAuth → Retention sauvegardée

#### Must-Have Capabilities (MVP Complet)

**1. Authentication & Account Management**
- ✅ OAuth 2.0 sécurisé Gmail + Outlook
- ✅ Settings: email management, subscription Stripe, logout
- ✅ Session management sécurisée (JWT tokens)

**2. Newsletter Configuration (Manuelle)**
- ✅ Ajout manuel newsletters via adresse email expéditeur
- ✅ Liste newsletters configurées (éditable, suppressible)
- ✅ Limite hard: 5 newsletters gratuit, illimité payant
- ✅ Validation: vérification format email, détection doublons

**3. AI Summarization Engine**
- ✅ **2 LLM dès MVP:**
  - LLM basique (GPT-3.5 Turbo / Claude Haiku) pour tier gratuit
  - LLM premium (GPT-4o / Claude Sonnet) pour tier payant
- ✅ **Free tier:** 1 résumé premium/jour (teaser qualité) + reste basique
- ✅ **Paid tier:** Tous résumés premium
- ✅ Génération on-demand (<2s target performance)
- ✅ Format résumé: texte + bullet points (chiffres clés, insights principaux)
- ✅ Longueur variable adaptée newsletter (limite max tokens pour coût control)
- ✅ Premiers résumés disponibles J+1 post-inscription (pas de backlog rétroactif)

**4. Responsive Web Interface (SPA)**
- ✅ Architecture Next.js (React) - SSR/SSG pages marketing + SPA app
- ✅ Design cards inspiré Instagram/Pinterest/Notion
- ✅ Feed chronologique résumés (plus récents premier)
- ✅ Card résumé contient:
  - Titre newsletter + date réception
  - Résumé IA (texte + bullets)
  - Bouton "Lire newsletter complète" (redirection email original Gmail)
  - Badge LLM utilisé (basique vs premium)
- ✅ Responsive breakpoints: Mobile (320-767px), Tablet (768-1023px), Desktop (1024px+)
- ✅ Mobile-first design (priorité micro-moments)

**5. Filtering & Navigation**
- ✅ Filtrage par **catégorie** (si utilisateur payant a créé catégories)
- ✅ Filtrage par **newsletter** (voir tous résumés d'une newsletter spécifique)
- ✅ Vue "Toutes newsletters" par défaut (feed complet chronologique)
- ✅ Navigation hamburger menu sur mobile

**6. Custom Categorization (Paid-Only Feature)**
- ✅ **Utilisateurs payants uniquement:** Création catégories illimitées (Tech, Finance, Perso, etc.)
- ✅ Assignment newsletters à 1+ catégories
- ✅ Filtrage résumés par catégorie
- ✅ **Gratuit = pas de catégorisation** (différenciateur conversion clé)

**7. Summary History**
- ✅ Accès tous résumés passés (historique illimité dans temps)
- ✅ Navigation chronologique (pagination ou infinite scroll)
- ✅ Persistance complète données utilisateur

**8. Freemium Business Model**
- ✅ **Free Tier:**
  - Max 5 newsletters enregistrées
  - Résumés illimités de ces 5 newsletters
  - 1 résumé premium/jour (teaser LLM supérieur)
  - Reste résumés via LLM basique
  - Pas de catégorisation custom

- ✅ **Paid Tier (4-5€/mois):**
  - Newsletters illimitées
  - Tous résumés via LLM premium (GPT-4o, Claude Sonnet)
  - Catégorisation custom illimitée
  - Historique complet
  - Support prioritaire

**9. Payment Management (Stripe)**
- ✅ Intégration Stripe abonnements récurrents
- ✅ Pricing page claire (gratuit vs payant, ROI explicite)
- ✅ Flow upgrade gratuit→payant fluide (in-app, friction minimale)
- ✅ Gestion abonnement Settings (annulation, changement carte, invoices)
- ✅ Webhooks Stripe (subscription created/cancelled/payment failed)

**10. SEO & Acquisition Infrastructure (CRITIQUE)**
- ✅ **Landing Page Optimisée:**
  - SSG (performance maximale)
  - Hero section (problème/solution clair)
  - Features highlights (différenciateurs vs Meco/LaterOn)
  - Pricing transparent
  - CTA fort (Sign Up / Try Free)
  - Testimonials/social proof (post-lancement)

- ✅ **SEO International:**
  - Pages marketing SSR/SSG (français + anglais minimum)
  - Meta tags optimisés (title, description, OG tags)
  - Sitemap XML + robots.txt
  - Structured data (JSON-LD)
  - Hreflang tags (FR/EN)
  - Core Web Vitals <2.5s LCP

- ✅ **Target Keywords:**
  - "gérer newsletters" / "manage newsletters"
  - "résumer newsletters" / "summarize newsletters"
  - "newsletter overload" / "trop de newsletters"

**11. Admin Dashboard (Operations Essentielles)**
- ✅ **Monitoring Metrics:**
  - Utilisateurs actifs/payants count
  - MRR (Monthly Recurring Revenue)
  - Coûts LLM aggregate + per-user breakdown
  - Conversion funnel (signups → actifs → payants)

- ✅ **LLM Cost Control:**
  - Configuration providers (switch GPT-4 ↔ Claude)
  - Token limits par résumé (coût control)
  - Alerts coûts anomalies (user >1.8€/mois, système >seuil)

- ✅ **User Support Tools:**
  - Logs utilisateurs (OAuth status, erreurs API, usage)
  - Contact form submissions tracking
  - Manual user actions (reset OAuth, refund, etc.)

**12. Support Infrastructure**
- ✅ Contact form simple (email, sujet, description, screenshot upload optionnel)
- ✅ Admin access logs pour debug (OAuth issues, erreurs génération, etc.)
- ✅ Email support response (monitoring inbox support@briefly.app)

### Out of Scope for MVP (Explicitly Excluded)

**Ces features sont confirmées HORS MVP** pour maintenir focus 3 mois et lancement rapide:

**Phase 2+ Features:**

1. ❌ **Gestion Backlog Newsletters** (v2.0)
   - Résumé rétroactif 200+ newsletters accumulées
   - Complexité technique + coût LLM élevé
   - Feature premium future ou one-time fee

2. ❌ **Détection Automatique Newsletters** (v2.0)
   - Scan auto emails + suggestions newsletters détectées
   - MVP = configuration 100% manuelle (simple, prévisible)

3. ❌ **Notifications Email/Push** (v2.0)
   - Email "nouveaux résumés disponibles"
   - Push notifications web/mobile
   - MVP = engagement organique (utilisateur ouvre app volontairement)

4. ❌ **Recherche Textuelle Full-Text** (v2.0)
   - Recherche mots-clés dans contenu résumés
   - MVP = filtres (catégorie, newsletter) suffisent

5. ❌ **App Mobile Native iOS/Android** (v2.5)
   - MVP = responsive web excellente (fonctionne très bien mobile)
   - Native = après validation traction

6. ❌ **Partage & Collaboration** (v3.0)
   - Partage résumés, workspaces équipes
   - Potentiel pivot B2B futur

7. ❌ **Insights & Analytics Utilisateur** (v2.5)
   - Dashboard "vos sujets plus lus", temps économisé
   - Feature engagement/rétention post-MVP

8. ❌ **Mode Digest Hebdomadaire** (v2.5)
   - Résumé de résumés (1 gros digest semaine)
   - Après validation pattern usage

9. ❌ **Suggestions Newsletters Populaires** (v3.0)
   - Recommandations newsletters par domaine
   - Nécessite masse critique utilisateurs

10. ❌ **Résumés Articles Web** (v3.0+)
    - Extension au-delà newsletters
    - Vision long-terme, hors scope initial

### Post-MVP Features Roadmap

#### Phase 2 (v2.0) - Enrichissement Fonctionnel (Mois 4-9)

**Objectif:** Améliorer engagement, rétention, et réduire friction utilisateur

**Features Prioritaires:**

1. **Gestion Backlog Newsletters** (Premium Feature)
   - Résumé rétroactif 100-200 newsletters accumulées
   - Tier premium séparé (ex: 10€ one-time fee ou 8€/mois premium+)
   - Résout pain point complet nouveaux utilisateurs

2. **Détection Semi-Automatique Newsletters**
   - Scan emails + suggestions newsletters détectées
   - Confirmation manuelle utilisateur (hybride auto + manuel)
   - Améliore onboarding UX significativement

3. **Notifications Configurables**
   - Email opt-in "nouveaux résumés disponibles"
   - Push web notifications (PWA)
   - Smart timing basé habitudes utilisateur

4. **Recherche Full-Text**
   - Recherche mots-clés dans résumés historiques
   - Filtres avancés (date range, newsletter, catégorie)
   - "Retrouver cet article sur IA dont je me souviens vaguement"

5. **Insights & Analytics Dashboard**
   - "Vos newsletters les plus engageantes"
   - Temps économisé calculé (vs lecture complète)
   - Statistiques hebdo/mensuelles
   - Gamification douce (streaks lecture)

**Timeline Phase 2:** 6 mois post-MVP (développement parallèle maintenance)

**Triggers Lancement Phase 2:**
- ✅ 100+ utilisateurs payants atteints
- ✅ 500€ MRR stable
- ✅ Rétention J90 >30% confirmée
- ✅ Feedback utilisateurs demandant ces features

#### Phase 3 (v3.0+) - Scale & Expansion (Année 2+)

**Objectif:** Différenciation marché, nouveaux segments utilisateurs, expansion domaine

**Features Vision:**

1. **App Mobile Native** (iOS + Android)
   - Expérience optimale micro-moments
   - Notifications push natives
   - Offline reading mode
   - Widget iOS home screen

2. **Mode Digest Hebdomadaire**
   - Résumé de résumés personnalisé
   - Option email hebdo highlights
   - Pour utilisateurs préférant batch processing weekend

3. **Partage & Collaboration** (B2B Pivot Potential)
   - Partager résumés avec collègues/amis
   - Workspaces équipes (newsletters pros partagées)
   - Pivot B2B: équipes gérant veille sectorielle collaborative

4. **Résumés Articles Web** (Domain Extension)
   - Extension navigateur "Résumer avec Briefly"
   - Résumer articles, blogs, documentation
   - Élargit TAM (Total Addressable Market)

5. **API Briefly & Intégrations**
   - API publique résumés
   - Intégrations Notion, Obsidian, Readwise
   - Marketplace résumés curated

**Timeline Phase 3:** Année 2+ (si traction significative démontrée)

**Triggers Lancement Phase 3:**
- ✅ 500+ utilisateurs payants
- ✅ 2500€+ MRR
- ✅ Product-market fit validé
- ✅ Capacité investissement temps/ressources (scale beyond side project)

### Risk Mitigation Strategy

#### Risque Majeur #1: Coûts LLM Sous-Estimés

**Description Risque:**
Les coûts LLM pourraient exploser au-delà des prévisions (target: <0.5€/mois gratuit, <1.5€/mois payant), détruisant marges et rendant modèle économique non-viable.

**Facteurs Risque:**
- Power users avec 25+ newsletters = 50+ résumés/semaine
- Newsletters très longues (5000+ mots) = tokens élevés
- Mauvaise estimation longueur moyenne résumés
- Coûts API LLM augmentent (peu probable 2026 mais possible)

**Mitigation Strategies:**

**1. Monitoring & Alerts Proactifs:**
- ✅ Dashboard admin affiche **coût LLM par utilisateur en temps réel**
- ✅ Alerts automatiques si user >1.8€/mois ou système >seuil budget
- ✅ Tracking coûts quotidien/hebdomadaire pour détecter dérive tôt

**2. Limits Techniques:**
- ✅ **Token limit résumés:** Max 800 tokens par résumé (configurable admin)
- ✅ **Rate limiting génération:** Max X résumés/jour par user (si abus détecté)
- ✅ **Prompt optimization:** Itération prompts pour réduire tokens sans sacrifier qualité

**3. Flexibilité Modèles LLM:**
- ✅ **Multi-provider architecture:** Facile switch GPT-4 ↔ Claude ↔ autres
- ✅ **A/B testing modèles:** Tester coût/qualité ratio différents LLM
- ✅ **Model downgrade option:** Si coûts explosent, downgrade temporaire LLM premium

**4. Pricing Adjustments:**
- ✅ **Plan B pricing:** Si marges <40%, augmenter tier payant 5€ → 6-7€
- ✅ **Usage-based tier:** Introduire tier "Power User" (10€/mois, 50+ newsletters) si nécessaire
- ✅ **Transparence utilisateurs:** Communiquer clairement ROI (5h/semaine économisées >> 5€/mois)

**5. Fallback Radical:**
- ✅ Si coûts ingérables: **Limiter newsletters payant** (ex: 20 max au lieu illimité)
- ✅ Communiquer changement comme "optimisation qualité" vs aveu échec

**Validation Early Signal:**
- **Mois 1-2:** Monitorer coûts réels 50-100 premiers users
- **Go/No-Go @ Mois 2:** Si coûts >2x prévisions, ajuster avant scale

#### Risque Majeur #2: Acquisition Organique Trop Lente

**Description Risque:**
Acquisition organique (SEO + bouche-à-oreille) insuffisante pour atteindre 500 users @ 12 mois, ralentissant validation modèle et croissance.

**Facteurs Risque:**
- SEO compétitif sur keywords "newsletter management"
- Domain Authority faible (nouveau site)
- Google indexation lente (3-6 mois)
- Bouche-à-oreille imprévisible

**Mitigation Strategies:**

**1. SEO Agressif Dès MVP:**
- ✅ **Landing page optimisée J1:** Hero, features, pricing, CTA fort
- ✅ **Blog content early:** 5-10 articles SEO-optimized pre-launch
  - "How to manage newsletter overload"
  - "Best newsletter summarizer tools 2026"
  - "Briefly vs Meco comparison"
- ✅ **Backlinks strategy:** Submit Product Hunt, Hacker News, indie hackers forums
- ✅ **International SEO:** Français + Anglais dès début (2x market TAM)

**2. Distribution Channels Diversifiés:**
- ✅ **Product Hunt launch:** Préparation campagne (teaser, hunters, upvotes)
- ✅ **Reddit/communities:** r/productivity, r/newsletters, r/SideProject (authentic engagement)
- ✅ **Twitter/X presence:** Thread lancement, demo vidéos, build in public
- ✅ **Indie Hackers:** Build in public journey, metrics transparentes

**3. Viral Loops Intégrés:**
- ✅ **Referral program simple:** Parraine ami = 1 mois gratuit (payant)
- ✅ **"Powered by Briefly" footer:** Résumés partagés (si sharing v2) avec attribution
- ✅ **Social proof:** Testimonials utilisateurs satisfaits sur landing page

**4. Paid Acquisition Test Budget:**
- ✅ **Budget test:** 200-500€ Google Ads / Facebook Ads (mois 4-6)
- ✅ **Target:** CAC <20€ pour valider canal
- ✅ **Si ROI positif:** Scale graduel paid acquisition

**5. Monitoring & Pivots:**
- ✅ **Weekly signups tracking:** Objectif 20-30 signups/mois @ mois 3
- ✅ **Source attribution:** Identifier canaux performants (SEO, Product Hunt, referral)
- ✅ **Pivot rapide:** Si channel mort, abandonner et tester autre (fail fast)

**Validation Early Signal:**
- **Mois 1:** 30-50 signups (early adopters, réseaux personnels)
- **Mois 3:** 100+ signups (SEO commence porter fruits)
- **Go/No-Go @ Mois 6:** Si <200 signups totaux, revoir stratégie acquisition ou pivot

#### Risques Secondaires

**Risque Technique: OAuth Complexité**
- **Mitigation:** Utiliser librairies éprouvées (Passport.js, NextAuth), tester tôt avec Gmail/Outlook APIs
- **Fallback:** Si OAuth bloquant, lancer avec Gmail only d'abord, Outlook ensuite

**Risque Marché: Conversion <5%**
- **Mitigation:** A/B testing freemium limits (5 newsletters vs 3 vs 7), optimiser paywall UX
- **Fallback:** Ajuster pricing (4€ → 3€), ou ajouter features payant-only

**Risque Resource: 10h/semaine insuffisantes**
- **Mitigation:** Scope ruthless, réutiliser components (Next.js boilerplate, Tailwind UI)
- **Fallback:** Étendre timeline MVP 3 mois → 4-5 mois, acceptable pour side project

### Success Criteria Recap (Validation Gates)

**@ 3 Mois (Fin MVP):**
- ✅ Produit déployé production, fonctionnel, stable
- ✅ 20 utilisateurs payants convertis (validation willingness-to-pay)
- ✅ 100€ MRR (validation modèle économique)
- ✅ Rétention J30 ≥50% (validation product-market fit early)
- ✅ Coûts LLM <1.5€/user payant confirmé (validation marges)

**@ 6 Mois (Post-Launch Iteration):**
- ✅ 50 utilisateurs payants
- ✅ 250€ MRR
- ✅ Rétention J60 ≥40%
- ✅ Acquisition organique 50+ signups/mois

**@ 12 Mois (Product-Market Fit Validation):**
- ✅ 100 utilisateurs payants (objectif final année 1)
- ✅ 500€ MRR (seuil rentabilité dépassé)
- ✅ Rétention J90 ≥30% (habitude ancrée)
- ✅ 10h/semaine maintenance suffisent (side project viable long-terme)

**Décision Gates:**
- **Go @ 3 mois:** ≥15 payants + rétention ≥40% → continuer Phase 2
- **Pivot @ 3 mois:** 5-14 payants + problème identifié → ajuster et re-tester
- **No-Go @ 3 mois:** <5 payants + engagement faible → arrêter ou pivot radical

## Functional Requirements

### User Authentication & Account Management

- **FR1:** Users can create an account using OAuth 2.0 authentication via Gmail
- **FR2:** Users can create an account using OAuth 2.0 authentication via Outlook
- **FR3:** Users can securely login to their existing account
- **FR4:** Users can logout from their account
- **FR5:** Users can revoke and reconnect OAuth access to their email provider
- **FR6:** Users can view their account settings (email, subscription status)
- **FR7:** System maintains secure user sessions using JWT tokens

### Newsletter Configuration & Management

- **FR8:** Users can manually add newsletters by providing the sender email address
- **FR9:** Users can view a list of all their configured newsletters
- **FR10:** Users can edit configured newsletter details
- **FR11:** Users can delete newsletters from their configuration
- **FR12:** System validates newsletter email addresses for correct format
- **FR13:** System detects and prevents duplicate newsletter entries
- **FR14:** Free tier users are limited to configuring a maximum of 5 newsletters
- **FR15:** Paid tier users can configure unlimited newsletters

### AI Summarization Engine

- **FR16:** System automatically detects new newsletters from configured senders in user's email inbox
- **FR17:** System generates AI summaries of newsletters using a basic LLM model (GPT-3.5 Turbo or Claude Haiku)
- **FR18:** System generates AI summaries of newsletters using a premium LLM model (GPT-4o or Claude Sonnet)
- **FR19:** Free tier users receive 1 premium summary per day, with remaining summaries using the basic LLM
- **FR20:** Paid tier users receive all summaries using the premium LLM
- **FR21:** System generates summaries in a structured format containing text and bullet points highlighting key insights and data
- **FR22:** System adapts summary length based on source newsletter length while respecting token limits
- **FR23:** System generates summaries on-demand within performance targets
- **FR24:** New users receive their first summaries starting the day after account creation (J+1)

### Content Consumption & Reading Experience

- **FR25:** Users can view a chronological feed of newsletter summaries (most recent first)
- **FR26:** Users can read individual newsletter summaries presented as visual cards
- **FR27:** Users can access the complete original newsletter from a summary
- **FR28:** Users can see which LLM model was used to generate each summary (basic vs premium badge)
- **FR29:** Users can view the newsletter title and reception date for each summary
- **FR30:** Users can access their complete summary history with unlimited time retention
- **FR31:** Users can navigate through their summary history chronologically

### Filtering & Organization

- **FR32:** Users can filter summaries to view all content from a specific newsletter
- **FR33:** Users can view all newsletters in a default unified feed
- **FR34:** Paid tier users can filter summaries by custom categories they've created
- **FR35:** Users can switch between different filtered views of their content

### Custom Categorization (Paid-Only Feature)

- **FR36:** Paid tier users can create unlimited custom categories with user-defined names
- **FR37:** Paid tier users can assign newsletters to one or more categories
- **FR38:** Paid tier users can edit category names and assignments
- **FR39:** Paid tier users can delete categories
- **FR40:** Free tier users cannot access categorization features

### Subscription & Payment Management

- **FR41:** Users can view available subscription tiers (Free vs Paid) and their features
- **FR42:** Free tier users can upgrade to paid tier subscription
- **FR43:** Users can complete payment setup using Stripe integration
- **FR44:** Users can manage their subscription (view status, payment method, billing history)
- **FR45:** Users can cancel their paid subscription
- **FR46:** Users can update their payment method
- **FR47:** System processes recurring subscription payments via Stripe
- **FR48:** System handles Stripe webhooks for subscription lifecycle events (created, cancelled, payment failed)
- **FR49:** System enforces feature limits based on subscription tier

### Admin & Operations Capabilities

- **FR50:** Admins can view total count of active users and paying users
- **FR51:** Admins can view current Monthly Recurring Revenue (MRR)
- **FR52:** Admins can view aggregate LLM costs and per-user cost breakdown
- **FR53:** Admins can view conversion funnel metrics (signups → active → paying users)
- **FR54:** Admins can configure LLM provider settings (switch between GPT-4, Claude, etc.)
- **FR55:** Admins can set token limits per summary for cost control
- **FR56:** Admins can configure automated alerts for cost anomalies (per-user or system-wide)
- **FR57:** Admins can view detailed user logs (OAuth status, API errors, usage patterns)
- **FR58:** Admins can view support contact form submissions
- **FR59:** Admins can perform manual user actions (reset OAuth, issue refunds, etc.)

### Support & Troubleshooting

- **FR60:** Users can submit support requests via a contact form with email, subject, and description
- **FR61:** Users can optionally attach screenshots to support requests
- **FR62:** Admins can access user activity logs to diagnose and resolve issues
- **FR63:** System sends support request notifications to the admin support inbox

### SEO & Public Content

- **FR64:** Public visitors can view an optimized landing page describing Briefly's value proposition
- **FR65:** Public visitors can view pricing information comparing Free and Paid tiers
- **FR66:** Public visitors can access marketing pages in multiple languages (French and English minimum)
- **FR67:** Public visitors can sign up for an account from the landing page
- **FR68:** System serves marketing pages with optimal SEO metadata (titles, descriptions, structured data)
- **FR69:** System generates and maintains an XML sitemap for search engines
- **FR70:** System serves marketing pages using Server-Side Rendering or Static Site Generation for performance

### Responsive Design & Accessibility

- **FR71:** Users can access all application features on mobile devices (320px-767px viewport)
- **FR72:** Users can access all application features on tablet devices (768px-1023px viewport)
- **FR73:** Users can access all application features on desktop devices (1024px+ viewport)
- **FR74:** Users can navigate the entire application using keyboard-only controls
- **FR75:** Users using screen readers can access all application content and functionality
- **FR76:** System maintains WCAG 2.1 Level AA accessibility compliance

## Non-Functional Requirements

### Performance

**Response Time Requirements:**

- **NFR-P1:** AI summary generation completes in ≤2 seconds for 95% of requests
- **NFR-P2:** Page load (First Contentful Paint) completes in ≤1.5 seconds
- **NFR-P3:** Largest Contentful Paint (LCP) completes in ≤2.5 seconds
- **NFR-P4:** Time to Interactive (TTI) completes in ≤3.5 seconds
- **NFR-P5:** SPA navigation between views completes in ≤100ms

**Rendering Performance:**

- **NFR-P6:** Feed scrolling maintains 60 frames per second (16.67ms frame budget)
- **NFR-P7:** Initial bundle size (gzipped) is ≤200KB for first load

**API Performance:**

- **NFR-P8:** OAuth authentication flow completes in ≤5 seconds
- **NFR-P9:** Newsletter configuration actions (add/edit/delete) respond in ≤500ms
- **NFR-P10:** Filter and category operations respond in ≤300ms

**Performance Monitoring:**

- **NFR-P11:** Google PageSpeed Insights score maintains ≥90 for key pages
- **NFR-P12:** Core Web Vitals meet "Good" thresholds (LCP <2.5s, FID <100ms, CLS <0.1)

### Security

**Authentication & Authorization:**

- **NFR-S1:** All user authentication uses OAuth 2.0 standard protocol
- **NFR-S2:** User sessions use secure JWT tokens with expiration
- **NFR-S3:** OAuth tokens are stored securely and never exposed client-side
- **NFR-S4:** Users can revoke OAuth access at any time

**Data Protection:**

- **NFR-S5:** All data transmission uses HTTPS/TLS 1.3 encryption
- **NFR-S6:** Sensitive data (email content, user info) is encrypted at rest in database
- **NFR-S7:** Payment data is handled exclusively by Stripe (PCI-DSS compliant), never stored locally

**Access Control:**

- **NFR-S8:** Users can only access their own newsletters and summaries (strict data isolation)
- **NFR-S9:** Admin dashboard requires separate authentication with elevated privileges
- **NFR-S10:** API endpoints enforce rate limiting to prevent abuse (max 100 requests/minute per user)

**Privacy & Compliance:**

- **NFR-S11:** System complies with GDPR requirements for European users
- **NFR-S12:** Users can request complete data export (GDPR Article 20)
- **NFR-S13:** Users can request account deletion with all data removed within 30 days (GDPR Article 17)
- **NFR-S14:** Privacy policy clearly documents data usage, storage, and third-party sharing

**Input Validation:**

- **NFR-S15:** All user inputs are validated and sanitized to prevent XSS attacks
- **NFR-S16:** SQL injection protection via parameterized queries or ORM
- **NFR-S17:** CORS configuration restricts API access to authorized origins only

### Reliability & Availability

**Uptime Requirements:**

- **NFR-R1:** System maintains ≥99% uptime (max 7.3 hours downtime per month)
- **NFR-R2:** Planned maintenance windows are scheduled outside peak usage hours (6am-10am UTC)
- **NFR-R3:** Critical path services (OAuth, summary generation, payment) have ≥99.5% uptime

**Error Handling:**

- **NFR-R4:** System gracefully handles OAuth failures with clear user messaging and retry options
- **NFR-R5:** LLM API failures trigger automatic retry (3 attempts) before showing error to user
- **NFR-R6:** Stripe webhook failures are logged and retried automatically
- **NFR-R7:** All critical errors are logged with sufficient context for debugging

**Data Integrity:**

- **NFR-R8:** Database transactions ensure data consistency (ACID properties)
- **NFR-R9:** Automated daily backups with 30-day retention
- **NFR-R10:** Backup recovery tested quarterly to ensure viability

**Monitoring & Alerting:**

- **NFR-R11:** System errors trigger real-time alerts to admin (email/Slack)
- **NFR-R12:** Critical metric anomalies (uptime <95%, error rate >5%) trigger automated alerts
- **NFR-R13:** All production errors are tracked in error monitoring system (Sentry or equivalent)

### Scalability

**User Growth Support:**

- **NFR-SC1:** System architecture supports 10x user growth (50 → 500 users) with <10% performance degradation
- **NFR-SC2:** Database schema and indexes support efficient queries at 5000+ users
- **NFR-SC3:** LLM API calls are queued and rate-limited to prevent service overload

**Resource Efficiency:**

- **NFR-SC4:** Server infrastructure scales horizontally (add instances) vs vertically (bigger machines)
- **NFR-SC5:** Static assets (images, JS, CSS) served via CDN for global performance
- **NFR-SC6:** Database connection pooling prevents resource exhaustion under load

**Traffic Management:**

- **NFR-SC7:** System handles 2x normal traffic during peak hours (morning 7-10am) without degradation
- **NFR-SC8:** API rate limiting prevents individual users from consuming excessive resources

### Accessibility

**WCAG 2.1 Level AA Compliance:**

- **NFR-A1:** All text maintains minimum contrast ratio of 4.5:1 (normal text) and 3:1 (large text)
- **NFR-A2:** All interactive elements are keyboard accessible with visible focus indicators
- **NFR-A3:** All images and icons have descriptive alt text
- **NFR-A4:** All forms have associated labels and clear error messaging
- **NFR-A5:** Semantic HTML5 elements used throughout (header, nav, main, article, etc.)
- **NFR-A6:** ARIA labels provided where semantic HTML insufficient
- **NFR-A7:** No keyboard traps in modals, dropdowns, or other interactive components

**Screen Reader Support:**

- **NFR-A8:** All application features are fully usable with NVDA, JAWS, and VoiceOver screen readers
- **NFR-A9:** Dynamic content changes announced to screen readers via ARIA live regions
- **NFR-A10:** Skip links provided for rapid navigation to main content

**Testing & Validation:**

- **NFR-A11:** Automated accessibility testing (axe-core, Lighthouse) runs in CI/CD pipeline
- **NFR-A12:** Manual keyboard navigation testing performed for all new features
- **NFR-A13:** Manual screen reader testing performed quarterly

### Integration

**OAuth Provider Integration:**

- **NFR-I1:** Gmail OAuth integration maintains ≥95% success rate for authentication
- **NFR-I2:** Outlook OAuth integration maintains ≥95% success rate for authentication
- **NFR-I3:** OAuth token refresh handled automatically without user intervention
- **NFR-I4:** Email inbox polling completes within 5 minutes of newsletter arrival

**Payment Integration (Stripe):**

- **NFR-I5:** Stripe webhook delivery acknowledged within 5 seconds
- **NFR-I6:** Failed payment retries handled automatically per Stripe retry schedule
- **NFR-I7:** Subscription status changes reflected in user account within 30 seconds
- **NFR-I8:** Stripe API errors logged with sufficient context for manual reconciliation if needed

**LLM Provider Integration:**

- **NFR-I9:** LLM API calls timeout after 30 seconds with automatic retry
- **NFR-I10:** LLM provider failures (rate limits, downtime) trigger fallback to alternative provider if configured
- **NFR-I11:** LLM cost tracking updated in real-time after each summary generation
- **NFR-I12:** Multiple LLM providers supported with runtime configuration switching (GPT-4, Claude)

**API Versioning:**

- **NFR-I13:** All external API integrations handle version changes gracefully with backward compatibility
- **NFR-I14:** Breaking changes to integrated APIs detected via monitoring and addressed within 48 hours

### Cost Efficiency

**LLM Cost Control (Critical for Viability):**

- **NFR-C1:** Average LLM cost per free tier user is ≤0.5€/month
- **NFR-C2:** Average LLM cost per paid tier user is ≤1.5€/month
- **NFR-C3:** Token limit per summary enforced (max 800 tokens) to prevent cost overruns
- **NFR-C4:** Admin dashboard displays real-time LLM costs (aggregate and per-user)
- **NFR-C5:** Automated alerts trigger if individual user exceeds 1.8€/month LLM cost
- **NFR-C6:** Automated alerts trigger if total monthly LLM costs exceed budget threshold

**Infrastructure Cost Optimization:**

- **NFR-C7:** Hosting costs (Vercel/Netlify) remain ≤50€/month for 500 users
- **NFR-C8:** Database costs (PostgreSQL) remain ≤30€/month for 500 users
- **NFR-C9:** CDN and bandwidth costs remain ≤20€/month for 500 users

**Gross Margin Targets:**

- **NFR-C10:** Paid tier gross margin (revenue - LLM - infrastructure costs) maintains ≥60%
- **NFR-C11:** Total operational costs (LLM + infrastructure) covered by revenue at ≥20 paying users

### Usability

**Mobile-First Experience:**

- **NFR-U1:** All core user flows completable on mobile devices (320px viewport) without horizontal scrolling
- **NFR-U2:** Touch targets (buttons, links) are minimum 44x44px for easy tapping
- **NFR-U3:** Forms optimized for mobile input (appropriate keyboard types, autocomplete)
- **NFR-U4:** Mobile navigation accessible via hamburger menu or bottom tab bar

**Responsive Design:**

- **NFR-U5:** Layout adapts seamlessly across breakpoints (mobile 320-767px, tablet 768-1023px, desktop 1024px+)
- **NFR-U6:** Typography scales appropriately (minimum 16px on mobile for readability)
- **NFR-U7:** Images and media use responsive sizing (srcset, picture elements)

**Error Messaging & Feedback:**

- **NFR-U8:** All error messages are user-friendly (no technical jargon) and actionable
- **NFR-U9:** Loading states clearly indicate ongoing processes (spinners, skeleton screens)
- **NFR-U10:** Success confirmations provided for all user actions (toast notifications, success messages)

**Onboarding & Learnability:**

- **NFR-U11:** New users can complete first successful summary generation within 5 minutes of signup
- **NFR-U12:** Onboarding flow requires ≤3 steps to first value (OAuth → configure newsletters → see summaries)
- **NFR-U13:** Empty states provide clear guidance on next actions (e.g., "Add your first newsletter")

**Internationalization:**

- **NFR-U14:** All user-facing text supports French and English language variants
- **NFR-U15:** Date and time formats adapt to user locale
- **NFR-U16:** Currency displays correctly for regional contexts (€ for EU, $ for US)
