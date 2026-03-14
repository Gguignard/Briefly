import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { searchParams } = new URL(req.url)
  const newsletterId = searchParams.get('newsletterId')
  const rawPage = parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createAdminClient()

  // First get user internal id from clerk_id
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return apiError('NOT_FOUND', 'Utilisateur introuvable', 404)

  // Query paginated summaries
  let query = supabase
    .from('summaries')
    .select(`
      id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails!inner ( sender_email, subject, newsletter_id )
    `)
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (newsletterId) {
    query = query.eq('raw_emails.newsletter_id', newsletterId)
  }

  // Query total unread count (separate from pagination)
  const { count: unreadCount } = await supabase
    .from('summaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  const { data, error } = await query

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de récupération', 500)

  return apiResponse({
    summaries: data ?? [],
    unreadCount: unreadCount ?? 0,
    page,
    hasMore: (data?.length ?? 0) === limit,
  })
}
