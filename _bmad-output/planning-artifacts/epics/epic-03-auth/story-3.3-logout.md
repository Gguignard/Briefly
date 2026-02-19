# Story 3.3 : Déconnexion & Gestion de Session

**Epic :** Epic 3 - Authentification & Gestion de Compte
**Priority :** P1 (High)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** authenticated user,
**I want** to sign out securely and have my session properly terminated,
**so that** my account is protected when I use a shared or public device.

---

## Acceptance Criteria

1. ✅ Bouton "Se déconnecter" visible dans la navigation (sidebar ou header)
2. ✅ Clic → appel `signOut()` Clerk → redirect vers `/` (landing page)
3. ✅ Session Clerk invalidée côté serveur (cookie supprimé)
4. ✅ Accès aux routes protégées impossible après déconnexion (redirect `/sign-in`)
5. ✅ Déconnexion disponible sur mobile (menu hamburger ou drawer)

---

## Technical Notes

### Composant de déconnexion

```typescript
// src/features/auth/components/SignOutButton.tsx
'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  const locale = useLocale()

  const handleSignOut = async () => {
    await signOut()
    router.push(`/${locale}`)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Se déconnecter
    </Button>
  )
}
```

### Intégration dans la sidebar dashboard

```typescript
// src/features/dashboard/components/AppSidebar.tsx
import { SignOutButton } from '@/features/auth/components/SignOutButton'

export function AppSidebar() {
  return (
    <aside className="flex flex-col h-full">
      {/* Navigation links */}
      <nav className="flex-1">...</nav>

      {/* Footer avec déconnexion */}
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  )
}
```

---

## Dependencies

**Requires :**
- Story 3.1 : Clerk OAuth configuré
- Story 3.2 : Route protection middleware

**Blocks :**
- Rien (feature autonome)

---

## Definition of Done

- [ ] `src/features/auth/components/SignOutButton.tsx` créé
- [ ] Bouton intégré dans la sidebar/header du dashboard
- [ ] Test manuel : déconnexion → redirect vers landing
- [ ] Test manuel : accès à `/summaries` après déconnexion → redirect `/sign-in`

---

## Testing Strategy

- **Manuel :** Connecté → cliquer "Se déconnecter" → vérifier redirect vers `/fr`
- **Manuel :** Copier l'URL `/fr/summaries` → coller après déconnexion → vérifier redirect `/sign-in`

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/features/auth/components/SignOutButton.tsx`
- [ ] Intégrer dans `AppSidebar`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
