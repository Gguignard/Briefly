import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { z } from 'zod'
import logger from '@/lib/utils/logger'

const CreateNewsletterSchema = z.object({
  name: z.string().min(1).max(100),
  emailAddress: z.string().email().optional(),
  categoryId: z.string().uuid().optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de récupération', 500)
  return apiResponse(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Corps de requête JSON invalide', 400)
  }

  const parsed = CreateNewsletterSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = createAdminClient()

  // Vérifier la limite tier gratuit
  const { count } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('active', true)

  const { data: user } = await supabase
    .from('users')
    .select('tier')
    .eq('clerk_id', userId)
    .single()

  if (user?.tier === 'free' && (count ?? 0) >= 5) {
    return apiError('LIMIT_REACHED', 'Limite de 5 newsletters atteinte (tier gratuit)', 403)
  }

  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      email_address: parsed.data.emailAddress ?? null,
      category_id: parsed.data.categoryId,
    })
    .select()
    .single()

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de création', 500)
  logger.info({ userId, newsletterId: data.id }, 'Newsletter created')
  return apiResponse(data, 201)
}
