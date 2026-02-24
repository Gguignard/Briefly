import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTier, getRole, isPaid, isAdmin, requireUser } from '../auth.utils'
import type { User } from '@clerk/nextjs/server'

// Mock Clerk's currentUser
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}))

// Helper to create mock User objects
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user_test123',
    primaryEmailAddressId: 'email_test',
    emailAddresses: [],
    phoneNumbers: [],
    web3Wallets: [],
    externalAccounts: [],
    samlAccounts: [],
    organizationMemberships: [],
    passkeys: [],
    publicMetadata: {},
    privateMetadata: {},
    unsafeMetadata: {},
    firstName: null,
    lastName: null,
    fullName: null,
    username: null,
    hasImage: false,
    imageUrl: '',
    primaryEmailAddress: null,
    primaryPhoneNumber: null,
    primaryWeb3Wallet: null,
    twoFactorEnabled: false,
    totpEnabled: false,
    backupCodeEnabled: false,
    passwordEnabled: false,
    banned: false,
    locked: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastSignInAt: null,
    lastActiveAt: null,
    externalId: null,
    legalAcceptedAt: null,
    createOrganizationEnabled: false,
    createOrganizationsLimit: null,
    deleteSelfEnabled: false,
    profileImageUrl: '',
    ...overrides,
  } as unknown as User
}

describe('auth.utils', () => {
  describe('getTier', () => {
    it('returns "free" when publicMetadata has no tier', () => {
      const user = createMockUser({ publicMetadata: {} })
      expect(getTier(user)).toBe('free')
    })

    it('returns "free" when publicMetadata is empty', () => {
      const user = createMockUser()
      expect(getTier(user)).toBe('free')
    })

    it('returns the tier from publicMetadata when set', () => {
      const user = createMockUser({
        publicMetadata: { tier: 'starter' },
      })
      expect(getTier(user)).toBe('starter')
    })

    it('returns "pro" tier when set', () => {
      const user = createMockUser({
        publicMetadata: { tier: 'pro' },
      })
      expect(getTier(user)).toBe('pro')
    })
  })

  describe('getRole', () => {
    it('returns "user" when publicMetadata has no role', () => {
      const user = createMockUser({ publicMetadata: {} })
      expect(getRole(user)).toBe('user')
    })

    it('returns "user" when publicMetadata is empty', () => {
      const user = createMockUser()
      expect(getRole(user)).toBe('user')
    })

    it('returns the role from publicMetadata when set', () => {
      const user = createMockUser({
        publicMetadata: { role: 'admin' },
      })
      expect(getRole(user)).toBe('admin')
    })
  })

  describe('isPaid', () => {
    it('returns false for free tier', () => {
      const user = createMockUser({ publicMetadata: { tier: 'free' } })
      expect(isPaid(user)).toBe(false)
    })

    it('returns false when no tier is set (defaults to free)', () => {
      const user = createMockUser()
      expect(isPaid(user)).toBe(false)
    })

    it('returns true for starter tier', () => {
      const user = createMockUser({ publicMetadata: { tier: 'starter' } })
      expect(isPaid(user)).toBe(true)
    })

    it('returns true for pro tier', () => {
      const user = createMockUser({ publicMetadata: { tier: 'pro' } })
      expect(isPaid(user)).toBe(true)
    })
  })

  describe('isAdmin', () => {
    it('returns false when role is not set', () => {
      const user = createMockUser()
      expect(isAdmin(user)).toBe(false)
    })

    it('returns false when role is "user"', () => {
      const user = createMockUser({ publicMetadata: { role: 'user' } })
      expect(isAdmin(user)).toBe(false)
    })

    it('returns true when role is "admin"', () => {
      const user = createMockUser({ publicMetadata: { role: 'admin' } })
      expect(isAdmin(user)).toBe(true)
    })
  })

  describe('requireUser', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('throws error when no user is authenticated', async () => {
      const { currentUser } = await import('@clerk/nextjs/server')
      vi.mocked(currentUser).mockResolvedValueOnce(null)

      await expect(requireUser()).rejects.toThrow('Unauthenticated')
    })

    it('returns the user when authenticated', async () => {
      const { currentUser } = await import('@clerk/nextjs/server')
      const mockUser = createMockUser({ id: 'user_authenticated' })
      vi.mocked(currentUser).mockResolvedValueOnce(mockUser)

      const result = await requireUser()
      expect(result).toBe(mockUser)
      expect(result.id).toBe('user_authenticated')
    })
  })
})
