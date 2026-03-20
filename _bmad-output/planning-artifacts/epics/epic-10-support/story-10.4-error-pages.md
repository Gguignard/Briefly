# Story 10.4 : Pages d'Erreur Personnalisées (404, 500)

**Epic :** Epic 10 - Support Utilisateur
**Priority :** P2 (Medium)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** user who encounters an error,
**I want** a friendly and helpful error page with navigation options,
**so that** I don't feel lost and can easily find my way back to the app.

---

## Acceptance Criteria

1. ✅ Page 404 personnalisée avec message et lien retour
2. ✅ Page 500 (error boundary) personnalisée avec message
3. ✅ Les deux pages respectent le design system (Tailwind + shadcn/ui)
4. ✅ 404 inclut un bouton "Retourner aux résumés" si l'utilisateur est connecté
5. ✅ 500 inclut un bouton "Recharger la page"

---

## Technical Notes

### `src/app/not-found.tsx` (global 404)

```typescript
// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-6xl font-bold text-muted-foreground/30">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground max-w-sm">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/fr/summaries">Mes résumés</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/fr">Accueil</Link>
        </Button>
      </div>
    </div>
  )
}
```

### `src/app/[locale]/(dashboard)/error.tsx` (error boundary dashboard)

```typescript
// src/app/[locale]/(dashboard)/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-4">
      <div className="space-y-2">
        <p className="text-5xl font-bold text-muted-foreground/30">500</p>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Quelque chose s&apos;est mal passé. Notre équipe a été notifiée.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono">
            Référence : {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Recharger</Button>
        <Button variant="outline" onClick={() => window.location.href = '/fr/summaries'}>
          Retour aux résumés
        </Button>
      </div>
    </div>
  )
}
```

### `src/app/global-error.tsx` (erreur globale Next.js)

```typescript
// src/app/global-error.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>Une erreur critique est survenue</h1>
          <button onClick={reset}>Recharger</button>
        </div>
      </body>
    </html>
  )
}
```

---

## Dependencies

**Requires :**
- Story 1.6 : Sentry (intégré dans l'error boundary)
- Story 1.1 : Projet Next.js

**Blocks :**
- Rien

---

## Definition of Done

- [x] `src/app/not-found.tsx` créé
- [x] `src/app/[locale]/(dashboard)/error.tsx` créé
- [x] `src/app/global-error.tsx` créé
- [x] Test : visiter une URL inexistante → 404 personnalisée
- [x] Test : déclencher une erreur → 500 avec bouton "Recharger"

---

## Testing Strategy

- **Manuel :** Visiter `/fr/cette-page-nexiste-pas` → 404 personnalisée
- **Manuel :** Ajouter `throw new Error()` dans un composant → 500 personnalisée avec "Recharger"

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Mettre à jour `src/app/not-found.tsx` — 404 avec code visuel, message, lien résumés + accueil
- [x] Créer `src/app/[locale]/(dashboard)/error.tsx` — error boundary 500 avec Sentry, digest, boutons recharger/retour
- [x] Créer `src/app/global-error.tsx` — erreur critique globale avec Sentry et bouton recharger

### Completion Notes
- `not-found.tsx` existait déjà avec un design minimal — mis à jour selon les AC (code 404, deux boutons)
- `error.tsx` (dashboard) inclut Sentry.captureException, affichage du digest, et boutons recharger/retour
- `global-error.tsx` utilise du HTML inline (pas de Tailwind) car il remplace le layout root
- 16 tests unitaires écrits et passants : 5 (not-found) + 8 (dashboard error) + 3 (global-error)

### File List
- `src/app/not-found.tsx` (modifié)
- `src/app/[locale]/(dashboard)/error.tsx` (créé)
- `src/app/global-error.tsx` (créé)
- `src/app/error.tsx` (modifié — alignement design avec dashboard error)
- `src/app/__tests__/not-found.test.tsx` (créé)
- `src/app/[locale]/(dashboard)/__tests__/error.test.tsx` (créé)
- `src/app/__tests__/global-error.test.tsx` (créé)

### Code Review (AI) — 2026-03-20

**Reviewer :** Claude Opus 4.6
**Issues Found :** 2 High, 3 Medium, 2 Low → All HIGH and MEDIUM fixed

**Fixes Applied :**
- **H1** : `not-found.tsx` — Bouton "Mes résumés" conditionné sur `auth()` (AC 4 : "si l'utilisateur est connecté")
- **H2** : Locale `/fr/` hardcodée remplacée par `getLocale()` (not-found) et `useLocale()` (dashboard error)
- **M1** : `global-error.tsx` — Ajout `lang="fr"`, `<head>` avec viewport meta, message utilisateur, styling du bouton
- **M2** : Dashboard `error.tsx` — Navigation locale-aware via `useLocale()` au lieu de `/fr/` en dur
- **M3** : Root `error.tsx` — Design aligné avec dashboard error (code 500, digest, bouton "Recharger")

**Remaining (LOW, not fixed) :**
- L1 : Tests utilisent `toBeDefined()` au lieu de `toBeInTheDocument()` — mineur
- L2 : Warning jsdom `<html> cannot be a child of <div>` dans global-error tests — limitation jsdom

**Tests :** 21 passants (8 not-found + 9 dashboard error + 4 global-error)

### Debug Log
Aucun problème rencontré.
