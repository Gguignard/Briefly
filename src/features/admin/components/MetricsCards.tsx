import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Zap, Euro } from 'lucide-react'

interface MetricsCardsProps {
  activeUsers: number
  avgSummariesPerDay: number
  totalCostEuros: number
}

export function MetricsCards({ activeUsers, avgSummariesPerDay, totalCostEuros }: MetricsCardsProps) {
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
          <CardTitle className="text-sm font-medium">Résumés/jour (moy)</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avgSummariesPerDay.toFixed(1)}</p>
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
