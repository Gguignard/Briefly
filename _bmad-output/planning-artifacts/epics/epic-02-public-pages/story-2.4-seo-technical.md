# Story 2.4 : SEO Technique — Sitemap, Robots.txt et Structured Data

**Epic :** Epic 2 - Pages Publiques & Acquisition SEO
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** search engine,
**I want** a complete sitemap.xml, a well-configured robots.txt, and JSON-LD structured data,
**so that** Briefly's public pages are indexed correctly and efficiently.

---

## Acceptance Criteria

1. ✅ `/sitemap.xml` liste toutes les pages publiques avec URL canoniques et hreflang FR/EN
2. ✅ `/robots.txt` autorise les pages marketing, bloque `/summaries/`, `/api/`, `/admin/`
3. ✅ Landing page contient JSON-LD `WebSite`, `Organization`, `SoftwareApplication`
4. ✅ Sitemap généré automatiquement via `app/sitemap.ts` Next.js
5. ✅ Core Web Vitals landing page : LCP < 2.5s, CLS < 0.1
6. ✅ Score PageSpeed Insights ≥ 90

---

## Technical Notes

### `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'

const BASE_URL = 'https://briefly.app'
const LOCALES = ['fr', 'en']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/pricing', '/legal/privacy', '/legal/terms']

  return staticPages.flatMap(page =>
    LOCALES.map(locale => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map(l => [l, `${BASE_URL}/${l}${page}`])
        ),
      },
    }))
  )
}
```

### `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/fr/', '/en/'],
        disallow: [
          '/summaries/',
          '/newsletters/',
          '/categories/',
          '/settings/',
          '/billing/',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://briefly.app/sitemap.xml',
  }
}
```

### JSON-LD Structured Data dans la landing page

```typescript
// src/app/[locale]/(marketing)/page.tsx
export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://briefly.app/#website',
        url: 'https://briefly.app',
        name: 'Briefly',
        description: 'Résumés IA de vos newsletters en 2 minutes par jour',
      },
      {
        '@type': 'Organization',
        '@id': 'https://briefly.app/#organization',
        name: 'Briefly',
        url: 'https://briefly.app',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Briefly',
        applicationCategory: 'ProductivityApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Tier gratuit — 5 newsletters max',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Contenu de la landing page */}
    </>
  )
}
```

### Metadata dans `layout.tsx` principal

```typescript
// src/app/[locale]/layout.tsx
export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  return {
    metadataBase: new URL('https://briefly.app'),
    alternates: {
      canonical: `https://briefly.app/${locale}`,
      languages: {
        fr: 'https://briefly.app/fr',
        en: 'https://briefly.app/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
    },
  }
}
```

---

## Dependencies

**Requires :**
- Story 1.5 : next-intl (locales disponibles)
- Story 2.1 : Landing page existante

**Blocks :**
- Indexation SEO en production (dépend du déploiement)

---

## Definition of Done

- [ ] `src/app/sitemap.ts` générant le sitemap XML complet
- [ ] `src/app/robots.ts` configuré correctement
- [ ] JSON-LD injecté dans la landing page
- [ ] Vérification : `curl https://briefly.app/sitemap.xml` retourne le XML
- [ ] Vérification : `curl https://briefly.app/robots.txt` retourne les règles
- [ ] Test Google Rich Results pour le JSON-LD

---

## Testing Strategy

- **Manuel :** `npm run build && npm run start`, visiter `/sitemap.xml` et `/robots.txt`
- **Outil :** [Google Rich Results Test](https://search.google.com/test/rich-results) pour le JSON-LD
- **Outil :** Google Search Console après mise en production

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/sitemap.ts`
- [ ] Créer `src/app/robots.ts`
- [ ] Ajouter JSON-LD dans la landing page
- [ ] Mettre à jour `generateMetadata` dans layout avec hreflang

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
