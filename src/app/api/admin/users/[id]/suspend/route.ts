import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError, ErrorCodes } from '@/lib/utils/apiResponse'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'
import type { NextRequest } from 'next/server'
import logger from '@/lib/utils/logger'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403)
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('suspended')
    .eq('id', id)
    .single()

  if (fetchError || !user) {
    return apiError(ErrorCodes.NOT_FOUND, 'User not found', 404)
  }

  const newSuspended = !user.suspended

  const { error: updateError } = await supabase
    .from('users')
    .update({ suspended: newSuspended })
    .eq('id', id)

  if (updateError) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to update suspension status', 500)
  }

  logger.info({ userId: id, suspended: newSuspended, adminId: sessionClaims?.sub }, 'Admin toggled user suspension')

  return apiResponse({ id, suspended: newSuspended })
}
