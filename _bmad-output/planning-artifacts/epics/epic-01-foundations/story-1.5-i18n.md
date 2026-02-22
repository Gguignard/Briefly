# Story 1.5 : Internationalisation avec next-intl (FR + EN)

**Epic :** Epic 1 - Fondations du Projet & Infrastructure
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** developer,
**I want** `next-intl` configured for French and English with App Router,
**so that** all user-facing text is externalized in translation files and the app serves the correct language automatically.

---

## Acceptance Criteria

1. ✅ `next-intl` installé et configuré avec App Router (pas de Pages Router) - **COMPLÉTÉ**
2. ✅ Middleware détecte la locale et redirige `/` → `/fr` ou `/en` selon Accept-Language - **COMPLÉTÉ**
3. ✅ Structure `[locale]` dans `src/app/` : `src/app/[locale]/layout.tsx` - **COMPLÉTÉ**
4. ✅ Fichiers de traduction `messages/fr.json` et `messages/en.json` créés avec les clés de base - **COMPLÉTÉ**
5. ✅ `useTranslations()` disponible pour les Client Components - **COMPLÉTÉ** (configuration validée par tests)
6. ✅ `getTranslations()` disponible pour les Server Components / Route Handlers - **COMPLÉTÉ** (configuration validée par tests)
7. ✅ Le changement de locale est persisté via un cookie `NEXT_LOCALE` - **COMPLÉTÉ** (géré automatiquement par next-intl middleware)
8. ✅ Infrastructure en place pour utiliser des traductions (pas de strings hardcodées) - **COMPLÉTÉ**

---

## Technical Notes

### Installation et configuration

```bash
npm install next-intl
```

### Structure de fichiers

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx          # Root layout avec NextIntlClientProvider
│       ├── page.tsx            # Page d'accueil (redirige vers /summaries si connecté)
│       ├── (marketing)/
│       ├── (auth)/
│       └── (dashboard)/
├── i18n/
│   ├── request.ts              # Configuration getRequestConfig
│   └── routing.ts              # Définition des locales
└── messages/
    ├── fr.json
    └── en.json
```

### `src/i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
})
```

### `src/i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

