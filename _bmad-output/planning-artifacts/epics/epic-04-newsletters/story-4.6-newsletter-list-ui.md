# Story 4.6 : Interface Liste des Newsletters

**Epic :** Epic 4 - Configuration des Newsletters & Ingestion Email
**Priority :** P1 (High)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** authenticated user,
**I want** to view, add, toggle, and remove my newsletters from a dedicated page,
**so that** I can easily manage which newsletters Briefly processes for me.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/newsletters` liste toutes les newsletters de l'utilisateur
2. ✅ Chaque newsletter affiche : nom, email expéditeur (si renseigné), statut actif/inactif, bouton toggle
3. ✅ Bouton "Ajouter une newsletter" ouvre un modal avec formulaire (nom + email optionnel)
4. ✅ Bouton "Supprimer" avec confirmation sur chaque newsletter
5. ✅ `InboxAddressCard` visible en haut de page (story 4.1)
6. ✅ `NewsletterLimitBanner` visible (story 4.5)
7. ✅ État vide : illustration + instruction pour ajouter la première newsletter
8. ✅ Loading state avec skeleton cards pendant le fetch

---

## Technical Notes

### Route

```
src/app/[locale]/(dashboard)/newsletters/page.tsx
```

### Page principale (Server Component)

```typescript
// src/app/[locale]/(dashboard)/newsletters/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewsletterList } from '@/features/newsletters/components/NewsletterList'
import { InboxAddressCard } from '@/features/newsletters/components/InboxAddressCard'

export default async function NewslettersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createClient()

  const [{ data: newsletters }, { data: user }] = await Promise.all([
    supabase.from('newsletters').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('users').select('inbox_address, tier').eq('id', userId).single(),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Mes newsletters</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les newsletters que Briefly résume pour vous.
        </p>
      </div>

      {user?.inbox_address && (
        <InboxAddressCard inboxAddress={user.inbox_address} />
      )}

      <NewsletterList
        initialNewsletters={newsletters ?? []}
        userTier={user?.tier ?? 'free'}
      />
    </div>
  )
}
```

### `NewsletterList` (Client Component)

```typescript
// src/features/newsletters/components/NewsletterList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Newsletter } from '@/types/newsletter'
import { NewsletterCard } from './NewsletterCard'
import { AddNewsletterModal } from './AddNewsletterModal'
import { NewsletterLimitBanner } from './NewsletterLimitBanner'
import { Button } from '@/components/ui/button'
import { Plus, MailOpen } from 'lucide-react'

interface Props {
  initialNewsletters: Newsletter[]
  userTier: 'free' | 'paid'
}

export function NewsletterList({ initialNewsletters, userTier }: Props) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const canAdd = userTier === 'paid' || newsletters.length < 5

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/newsletters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
    setNewsletters(prev =>
      prev.map(n => n.id === id ? { ...n, active } : n)
    )
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/newsletters/${id}`, { method: 'DELETE' })
    setNewsletters(prev => prev.filter(n => n.id !== id))
  }

  const handleAdd = (newsletter: Newsletter) => {
    setNewsletters(prev => [newsletter, ...prev])
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NewsletterLimitBanner count={newsletters.length} tier={userTier} />
        <Button size="sm" disabled={!canAdd} onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <MailOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Ajoutez votre première newsletter et transférez-la vers votre adresse Briefly.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {newsletters.map(n => (
            <NewsletterCard
              key={n.id}
              newsletter={n}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddNewsletterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
```

### `NewsletterCard`

```typescript
// src/features/newsletters/components/NewsletterCard.tsx
'use client'

import { useState } from 'react'
import { Newsletter } from '@/types/newsletter'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  newsletter: Newsletter
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function NewsletterCard({ newsletter, onToggle, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium truncate">{newsletter.name}</p>
        {newsletter.sender_email && (
          <p className="text-xs text-muted-foreground truncate">{newsletter.sender_email}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={newsletter.active}
          onCheckedChange={active => onToggle(newsletter.id, active)}
        />
        {confirmDelete ? (
          <>
            <Button variant="destructive" size="xs" onClick={() => onDelete(newsletter.id)}>
              Confirmer
            </Button>
            <Button variant="ghost" size="xs" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

## Dependencies

**Requires :**
- Story 4.1 : `InboxAddressCard` + table `users`
- Story 4.2 : CRUD API routes
- Story 4.5 : `NewsletterLimitBanner`

**Blocks :**
- Story 6.1 : Feed résumés (navigation depuis newsletters)

---

## Definition of Done

- [ ] Page `/fr/newsletters` s'affiche avec la liste des newsletters
- [ ] Ajout via modal fonctionnel
- [ ] Toggle actif/inactif fonctionnel
- [ ] Suppression avec confirmation fonctionnelle
- [ ] `InboxAddressCard` et `NewsletterLimitBanner` visibles
- [ ] État vide affiché correctement

---

## Testing Strategy

- **Manuel :** Visiter `/fr/newsletters` → voir la liste ou l'état vide
- **Manuel :** Ajouter une newsletter → vérifier l'apparition dans la liste
- **Manuel :** Toggler → vérifier le changement en base (Supabase)
- **Manuel :** Supprimer → confirmer → vérifier la disparition

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(dashboard)/newsletters/page.tsx`
- [ ] Créer `NewsletterList`, `NewsletterCard`, `AddNewsletterModal`
- [ ] Intégrer `InboxAddressCard` et `NewsletterLimitBanner`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
