import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger from '@/lib/utils/logger'
import { z } from 'zod'

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de récupération', 500)
  return apiResponse(data ?? [])
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

  const parsed = CreateCategorySchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = createAdminClient()

  // Vérifier limite tier gratuit
  const { data: user } = await supabase
    .from('users')
    .select('tier')
    .eq('clerk_id', userId)
    .single()

  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (user?.tier === 'free' && (count ?? 0) >= 3) {
    return apiError('LIMIT_REACHED', 'Limite de 3 catégories (tier gratuit)', 403)
  }

  // Vérifier unicité du nom pour cet utilisateur
  const { count: nameCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('name', parsed.data.name)

  if ((nameCount ?? 0) > 0) {
    return apiError('VALIDATION_ERROR', 'Une catégorie avec ce nom existe déjà', 409)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, ...parsed.data })
    .select()
    .single()

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de création', 500)
  logger.info({ userId, categoryId: data.id }, 'Category created')
  return apiResponse(data, 201)
}
