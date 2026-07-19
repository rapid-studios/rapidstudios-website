import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cmsMutationRejection } from "@/lib/cms/auth/csrf";

/**
 * Reject cross-origin browser mutations before they reach cookie-authenticated
 * CMS handlers. Route-level authorization remains the primary security layer;
 * this is the CSRF boundary for the httpOnly session cookie.
 */
export function proxy(request: NextRequest) {
  const rejection = cmsMutationRejection({
    method: request.method,
    expectedOrigin: request.nextUrl.origin,
    origin: request.headers.get("origin"),
    fetchSite: request.headers.get("sec-fetch-site"),
    hasCookieSession: request.cookies.has("cms_session"),
    hasBearerSession: request.headers.has("authorization"),
  });
  if (rejection) {
    return NextResponse.json({ error: rejection }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/cms/:path*",
};
