import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { AdminUsersTable } from '../AdminUsersTable'
import type { AdminUserRow } from '../../admin.types'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      title: 'User Management',
      searchPlaceholder: 'Search by email…',
      search: 'Search',
      email: 'Email',
      tier: 'Tier',
      registration: 'Registration',
      summaries: 'Summaries',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      suspended: 'Suspended',
      suspend: 'Suspend',
      reactivate: 'Reactivate',
      loading: 'Loading…',
      noUsers: 'No users found',
      tierFree: 'Free',
      tierStarter: 'Starter',
      tierPro: 'Pro',
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmSuspendTitle: 'Confirm suspension',
      confirmSuspendDescription: 'Are you sure?',
      confirmReactivateTitle: 'Confirm reactivation',
      confirmReactivateDescription: 'Reactivate?',
      tierUpdateSuccess: 'Tier updated.',
      suspendSuccess: 'Suspended.',
      reactivateSuccess: 'Reactivated.',
      errorGeneric: 'Error.',
      userCount: `${params?.count ?? 0} users — page ${params?.page ?? 1}/${params?.totalPages ?? 1}`,
    }
    return messages[key] ?? key
  },
  useLocale: () => 'en',
}))

const mockUsers: AdminUserRow[] = [
  {
    id: 'uuid-1',
    clerk_id: 'clerk_1',
    email: 'alice@test.com',
    tier: 'free',
    suspended: false,
    created_at: '2026-01-15T10:00:00Z',
    summaries_count: 5,
  },
  {
    id: 'uuid-2',
    clerk_id: 'clerk_2',
    email: 'bob@test.com',
    tier: 'pro',
    suspended: true,
    created_at: '2026-02-20T14:00:00Z',
    summaries_count: 12,
  },
]

describe('AdminUsersTable', () => {
  afterEach(cleanup)

  it('renders user emails', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('renders summaries count', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows suspended status', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Suspended')).toBeInTheDocument()
  })

  it('shows suspend/reactivate buttons', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('Suspend')).toBeInTheDocument()
    expect(screen.getByText('Reactivate')).toBeInTheDocument()
  })

  it('renders empty state when no users', () => {
    render(
      <AdminUsersTable initialUsers={[]} initialTotal={0} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('renders pagination info', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={45} initialPage={2} perPage={20} />
    )
    expect(screen.getByText('45 users — page 2/3')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByPlaceholderText('Search by email…')).toBeInTheDocument()
  })

  it('calls fetch on search button click', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { users: [], total: 0, page: 1, perPage: 20 } }),
    })
    global.fetch = mockFetch

    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )

    const input = screen.getByPlaceholderText('Search by email…')
    fireEvent.change(input, { target: { value: 'alice' } })
    fireEvent.click(screen.getByText('Search'))

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/users?page=1&search=alice')
  })

  it('opens confirmation dialog when suspend button is clicked', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )

    fireEvent.click(screen.getByText('Suspend'))
    expect(screen.getByText('Confirm suspension')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders i18n column headers', () => {
    render(
      <AdminUsersTable initialUsers={mockUsers} initialTotal={2} initialPage={1} perPage={20} />
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Registration')).toBeInTheDocument()
    expect(screen.getByText('Summaries')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
