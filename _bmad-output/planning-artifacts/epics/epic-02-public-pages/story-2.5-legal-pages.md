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

- [ ] `src/app/[locale]/(marketing)/legal/privacy/page.tsx` créé
- [ ] `src/app/[locale]/(marketing)/legal/terms/page.tsx` créé
- [ ] Pages accessibles sur `/fr/legal/privacy`, `/en/legal/privacy`, `/fr/legal/terms`, `/en/legal/terms`
- [ ] Métadonnées `robots: { index: false }` en place
- [ ] Footer composant créé avec liens vers les pages légales
- [ ] `npm run build` génère les pages en statique

---

## Testing Strategy

- **Manuel :** Visiter `/fr/legal/privacy` et `/en/legal/terms`, vérifier l'affichage
- **Manuel :** Inspecter les balises `<meta name="robots">` dans le `<head>`
- **CI :** `npm run build` vérifie la compilation statique

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(marketing)/legal/privacy/page.tsx`
- [ ] Créer `src/app/[locale]/(marketing)/legal/terms/page.tsx`
- [ ] Créer `src/features/marketing/components/Footer.tsx`
- [ ] Intégrer le footer dans la landing page

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
