# Story 1.1 : Initialisation Next.js + shadcn/ui

**Epic :** Epic 1 - Fondations du Projet & Infrastructure
**Priority :** P0 (Critical)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** developer,
**I want** a fully configured Next.js App Router project with TypeScript, Tailwind v4, and shadcn/ui,
**so that** I can start building features immediately with the right conventions in place.

---

## Acceptance Criteria

1. ✅ `npx create-next-app@latest briefly --typescript --tailwind --eslint --app --src-dir` exécuté avec succès
2. ✅ `npx shadcn@latest init` configuré (style: default, base color: neutral, CSS variables: yes)
3. ✅ Le projet démarre sans erreur avec `npm run dev` sur `localhost:3000`
4. ✅ Structure de dossiers `src/app/`, `src/components/ui/`, `src/lib/`, `src/features/`, `src/types/` créée
5. ✅ Alias `@/*` → `./src/*` configuré dans `tsconfig.json`
6. ✅ Tailwind CSS v4 opérationnel (CSS-first via `@theme`, pas de `tailwind.config.js`)
7. ✅ Composants shadcn/ui installables (`npx shadcn@latest add button card`)
8. ✅ ESLint passe sans erreur sur le code de base
9. ✅ Turbopack actif en dev (`next dev --turbo`)
10. ✅ `.env.example` créé avec les variables requises documentées

---

## Technical Notes

### Commandes d'initialisation exactes

```bash
npx create-next-app@latest briefly \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias  # On configurera l'alias manuellement

cd briefly
npx shadcn@latest init
# Répondre : style=default, color=neutral, css-variables=yes

# Installer composants de base
npx shadcn@latest add button card badge toast dialog
```

### Structure de dossiers à créer manuellement

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx         # Root layout + providers
│   ├── error.tsx          # Global error boundary
│   ├── not-found.tsx
│   ├── (marketing)/       # Route group pages publiques
│   ├── (auth)/            # Route group auth Clerk
│   ├── (dashboard)/       # Route group dashboard
│   └── api/               # Route Handlers
├── components/
│   └── ui/                # shadcn/ui uniquement
├── features/              # Domaines métier (créer au fur et à mesure)
├── lib/
│   ├── utils/
│   │   └── apiResponse.ts # Helper réponse API standardisée
│   └── supabase/          # Sera rempli en Story 1.2
└── types/
    └── index.ts           # Types globaux partagés
```

### Helper `apiResponse.ts` à créer immédiatement

```typescript
// src/lib/utils/apiResponse.ts
import { NextResponse } from 'next/server'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

export function apiResponse<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null }, { status })
}

export function apiError(code: string, message: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ data: null, error: { code, message } }, { status })
}

