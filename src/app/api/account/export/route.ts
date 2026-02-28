import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()

  const [profile, newsletters, summaries, settings] = await Promise.all([
    supabase
      .from('users')
      .select('email, tier, created_at')
      .eq('clerk_id', userId)
      .single(),
    supabase
      .from('newsletters')
      .select('name, email_address, category_id, active, created_at')
      .eq('user_id', userId),
    supabase
      .from('summaries')
      .select('title, content, llm_tier, created_at, newsletter_id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('user_settings')
      .select('daily_summary_enabled, created_at')
      .eq('user_id', userId)
      .single(),
  ])

  if (profile.error && profile.error.code !== 'PGRST116') return apiError('INTERNAL_ERROR', 'Erreur lors de la récupération du profil', 500)
  if (newsletters.error) return apiError('INTERNAL_ERROR', 'Erreur lors de la récupération des newsletters', 500)
  if (summaries.error) return apiError('INTERNAL_ERROR', 'Erreur lors de la récupération des résumés', 500)
  if (settings.error && settings.error.code !== 'PGRST116') return apiError('INTERNAL_ERROR', 'Erreur lors de la récupération des paramètres', 500)

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: profile.data ?? {},
    newsletters: newsletters.data ?? [],
    summaries: summaries.data ?? [],
    settings: settings.data ?? {},
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="briefly-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
