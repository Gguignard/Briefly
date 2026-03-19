import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import type { BrieflyPublicMetadata } from "@/features/auth/auth.types";
import { featureFlags } from "./lib/flags";

const handleI18nRouting = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/",
  "/(fr|en)",
  "/(fr|en)/pricing",
  "/(fr|en)/help",
  "/(fr|en)/help/(.*)",
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
  // Mode maintenance : bloque tout sauf /admin
  if (featureFlags.maintenanceMode && !isAdminRoute(request)) {
    const locale = (request.nextUrl.pathname.match(/^\/(fr|en)\b/) ?? [])[1] ?? "fr";
    const title = locale === "en" ? "Briefly is under maintenance" : "Briefly est en maintenance";
    const message = locale === "en"
      ? "We'll be back in a few minutes. Thank you for your patience."
      : "Revenez dans quelques minutes. Merci de votre patience.";
    return new NextResponse(
      `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#111827;text-align:center}div{max-width:480px;padding:2rem}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#6b7280}</style></head><body><div><h1>${title}</h1><p>${message}</p></div></body></html>`,
      {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Retry-After": "300",
        },
      },
    );
  }

  // Signup désactivé : bloque les routes sign-up
  if (!featureFlags.signupEnabled) {
    const pathname = request.nextUrl.pathname;
    if (pathname.includes("/sign-up")) {
      const locale = (pathname.match(/^\/(fr|en)\b/) ?? [])[1] ?? "fr";
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

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
