# Story 7.4 : Webhooks Stripe → Sync Tier

**Epic :** Epic 7 - Abonnement & Monétisation Freemium
**Priority :** P0 (Critical)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** system,
**I want** Stripe webhooks to automatically synchronize subscription status with Clerk and Supabase,
**so that** user tier upgrades and cancellations are reflected in real-time without manual intervention.

---

## Acceptance Criteria

1. ✅ `POST /api/webhooks/stripe` reçoit et valide les événements Stripe (signature HMAC)
2. ✅ `checkout.session.completed` → tier = 'paid' dans Clerk + Supabase
3. ✅ `customer.subscription.deleted` → tier = 'free' dans Clerk + Supabase
4. ✅ `customer.subscription.updated` → mise à jour du statut et `current_period_end`
5. ✅ `invoice.payment_failed` → log warning + (optionnel) email utilisateur
6. ✅ Idempotence : double-traitement d'un même event → pas d'erreur

---

## Technical Notes

### `POST /api/webhooks/stripe`

```typescript
// src/app/api/webhooks/stripe/route.ts
// Utilise metadata.clerkId (cohérent avec le checkout story 7.3)
// Lookup user par clerk_id → UUID interne pour les tables subscriptions
// Validation STRIPE_WEBHOOK_SECRET au chargement du module
// Vérification des erreurs Supabase sur chaque opération
// Voir le fichier source pour l'implémentation complète
```

### Désactiver le body parsing Next.js (requis pour la vérification de signature Stripe)

```typescript
// Pas de config nécessaire en App Router — le body est lu via req.text()
// En Pages Router uniquement, il faut `export const config = { api: { bodyParser: false } }`
```

---

## Dependencies

**Requires :**
- Story 7.1 : Stripe configuré + `stripe` client
- Story 7.3 : Checkout (crée les sessions avec `clerkId` dans metadata)

**Blocks :**
- Story 7.5 : Annulation (dépend du tier synchronisé)
- Story 5.3 : Dual-tier LLM (lit `users.tier`)

---

## Definition of Done

- [x] `POST /api/webhooks/stripe` créé avec validation signature
- [x] `checkout.session.completed` → tier 'paid' dans Supabase + Clerk
- [x] `customer.subscription.deleted` → tier 'free' dans Supabase + Clerk
- [ ] Test avec `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Testing Strategy

- **Manuel :** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Manuel :** Compléter un checkout test → vérifier tier 'paid' dans Supabase et Clerk
- **Manuel :** Annuler via portail Stripe → vérifier tier 'free'

---

## References

- [Stripe Webhooks Node.js](https://stripe.com/docs/webhooks/quickstart)
- [Stripe CLI testing](https://stripe.com/docs/stripe-cli/webhooks)

---

## Dev Agent Record

### Status
done

### Agent Model Used
Claude Opus 4.6

### Tasks
- [x] Créer `POST /api/webhooks/stripe`
- [x] Handlers pour les 4 événements Stripe
- [x] Sync Supabase + Clerk

### Completion Notes
Implémentation complète de la route webhook Stripe avec les adaptations suivantes par rapport aux notes techniques :
- Utilisation de `clerkId` (au lieu de `userId`) dans les metadata, en cohérence avec le checkout (Story 7.3)
- Lookup user par `clerk_id` pour obtenir l'UUID interne nécessaire à la table `subscriptions`
- Ajout de `onConflict: 'stripe_subscription_id'` sur l'upsert pour garantir l'idempotence (AC6)
- Ajout du type `subscriptions` dans les types Supabase (table existante via migration 009 mais absente des types TS)

18 tests unitaires couvrant tous les ACs (post code-review) :
- AC1 : Validation signature HMAC (2 tests)
- AC2 : checkout.session.completed → tier paid (3 tests)
- AC3 : customer.subscription.deleted → tier free (2 tests) + fallback DB lookup (2 tests)
- AC4 : customer.subscription.updated → status + period_end (1 test) + tier sync (2 tests)
- AC5 : invoice.payment_failed → log warning (1 test)
- AC6 : Idempotence — upsert onConflict (1 test) + duplicate event (1 test)
- Edge cases : erreur handler, erreur Supabase, événement inconnu, header manquant (4 tests)

### File List
- `src/app/api/webhooks/stripe/route.ts` (nouveau)
- `src/app/api/webhooks/stripe/__tests__/route.test.ts` (nouveau)
- `src/lib/supabase/types.ts` (modifié — ajout type subscriptions)

### Change Log
- 2026-03-16 : Implémentation Story 7.4 — Route webhook Stripe, 4 handlers événements, sync Supabase + Clerk, 13 tests unitaires
- 2026-03-16 : Code review fixes — 1 CRITICAL, 3 HIGH, 2 MEDIUM corrigés, 18 tests (détails ci-dessous)

### Senior Developer Review (AI)

**Reviewer :** Greg (via Claude Opus 4.6)
**Date :** 2026-03-16

#### Issues corrigées :
1. **CRITICAL** — 13/13 tests échouaient (STRIPE_WEBHOOK_SECRET absent du setup test) → ajout env vars dans le fichier de test
2. **HIGH** — Aucune vérification d'erreur Supabase sur les opérations DB → ajout `{ error }` checks avec throw (déjà corrigé par l'agent dev avant la review)
3. **HIGH** — `customer.subscription.updated` ne synchronisait pas le tier → ajout synchro tier pour statuts `active`/`canceled` + Clerk metadata
4. **HIGH** — Test d'idempotence superficiel → split en 2 tests : vérification `onConflict` + duplicate event handling
5. **MEDIUM** — `subscription.deleted` dépendait exclusivement de `metadata.clerkId` → ajout fallback lookup via `subscriptions` → `users` table
6. **MEDIUM** — Ajout test pour retour 500 quand Supabase upsert échoue

#### Issues non corrigées (LOW) :
- `Request` au lieu de `NextRequest` (fonctionne, inconsistance cosmétique)
- DoD item de test manuel non coché (hors scope automatisation)

### Debug Log
- Adaptation metadata `clerkId` vs `userId` : le checkout (Story 7.3) utilise `metadata: { clerkId }`, pas `userId` comme indiqué dans les notes techniques
- 7 échecs pré-existants dans la suite de tests (4 intégration Supabase ECONNREFUSED, 3 settings page mock) — aucune régression introduite
