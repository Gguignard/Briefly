# Story 10.3 : Onboarding Flow (Tooltip + Guide)

**Epic :** Epic 10 - Support Utilisateur
**Priority :** P2 (Medium)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** new user,
**I want** a guided onboarding that shows me how to add my first newsletter,
**so that** I can get value from Briefly within the first 5 minutes after signing up.

---

## Acceptance Criteria

1. ✅ À la première connexion, banner d'accueil visible sur la page Newsletters
2. ✅ Guide en 3 étapes : "Copiez votre adresse", "Abonnez-vous", "Attendez le premier résumé"
3. ✅ Guide dismissable (stocker `onboarding_completed` dans user_settings)
4. ✅ Si aucun résumé après 24h, email de rappel (simple, non-intrusif)
5. ✅ Guide ne s'affiche plus une fois la première newsletter ajoutée

---

## Technical Notes

### Banner d'onboarding

```typescript
// src/features/onboarding/components/OnboardingBanner.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  inboxAddress: string
  onDismiss: () => void
}

const STEPS = [
  {
    step: 1,
    title: "Copiez votre adresse Briefly",
    description: "C'est l'adresse à utiliser pour vous abonner à vos newsletters préférées.",
  },
  {
    step: 2,
    title: "Abonnez-vous à vos newsletters",
    description: "Utilisez votre adresse Briefly comme email d'inscription sur les sites de newsletters.",
  },
  {
    step: 3,
    title: "Vos résumés arrivent le lendemain",
    description: "Dès la première newsletter reçue, Briefly génère un résumé pour vous.",
  },
]

export function OnboardingBanner({ inboxAddress, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inboxAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-primary/20 rounded-xl bg-primary/5 p-6 space-y-4 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Fermer le guide"
      >
        <X className="h-4 w-4" />
      </button>

      <div>
        <h2 className="font-semibold text-base">Bienvenue dans Briefly ! 👋</h2>
        <p className="text-sm text-muted-foreground">3 étapes pour recevoir vos premiers résumés</p>
      </div>

      <ol className="space-y-3">
        {STEPS.map(({ step, title, description }) => (
          <li key={step} className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-semibold">
              {step}
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleCopy}>
          {copied ? 'Copié !' : 'Copier mon adresse Briefly'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          J&apos;ai compris
        </Button>
      </div>
    </div>
  )
}
```

### Logique d'affichage

```typescript
// Dans la page newsletters (story 4.6)
// Afficher si : aucune newsletter et onboarding_completed = false

const showOnboarding = newsletters.length === 0 && !user.onboarding_completed

const handleDismiss = async () => {
  await fetch('/api/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify({ onboardingCompleted: true }),
  })
  setShowOnboarding(false)
}
```

### Extension `user_settings` (story 3.4)

```sql
ALTER TABLE user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
```

---

## Dependencies

**Requires :**
- Story 4.6 : Page newsletters (où apparaît le banner)
- Story 3.4 : `user_settings` table

**Blocks :**
- Rien

---

## Definition of Done

- [ ] `OnboardingBanner` composant créé
- [ ] Affiché uniquement aux nouveaux users sans newsletter
- [ ] Dismissable avec persistance dans `user_settings`
- [ ] Disparaît automatiquement après ajout d'une newsletter

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `OnboardingBanner` component
- [ ] Ajouter colonne `onboarding_completed` dans `user_settings`
- [ ] Intégrer dans la page newsletters

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
