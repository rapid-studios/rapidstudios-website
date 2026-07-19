// lib/cms/auth/guard.ts
// Auth helpers for Next.js route handlers. Reads the Bearer token, returns the
// auth payload, and provides owner / site-scoped guards. Unlike Express
// middleware, these return either an auth context or a NextResponse to return.

import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { verifyToken, type AuthPayload } from "./tokens";

const OWNER_MASTER_KEY = process.env.CMS_OWNER_KEY || null;

export const SESSION_COOKIE = "cms_session";

/** Reads auth from the Authorization header first, then the session cookie. */
export function getAuth(req: Request): AuthPayload | null {
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (m) return verifyToken(m[1]);
  const cookie = req.headers.get("cookie") || "";
  const cm = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (cm) return verifyToken(decodeURIComponent(cm[1]));
  return null;
}

/** Attach the httpOnly session cookie to a login response. */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

/** Clear the session cookie (logout). */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export function ownerKeyConfigured(): boolean {
  return Boolean(OWNER_MASTER_KEY);
}

export function checkOwnerKey(presented: unknown): boolean {
  if (!OWNER_MASTER_KEY || typeof presented !== "string" || presented.length > 256) return false;
  const actual = Buffer.from(OWNER_MASTER_KEY);
  const candidate = Buffer.from(presented);
  return actual.length === candidate.length && timingSafeEqual(actual, candidate);
}

/** Returns null if owner; otherwise a 403 response to return. */
export function requireOwner(req: Request): NextResponse | null {
  const auth = getAuth(req);
  if (auth && auth.role === "owner") return null;
  return NextResponse.json({ error: "Owner access required" }, { status: 403 });
}

/** Returns null if owner OR matching client; otherwise a 403 response. */
export function requireSiteAccess(req: Request, siteId: string): NextResponse | null {
  const auth = getAuth(req);
  if (auth) {
    if (auth.role === "owner") return null;
    if (auth.role === "client" && auth.siteId === siteId) return null;
  }
  return NextResponse.json({ error: "Access denied for this site" }, { status: 403 });
}

export function isOwner(req: Request): boolean {
  const auth = getAuth(req);
  return Boolean(auth && auth.role === "owner");
}
