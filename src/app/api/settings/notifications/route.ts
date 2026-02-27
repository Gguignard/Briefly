import { auth } from '@clerk/nextjs/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const body = await req.json()
  const { dailySummaryEnabled } = body

  if (typeof dailySummaryEnabled !== 'boolean') {
    return apiError('VALIDATION_ERROR', 'dailySummaryEnabled must be a boolean', 400)
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, daily_summary_enabled: dailySummaryEnabled })

  if (error) return apiError('DB_ERROR', 'Erreur de sauvegarde', 500)

  return apiResponse({ updated: true })
}
