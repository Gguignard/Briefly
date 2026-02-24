export type UserTier = 'free' | 'starter' | 'pro'
export type UserRole = 'user' | 'admin'

export interface BrieflyPublicMetadata {
  tier: UserTier
  role: UserRole
}

export interface BrieflyUser {
  clerkId: string
  email: string
  tier: UserTier
  role: UserRole
  createdAt: Date
}
