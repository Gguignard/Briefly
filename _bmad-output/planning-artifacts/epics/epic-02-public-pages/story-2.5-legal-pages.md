# Story 2.5 : Pages Légales (Privacy & CGU)

**Epic :** Epic 2 - Pages Publiques & Acquisition SEO
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** public visitor,
**I want** to read a privacy policy and terms of service,
**so that** I understand how my data is handled and can trust Briefly before signing up.

---

## Acceptance Criteria

1. ✅ Page `/fr/legal/privacy` et `/en/legal/privacy` accessible publiquement
2. ✅ Page `/fr/legal/terms` et `/en/legal/terms` accessible publiquement
3. ✅ Contenu RGPD-conforme : données collectées, durée de rétention, droits utilisateur
4. ✅ Pages servies en SSG (pas de données dynamiques)
5. ✅ Lien vers les pages légales dans le footer de la landing page
6. ✅ Métadonnées SEO `noindex` sur les pages légales (ne pas polluer les SERPs)
7. ✅ `robots.txt` n'exclut pas `/legal/` (conforme AC story 2.4)

---

## Technical Notes

### Structure des fichiers

```
src/app/[locale]/(marketing)/legal/
├── privacy/
│   └── page.tsx
└── terms/
    └── page.tsx
```

### `src/app/[locale]/(marketing)/legal/privacy/page.tsx`

```typescript
import { Metadata } from 'next'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Politique de Confidentialité — Briefly',
    robots: { index: false, follow: false },
  }
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral">
      <h1>Politique de Confidentialité</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : janvier 2025</p>

      <h2>Données collectées</h2>
      <p>
        Briefly collecte uniquement les données nécessaires au fonctionnement du service :
        votre adresse email (via OAuth Google ou Microsoft), les newsletters que vous choisissez
        de suivre, et les résumés générés pour votre compte.
      </p>
      <p>
        <strong>Briefly n&apos;accède jamais à votre boîte mail personnelle.</strong> L&apos;ingestion
        des newsletters se fait via une adresse email dédiée ({'{uuid}'}@mail.briefly.app).
      </p>

      <h2>Utilisation des données</h2>
      <ul>
        <li>Génération de résumés IA à partir des newsletters reçues</li>
        <li>Gestion de votre abonnement (via Stripe)</li>
        <li>Amélioration du service (logs techniques anonymisés)</li>
      </ul>

      <h2>Durée de rétention</h2>
      <ul>
        <li>Résumés : conservés 90 jours</li>
        <li>Compte utilisateur : jusqu&apos;à suppression du compte</li>
        <li>Logs techniques : 30 jours</li>
      </ul>

      <h2>Vos droits (RGPD)</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité
        de vos données. Pour exercer ces droits, contactez-nous à{' '}
        <a href="mailto:privacy@briefly.app">privacy@briefly.app</a>.
      </p>
      <p>
        Vous pouvez également supprimer votre compte directement depuis l&apos;interface
        Paramètres → Compte → Supprimer mon compte.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li><strong>Clerk</strong> — Authentification (données de compte)</li>
        <li><strong>Supabase</strong> — Base de données (newsletters, résumés)</li>
        <li><strong>Stripe</strong> — Paiements (données de facturation)</li>
        <li><strong>Cloudflare</strong> — Routage email</li>
        <li><strong>OpenAI / Anthropic</strong> — Génération des résumés IA</li>
        <li><strong>Sentry</strong> — Tracking d&apos;erreurs (anonymisé)</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Pour toute question relative à la protection des données :{' '}
        <a href="mailto:privacy@briefly.app">privacy@briefly.app</a>
      </p>
    </main>
  )
}
```

### `src/app/[locale]/(marketing)/legal/terms/page.tsx`

```typescript
import { Metadata } from 'next'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Conditions Générales d'Utilisation — Briefly",
    robots: { index: false, follow: false },
  }
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral">
      <h1>Conditions Générales d&apos;Utilisation</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : janvier 2025</p>

      <h2>1. Objet</h2>
      <p>
        Briefly est un service de résumés automatiques de newsletters par intelligence artificielle.
        En utilisant Briefly, vous acceptez les présentes CGU.
      </p>

      <h2>2. Compte utilisateur</h2>
      <p>
        L&apos;accès au service nécessite la création d&apos;un compte via Google ou Microsoft OAuth.
        Vous êtes responsable de la sécurité de votre compte.
      </p>

      <h2>3. Tiers gratuit et payant</h2>
      <ul>
        <li><strong>Tier gratuit :</strong> 5 newsletters maximum, 1 résumé premium/jour</li>
        <li><strong>Tier payant (5€/mois) :</strong> newsletters illimitées, tous les résumés en LLM premium</li>
      </ul>

      <h2>4. Utilisation acceptable</h2>
      <p>
        Le service est destiné à un usage personnel. Il est interdit de revendre, redistribuer
        ou utiliser les résumés générés à des fins commerciales sans accord préalable.
      </p>

      <h2>5. Résiliation</h2>
      <p>
        Vous pouvez résilier votre abonnement à tout moment depuis Paramètres → Facturation.
        La résiliation prend effet à la fin de la période en cours.
      </p>

      <h2>6. Limitation de responsabilité</h2>
      <p>
        Les résumés sont générés automatiquement par IA. Briefly ne garantit pas leur exactitude
        et n&apos;est pas responsable des décisions prises sur la base de ces résumés.
      </p>

      <h2>7. Contact</h2>
      <p>
        Pour toute question : <a href="mailto:hello@briefly.app">hello@briefly.app</a>
      </p>
    </main>
  )
}
```

