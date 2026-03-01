import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { z } from 'zod'
import logger from '@/lib/utils/logger'

const PatchNewsletterSchema = z.object({
  active: z.boolean(),
})

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { id } = await params

  if (!z.string().uuid().safeParse(id).success) {
    return apiError('VALIDATION_ERROR', 'ID invalide', 400)
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de suppression', 500)
  if (!data || data.length === 0) return apiError('NOT_FOUND', 'Newsletter introuvable', 404)
  logger.info({ userId, newsletterId: id }, 'Newsletter deleted')
  return apiResponse({ deleted: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { id } = await params

  if (!z.string().uuid().safeParse(id).success) {
    return apiError('VALIDATION_ERROR', 'ID invalide', 400)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Corps de requête JSON invalide', 400)
  }

  const parsed = PatchNewsletterSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.message, 400)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('newsletters')
    .update({ active: parsed.data.active })
    .eq('id', id)
    .eq('user_id', userId)
    .select()

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de mise à jour', 500)
  if (!data || data.length === 0) return apiError('NOT_FOUND', 'Newsletter introuvable', 404)
  logger.info({ userId, newsletterId: id, active: parsed.data.active }, 'Newsletter toggled')
  return apiResponse(data[0])
}
