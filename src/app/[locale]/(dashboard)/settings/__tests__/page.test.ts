import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}))

// Mock next/navigation
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

// Mock Supabase admin client
const mockMaybeSingle = vi.fn()
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}))

// Mock feature components with trackable fns
const mockNotificationSection = vi.fn().mockReturnValue(null)
vi.mock('@/features/settings/components/AccountSection', () => ({
  AccountSection: () => null,
}))
vi.mock('@/features/settings/components/NotificationSection', () => ({
  NotificationSection: (props: unknown) => mockNotificationSection(props),
}))
vi.mock('@/features/settings/components/BillingSection', () => ({
  BillingSection: () => null,
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
  })

  it('redirects to sign-in when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const { default: SettingsPage } = await import('../page')
    await SettingsPage()

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })

  it('passes initialEnabled=true to NotificationSection when no settings row exists', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })

    const { default: SettingsPage } = await import('../page')
    await SettingsPage()

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotificationSection).toHaveBeenCalledWith(
      expect.objectContaining({ initialEnabled: true })
    )
  })

  it('passes initialEnabled=true when daily_summary_enabled is true in DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockMaybeSingle.mockResolvedValue({
      data: { daily_summary_enabled: true },
      error: null,
    })

    const { default: SettingsPage } = await import('../page')
    await SettingsPage()

    expect(mockNotificationSection).toHaveBeenCalledWith(
      expect.objectContaining({ initialEnabled: true })
    )
  })

  it('passes initialEnabled=false when daily_summary_enabled is false in DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockMaybeSingle.mockResolvedValue({
      data: { daily_summary_enabled: false },
      error: null,
    })

    const { default: SettingsPage } = await import('../page')
    await SettingsPage()

    expect(mockNotificationSection).toHaveBeenCalledWith(
      expect.objectContaining({ initialEnabled: false })
    )
  })
})
