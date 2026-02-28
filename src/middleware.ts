import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import type { BrieflyPublicMetadata } from "@/features/auth/auth.types";

const handleI18nRouting = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/",
  "/(fr|en)",
  "/(fr|en)/pricing",
  "/(fr|en)/legal/(.*)",
  "/(fr|en)/sign-in(.*)",
  "/(fr|en)/sign-up(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/:locale/admin(.*)",
]);

// Runs clerkMiddleware only on non-public routes to avoid redirect loops
// between Clerk auth and next-intl routing on sign-in/sign-up pages.
export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (isPublicRoute(request)) {
    return handleI18nRouting(request);
  }

  return clerkMiddleware(async (auth, req) => {
    if (isAdminRoute(req)) {
      const { sessionClaims } = await auth.protect();
      const metadata = sessionClaims?.metadata as Partial<BrieflyPublicMetadata> | undefined;

      if (metadata?.role !== "admin") {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
    } else {
      const locale = (req.nextUrl.pathname.match(/^\/(fr|en)\b/) ?? [])[1] ?? "fr";
      const signInUrl = new URL(`/${locale}/sign-in`, req.url);

      await auth.protect({
        unauthenticatedUrl: signInUrl.toString(),
      });
    }

    return handleI18nRouting(req);
  })(request, event);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!_next|_vercel|monitoring|.*\\..*).*)",
};
