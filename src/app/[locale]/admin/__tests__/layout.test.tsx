import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

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
  getLocale: vi.fn().mockResolvedValue('fr'),
  getTranslations: vi.fn().mockResolvedValue((key: string) => {
    const translations: Record<string, string> = {
      title: 'Briefly Admin',
      dashboardTitle: 'Admin Dashboard',
      dashboardWelcome: 'Welcome to the admin panel.',
    }
    return translations[key] ?? key
  }),
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('redirects to sign-in when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null })

    const { default: AdminLayout } = await import('../layout')
    await AdminLayout({ children: React.createElement('div') })

    expect(mockRedirect).toHaveBeenCalledWith('/fr/sign-in')
  })

  it('redirects to locale home when user has no admin role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'user' } },
    })

    const { default: AdminLayout } = await import('../layout')
    await AdminLayout({ children: React.createElement('div') })

    expect(mockRedirect).toHaveBeenCalledWith('/fr')
  })

  it('redirects to locale home when user has no role metadata', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: {} },
    })

    const { default: AdminLayout } = await import('../layout')
    await AdminLayout({ children: React.createElement('div') })

    expect(mockRedirect).toHaveBeenCalledWith('/fr')
  })

  it('renders header and children when user is admin', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'admin' } },
    })

    const { default: AdminLayout } = await import('../layout')
    const result = await AdminLayout({
      children: React.createElement('div', { 'data-testid': 'child' }, 'Admin content'),
    })

    expect(mockRedirect).not.toHaveBeenCalled()

    render(result as React.ReactElement)
    expect(screen.getByText('Briefly Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })
})
