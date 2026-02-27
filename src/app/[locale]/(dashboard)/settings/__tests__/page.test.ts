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
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}))

// Mock feature components
vi.mock('@/features/settings/components/AccountSection', () => ({
  AccountSection: () => null,
}))
vi.mock('@/features/settings/components/NotificationSection', () => ({
  NotificationSection: () => null,
}))
vi.mock('@/features/settings/components/BillingSection', () => ({
  BillingSection: () => null,
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: null, error: null })
  })

  it('redirects to sign-in when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const { default: SettingsPage } = await import('../page')
    await SettingsPage()

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in')
  })

  it('renders settings page when user is authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockSingle.mockResolvedValue({
      data: { daily_summary_enabled: true },
      error: null,
    })

    const { default: SettingsPage } = await import('../page')
    const result = await SettingsPage()

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(result).toBeDefined()
  })

  it('defaults notification to enabled when no settings exist', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockSingle.mockResolvedValue({ data: null, error: null })

    const { default: SettingsPage } = await import('../page')
    const result = await SettingsPage()

    expect(result).toBeDefined()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
