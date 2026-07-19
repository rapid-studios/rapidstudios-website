// app/api/cms/auth/owner/route.ts
// Owner login. Rate limited. Accepts EITHER the master key (bootstrap /
// break-glass) OR an owner account's email + password. On success, returns the
// token AND sets an httpOnly session cookie so the Studio never has to persist
// the token in localStorage.

import { NextResponse } from "next/server";
import { checkOwnerKey, ownerKeyConfigured, setSessionCookie } from "@/lib/cms/auth/guard";
import { issueToken } from "@/lib/cms/auth/tokens";
import { verifyPassword } from "@/lib/cms/auth/passwords";
import { checkRateLimit, resetRateLimit, clientIp, sweepExpired } from "@/lib/cms/auth/rate-limit";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  sweepExpired();
  const rlKey = `owner:${clientIp(request)}`;
  const rl = checkRateLimit(rlKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } }
    );
  }

  let body: { masterKey?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Path 1: master key (bootstrap and break-glass).
  if (body.masterKey !== undefined) {
    if (!ownerKeyConfigured()) {
      return NextResponse.json({ error: "Owner login is disabled (CMS_OWNER_KEY not set)" }, { status: 503 });
    }
    if (!checkOwnerKey(body.masterKey)) {
      return NextResponse.json({ error: "Invalid master key" }, { status: 401 });
    }
    resetRateLimit(rlKey);
    const token = issueToken({ role: "owner" });
    const res = NextResponse.json({ token, role: "owner", via: "masterKey" });
    setSessionCookie(res, token);
    return res;
  }

  // Path 2: owner account email + password.
  if (body.email !== undefined || body.password !== undefined) {
    if (
      typeof body.email !== "string" ||
      body.email.length === 0 ||
      body.email.length > 320 ||
      typeof body.password !== "string" ||
      body.password.length === 0 ||
      body.password.length > 128
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const owner = await store.getOwnerByEmail(body.email);
    const ok = owner ? await verifyPassword(body.password, owner.passwordHash) : false;
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    resetRateLimit(rlKey);
    const token = issueToken({ role: "owner" });
    const res = NextResponse.json({ token, role: "owner", via: "account", email: owner!.email });
    setSessionCookie(res, token);
    return res;
  }

  return NextResponse.json({ error: "Provide masterKey, or email and password." }, { status: 400 });
}
