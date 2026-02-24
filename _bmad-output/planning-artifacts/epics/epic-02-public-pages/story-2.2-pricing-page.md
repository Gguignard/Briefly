# Story 2.2 : Page Pricing avec Comparaison des Tiers

**Epic :** Epic 2 - Pages Publiques & Acquisition SEO
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** public visitor,
**I want** to see a clear pricing page comparing the Free and Paid tiers with explicit ROI,
**so that** I can make an informed decision about upgrading and understand the value of each tier.

---

## Acceptance Criteria

1. ✅ Tiers Gratuit et Payant présentés côte à côte (layout 2 colonnes desktop, empilé mobile)
2. ✅ ROI explicitement mentionné : "5h/semaine économisées >> 5€/mois"
3. ✅ Limite de 5 newsletters du tier gratuit clairement visible avec icône lock sur les features payantes
4. ✅ CTAs "Commencer gratuitement" et "Passer au payant" avec liens corrects
5. ✅ Page servie en SSG avec métadonnées SEO optimisées
6. ✅ Disponible en FR (`/fr/pricing`) et EN (`/en/pricing`) via next-intl
7. ✅ LCP < 2.5s, respecte WCAG 2.1 AA

---

## Technical Notes

### Route et fichier

```
src/app/[locale]/(marketing)/pricing/page.tsx   # SSG (no dynamic data)
```

### Composant de la page

```typescript
// app/[locale]/(marketing)/pricing/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PricingCard } from '@/features/marketing/components/PricingCard'
import { CheckIcon, LockIcon } from 'lucide-react'

export const dynamic = 'force-static'  // SSG

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  return {
    title: locale === 'fr' ? 'Tarifs — Briefly' : 'Pricing — Briefly',
    description: locale === 'fr'
      ? 'Gratuit ou Premium, choisissez la formule qui vous convient.'
      : 'Free or Premium, choose the plan that works for you.',
  }
}

const FREE_FEATURES = [
  { label: 'Résumés IA quotidiens', included: true },
  { label: '5 newsletters maximum', included: true },
  { label: '1 résumé premium/jour (teaser)', included: true },
  { label: 'Newsletters illimitées', included: false, locked: true },
  { label: 'Tous les résumés en LLM premium', included: false, locked: true },
  { label: 'Catégorisation personnalisée', included: false, locked: true },
]

const PAID_FEATURES = [
  { label: 'Résumés IA quotidiens', included: true },
  { label: 'Newsletters illimitées', included: true },
  { label: 'Tous les résumés en LLM premium', included: true },
  { label: 'Catégorisation personnalisée illimitée', included: true },
  { label: 'Support prioritaire', included: true },
]
```

### Tableau de features conseillé

- Colonne Gratuit : badge "Gratuit", prix "0€/mois", features avec ✅/🔒
- Colonne Payant : badge "Premium" (highlighted), prix "5€/mois", features avec ✅
- Ligne ROI sous le tableau : "💡 5h économisées/semaine >> 5€/mois"

### Messages i18n à ajouter dans `messages/fr.json`

```json
{
  "pricing": {
    "title": "Choisissez votre formule",
    "subtitle": "Commencez gratuitement, upgradez quand vous êtes prêt",
    "freeTier": "Gratuit",
    "paidTier": "Premium",
    "freePrice": "0€/mois",
    "paidPrice": "5€/mois",
    "roiNote": "💡 5h économisées par semaine >> 5€ par mois",
    "ctaFree": "Commencer gratuitement",
    "ctaPaid": "Passer au Premium",
    "popular": "Le plus populaire"
  }
}
```

---

## Dependencies

**Requires :**
- Story 1.1 : Projet initialisé
- Story 1.5 : next-intl configuré

**Blocks :**
- Story 7.x : Page billing (reprend la logique de comparaison)

---

## Definition of Done

