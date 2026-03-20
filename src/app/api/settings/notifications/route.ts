import { auth } from '@clerk/nextjs/server'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé.', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Corps de requête JSON invalide', 400)
  }

  const { dailySummaryEnabled, onboardingCompleted } = body

  const hasDailySummary = 'dailySummaryEnabled' in body
  const hasOnboarding = 'onboardingCompleted' in body

  if (!hasDailySummary && !hasOnboarding) {
    return apiError('VALIDATION_ERROR', 'Au moins un champ requis : dailySummaryEnabled, onboardingCompleted', 400)
  }

  if (hasDailySummary && typeof dailySummaryEnabled !== 'boolean') {
    return apiError('VALIDATION_ERROR', 'dailySummaryEnabled doit être un booléen', 400)
  }

  if (hasOnboarding && typeof onboardingCompleted !== 'boolean') {
    return apiError('VALIDATION_ERROR', 'onboardingCompleted doit être un booléen', 400)
  }

  const updates: Record<string, unknown> = { user_id: userId }
  if (typeof dailySummaryEnabled === 'boolean') updates.daily_summary_enabled = dailySummaryEnabled
  if (typeof onboardingCompleted === 'boolean') updates.onboarding_completed = onboardingCompleted

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('user_settings')
    .upsert(updates, { onConflict: 'user_id' })

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de sauvegarde', 500)

  return apiResponse({ updated: true })
}