### `src/middleware.ts` — intégration avec Clerk

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const isPublicRoute = createRouteMatcher([
  '/(fr|en)',
  '/(fr|en)/pricing',
  '/(fr|en)/legal/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

### `messages/fr.json` — clés de base

```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "confirm": "Confirmer"
  },
  "nav": {
    "summaries": "Résumés",
    "newsletters": "Newsletters",
    "categories": "Catégories",
    "settings": "Paramètres",
    "billing": "Facturation",
    "signOut": "Se déconnecter"
  },
  "auth": {
    "signIn": "Se connecter",
    "signUp": "S'inscrire",
    "signUpCta": "Essayer gratuitement",
    "securityMessage": "Connexion sécurisée OAuth 2.0 — Briefly n'accède jamais à vos emails personnels"
  },
  "summaries": {
    "empty": "Vos premiers résumés arriveront demain matin !",
    "newCount": "{count} nouveau(x) résumé(s) disponible(s)",
    "readMore": "Lire la newsletter complète",
    "badgePremium": "Premium",
    "badgeBasic": "Basique"
  },
  "newsletters": {
    "empty": "Ajoutez votre première newsletter",
    "addButton": "Ajouter une newsletter",
    "limitReached": "{count}/5 newsletters (tier gratuit)"
  }
}
```

### Utilisation dans les composants

```typescript
// Server Component
import { getTranslations } from 'next-intl/server'
export default async function Page() {
  const t = await getTranslations('summaries')
  return <h1>{t('empty')}</h1>
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'
export function SummaryCard() {
  const t = useTranslations('summaries')
  return <Badge>{t('badgePremium')}</Badge>
}
```

---

## Dependencies

**Requires :**
- Story 1.1 : Projet Next.js initialisé

**Blocks :**
- Toutes les pages avec contenu textuel (2.x, 3.x, 6.x, etc.)

---

## Definition of Done

- [x] `next-intl` installé et `i18n/routing.ts` + `i18n/request.ts` créés
- [x] Middleware intégrant next-intl fonctionnel (Clerk non installé, sera intégré ultérieurement)
- [x] `src/app/[locale]/layout.tsx` avec `NextIntlClientProvider`
- [x] `messages/fr.json` et `messages/en.json` avec clés communes, nav, auth, summaries, newsletters
- [x] Configuration testée via tests unitaires
- [x] Navigation `/fr` → français, `/en` → anglais fonctionne
- [x] Structure de routes restructurée sous `[locale]/`

---

## Testing Strategy

- **Manuel :** Accéder à `localhost:3000` → redirigé vers `/fr` ou `/en` selon navigateur
- **Manuel :** Changer la locale via URL `/en/summaries` → textes en anglais
- **Manuel :** Vérifier que `Accept-Language: en` dans le navigateur → `/en`

---

## References

- [next-intl App Router docs](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [next-intl + Clerk integration](https://next-intl-docs.vercel.app/docs/routing/middleware#example-clerk-authentication)

---

## Senior Developer Review (AI)

### Review Date
2026-02-22

### Review Outcome
✅ **Approved** (after fixes applied)

### Issues Found & Resolved
| Severity | Issue | Status |
|----------|-------|--------|
| 🔴 HIGH | Strings hardcodées dans `page.tsx` - AC #8 violé | ✅ Fixed |
| 🔴 HIGH | Pluriel FR sans syntaxe ICU dans `fr.json` | ✅ Fixed |
| 🔴 HIGH | Tests incomplets - ne vérifient pas tous les namespaces | ✅ Fixed |
| 🟡 MED | Type assertion `as any` - type safety compromis | ✅ Fixed |
| 🟡 MED | Pas de type `Locale` exporté réutilisable | ✅ Fixed |
| 🟡 MED | Pas de navigation helpers (`Link`, `useRouter`) | ✅ Fixed |
| 🟢 LOW | Commentaires en anglais (convention acceptée) | N/A |
| 🟢 LOW | Metadata non internationalisées | ✅ Fixed |

### Fixes Applied
1. **page.tsx** - Utilise maintenant `getTranslations('home')` pour tous les textes
2. **fr.json** - Ajout namespaces `home`, `metadata` + syntaxe ICU pour pluriels
3. **en.json** - Ajout namespaces `home`, `metadata`
4. **routing.ts** - Export `locales` const et type `Locale`
5. **layout.tsx** - Type guard `isValidLocale()` + `generateMetadata()` internationalisé
6. **navigation.ts** - Nouveau fichier avec helpers `Link`, `redirect`, `usePathname`, etc.
7. **i18n.test.tsx** - Tests étendus pour tous les namespaces + validation ICU plurals

### Convention établie
- **Commentaires dans le code : EN anglais** (convention universelle)

---

## Dev Agent Record

### Status
Done

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Tasks
- [x] Installer `next-intl`
- [x] Créer `src/i18n/routing.ts` et `src/i18n/request.ts`
- [x] Créer `src/app/[locale]/layout.tsx`
- [x] Mettre à jour `src/middleware.ts` avec next-intl (Clerk non présent, configuration adaptée)
- [x] Créer `messages/fr.json` et `messages/en.json`
- [x] Tester la navigation locale et créer tests unitaires

### Completion Notes
**Implémentation complétée avec succès (2026-02-21)**
**Code review passée avec corrections (2026-02-22)**

Internationalisation configurée avec next-intl pour français et anglais :
- Configuration i18n complète avec routing, request handlers, et navigation helpers
- Structure App Router restructurée avec pattern `[locale]/`
- Fichiers de traduction avec 7 namespaces et syntaxe ICU pour pluriels
- Middleware configuré pour détection automatique de locale
- Tests unitaires complets (9 tests) validant tous les namespaces
- Type `Locale` exporté pour type safety
- Metadata internationalisées via `generateMetadata()`

**Note importante** : Clerk n'est pas encore installé dans le projet. Le middleware a été configuré pour next-intl uniquement. L'intégration Clerk pourra être ajoutée ultérieurement quand Clerk sera installé (probablement dans Story 3.1 - OAuth Signup).

**Tests** : 20 tests (14 passent, 4 Supabase échouent - DB locale non démarrée, non lié à i18n)
**Tests i18n** : 9/9 passent
**Build** : Production build réussit sans erreur
**TypeScript** : Aucune erreur de type

### File List
- `package.json` - Ajout de next-intl dependency
- `next.config.ts` - Configuration du plugin next-intl
- `src/i18n/routing.ts` - Configuration des locales + export type Locale
- `src/i18n/request.ts` - Configuration getRequestConfig
- `src/i18n/navigation.ts` - **[NEW]** Helpers navigation (Link, redirect, useRouter, etc.)
- `src/i18n/__tests__/i18n.test.tsx` - Tests unitaires complets (9 tests, tous namespaces)
- `src/middleware.ts` - Middleware next-intl pour détection locale
- `src/app/[locale]/layout.tsx` - Root layout avec NextIntlClientProvider + generateMetadata
- `src/app/[locale]/page.tsx` - Page d'accueil avec traductions
- `messages/fr.json` - Traductions françaises (7 namespaces, syntaxe ICU)
- `messages/en.json` - Traductions anglaises (7 namespaces, syntaxe ICU)
- Déplacé : `src/app/(marketing)/` → `src/app/[locale]/(marketing)/`
- Déplacé : `src/app/(auth)/` → `src/app/[locale]/(auth)/`
- Déplacé : `src/app/(dashboard)/` → `src/app/[locale]/(dashboard)/`
- Déplacé : `src/app/test-supabase/` → `src/app/[locale]/test-supabase/`
- Supprimé : `src/app/layout.tsx` (remplacé par [locale]/layout.tsx)

### Debug Log
- Implémentation initiale sans problème majeur
- **Code Review (2026-02-22)** : 6 issues corrigées (3 HIGH, 3 MEDIUM, 1 LOW)
- Convention établie : commentaires EN anglais dans le code
