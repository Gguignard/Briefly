import { auth, clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils/apiResponse'
import { logError } from '@/lib/utils/logger'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return apiError('UNAUTHORIZED', 'Non autorisé', 401)

  const supabase = createAdminClient()

  try {
    // 1. Supprimer toutes les données Supabase (ordre pour respecter les FK)
    const r1 = await supabase.from('user_settings').delete().eq('user_id', userId)
    if (r1.error) throw new Error(`user_settings: ${r1.error.message}`)

    const r2 = await supabase.from('summaries').delete().eq('user_id', userId)
    if (r2.error) throw new Error(`summaries: ${r2.error.message}`)

    const r3 = await supabase.from('newsletters').delete().eq('user_id', userId)
    if (r3.error) throw new Error(`newsletters: ${r3.error.message}`)

    const r4 = await supabase.from('llm_costs').delete().eq('user_id', userId)
    if (r4.error) throw new Error(`llm_costs: ${r4.error.message}`)

    const r5 = await supabase.from('users').delete().eq('clerk_id', userId)
    if (r5.error) throw new Error(`users: ${r5.error.message}`)

    // 2. Supprimer le compte Clerk (idempotent : 404 = déjà supprimé)
    try {
      const client = await clerkClient()
      await client.users.deleteUser(userId)
    } catch (clerkError: unknown) {
      const status = (clerkError as { status?: number }).status
      if (status !== 404) throw clerkError
    }

    return apiResponse({ deleted: true })
  } catch (error) {
    logError(error as Error, { userId, action: 'account_deletion' })
    return apiError('INTERNAL_ERROR', 'Erreur lors de la suppression', 500)
  }
}
