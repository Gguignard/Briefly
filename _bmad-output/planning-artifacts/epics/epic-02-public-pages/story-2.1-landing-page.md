# Story 2.1 : Landing Page Principale (FR + EN)

**Epic :** Epic 2 - Pages Publiques & Acquisition SEO
**Priority :** P1 (High)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1-2 day(s)

---

## User Story

**As a** visiteur public,
**I want** voir une landing page claire qui explique la valeur de Briefly et me convainc de m'inscrire,
**so that** je comprends immédiatement le problème résolu (surcharge de newsletters) et je clique sur "Essayer gratuitement".

---

## Acceptance Criteria

1. ✅ La page s'affiche à `/fr/` et `/en/` (SSG, pre-rendered au build)
2. ✅ Le Hero section communique clairement : "Transformez vos newsletters en résumés IA en 30 secondes"
3. ✅ Un CTA principal "Essayer gratuitement" est visible above-the-fold et redirige vers `/sign-up`
4. ✅ La section Features présente 3 avantages clés avec icônes (shadcn/ui Card)
5. ✅ Une section Social Proof est présente (compteur utilisateurs ou témoignage)
6. ✅ Un CTA secondaire "Voir les tarifs" redirige vers `/fr/pricing` ou `/en/pricing`
7. ✅ `generateMetadata()` retourne titre, description, og:image, og:title, og:description pour FR et EN
8. ✅ Les alternates hreflang sont présents dans la metadata (`{ fr: '/fr/', en: '/en/' }`)
9. ✅ Les images utilisent `next/image` avec `alt` text descriptifs (WCAG 2.1 AA)
10. ✅ La page est 100% responsive : mobile (320px), tablette (768px), desktop (1024px+)
11. ✅ Score Lighthouse Performance ≥ 90 (mesuré en build de production)
12. ✅ `npm run build` compile sans erreur TypeScript ni ESLint

---

## Technical Notes

### Structure de fichiers à créer

```
src/app/[locale]/(marketing)/
├── layout.tsx              # Layout commun : MarketingHeader + MarketingFooter
└── page.tsx                # Landing page principale

src/components/marketing/
├── HeroSection.tsx
├── FeaturesSection.tsx
├── SocialProofSection.tsx
└── CtaSection.tsx

messages/
├── fr.json                 # Clés namespace "marketing"
└── en.json                 # Clés namespace "marketing"
```

### `app/[locale]/(marketing)/layout.tsx`

```typescript
import { getTranslations } from 'next-intl/server'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter locale={locale} />
    </div>
  )
}
```

### `app/[locale]/(marketing)/page.tsx` — generateStaticParams + generateMetadata

```typescript
import { getTranslations, getMessages } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import HeroSection from '@/components/marketing/HeroSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import SocialProofSection from '@/components/marketing/SocialProofSection'
import CtaSection from '@/components/marketing/CtaSection'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.meta' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://briefly.app'

  return {
    title: t('title'),           // ex: "Briefly — Résumés IA de vos newsletters"
    description: t('description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/`,
      languages: {
        fr: `${baseUrl}/fr/`,
        en: `${baseUrl}/en/`,
        'x-default': `${baseUrl}/fr/`,
      },
    },
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      url: `${baseUrl}/${locale}/`,
      siteName: 'Briefly',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og_title'),
      description: t('og_description'),
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <CtaSection />
    </>
  )
}
```

### `components/marketing/HeroSection.tsx`

```typescript
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export default function HeroSection() {
  const t = useTranslations('marketing.hero')
  const locale = useLocale()

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm">
              {t('badge')}  {/* "Gratuit pour 5 newsletters" */}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {t('headline')}
              {/* "Transformez vos newsletters en résumés IA en 30 secondes" */}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              {t('subheadline')}
              {/* "Économisez 5h/semaine. Briefly lit, résume et catégorise vos newsletters à votre place." */}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href={`/${locale}/sign-up`}>
                  {t('cta_primary')}  {/* "Essayer gratuitement" */}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href={`/${locale}/pricing`}>
                  {t('cta_secondary')}  {/* "Voir les tarifs" */}
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('no_credit_card')}  {/* "Aucune carte bancaire requise" */}
            </p>
          </div>
          {/* Illustration */}
          <div className="relative">
            <Image
              src="/images/dashboard-preview.png"
              alt={t('image_alt')}
              width={600}
              height={400}
              priority
              className="rounded-xl shadow-2xl border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
```

### `components/marketing/FeaturesSection.tsx`

```typescript
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Brain, FolderOpen } from 'lucide-react'

const FEATURES = [
  { key: 'dual_llm', icon: Brain },
  { key: 'auto_summary', icon: Zap },
  { key: 'categories', icon: FolderOpen },
] as const

