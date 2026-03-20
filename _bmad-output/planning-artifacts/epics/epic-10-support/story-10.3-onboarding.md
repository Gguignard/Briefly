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
4. ❌ Si aucun résumé après 24h, email de rappel (simple, non-intrusif)
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

- [x] `OnboardingBanner` composant créé
- [x] Affiché uniquement aux nouveaux users sans newsletter
- [x] Dismissable avec persistance dans `user_settings`
- [x] Disparaît automatiquement après ajout d'une newsletter

---

## Dev Agent Record

### Status
in-progress

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `OnboardingBanner` component
- [x] Ajouter colonne `onboarding_completed` dans `user_settings`
- [x] Intégrer dans la page newsletters
- [ ] Implémenter l'email de rappel après 24h sans résumé (AC #4 — cron/worker + template email)

#### Review Follow-ups (AI)
- [x] [AI-Review][MEDIUM] Validation API par champ individuel [route.ts:18-31] — corrigé
- [x] [AI-Review][MEDIUM] OnboardingWrapper re-affiche le banner si API échoue [OnboardingWrapper.tsx:13-24] — corrigé
- [x] [AI-Review][MEDIUM] Barrel export pour le module onboarding [features/onboarding/index.ts] — corrigé
- [x] [AI-Review][LOW] Messages d'erreur API harmonisés en français [route.ts] — corrigé

### Completion Notes
- Composant `OnboardingBanner` créé avec 3 étapes guidées, copie d'adresse, dismiss
- `OnboardingWrapper` client component gère l'état visible/caché et l'appel API dismiss
- Migration SQL 012 ajoute `onboarding_completed` à `user_settings`
- Route API PATCH étendue pour supporter `onboardingCompleted` en plus de `dailySummaryEnabled`
- Page newsletters intégrée : banner affiché si 0 newsletters ET `onboarding_completed = false`
- Clés i18n ajoutées dans fr.json et en.json (namespace `onboarding`)
- 18 tests : 7 OnboardingBanner, 3 OnboardingWrapper, 8 API route (dont 2 nouveaux)

### File List
- src/features/onboarding/index.ts (nouveau — barrel export)
- src/features/onboarding/components/OnboardingBanner.tsx (nouveau)
- src/features/onboarding/components/OnboardingWrapper.tsx (nouveau, modifié review)
- src/features/onboarding/components/__tests__/OnboardingBanner.test.tsx (nouveau)
- src/features/onboarding/components/__tests__/OnboardingWrapper.test.tsx (nouveau, modifié review)
- src/app/[locale]/(dashboard)/newsletters/page.tsx (modifié)
- src/app/api/settings/notifications/route.ts (modifié, modifié review)
- src/app/api/settings/notifications/__tests__/route.test.ts (modifié, modifié review)
- supabase/migrations/012_onboarding_completed.sql (nouveau)
- messages/fr.json (modifié)
- messages/en.json (modifié)

### Debug Log
Aucun problème rencontré. Tous les tests passent (18/18). Les échecs dans la suite complète (settings page, email worker, categories, supabase integration) sont pré-existants et non liés à cette story.
