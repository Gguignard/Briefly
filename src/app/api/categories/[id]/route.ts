import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import logger from '@/lib/utils/logger'
import { z } from 'zod'

const UUIDSchema = z.string().uuid()

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).refine(data => data.name !== undefined || data.color !== undefined, {
  message: 'Au moins un champ (name ou color) requis',
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { id } = await params
  if (!UUIDSchema.safeParse(id).success) {
    return apiError('VALIDATION_ERROR', 'ID de catégorie invalide', 400)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Corps de requête JSON invalide', 400)
  }

  const parsed = UpdateCategorySchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = createAdminClient()

  // Vérifier unicité du nom si renommage
  if (parsed.data.name !== undefined) {
    const { count: nameCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('name', parsed.data.name)
      .neq('id', id)

    if ((nameCount ?? 0) > 0) {
      return apiError('VALIDATION_ERROR', 'Une catégorie avec ce nom existe déjà', 409)
    }
  }

  const updateData: Record<string, string> = {}
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name
  if (parsed.data.color !== undefined) updateData.color = parsed.data.color

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Catégorie non trouvée', 404)
    }
    return apiError('INTERNAL_ERROR', 'Erreur de mise à jour', 500)
  }
  logger.info({ userId, categoryId: id }, 'Category updated')
  return apiResponse(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { id } = await params
  if (!UUIDSchema.safeParse(id).success) {
    return apiError('VALIDATION_ERROR', 'ID de catégorie invalide', 400)
  }

  const supabase = createAdminClient()

  // Vérifier que la catégorie existe et appartient à l'utilisateur
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return apiError('NOT_FOUND', 'Catégorie non trouvée', 404)
  }

  // Désassigner les newsletters avant suppression (FK ON DELETE SET NULL le fait aussi,
  // mais on le fait explicitement pour s'assurer du scope user_id)
  const { error: unassignError } = await supabase
    .from('newsletters')
    .update({ category_id: null })
    .eq('category_id', id)
    .eq('user_id', userId)

  if (unassignError) {
    logger.error({ userId, categoryId: id, error: unassignError }, 'Failed to unassign newsletters')
    return apiError('INTERNAL_ERROR', 'Erreur de désassignation des newsletters', 500)
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de suppression', 500)
  logger.info({ userId, categoryId: id }, 'Category deleted')
  return apiResponse({ deleted: true })
}