- [x] Page `/fr/pricing` et `/en/pricing` s'affichent sans erreur
- [x] Layout responsive (2 colonnes desktop, empilé mobile)
- [x] Features avec icônes ✅ et 🔒 correctement affichées
- [x] CTAs redirigent vers `/sign-up` (Clerk)
- [x] `export const dynamic = 'force-static'` en place
- [x] Metadata SEO générée dynamiquement selon locale
- [x] `npm run build` génère la page en statique

---

## Testing Strategy

- **Manuel :** Visiter `/fr/pricing` et `/en/pricing`, vérifier le contenu traduit
- **Manuel :** Réduire le viewport mobile (375px), vérifier l'empilement
- **CI :** `npm run build` vérifie que la page compile en SSG

---

## Dev Agent Record

### Status
Done

### Agent Model Used
Claude Opus 4.5

### Tasks
- [x] Créer `src/app/[locale]/(marketing)/pricing/page.tsx`
- [x] Créer `src/components/marketing/PricingCard.tsx` (adapté au pattern existant du projet)
- [x] Ajouter les clés i18n dans `messages/fr.json` et `messages/en.json`
- [x] Vérifier SSG (`force-static`)
- [x] Vérifier responsive mobile
- [x] Écrire les tests unitaires

### Completion Notes
- Page pricing implémentée avec SSG (`force-static`) pour `/fr/pricing` et `/en/pricing`
- Composant PricingCard créé dans `src/components/marketing/` (suivant le pattern existant du projet au lieu de `src/features/marketing/`)
- Layout responsive: 2 colonnes desktop (md:grid-cols-2), empilé mobile
- Features avec icônes Check (✓) et Lock (🔒) via lucide-react
- CTAs redirigent vers `/{locale}/sign-up`
- Badge "Le plus populaire" sur le tier Premium avec aria-label pour accessibilité
- ROI note affiché sous les cards: "💡 5h économisées par semaine >> 5€ par mois"
- Metadata SEO générée dynamiquement selon la locale (utilise NEXT_PUBLIC_APP_URL depuis .env.example)
- Stratégie de devise documentée: € pour FR, $ pour EN (optimisation conversion selon marché cible)
- 17 tests unitaires ajoutés: 10 tests de types/traductions + 7 tests de rendu complet (happy-dom + @testing-library/react)
- Configuration vitest améliorée pour supporter les tests de composants React

### File List
- `src/app/[locale]/(marketing)/pricing/page.tsx` (nouveau)
- `src/components/marketing/PricingCard.tsx` (nouveau)
- `src/components/marketing/__tests__/PricingCard.test.tsx` (nouveau)
- `src/test/setup.ts` (nouveau - config testing-library pour vitest)
- `messages/fr.json` (modifié - ajout section marketing.pricing)
- `messages/en.json` (modifié - ajout section marketing.pricing)
- `vitest.config.mts` (modifié - ajout environnement happy-dom + setup)
- `package.json` (modifié - ajout @testing-library/react, @testing-library/jest-dom, happy-dom)

### Debug Log
- Build SSG vérifié: pages `/fr/pricing` et `/en/pricing` générées en statique
- Lint passé sans erreur
- 17/17 tests pricing passent avec happy-dom + @testing-library/react

### Change Log
**2026-02-24 - Code Review (Claude Sonnet 4.5)**
- Review adversariale complète effectuée
- Corrections appliquées:
  - ✅ Corrigé variable d'environnement: utilise NEXT_PUBLIC_APP_URL au lieu de NEXT_PUBLIC_BASE_URL non-existante
  - ✅ Amélioré accessibilité: ajout aria-label au badge "Le plus populaire"
  - ✅ Ajouté 7 tests de rendu complets avec @testing-library/react (total 17 tests)
  - ✅ Configuré vitest avec happy-dom pour tests de composants React
  - ✅ Documenté stratégie de devise FR/EN dans le code
  - ✅ Mis à jour File List et Completion Notes
- Résultat: 0 HIGH issues, 0 MEDIUM issues, tous les ACs implémentés, 17/17 tests passent
- Statut changé: Review → Done
