import { type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError, ErrorCodes } from '@/lib/utils/apiResponse'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'
import logger from '@/lib/utils/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403)
  }

  const { id } = await params
  const body = await request.json()
  const { tier } = body

  if (!tier || !['free', 'starter', 'pro'].includes(tier)) {
    return apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid tier. Accepted values: free, starter, pro', 400)
  }

  const supabase = createAdminClient()

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('clerk_id, tier')
    .eq('id', id)
    .single()

  if (fetchError || !user) {
    return apiError(ErrorCodes.NOT_FOUND, 'User not found', 404)
  }

  const previousTier = user.tier

  const { error: updateError } = await supabase
    .from('users')
    .update({ tier })
    .eq('id', id)

  if (updateError) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to update tier', 500)
  }

  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(user.clerk_id)
    const existingMetadata = (clerkUser.publicMetadata ?? {}) as Record<string, unknown>
    await clerk.users.updateUser(user.clerk_id, {
      publicMetadata: { ...existingMetadata, tier },
    })
  } catch (clerkError) {
    logger.error({ userId: id, clerkId: user.clerk_id, tier, previousTier, error: clerkError }, 'Clerk sync failed after Supabase tier update, rolling back')
    await supabase.from('users').update({ tier: previousTier }).eq('id', id)
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to sync tier with auth provider', 500)
  }

  logger.info({ userId: id, previousTier, newTier: tier, adminId: sessionClaims?.sub }, 'Admin changed user tier')

  return apiResponse({ id, tier })
}
