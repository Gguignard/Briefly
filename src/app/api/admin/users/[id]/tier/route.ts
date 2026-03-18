import { type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError, ErrorCodes } from '@/lib/utils/apiResponse'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    return apiError(ErrorCodes.FORBIDDEN, 'Accès refusé', 403)
  }

  const { id } = await params
  const body = await request.json()
  const { tier } = body

  if (!tier || !['free', 'starter', 'pro'].includes(tier)) {
    return apiError(ErrorCodes.VALIDATION_ERROR, 'Tier invalide. Valeurs acceptées : free, starter, pro', 400)
  }

  const supabase = createAdminClient()

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('clerk_id')
    .eq('id', id)
    .single()

  if (fetchError || !user) {
    return apiError(ErrorCodes.NOT_FOUND, 'Utilisateur non trouvé', 404)
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ tier })
    .eq('id', id)

  if (updateError) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Erreur lors de la mise à jour du tier', 500)
  }

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(user.clerk_id)
  const existingMetadata = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>
  await clerk.users.updateUser(user.clerk_id, {
    publicMetadata: { ...existingMetadata, tier },
  })

  return apiResponse({ id, tier })
}
