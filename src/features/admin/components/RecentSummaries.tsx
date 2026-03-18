import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecentSummaryRow } from '../admin.types'

interface RecentSummariesProps {
  summaries: RecentSummaryRow[]
}

export function RecentSummaries({ summaries }: RecentSummariesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">10 derniers résumés</CardTitle>
      </CardHeader>
      <CardContent>
        {summaries.length === 0 ? (
          <p className="text-muted-foreground">Aucun résumé récent</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Titre</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium">Provider</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2">{s.title}</td>
                    <td className="py-2 font-mono text-xs">{s.user_id}</td>
                    <td className="py-2">{s.llm_tier}</td>
                    <td className="py-2">{s.llm_provider}</td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(s.generated_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
