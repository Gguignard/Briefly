# Story 10.1 : Page d'Aide avec FAQ

**Epic :** Epic 10 - Support Utilisateur
**Priority :** P2 (Medium)
**Complexity :** Low (1 pt)
**Estimated Effort :** 0.25 day

---

## User Story

**As a** user (public or authenticated),
**I want** a help page with frequently asked questions,
**so that** I can resolve common issues without contacting support.

---

## Acceptance Criteria

1. ✅ Page `/[locale]/help` accessible publiquement
2. ✅ FAQ avec accordéon (expand/collapse) sur les questions les plus courantes
3. ✅ Sections : "Comment ça marche ?", "Problèmes d'ingestion email", "Facturation", "RGPD"
4. ✅ Lien vers le formulaire de contact en bas de page
5. ✅ Page SSG avec métadonnées SEO

---

## Technical Notes

### Route

```
src/app/[locale]/(marketing)/help/page.tsx
```

### Structure FAQ

```typescript
// src/app/[locale]/(marketing)/help/page.tsx
import { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Aide — Briefly',
  description: 'Questions fréquentes sur Briefly, le service de résumés de newsletters IA.',
}

const FAQ_ITEMS = [
  {
    id: 'how-it-works',
    question: 'Comment fonctionne Briefly ?',
    answer: `Briefly génère des résumés IA de vos newsletters. Vous obtenez une adresse email dédiée (ex: votre-id@mail.briefly.app) que vous utilisez pour vous abonner à vos newsletters préférées. Briefly reçoit les emails, les résume avec IA, et les affiche dans votre feed quotidien.`,
  },
  {
    id: 'email-forwarding',
    question: "Je ne reçois pas mes résumés, que faire ?",
    answer: `Vérifiez que vous vous êtes bien abonné à vos newsletters avec votre adresse Briefly (visible dans l'onglet Newsletters). Certaines newsletters peuvent prendre 24h avant le premier email. Si le problème persiste, contactez-nous.`,
  },
  {
    id: 'free-limit',
    question: 'Quelle est la limite du tier gratuit ?',
    answer: `Le tier gratuit vous permet de suivre jusqu'à 5 newsletters et de recevoir 1 résumé premium (meilleure IA) par jour. Les résumés supplémentaires utilisent notre modèle standard, toujours très performant.`,
  },
  {
    id: 'billing',
    question: 'Comment annuler mon abonnement Premium ?',
    answer: `Rendez-vous dans Paramètres → Facturation, puis cliquez sur "Gérer l'abonnement". Vous serez redirigé vers le portail Stripe où vous pourrez annuler facilement. L'annulation prend effet à la fin de la période en cours.`,
  },
  {
    id: 'data',
    question: 'Briefly accède-t-il à mes emails personnels ?',
    answer: `Non, jamais. Briefly fonctionne uniquement avec une adresse email dédiée que nous créons pour vous. Nous n'avons aucun accès à votre boîte mail Gmail, Outlook, ou autre.`,
  },
  {
    id: 'delete',
    question: 'Comment supprimer mon compte ?',
    answer: `Allez dans Paramètres → Zone de danger → Supprimer mon compte. Toutes vos données seront supprimées définitivement et immédiatement.`,
  },
]

export default function HelpPage({ params }: { params: { locale: string } }) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Centre d&apos;aide</h1>
        <p className="text-muted-foreground mt-2">Questions fréquentes sur Briefly</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map(item => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="border-t pt-8 text-center space-y-2">
        <p className="text-muted-foreground">Vous n&apos;avez pas trouvé votre réponse ?</p>
        <Link
          href={`/${params.locale}/help/contact`}
          className="text-primary hover:underline font-medium"
        >
          Contactez notre équipe →
        </Link>
      </div>
    </main>
  )
}
```

---

## Dependencies

**Requires :**
- Story 1.5 : next-intl
- Story 2.1 : Landing page (footer doit pointer vers `/help`)

**Blocks :**
- Story 10.2 : Formulaire contact (lié depuis cette page)

---

## Definition of Done

- [ ] Page `/[locale]/help` accessible et rendue statiquement
- [ ] Accordéon FAQ avec au moins 6 questions
- [ ] Lien vers le formulaire de contact

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/[locale]/(marketing)/help/page.tsx`
- [ ] Ajouter lien dans le footer de la landing

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
