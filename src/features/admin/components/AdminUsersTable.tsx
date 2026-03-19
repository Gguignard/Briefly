'use client'

import { useState, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AdminUserRow } from '../admin.types'

const TIERS = ['free', 'starter', 'pro'] as const
const TIER_LABEL_KEYS = {
  free: 'tierFree',
  starter: 'tierStarter',
  pro: 'tierPro',
} as const

interface AdminUsersTableProps {
  initialUsers: AdminUserRow[]
  initialTotal: number
  initialPage: number
  perPage: number
}

export function AdminUsersTable({
  initialUsers,
  initialTotal,
  initialPage,
  perPage,
}: AdminUsersTableProps) {
  const t = useTranslations('admin.users')
  const locale = useLocale()

  const [users, setUsers] = useState(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRow | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const fetchUsers = useCallback(async (p: number, s: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (s) params.set('search', s)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) {
        toast.error(t('errorGeneric'))
        return
      }
      const json = await res.json()
      if (json.data) {
        setUsers(json.data.users)
        setTotal(json.data.total)
        setPage(json.data.page)
      }
    } catch {
      toast.error(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const handleSearch = () => {
    fetchUsers(1, search)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage, search)
    }
  }

  const handleTierChange = async (userId: string, newTier: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, tier: newTier } : u))
        )
        toast.success(t('tierUpdateSuccess'))
      } else {
        toast.error(t('errorGeneric'))
      }
    } catch {
      toast.error(t('errorGeneric'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendConfirm = async () => {
    if (!suspendTarget) return
    const userId = suspendTarget.id
    const wasSuspended = suspendTarget.suspended
    setSuspendTarget(null)
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      })
      if (res.ok) {
        const json = await res.json()
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, suspended: json.data.suspended } : u
          )
        )
        toast.success(wasSuspended ? t('reactivateSuccess') : t('suspendSuccess'))
      } else {
        toast.error(t('errorGeneric'))
      }
    } catch {
      toast.error(t('errorGeneric'))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              {t('search')}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">{t('email')}</th>
                  <th className="pb-2 font-medium">{t('tier')}</th>
                  <th className="pb-2 font-medium">{t('registration')}</th>
                  <th className="pb-2 font-medium">{t('summaries')}</th>
                  <th className="pb-2 font-medium">{t('status')}</th>
                  <th className="pb-2 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t('loading')}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t('noUsers')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        <Select
                          value={user.tier}
                          onValueChange={(value) => handleTierChange(user.id, value)}
                          disabled={actionLoading === user.id}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIERS.map((tier) => (
                              <SelectItem key={tier} value={tier}>
                                {t(TIER_LABEL_KEYS[tier])}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString(locale)}
                      </td>
                      <td className="py-2">{user.summaries_count}</td>
                      <td className="py-2">
                        {user.suspended ? (
                          <span className="text-xs font-medium text-destructive">
                            {t('suspended')}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600">
                            {t('active')}
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <Button
                          size="sm"
                          variant={user.suspended ? 'secondary' : 'destructive'}
                          disabled={actionLoading === user.id}
                          onClick={() => setSuspendTarget(user)}
                        >
                          {user.suspended ? t('reactivate') : t('suspend')}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t('userCount', { count: total, page, totalPages })}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!suspendTarget} onOpenChange={() => setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget?.suspended
                ? t('confirmReactivateTitle')
                : t('confirmSuspendTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget?.suspended
                ? t('confirmReactivateDescription')
                : t('confirmSuspendDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendConfirm}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
