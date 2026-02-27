import { auth } from '@clerk/nextjs/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Corps de requête JSON invalide', 400)
  }

  const { dailySummaryEnabled } = body

  if (typeof dailySummaryEnabled !== 'boolean') {
    return apiError('VALIDATION_ERROR', 'dailySummaryEnabled must be a boolean', 400)
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, daily_summary_enabled: dailySummaryEnabled }, { onConflict: 'user_id' })

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de sauvegarde', 500)

  return apiResponse({ updated: true })
}
