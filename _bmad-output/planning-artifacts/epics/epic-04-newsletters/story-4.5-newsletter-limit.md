# Story 4.5 : Enforcement Limite 5 Newsletters (Tier Gratuit)

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** free-tier user,
**I want** to be clearly informed when I reach the 5-newsletter limit,
**so that** I understand my options (upgrade or remove existing newsletters) without frustration.

---

## Acceptance Criteria

1. ✅ `POST /api/newsletters` retourne `403 LIMIT_REACHED` si tier=free et count ≥ 5
2. ✅ UI affiche un message clair : "5/5 newsletters (tier gratuit) — Passez au Premium pour en ajouter plus"
3. ✅ Bouton "Ajouter" désactivé visuellement quand la limite est atteinte
4. ✅ Lien "Passer au Premium" dans le message de limite → `/billing`
5. ✅ Les utilisateurs payants ne voient pas de limite

---

## Technical Notes

### Compteur dans l'API (déjà intégré dans story 4.2)

Le check est déjà dans `POST /api/newsletters` :

```typescript
if (user?.tier === 'free' && (count ?? 0) >= 5) {
  return apiError('LIMIT_REACHED', 'Limite de 5 newsletters atteinte (tier gratuit)', 403)
}
```

### Composant bannière de limite

```typescript
// src/features/newsletters/components/NewsletterLimitBanner.tsx
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  count: number
  tier: 'free' | 'paid'
}

export function NewsletterLimitBanner({ count, tier }: Props) {
  const locale = useLocale()

  if (tier === 'paid') return null

  const atLimit = count >= 5

  return (
    <div className="flex items-center justify-between text-sm">
      <span className={atLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
        {count}/5 newsletters (tier gratuit)
      </span>
      {atLimit && (
        <Alert className="border-amber-200 bg-amber-50 mt-2">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Limite atteinte.{' '}
            <Link href={`/${locale}/billing`} className="font-medium underline">
              Passez au Premium
            </Link>{' '}
            pour des newsletters illimitées.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

### Désactivation du bouton "Ajouter"

```typescript
// Dans la liste newsletters (story 4.6)
const canAddNewsletter = tier === 'paid' || newsletters.length < 5

<Button disabled={!canAddNewsletter} onClick={openAddModal}>
  Ajouter une newsletter
</Button>
```

---

## Dependencies

**Requires :**
- Story 4.2 : CRUD newsletters (le check est dans `POST /api/newsletters`)

**Blocks :**
- Rien (UI feedback seulement)

---

## Definition of Done

- [ ] `POST /api/newsletters` retourne 403 à la limite pour tier free
- [ ] `NewsletterLimitBanner` affiche le compteur X/5
- [ ] Message de limite affiché avec lien `/billing`
- [ ] Bouton "Ajouter" désactivé visuellement à 5/5

---

## Testing Strategy

- **Manuel :** Créer 5 newsletters → tenter d'en créer une 6e → vérifier le message 403 dans l'UI
- **Manuel :** Passer le tier à 'paid' → vérifier que la limite disparaît

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `NewsletterLimitBanner` component
- [ ] Intégrer dans la liste newsletters (story 4.6)
- [ ] Vérifier le check 403 dans l'API

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
