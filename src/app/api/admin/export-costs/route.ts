import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, ErrorCodes } from '@/lib/utils/apiResponse'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'

function sanitizeCsvField(value: string | number | null): string {
  const str = String(value ?? '')
  if (/[,"\n\r]/.test(str) || /^[=+\-@\t\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    return apiError(ErrorCodes.FORBIDDEN, 'Accès refusé', 403)
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
    ...(data ?? []).map(
      (r) =>
        [
          r.user_id,
          r.provider,
          r.model,
          r.tokens_input,
          r.tokens_output,
          r.cost_cents,
          r.created_at,
        ]
          .map(sanitizeCsvField)
          .join(',')
    ),
  ].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="costs-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
