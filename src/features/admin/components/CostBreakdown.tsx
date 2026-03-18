import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LlmCostRow } from '../admin.types'

interface CostBreakdownProps {
  costs: LlmCostRow[]
}

export function CostBreakdown({ costs }: CostBreakdownProps) {
  const byProvider = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.provider] = (acc[c.provider] ?? 0) + c.cost_cents
    return acc
  }, {})

  const byTier = costs.reduce<Record<string, number>>((acc, c) => {
    const tier = c.summaries?.llm_tier ?? 'unknown'
    acc[tier] = (acc[tier] ?? 0) + c.cost_cents
    return acc
  }, {})

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Ventilation des coûts</CardTitle>
        {costs.length > 0 && (
          <a
            href="/api/admin/export-costs"
            className="text-sm text-primary underline"
            download
          >
            Exporter CSV
          </a>
        )}
      </CardHeader>
      <CardContent>
        {costs.length === 0 ? (
          <p className="text-muted-foreground">Aucun coût ce mois</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Par provider</h3>
              {Object.entries(byProvider).map(([provider, totalCents]) => (
                <div key={provider} className="flex items-center justify-between">
                  <span className="font-medium">{provider}</span>
                  <span className="font-mono">{(totalCents / 100).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Par tier</h3>
              {Object.entries(byTier).map(([tier, totalCents]) => (
                <div key={tier} className="flex items-center justify-between">
                  <span className="font-medium">{tier}</span>
                  <span className="font-mono">{(totalCents / 100).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