### Lien footer dans la landing page

```typescript
// src/features/marketing/components/Footer.tsx
import Link from 'next/link'
import { useLocale } from 'next-intl'

export function Footer() {
  const locale = useLocale()

  return (
    <footer className="border-t py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>© 2025 Briefly. Tous droits réservés.</p>
        <nav className="flex gap-6">
          <Link href={`/${locale}/legal/privacy`}>Confidentialité</Link>
          <Link href={`/${locale}/legal/terms`}>CGU</Link>
          <a href="mailto:hello@briefly.app">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
```

---

## Dependencies

**Requires :**
- Story 1.5 : next-intl (structure `[locale]`)
- Story 2.1 : Landing page (footer à ajouter)

**Blocks :**
- Conformité RGPD pour le lancement

---

## Definition of Done

- [x] `src/app/[locale]/(marketing)/legal/privacy/page.tsx` créé
- [x] `src/app/[locale]/(marketing)/legal/terms/page.tsx` créé
- [x] Pages accessibles sur `/fr/legal/privacy`, `/en/legal/privacy`, `/fr/legal/terms`, `/en/legal/terms`
- [x] Métadonnées `robots: { index: false }` en place
- [x] Footer composant créé avec liens vers les pages légales
- [x] `npm run build` génère les pages en statique

---

## Testing Strategy

- **Manuel :** Visiter `/fr/legal/privacy` et `/en/legal/terms`, vérifier l'affichage
- **Manuel :** Inspecter les balises `<meta name="robots">` dans le `<head>`
- **CI :** `npm run build` vérifie la compilation statique

---

## Dev Agent Record

### Status
Done

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Tasks
- [x] Créer `src/app/[locale]/(marketing)/legal/privacy/page.tsx`
- [x] Créer `src/app/[locale]/(marketing)/legal/terms/page.tsx`
- [x] Créer `src/features/marketing/components/Footer.tsx`
- [x] Intégrer le footer dans la landing page

### Completion Notes
**Implémentation réussie suivant le cycle red-green-refactor:**

1. **Pages légales** (privacy & terms):
   - Créées avec `dynamic = 'force-static'` pour SSG
   - Métadonnées `robots: { index: false, follow: false }` ✓
   - Contenu RGPD-conforme avec données collectées, durée de rétention, droits utilisateur
   - Tests complets (27 tests passent)

2. **Footer component**:
   - Composant serveur recevant `locale` comme prop (pattern cohérent avec HeroSection)
   - Liens vers `/[locale]/legal/privacy` et `/[locale]/legal/terms`
   - Intégré dans la landing page

3. **Build SSG**:
   - Modification du layout pour rendre ClerkProvider conditionnel (permet build sans clés Clerk)
   - Build réussi, pages générées en statique pour /fr et /en

