import { type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { apiResponse, apiError, ErrorCodes } from '@/lib/utils/apiResponse'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'
import { fetchAdminUsers } from '@/features/admin/admin.service'

export async function GET(request: NextRequest) {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
  if (metadata?.role !== 'admin') {
    return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403)
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search')?.trim() ?? ''

  try {
    const response = await fetchAdminUsers(page, search)
    return apiResponse(response)
  } catch {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to load users', 500)
  }
}
