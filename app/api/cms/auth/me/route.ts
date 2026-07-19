// app/api/cms/auth/me/route.ts
// Session check for the Studio. Reads the httpOnly cookie (or Bearer header)
// and returns the current role, so the frontend can restore a session without
// ever persisting the token itself.

import { NextResponse } from "next/server";
import { getAuth } from "@/lib/cms/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = getAuth(request);
  if (!auth) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    role: auth.role,
    siteId: auth.role === "client" ? auth.siteId : undefined,
  });
}