4. **Tests**:
   - 117/121 tests passent (4 échecs: tests d'intégration Supabase nécessitant serveur local)
   - 27 nouveaux tests créés pour privacy, terms, et Footer
   - Tous les tests de régressions passent

### File List
- src/app/[locale]/(marketing)/legal/privacy/page.tsx (créé)
- src/app/[locale]/(marketing)/legal/privacy/__tests__/page.test.tsx (créé)
- src/app/[locale]/(marketing)/legal/terms/page.tsx (créé)
- src/app/[locale]/(marketing)/legal/terms/__tests__/page.test.tsx (créé)
- src/features/marketing/components/Footer.tsx (créé)
- src/features/marketing/components/__tests__/Footer.test.tsx (créé)
- src/app/[locale]/(marketing)/page.tsx (modifié - ajout Footer)
- src/app/[locale]/(marketing)/__tests__/page.test.tsx (modifié - mock Footer)
- src/app/[locale]/layout.tsx (modifié - ClerkProvider conditionnel)

### Debug Log
**Problème rencontré lors du build:**
- Erreur initiale: ClerkProvider nécessitait une publishableKey valide même pour le SSG
- Solution: Modification du layout pour rendre ClerkProvider conditionnel basé sur la présence de `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Cela permet le build de pages publiques statiques sans clés Clerk tout en gardant l'auth fonctionnelle quand configurée

**Décisions techniques:**
- Footer comme composant serveur (pas de "use client") pour cohérence avec architecture existante
- Pattern props `{ locale }` au lieu de hook `useLocale()` pour compatibilité SSG
- Tests utilisant `cleanup()` entre chaque test pour éviter pollution du DOM

### Change Log
**2026-02-24 - Story 2.5 Implémentation:**
- Ajout des pages légales privacy et terms avec SSG
- Création du composant Footer et intégration dans la landing page
- Modification du layout pour ClerkProvider conditionnel (compatibilité build sans clés)
- Tests complets: 27 nouveaux tests, 117/121 tests passent (4 échecs non liés: Supabase intégration)
- Build vérifié: pages SSG générées pour /fr/legal/privacy, /en/legal/privacy, /fr/legal/terms, /en/legal/terms

**2026-02-24 - Code Review & Fixes (AI):**
- **7 issues corrigés** (4 HIGH, 3 MEDIUM)
- Ajout i18n complet: pages privacy, terms et Footer utilisent maintenant `getTranslations`
- Ajout traductions dans `messages/fr.json` et `messages/en.json` (section `marketing.legal`)
- Ajout `generateStaticParams` et `setRequestLocale` aux pages légales
- Correction copyright: 2025 → 2026 (via traductions)
- Correction date: janvier 2025 → février 2026 (via traductions)
- Tests mis à jour: vérification FR et EN, 33 tests pour les pages légales
- Build vérifié: 123/127 tests passent (4 échecs Supabase non liés)

---

## Senior Developer Review (AI)

### Review Date
2026-02-24

### Reviewer
Claude Opus 4.5 (Code Review Agent)

### Review Outcome
✅ **APPROVED** - Issues corrigés automatiquement

### Issues Found & Fixed

| # | Sévérité | Description | Statut |
|---|----------|-------------|--------|
| 1 | HIGH | Footer.tsx utilisait texte hardcodé français au lieu de i18n | ✅ Corrigé |
| 2 | HIGH | Pages privacy/terms sans support i18n (contenu français uniquement) | ✅ Corrigé |
| 3 | HIGH | Métadonnées SEO hardcodées en français | ✅ Corrigé |
| 4 | HIGH | Copyright année 2025 au lieu de 2026 | ✅ Corrigé |
| 5 | MEDIUM | Manque `generateStaticParams` et `setRequestLocale` | ✅ Corrigé |
| 6 | MEDIUM | Date "janvier 2025" obsolète | ✅ Corrigé |
| 7 | MEDIUM | Tests ne vérifiaient pas le comportement anglais | ✅ Corrigé |

### Files Modified During Review
- `messages/fr.json` - Ajout section `marketing.legal`
- `messages/en.json` - Ajout section `marketing.legal`
- `src/features/marketing/components/Footer.tsx` - Ajout i18n avec `getTranslations`
- `src/app/[locale]/(marketing)/legal/privacy/page.tsx` - Refactoring complet avec i18n
- `src/app/[locale]/(marketing)/legal/terms/page.tsx` - Refactoring complet avec i18n
- `src/features/marketing/components/__tests__/Footer.test.tsx` - Tests FR + EN
- `src/app/[locale]/(marketing)/legal/privacy/__tests__/page.test.tsx` - Tests FR + EN
- `src/app/[locale]/(marketing)/legal/terms/__tests__/page.test.tsx` - Tests FR + EN

### Test Results Post-Fix
- **123 tests passent** (vs 117 avant review)
- **33 tests** pour les pages légales et Footer
- **4 échecs** non liés (tests Supabase nécessitant serveur local)
- **Build SSG** vérifié: pages générées pour `/fr/legal/*` et `/en/legal/*`

### Acceptance Criteria Validation
| AC | Description | Validé |
|----|-------------|--------|
| 1 | `/fr/legal/privacy` et `/en/legal/privacy` accessibles avec contenu correct | ✅ |
| 2 | `/fr/legal/terms` et `/en/legal/terms` accessibles avec contenu correct | ✅ |
| 3 | Contenu RGPD-conforme | ✅ |
| 4 | Pages servies en SSG | ✅ |
| 5 | Liens dans le footer (traduits) | ✅ |
| 6 | Métadonnées `noindex` | ✅ |
| 7 | `robots.txt` n'exclut pas `/legal/` | ✅ |
