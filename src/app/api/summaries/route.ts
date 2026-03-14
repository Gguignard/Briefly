import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { searchParams } = new URL(req.url)
  const newsletterId = searchParams.get('newsletterId')
  const page = parseInt(searchParams.get('page') ?? '1')
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

  const { data, error } = await query

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de récupération', 500)

  return apiResponse({
    summaries: data ?? [],
    unreadCount: data?.filter((s) => !s.read_at).length ?? 0,
    page,
    hasMore: (data?.length ?? 0) === limit,
  })
}
