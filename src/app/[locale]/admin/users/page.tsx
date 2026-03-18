import { getTranslations } from 'next-intl/server'
import { AdminUsersTable } from '@/features/admin/components/AdminUsersTable'
import { fetchAdminUsers } from '@/features/admin/admin.service'

export default async function AdminUsersPage() {
  const t = await getTranslations('admin.users')
  const { users, total, page, perPage } = await fetchAdminUsers(1)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <AdminUsersTable
        initialUsers={users}
        initialTotal={total}
        initialPage={page}
        perPage={perPage}
      />
    </div>
  )
}
