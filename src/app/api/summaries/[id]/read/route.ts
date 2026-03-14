import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const { id } = await params

  if (!z.string().uuid().safeParse(id).success) {
    return apiError('VALIDATION_ERROR', 'ID invalide', 400)
  }

  const supabase = createAdminClient()

  // Get user internal id from clerk_id
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) return apiError('NOT_FOUND', 'Utilisateur introuvable', 404)

  const { data, error } = await supabase
    .from('summaries')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')

  if (error) return apiError('INTERNAL_ERROR', 'Erreur de mise à jour', 500)
  if (!data || data.length === 0) return apiError('NOT_FOUND', 'Résumé introuvable', 404)

  return apiResponse({ read: true })
}
