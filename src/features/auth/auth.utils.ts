import { currentUser, User } from '@clerk/nextjs/server'
import type { BrieflyPublicMetadata, UserTier, UserRole } from './auth.types'

/**
 * Type guard to safely extract BrieflyPublicMetadata from Clerk User
 */
function getPublicMetadata(user: User): Partial<BrieflyPublicMetadata> {
  return (user.publicMetadata as unknown as Partial<BrieflyPublicMetadata>) ?? {}
}

export function getTier(user: User): UserTier {
  const metadata = getPublicMetadata(user)
  return metadata.tier ?? 'free'
}

export function getRole(user: User): UserRole {
  const metadata = getPublicMetadata(user)
  return metadata.role ?? 'user'
}

export function isPaid(user: User): boolean {
  const tier = getTier(user)
  return tier === 'starter' || tier === 'pro'
}

export function isAdmin(user: User): boolean {
  return getRole(user) === 'admin'
}

export async function requireUser(): Promise<User> {
  const user = await currentUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}
