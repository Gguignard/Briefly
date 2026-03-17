import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { searchParams } = new URL(req.url)
  const newsletterId = searchParams.get('newsletterId')
  const categoryId = searchParams.get('categoryId')
  if (categoryId && !z.string().uuid().safeParse(categoryId).success) {
    return apiError('VALIDATION_ERROR', 'categoryId invalide', 400)
  }
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

  // Verify category belongs to current user
  if (categoryId) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!cat) {
      return apiError('NOT_FOUND', 'Catégorie introuvable', 404)
    }
  }

  // Query paginated summaries
  const selectColumns = categoryId
    ? `id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails!inner ( sender_email, subject, newsletter_id, newsletters!inner ( category_id ) )`
    : `id, title, key_points, source_url, llm_tier, read_at, generated_at,
      raw_emails!inner ( sender_email, subject, newsletter_id )`

  let query = supabase
    .from('summaries')
    .select(selectColumns)
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (newsletterId) {
    query = query.eq('raw_emails.newsletter_id', newsletterId)
  }

  if (categoryId) {
    query = query.eq('raw_emails.newsletters.category_id', categoryId)
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
