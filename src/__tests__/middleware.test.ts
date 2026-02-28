import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextFetchEvent } from 'next/server'

// Mock next-intl middleware
const mockIntlMiddleware = vi.fn(() => new Response(null, { status: 200 }))
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mockIntlMiddleware),
}))

// Mock i18n routing config
vi.mock('../i18n/routing', () => ({
  routing: {},
  locales: ['fr', 'en'],
}))

// Mock Clerk
const mockProtect = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn((handler) => {
    return vi.fn((req: NextRequest, _event: unknown) => {
      const auth = { protect: mockProtect }
      return handler(auth, req)
    })
  }),
  createRouteMatcher: vi.fn((patterns: string[]) => {
    return (req: NextRequest) => {
      const pathname = req.nextUrl.pathname
      return patterns.some((pattern) => {
        const regexStr =
          '^' +
          pattern
            .replace(/\/:[a-zA-Z]+/g, '/[^/]+') // /:locale, /:param → /[^/]+
            .replace(/\(fr\|en\)/g, '(?:fr|en)')
            .replace(/\(\.?\*\)/g, '.*')
            .replace(/\.\.\./g, '.*') +
          '$'
        return new RegExp(regexStr).test(pathname)
      })
    }
  }),
}))

function createRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, 'http://localhost:3000'))
}

const fakeEvent = {} as NextFetchEvent

describe('middleware', () => {
  let middleware: (req: NextRequest, event: NextFetchEvent) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockProtect.mockResolvedValue({ sessionClaims: {} })
    const mod = await import('../middleware')
    middleware = mod.default
  })

  describe('public routes — skip Clerk, go straight to i18n', () => {
    it('allows / without authentication', async () => {
      const req = createRequest('/')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /fr without authentication', async () => {
      const req = createRequest('/fr')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /en without authentication', async () => {
      const req = createRequest('/en')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /fr/pricing without authentication', async () => {
      const req = createRequest('/fr/pricing')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /en/pricing without authentication', async () => {
      const req = createRequest('/en/pricing')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/legal/privacy without authentication', async () => {
      const req = createRequest('/fr/legal/privacy')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/sign-in without authentication', async () => {
      const req = createRequest('/fr/sign-in')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/sign-up without authentication', async () => {
      const req = createRequest('/fr/sign-up')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /api/webhooks/clerk without authentication', async () => {
      const req = createRequest('/api/webhooks/clerk')
      await middleware(req, fakeEvent)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })
  })

  describe('protected routes — Clerk auth required', () => {
    it('calls auth.protect() for /fr/dashboard', async () => {
      const req = createRequest('/fr/dashboard')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/settings', async () => {
      const req = createRequest('/fr/settings')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/newsletters', async () => {
      const req = createRequest('/fr/newsletters')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/categories', async () => {
      const req = createRequest('/fr/categories')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/billing', async () => {
      const req = createRequest('/fr/billing')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/summaries', async () => {
      const req = createRequest('/fr/summaries')
      await middleware(req, fakeEvent)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('passes i18n middleware after successful auth', async () => {
      const req = createRequest('/fr/settings')
      await middleware(req, fakeEvent)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('redirects to /fr/sign-in when unauthenticated on /fr/settings', async () => {
      const nextRedirectError = Object.assign(new Error('NEXT_REDIRECT'), {
        digest: 'NEXT_REDIRECT;replace;/fr/sign-in?redirect_url=%2Ffr%2Fsettings;307;',
      })
      mockProtect.mockRejectedValue(nextRedirectError)

      const req = createRequest('/fr/settings')

      await expect(middleware(req, fakeEvent)).rejects.toMatchObject({
        digest: expect.stringContaining('NEXT_REDIRECT'),
      })
      expect(mockProtect).toHaveBeenCalledWith(
        expect.objectContaining({ unauthenticatedUrl: expect.stringContaining('/fr/sign-in') }),
      )
    })

    it('redirects to /en/sign-in when unauthenticated on /en/newsletters', async () => {
      const nextRedirectError = Object.assign(new Error('NEXT_REDIRECT'), {
        digest: 'NEXT_REDIRECT;replace;/en/sign-in;307;',
      })
      mockProtect.mockRejectedValue(nextRedirectError)

      const req = createRequest('/en/newsletters')

      await expect(middleware(req, fakeEvent)).rejects.toMatchObject({
        digest: expect.stringContaining('NEXT_REDIRECT'),
      })
      expect(mockProtect).toHaveBeenCalledWith(
        expect.objectContaining({ unauthenticatedUrl: expect.stringContaining('/en/sign-in') }),
      )
    })
  })

  describe('admin routes', () => {
    it('returns 403 for non-admin user on /fr/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'user' } },
      })

      const req = createRequest('/fr/admin')
      const response = await middleware(req, fakeEvent)

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Forbidden: admin access required')
    })

    it('returns 403 for user without role metadata on /en/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: {} },
      })

      const req = createRequest('/en/admin')
      const response = await middleware(req, fakeEvent)

      expect(response.status).toBe(403)
    })

    it('allows admin user on /fr/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'admin' } },
      })

      const req = createRequest('/fr/admin')
      await middleware(req, fakeEvent)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows admin user on /en/admin/dashboard', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'admin' } },
      })

      const req = createRequest('/en/admin/dashboard')
      await middleware(req, fakeEvent)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })
  })
})
