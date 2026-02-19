# Story 9.2 : Dashboard Métriques (Users, Coûts, Résumés)

**Epic :** Epic 9 - Dashboard Admin & Contrôle Opérationnel
**Priority :** P2 (Medium)
**Complexity :** Medium (3 pts)
**Estimated Effort :** 1 day

---

## User Story

**As a** admin,
**I want** a metrics dashboard showing active users, summaries generated, and LLM costs,
**so that** I can monitor the health and economics of Briefly in real-time.

---

## Acceptance Criteria

1. ✅ Page `/admin` affiche les KPIs : users actifs (7j), résumés/jour (moy), coût LLM mois en cours
2. ✅ Breakdown coûts par tier (free vs paid) et par provider (OpenAI vs Anthropic)
3. ✅ Tableau des 10 derniers résumés générés (tous users)
4. ✅ Export CSV des coûts du mois en cours
5. ✅ Données rafraîchies au chargement de page (pas de polling en temps réel)

---

## Technical Notes

### Page admin principale

```typescript
// src/app/admin/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { MetricsCards } from '@/features/admin/components/MetricsCards'
import { CostBreakdown } from '@/features/admin/components/CostBreakdown'
import { RecentSummaries } from '@/features/admin/components/RecentSummaries'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: activeUsers },
    { data: summariesThisMonth },
    { data: costs },
    { data: recentSummaries },
  ] = await Promise.all([
    supabase
      .from('summaries')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    supabase
      .from('summaries')
      .select('id, created_at')
      .gte('created_at', monthStart),
    supabase
      .from('llm_costs')
      .select('provider, cost_cents, created_at, user_id')
      .gte('created_at', monthStart),
    supabase
      .from('summaries')
      .select('id, title, user_id, llm_tier, llm_provider, generated_at')
      .order('generated_at', { ascending: false })
      .limit(10),
  ])

  const totalCostCents = costs?.reduce((sum, c) => sum + Number(c.cost_cents), 0) ?? 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
      <MetricsCards
        activeUsers={activeUsers ?? 0}
        summariesThisMonth={summariesThisMonth?.length ?? 0}
        totalCostEuros={totalCostCents / 100}
      />
      <CostBreakdown costs={costs ?? []} />
      <RecentSummaries summaries={recentSummaries ?? []} />
    </div>
  )
}
```

### `MetricsCards`

```typescript
// src/features/admin/components/MetricsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Zap, Euro } from 'lucide-react'

interface Props {
  activeUsers: number
  summariesThisMonth: number
  totalCostEuros: number
}

export function MetricsCards({ activeUsers, summariesThisMonth, totalCostEuros }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Users actifs (7j)</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{activeUsers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Résumés ce mois</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summariesThisMonth}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Coût LLM ce mois</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalCostEuros.toFixed(2)}€</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Route API export CSV

```typescript
// src/app/api/admin/export-costs/route.ts
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError } from '@/lib/utils/apiResponse'

export async function GET() {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return apiError('FORBIDDEN', 'Accès refusé', 403)
  }

  const supabase = createAdminClient()
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data } = await supabase
    .from('llm_costs')
    .select('user_id, provider, model, tokens_input, tokens_output, cost_cents, created_at')
    .gte('created_at', monthStart)
    .order('created_at', { ascending: false })

  const csv = [
    'user_id,provider,model,tokens_input,tokens_output,cost_cents,created_at',
    ...(data ?? []).map(r =>
      `${r.user_id},${r.provider},${r.model},${r.tokens_input},${r.tokens_output},${r.cost_cents},${r.created_at}`
    ),
  ].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="costs-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
```

---

## Dependencies

**Requires :**
- Story 9.1 : Accès admin sécurisé
- Story 5.5 : Table `llm_costs`

**Blocks :**
- Rien

---

## Definition of Done

- [ ] Page `/admin` avec les 3 KPIs cards
- [ ] `CostBreakdown` avec ventilation par provider
- [ ] Export CSV fonctionnel
- [ ] Accessible uniquement aux admins

---

## Dev Agent Record

### Status
Not Started

### Agent Model Used
_À remplir par l'agent_

### Tasks
- [ ] Créer `src/app/admin/page.tsx`
- [ ] Créer `MetricsCards`, `CostBreakdown`, `RecentSummaries`
- [ ] Créer `GET /api/admin/export-costs`

### Completion Notes
_À remplir par l'agent_

### File List
_À remplir par l'agent_

### Debug Log
_À remplir par l'agent_
