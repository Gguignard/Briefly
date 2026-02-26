import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next-intl middleware
const mockIntlMiddleware = vi.fn(() => new Response(null, { status: 200 }))
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mockIntlMiddleware),
}))

// Mock Clerk
const mockProtect = vi.fn()
const mockClerkMiddlewareHandler = vi.fn()

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn((handler) => {
    mockClerkMiddlewareHandler.mockImplementation((req: NextRequest) => {
      const auth = { protect: mockProtect }
      return handler(auth, req)
    })
    return mockClerkMiddlewareHandler
  }),
  createRouteMatcher: vi.fn((patterns: string[]) => {
    return (req: NextRequest) => {
      const pathname = req.nextUrl.pathname
      return patterns.some((pattern) => {
        // Convert route matcher pattern to regex
        const regexStr = '^' + pattern
          .replace(/\(\.?\*\)/g, '.*')
          .replace(/\.\.\./g, '.*') + '$'
        return new RegExp(regexStr).test(pathname)
      })
    }
  }),
}))

function createRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, 'http://localhost:3000'))
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProtect.mockResolvedValue({ sessionClaims: {} })
  })

  describe('public routes', () => {
    it('allows root without authentication', async () => {
      // Dynamic import to get the middleware after mocks are set up
      const mod = await import('../middleware')
      const middleware = mockClerkMiddlewareHandler

      const req = createRequest('/')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /fr without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /en without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/en')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows /fr/pricing without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/pricing')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /en/pricing without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/en/pricing')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/legal/privacy without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/legal/privacy')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/sign-in without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/sign-in')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /fr/sign-up without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/sign-up')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
    })

    it('allows /api/webhooks/clerk without authentication', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/api/webhooks/clerk')
      await middleware(req)

      expect(mockProtect).not.toHaveBeenCalled()
      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })
  })

  describe('protected routes', () => {
    it('calls auth.protect() for /fr/summaries', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/summaries')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /en/newsletters', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/en/newsletters')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/categories', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/categories')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/settings', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/settings')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /fr/billing', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/billing')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })

    it('returns intl middleware response after auth for protected routes', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/summaries')
      await middleware(req)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('delegates unauthenticated redirect to auth.protect() for protected routes', async () => {
      // When unauthenticated, Clerk's auth.protect() triggers a NEXT_REDIRECT to /sign-in?redirect_url=...
      // This test verifies our middleware calls protect() and propagates Clerk's redirect mechanism
      const nextRedirectError = Object.assign(new Error('NEXT_REDIRECT'), {
        digest: 'NEXT_REDIRECT;replace;/sign-in?redirect_url=%2Ffr%2Fsummaries;307;',
      })
      mockProtect.mockRejectedValue(nextRedirectError)

      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/summaries')

      await expect(middleware(req)).rejects.toMatchObject({
        digest: expect.stringContaining('NEXT_REDIRECT'),
      })
      expect(mockProtect).toHaveBeenCalled()
    })

    it('calls auth.protect() for /summaries without locale prefix', async () => {
      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/summaries')
      await middleware(req)

      expect(mockProtect).toHaveBeenCalled()
    })
  })

  describe('admin routes', () => {
    it('returns 403 for non-admin user on /fr/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'user' } },
      })

      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/admin')
      const response = await middleware(req)

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Forbidden: admin access required')
    })

    it('returns 403 for user without role metadata on /en/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: {} },
      })

      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/en/admin')
      const response = await middleware(req)

      expect(response.status).toBe(403)
    })

    it('allows admin user on /fr/admin', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'admin' } },
      })

      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/fr/admin')
      await middleware(req)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })

    it('allows admin user on /en/admin/dashboard', async () => {
      mockProtect.mockResolvedValue({
        sessionClaims: { metadata: { role: 'admin' } },
      })

      const middleware = mockClerkMiddlewareHandler
      const req = createRequest('/en/admin/dashboard')
      await middleware(req)

      expect(mockIntlMiddleware).toHaveBeenCalledWith(req)
    })
  })
})
