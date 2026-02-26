import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { BrieflyPublicMetadata } from '@/features/auth/auth.types'

const intlMiddleware = createIntlMiddleware(routing)

const isPublicRoute = createRouteMatcher([
  '/',
  '/(fr|en)',
  '/(fr|en)/pricing',
  '/(fr|en)/legal/(.*)',
  '/(fr|en)/sign-in(.*)',
  '/(fr|en)/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/(fr|en)/admin',
  '/(fr|en)/admin/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return intlMiddleware(req)
  }

  const { sessionClaims } = await auth.protect()

  if (isAdminRoute(req)) {
    const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined
    if (metadata?.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
