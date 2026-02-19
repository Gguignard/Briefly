# Story 2.3 : Flow d'Inscription depuis la Landing Page

**Epic :** Epic 2 - Pages Publiques & Acquisition SEO
**Priority :** P0 (Critical)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** public visitor,
**I want** to sign up directly from the landing page or pricing page with one click,
**so that** I can start using Briefly without unnecessary friction.

---

## Acceptance Criteria

1. ✅ Clic sur CTA → page `/sign-up` Clerk hosted UI s'affiche
2. ✅ Options OAuth Google et Microsoft visibles sur la page d'inscription
3. ✅ Après inscription réussie, redirect vers `/summaries`
4. ✅ Flow complet complétable en < 60 secondes
5. ✅ Message rassurant visible : "Connexion sécurisée OAuth 2.0"
6. ✅ Page responsive mobile (320px) et desktop

---

## Technical Notes

### Variables d'environnement Clerk pour les redirects

```bash
# .env.local
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/summaries
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/summaries
```

### Pages Clerk catch-all

```typescript
// src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        🔒 Connexion sécurisée OAuth 2.0 — Briefly n&apos;accède jamais à vos emails personnels
      </p>
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}

// src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        🔒 Connexion sécurisée OAuth 2.0 — Briefly n&apos;accède jamais à vos emails personnels
      </p>
      <SignUp routing="path" path="/sign-up" />
    </div>
  )
}
```

### Configuration OAuth dans le dashboard Clerk

À configurer manuellement dans le Clerk Dashboard :
1. Activer Google OAuth provider
2. Activer Microsoft OAuth provider
3. Configurer les redirect URLs de production : `https://briefly.app/sign-in/sso-callback`

### Apparence Clerk (optionnel)

```typescript
// Personnalisation minimale pour correspondre au design
<SignUp
  appearance={{
    elements: {
      card: 'shadow-none border',
      headerTitle: 'text-xl font-semibold',
    }
  }}
/>
```

---

## Dependencies

**Requires :**
- Story 1.5 : next-intl (structure `[locale]`)
- Story 3.1 : Clerk configuré (OAuth providers actifs)

**Blocks :**
- Story 3.2 : Protection des routes (dépend du flow auth complet)

---

## Definition of Done

- [ ] `src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx` créé
- [ ] `src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx` créé
- [ ] Variables `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/summaries` configurées
- [ ] Message de sécurité visible sur les pages
- [ ] Test manuel : inscription → redirect vers `/summaries`

---

## Testing Strategy

- **Manuel :** Cliquer "S'inscrire" depuis la landing, compléter le flow, vérifier redirect `/summaries`
- **Manuel :** Tester sur mobile 375px (le composant Clerk doit être responsive)

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer les pages `sign-in` et `sign-up` avec Clerk components
- [ ] Configurer les variables env de redirect
- [ ] Ajouter message de sécurité

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
