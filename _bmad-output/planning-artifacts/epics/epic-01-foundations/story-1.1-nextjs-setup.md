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

- [ ] `npm run dev` démarre sans erreur sur `localhost:3000`
- [ ] `npm run build` réussit sans erreur TypeScript
- [ ] `npm run lint` passe sans warning
- [ ] Structure de dossiers correcte (`src/features/`, `src/lib/`, `src/types/`)
- [ ] `src/lib/utils/apiResponse.ts` créé et exporté
- [ ] shadcn/ui Button et Card fonctionnels dans une page de test
- [ ] `.env.example` créé avec placeholder pour toutes les variables futures
- [ ] Turbopack actif (vérifier `next dev --turbo` dans `package.json` scripts)

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
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Exécuter `create-next-app` avec les flags corrects
- [ ] Exécuter `shadcn@latest init`
- [ ] Créer la structure de dossiers `features/`, `lib/`, `types/`
- [ ] Créer `src/lib/utils/apiResponse.ts`
- [ ] Créer `src/types/index.ts`
- [ ] Vérifier ESLint passe
- [ ] Vérifier build réussit
- [ ] Créer `.env.example`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