export default function FeaturesSection() {
  const t = useTranslations('marketing.features')

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ key, icon: Icon }) => (
            <Card key={key} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">{t(`${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t(`${key}.description`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Messages i18n — `messages/fr.json` (namespace marketing)

```json
{
  "marketing": {
    "meta": {
      "title": "Briefly — Résumés IA de vos newsletters | Gratuit",
      "description": "Briefly transforme vos newsletters en résumés IA concis. Économisez 5h/semaine. Gratuit pour 5 newsletters.",
      "og_title": "Briefly — Résumés IA de vos newsletters",
      "og_description": "Transformez vos newsletters en résumés IA en 30 secondes. Gratuit, sans carte bancaire.",
      "og_image_alt": "Aperçu du tableau de bord Briefly"
    },
    "hero": {
      "badge": "Gratuit pour 5 newsletters",
      "headline": "Transformez vos newsletters en résumés IA en 30 secondes",
      "subheadline": "Économisez 5h/semaine. Briefly lit, résume et catégorise vos newsletters à votre place.",
      "cta_primary": "Essayer gratuitement",
      "cta_secondary": "Voir les tarifs",
      "no_credit_card": "Aucune carte bancaire requise",
      "image_alt": "Aperçu du feed de résumés Briefly"
    },
    "features": {
      "title": "Tout ce dont vous avez besoin",
      "subtitle": "Des résumés intelligents, une vraie organisation, zéro effort.",
      "dual_llm": {
        "title": "Dual LLM IA",
        "description": "GPT-5 Nano pour les résumés rapides, Claude Haiku pour les analyses approfondies. Le meilleur des deux mondes."
      },
      "auto_summary": {
        "title": "Résumés automatiques",
        "description": "Dès qu'une newsletter arrive, Briefly la résume. Retrouvez l'essentiel en 30 secondes."
      },
      "categories": {
        "title": "Catégorisation intelligente",
        "description": "Organisez vos newsletters par thèmes personnalisés. Tech, Finance, Culture — à vous de choisir."
      }
    }
  }
}
```

### Composants shadcn/ui à installer

```bash
npx shadcn@latest add card button badge
```

### Checklist WCAG 2.1 AA

- `alt` text sur toutes les images `next/image`
- Ratio de contraste ≥ 4.5:1 pour le texte (vérifier avec axe DevTools)
- Focus visible sur tous les liens et boutons (`:focus-visible` Tailwind)
- Hiérarchie heading correcte : `h1` unique par page, puis `h2` pour les sections
- `aria-hidden="true"` sur les icônes décoratives (Lucide)
- Boutons avec libellés textuels (pas que des icônes)

---

## Dependencies

**Requires :**
- Story 1.1 : Initialisation Next.js + shadcn/ui (projet de base, composants UI)
- Story 1.5 : Internationalisation next-intl (FR + EN) (routing i18n, `useTranslations`, `getTranslations`)

**Blocks :**
- Story 2.3 : Flux d'Inscription (CTA de la landing mène vers `/sign-up`)
- Story 2.4 : SEO Technique (JSON-LD injecté dans cette page)
- Story 2.5 : Pages Légales (Footer de ce layout contient les liens légaux)

---

## Definition of Done

- [ ] `src/app/[locale]/(marketing)/layout.tsx` créé avec `MarketingHeader` et `MarketingFooter`
- [ ] `src/app/[locale]/(marketing)/page.tsx` créé avec `generateStaticParams`, `generateMetadata`, et les 4 sections
- [ ] `generateStaticParams()` retourne `[{ locale: 'fr' }, { locale: 'en' }]`
- [ ] `generateMetadata()` retourne titre, description, og:*, et `alternates.languages` hreflang
- [ ] Hero section avec H1, sous-titre, CTA primaire "Essayer gratuitement" → `/sign-up`, CTA secondaire → `/pricing`
- [ ] Features section avec 3 cartes shadcn/ui Card (dual LLM, résumés automatiques, catégorisation)
- [ ] Social Proof section présente (compteur ou témoignage)
- [ ] CTA section en bas de page
- [ ] Toutes les images avec `next/image` et `alt` text
- [ ] Responsive vérifié sur 320px, 768px, 1024px (Chrome DevTools)
- [ ] Clés i18n créées dans `messages/fr.json` et `messages/en.json` (namespace `marketing`)
- [ ] `npm run build` passe sans erreur TypeScript
- [ ] `npm run lint` passe sans warning
- [ ] Test manuel : `/fr/` et `/en/` s'affichent correctement en production build

---

## Testing Strategy

- **SSG validation :** `npm run build && npm run start` → vérifier que `/fr/` et `/en/` répondent HTTP 200 avec contenu pré-rendu
- **i18n :** Naviguer entre `/fr/` et `/en/`, vérifier que les textes changent correctement
- **Responsive :** Chrome DevTools → Device Toolbar → tester 320px (iPhone SE), 768px (iPad), 1440px (desktop)
- **Accessibilité :** axe DevTools browser extension → 0 violation critique sur la page
- **Performance :** `npm run build` → Lighthouse CI → LCP <2.5s, FCP <1.5s, Performance score ≥ 90
- **Metadata :** Inspecter `<head>` en production → vérifier og:title, og:description, canonical, hreflang
- **Navigation :** CTA "Essayer gratuitement" redirige bien vers `/fr/sign-up` ou `/en/sign-up` selon locale

---

## References

- Architecture doc : section "Hébergement : VPS OVH vs Vercel" (SSG + Cloudflare CDN)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [next-intl Server Components](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing)
- [shadcn/ui Card](https://ui.shadcn.com/docs/components/card)
- PRD FR64, FR66, FR70 — Landing page SSG multilingue

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(marketing)/layout.tsx` avec `MarketingHeader` et `MarketingFooter`
- [ ] Créer `src/app/[locale]/(marketing)/page.tsx` avec `generateStaticParams` et `generateMetadata`
- [ ] Créer `src/components/marketing/HeroSection.tsx`
- [ ] Créer `src/components/marketing/FeaturesSection.tsx`
- [ ] Créer `src/components/marketing/SocialProofSection.tsx`
- [ ] Créer `src/components/marketing/CtaSection.tsx`
- [ ] Créer `src/components/marketing/MarketingHeader.tsx`
- [ ] Créer `src/components/marketing/MarketingFooter.tsx`
- [ ] Ajouter les clés i18n dans `messages/fr.json` (namespace `marketing`)
- [ ] Ajouter les clés i18n dans `messages/en.json` (namespace `marketing`)
- [ ] Installer composants shadcn/ui : `npx shadcn@latest add card button badge`
- [ ] Vérifier Responsive sur 320px, 768px, 1024px
- [ ] Vérifier `npm run build` et `npm run lint` passent

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
