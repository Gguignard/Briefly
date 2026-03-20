# Story 10.2 : Formulaire de Contact

**Epic :** Epic 10 - Support Utilisateur
**Priority :** P2 (Medium)
**Complexity :** Low (2 pts)
**Estimated Effort :** 0.5 day

---

## User Story

**As a** user,
**I want** to send a support message via a contact form,
**so that** I can get help without having to know the support email address.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/help/contact` avec formulaire (nom, email, sujet, message)
2. ✅ Validation Zod côté serveur (tous les champs requis)
3. ✅ Soumission → email envoyé à `support@briefly.app` via Resend (ou équivalent)
4. ✅ Message de confirmation affiché après envoi réussi
5. ✅ Protection anti-spam (rate limiting par IP : 3 messages/heure)
6. ✅ Si connecté, email pré-rempli avec l'email Clerk

---

## Technical Notes

### Installation

```bash
npm install resend
```

### `POST /api/contact`

```typescript
// src/app/api/contact/route.ts
import { z } from 'zod'
import { Resend } from 'resend'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
})

// Simple in-memory rate limiter (production : utiliser Redis)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  // Rate limiting par IP
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const entry = rateLimiter.get(ip)

  if (entry && now < entry.resetAt && entry.count >= 3) {
    return apiError('RATE_LIMIT', 'Trop de messages envoyés. Réessayez dans 1h.', 429)
  }

  rateLimiter.set(ip, {
    count: (entry?.count ?? 0) + 1,
    resetAt: entry?.resetAt ?? now + 3600000,
  })

  const body = await req.json()
  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const { name, email, subject, message } = parsed.data

  await resend.emails.send({
    from: 'Briefly Contact <noreply@briefly.app>',
    to: 'support@briefly.app',
    replyTo: email,
    subject: `[Support] ${subject}`,
    text: `De: ${name} (${email})\n\n${message}`,
  })

  return apiResponse({ sent: true })
}
```

### Page formulaire

```typescript
// src/app/[locale]/(marketing)/help/contact/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
        <h1 className="text-xl font-semibold">Message envoyé !</h1>
        <p className="text-muted-foreground">Nous vous répondrons sous 48h.</p>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16 space-y-6">
      <h1 className="text-2xl font-bold">Contactez-nous</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register('name')} placeholder="Votre nom" />
        <Input {...register('email')} type="email" placeholder="Votre email" />
        <Input {...register('subject')} placeholder="Sujet" />
        <Textarea {...register('message')} placeholder="Votre message" rows={5} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
        </Button>
      </form>
    </main>
  )
}
```

### Variable d'environnement

```bash
RESEND_API_KEY=re_xxx
```

---

## Dependencies

**Requires :**
- Story 10.1 : Page d'aide (lien vers le formulaire)

**Blocks :**
- Rien

---

## Definition of Done

- [x] `POST /api/contact` avec validation et Resend
- [x] Page formulaire avec confirmation après envoi
- [x] Rate limiting basique (3/heure par IP)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Installer `resend`, `react-hook-form` et `@hookform/resolvers`
- [x] Créer `POST /api/contact`
- [x] Créer page `/[locale]/help/contact`

### Completion Notes
- Installé resend@^6.9.4, react-hook-form@^7.71.2, @hookform/resolvers@^5.2.2
- Route API POST /api/contact : validation Zod (nom, email, subject, message), rate limiting in-memory 3/h par IP, envoi via Resend, gestion erreurs JSON invalide et Resend failure
- Correction bug story originale : le rate limiter ne réinitialisait pas le compteur après expiration du resetAt
- Page contact client-side avec react-hook-form + zodResolver, pré-remplissage email Clerk (AC6), confirmation visuelle (AC4), affichage erreurs serveur
- Composant UI Textarea créé (pattern shadcn identique à Input)
- Traductions i18n ajoutées (fr + en) sous namespace marketing.contact
- 14 tests API (validation, rate limit, erreurs Resend, longueurs max, IP parsing, invalid requests not counted)
- 7 tests page (rendu, pré-remplissage email, soumission, erreur serveur, erreur rate limit traduite, erreur non-JSON, état submitting)
- 0 régression introduite (4 fichiers en échec pré-existants : workers, supabase integ, settings, categories)

### File List
- src/app/api/contact/route.ts (new)
- src/app/api/contact/__tests__/route.test.ts (new)
- src/app/[locale]/(marketing)/help/contact/page.tsx (new)
- src/app/[locale]/(marketing)/help/contact/__tests__/page.test.tsx (new)
- src/components/ui/textarea.tsx (new)
- messages/fr.json (modified — added marketing.contact namespace)
- messages/en.json (modified — added marketing.contact namespace)
- package.json (modified — added resend, react-hook-form, @hookform/resolvers)

### Debug Log
- Mock Resend initial avec vi.fn() échouait ("not a constructor") → corrigé avec class mock
- npm install lent (>3min) à cause des warnings EBADENGINE node v21 — n'affecte pas le fonctionnement

### Change Log
- 2026-03-19 : Implémentation complète story 10.2 — formulaire de contact avec API, validation, rate limiting, i18n, tests
- 2026-03-20 : Code review — Corrigé 8 issues (H1: fuite mémoire rate limiter + cleanup, H2: import auth inutilisé supprimé, H3: parsing x-forwarded-for, M1: rate limit après validation seulement, M2: max lengths client = serveur, M3: messages erreur API en anglais + traduction côté client, M4: emails en env vars, M5: protection res.json() non-JSON). Ajouté 3 tests (invalid requests not counted, IP chain parsing, non-JSON error fallback). 21 tests passent.
