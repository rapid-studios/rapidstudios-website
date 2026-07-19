// app/api/cms/auth/client/route.ts
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/cms/auth/passwords";
import { setSessionCookie } from "@/lib/cms/auth/guard";
import {
  checkRateLimit,
  clientLoginRateLimitKey,
  isValidClientPassword,
  resetRateLimit,
  sweepExpired,
} from "@/lib/cms/auth/rate-limit";
import { issueToken } from "@/lib/cms/auth/tokens";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  sweepExpired();

  let body: { siteId?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { siteId, password } = body;
  if (
    typeof siteId !== "string" ||
    !siteId ||
    siteId.length > 128 ||
    typeof password !== "string" ||
    !password
  ) {
    return NextResponse.json({ error: "siteId and password are required" }, { status: 400 });
  }

  const rlKey = clientLoginRateLimitKey(request, siteId);
  const rl = checkRateLimit(rlKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } }
    );
  }

  if (!isValidClientPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const site = await store.getSite(siteId);
  if (!site || !site.clientPasswordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await verifyPassword(password, site.clientPasswordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  // Only this IP + site bucket is cleared. A successful login to one site must
  // not erase failed attempts against another site.
  resetRateLimit(rlKey);
  const token = issueToken({ role: "client", siteId });
  const res = NextResponse.json({ token, role: "client", siteId });
  setSessionCookie(res, token);
  return res;
}