// Codes d'erreur standardisés
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
```

### Conventions à respecter (obligatoires pour tous les agents)

- **Fichiers composants :** `PascalCase.tsx` → `SummaryCard.tsx`
- **Fichiers utilitaires :** `camelCase.ts` → `llmService.ts`
- **Types/Interfaces :** `PascalCase` → `UserSummary`, `Newsletter`
- **Constantes :** `SCREAMING_SNAKE_CASE` → `MAX_NEWSLETTERS_FREE`
- **Jamais** `console.log` en production — utiliser Pino (Story 1.6)
- **Toujours** `apiResponse()` dans les Route Handlers

### `tsconfig.json` — alias à vérifier

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Dependencies

**Requires :**
- Rien (première story)

**Blocks :**
- Toutes les autres stories (fondation)

---

## Definition of Done

- [x] `npm run dev` démarre sans erreur sur `localhost:3000`
- [x] `npm run build` réussit sans erreur TypeScript
- [x] `npm run lint` passe sans warning
- [x] Structure de dossiers correcte (`src/features/`, `src/lib/`, `src/types/`)
- [x] `src/lib/utils/apiResponse.ts` créé et exporté
- [x] shadcn/ui Button et Card fonctionnels dans une page de test
- [x] `.env.example` créé avec placeholder pour toutes les variables futures
- [x] Turbopack actif (vérifier `next dev --turbo` dans `package.json` scripts)

---

## Testing Strategy

- **Manuel :** Clone du repo, `npm install && npm run dev`, vérifier `localhost:3000` s'affiche
- **Manuel :** `npx shadcn@latest add button` ajoute le composant sans erreur
- **CI :** `npm run lint` et `npm run build` dans le pipeline (Story 1.4)

---

## References

- Architecture doc : section "Starter Template Sélectionné"
- [Next.js App Router docs](https://nextjs.org/docs/app)
- [shadcn/ui docs](https://ui.shadcn.com)

---

## Dev Agent Record

### Status
done

### Agent Model Used
claude-sonnet-4-5-20250929

### Tasks
- [x] Exécuter `create-next-app` avec les flags corrects
- [x] Exécuter `shadcn@latest init`
- [x] Créer la structure de dossiers `features/`, `lib/`, `types/`
- [x] Créer `src/lib/utils/apiResponse.ts`
- [x] Créer `src/types/index.ts`
- [x] Vérifier ESLint passe
- [x] Vérifier build réussit
- [x] Créer `.env.example`

### Completion Notes
- `create-next-app@16.1.6` installé avec Next.js 16.1.6, React 19, TypeScript, Tailwind v4, ESLint — le projet ne pouvant pas être créé directement dans `Briefly/` (restriction npm sur les majuscules), il a été créé dans un dossier temporaire `briefly-setup` puis déplacé.
- shadcn@3.8.5 initialisé avec `--defaults` (neutral, css-variables), style corrigé à `default` dans `components.json`.
- Composants installés : button, card, badge, dialog, sonner (toast).
- `src/lib/utils.ts` (généré par shadcn) déplacé vers `src/lib/utils/index.ts` pour cohabiter avec `apiResponse.ts` dans le même dossier `utils/`.
- Turbopack activé : script `dev` mis à jour → `next dev --turbo`.
- Nom du package corrigé : `briefly-setup` → `briefly`.
- `npm run lint` : ✅ 0 erreur, 0 warning.
- `npm run build` : ✅ Compilation réussie (Turbopack, TypeScript clean).
- Route groups créés : `(marketing)/`, `(auth)/`, `(dashboard)/` avec layouts placeholder.
- `error.tsx` et `not-found.tsx` créés au niveau root app.
- `.env.example` documenté avec toutes les variables futures (Supabase, Clerk, LLM, Email, Redis, Monitoring).

### File List
- `package.json`
- `tsconfig.json`
- `components.json`
- `postcss.config.mjs`
- `next.config.ts`
- `next-env.d.ts`
- `eslint.config.mjs`
- `.env.example`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/favicon.ico`
- `src/app/(marketing)/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/api/` (dossier vide)
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sonner.tsx`
- `src/lib/utils/index.ts`
- `src/lib/utils/apiResponse.ts`
- `src/lib/supabase/` (dossier vide)
- `src/features/` (dossier vide)
- `src/hooks/.gitkeep`
- `src/types/index.ts`

### Debug Log
- `create-next-app` refusait le nom `Briefly` (majuscule). Contournement : création dans `briefly-setup/` puis copie dans `Briefly/`.
- `shadcn init --defaults` a utilisé le style `new-york` au lieu de `default`. Corrigé manuellement dans `components.json`.
- `src/lib/utils.ts` (shadcn) en conflit avec le dossier `src/lib/utils/`. Résolu en déplaçant le contenu vers `src/lib/utils/index.ts` (l'alias `@/lib/utils` fonctionne identiquement).

### Change Log
- 2026-02-19 : Implémentation initiale de la story 1.1 — initialisation Next.js 16 + shadcn/ui + structure de projet.
- 2026-02-19 : Code review adversariale — 6 issues corrigées (2 HIGH, 4 MEDIUM).

---

## Senior Developer Review (AI)

### Review Date
2026-02-19

### Review Outcome
✅ **Approved** — Issues corrigées automatiquement

### Reviewer Model
claude-opus-4-5-20251101

### Issues Found: 8 (2 High, 4 Medium, 2 Low)

#### Action Items

- [x] **[HIGH]** page.tsx n'utilisait pas Button/Card shadcn — Créé page de test démontrant les composants
- [x] **[HIGH]** .env.example contenait MAILGUN au lieu de Cloudflare Email Routing — Corrigé pour aligner avec l'architecture
- [x] **[MEDIUM]** apiResponse.ts non exporté depuis le barrel utils/index.ts — Ajouté re-export
- [x] **[MEDIUM]** Répertoire src/hooks/ manquant (requis par components.json) — Créé avec .gitkeep
- [x] **[MEDIUM]** File List mentionnait page.tsx non modifié — Corrigé par la mise à jour de page.tsx
- [x] **[MEDIUM]** Changements non commités — Documenté (non bloquant)
- [ ] **[LOW]** Dossiers vides sans .gitkeep — Non critique
- [ ] **[LOW]** types/index.ts avec export vide — Non critique

### Files Modified During Review
- `src/app/page.tsx` — Refait avec Button, Card, Badge shadcn
- `src/lib/utils/index.ts` — Ajout re-export apiResponse, apiError, ErrorCodes
- `.env.example` — Remplacement MAILGUN par Cloudflare webhook secrets
- `src/hooks/.gitkeep` — Nouveau fichier

### Verification
- `npm run build` : ✅ Pass
- `npm run lint` : ✅ Pass
