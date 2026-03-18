import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminUserRow, AdminUsersResponse } from './admin.types'

const PER_PAGE = 20

export async function fetchAdminUsers(
  page: number,
  search: string = ''
): Promise<AdminUsersResponse> {
  const supabase = createAdminClient()
  const offset = (page - 1) * PER_PAGE

  let countQuery = supabase.from('users').select('id', { count: 'exact', head: true })
  let dataQuery = supabase
    .from('users')
    .select('id, clerk_id, email, tier, suspended, created_at, summaries(count)')

  if (search) {
    countQuery = countQuery.ilike('email', `%${search}%`)
    dataQuery = dataQuery.ilike('email', `%${search}%`)
  }

  dataQuery = dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + PER_PAGE - 1)

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error || dataResult.error) {
    throw new Error('Failed to load users')
  }

  const users: AdminUserRow[] = (dataResult.data as unknown[]).map((u: unknown) => {
    const row = u as Record<string, unknown>
    const summariesArr = row.summaries as { count: number }[] | undefined
    return {
      id: row.id as string,
      clerk_id: row.clerk_id as string,
      email: row.email as string,
      tier: row.tier as string,
      suspended: row.suspended as boolean,
      created_at: row.created_at as string,
      summaries_count: summariesArr?.[0]?.count ?? 0,
    }
  })

  return {
    users,
    total: countResult.count ?? 0,
    page,
    perPage: PER_PAGE,
  }
}
