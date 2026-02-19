# Epic 2 : Pages Publiques & Acquisition SEO

**Statut :** Prêt pour développement
**FRs couverts :** FR64-70
**NFRs couverts :** NFR-P1 (FCP <1.5s, LCP <2.5s), NFR-A1-13 (WCAG 2.1 AA), NFR-SC4 (TLS 1.3)

## Objectif

Les visiteurs publics peuvent découvrir Briefly via une landing page SSG optimisée, comparer les offres gratuites et payantes, s'inscrire via Clerk, et l'application est correctement indexée par les moteurs de recherche en français et en anglais. Toutes les pages marketing sont servies en SSG via Cloudflare CDN pour une performance maximale (FCP <1.5s, LCP <2.5s).

## Stories

| Story | Titre | Priorité | Complexité | Effort |
|---|---|---|---|---|
| [2.1](./story-2.1-landing-page.md) | Landing Page Principale (FR + EN) | P1 | Medium (3 pts) | 1-2 jours |
| [2.2](./story-2.2-pricing-page.md) | Page Pricing avec Comparaison des Tiers | P1 | Low (2 pts) | 0.5 jour |
| [2.3](./story-2.3-signup-flow.md) | Flux d'Inscription depuis la Landing Page | P0 | Low (2 pts) | 0.5 jour |
| [2.4](./story-2.4-seo-technical.md) | SEO Technique — Sitemap, Robots.txt, Structured Data | P1 | Low (2 pts) | 0.5 jour |
| [2.5](./story-2.5-legal-pages.md) | Pages Légales (Politique de Confidentialité + CGU) | P1 | Low (1 pt) | 0.5 jour |

## Ordre d'implémentation recommandé

```
Story 2.1 (Landing Page)
    ↓
Story 2.2 (Pricing)   Story 2.3 (Signup)   Story 2.4 (SEO)   Story 2.5 (Legal)
    ↓                       ↓
  Epic 7                  Epic 3
(Billing page)         (Auth middleware)
```

## Architecture technique de l'Epic

### Route Group `(marketing)`

Toutes les pages de cet epic vivent sous `src/app/[locale]/(marketing)/`. Le route group `(marketing)` isole les pages publiques SSG des zones authentifiées, sans impacter les URLs (ex: `briefly.app/fr/` et non `briefly.app/fr/marketing/`).

```
src/app/[locale]/(marketing)/
├── layout.tsx              # Layout marketing : header public + footer avec liens légaux
├── page.tsx                # Landing page (FR + EN)
├── pricing/
│   └── page.tsx            # Page pricing
└── legal/
    ├── privacy/
    │   └── page.tsx        # Politique de confidentialité
    └── terms/
        └── page.tsx        # CGU
```

### Stratégie SSG + CDN

- `generateStaticParams()` pour pre-render les locales `['fr', 'en']` au build
- Pages exportées comme HTML statique → servis par Cloudflare CDN (TTL 24h)
- Cache-Control : `s-maxage=86400, stale-while-revalidate=3600`
- Revalidation : `next revalidate` avec tag `marketing-pages`

### i18n avec `next-intl`

- Fichiers de messages : `messages/fr.json` et `messages/en.json`
- Clés d'espace de noms : `marketing.*`, `pricing.*`, `legal.*`
- `getTranslations('marketing')` dans les Server Components
- Alternates hreflang dans `generateMetadata()` pour chaque page

## FR Coverage Detail

| FR | Description | Story |
|---|---|---|
| FR64 | Landing page optimisée (valeur proposition Briefly) | 2.1 |
| FR65 | Page pricing (gratuit vs payant) | 2.2 |
| FR66 | Pages marketing multilingues (FR + EN) | 2.1, 2.2, 2.5 |
| FR67 | Inscription depuis la landing page | 2.3 |
| FR68 | Métadonnées SEO optimales (titres, descriptions, données structurées) | 2.4 |
| FR69 | Sitemap XML pour moteurs de recherche | 2.4 |
| FR70 | Pages marketing servies en SSR/SSG | 2.1, 2.2, 2.4, 2.5 |
