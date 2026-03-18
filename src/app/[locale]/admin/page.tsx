import { createAdminClient } from '@/lib/supabase/admin'
import { MetricsCards } from '@/features/admin/components/MetricsCards'
import { CostBreakdown } from '@/features/admin/components/CostBreakdown'
import { RecentSummaries } from '@/features/admin/components/RecentSummaries'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [activeUsersResult, summariesResult, costsResult, recentSummariesResult] =
    await Promise.all([
      supabase.from('summaries').select('user_id').gte('created_at', sevenDaysAgo),
      supabase
        .from('summaries')
        .select('id, created_at')
        .gte('created_at', monthStart),
      supabase
        .from('llm_costs')
        .select(
          'id, provider, model, cost_cents, tokens_input, tokens_output, user_id, created_at, summaries(llm_tier)'
        )
        .gte('created_at', monthStart),
      supabase
        .from('summaries')
        .select('id, title, user_id, llm_tier, llm_provider, generated_at')
        .order('generated_at', { ascending: false })
        .limit(10),
    ])

  if (activeUsersResult.error || summariesResult.error || costsResult.error || recentSummariesResult.error) {
    const errors = [
      activeUsersResult.error,
      summariesResult.error,
      costsResult.error,
      recentSummariesResult.error,
    ].filter(Boolean)
    throw new Error(`Failed to load admin data: ${errors.map((e) => e?.message).join(', ')}`)
  }

  const activeUsers = new Set(activeUsersResult.data?.map((r) => r.user_id)).size
  const summariesThisMonth = summariesResult.data?.length ?? 0
  const costs = costsResult.data ?? []
  const totalCostCents = costs.reduce((sum, c) => sum + Number(c.cost_cents), 0)

  const dayOfMonth = now.getDate()
  const avgSummariesPerDay = dayOfMonth > 0 ? summariesThisMonth / dayOfMonth : 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
      <MetricsCards
        activeUsers={activeUsers}
        avgSummariesPerDay={avgSummariesPerDay}
        totalCostEuros={totalCostCents / 100}
      />
      <CostBreakdown costs={costs} />
      <RecentSummaries summaries={recentSummariesResult.data ?? []} />
    </div>
  )
}
