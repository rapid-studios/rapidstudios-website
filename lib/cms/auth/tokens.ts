// lib/cms/auth/tokens.ts
// Minimal JWT (HS256) using Node crypto — no external dependency. Issues owner
// and client tokens. Signing secret from CMS_JWT_SECRET; required in production.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

let developmentSecret: string | undefined;

function getSecret(): string {
  const configuredSecret = process.env.CMS_JWT_SECRET;
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CMS_JWT_SECRET must be set in production");
  }
  developmentSecret ??= `dev-${randomBytes(16).toString("hex")}`;
  return developmentSecret;
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 12; // 12h

export interface OwnerPayload { role: "owner"; iat: number; exp: number }
export interface ClientPayload { role: "client"; siteId: string; iat: number; exp: number }
export type AuthPayload = OwnerPayload | ClientPayload;

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function issueToken(
  payload: { role: "owner" } | { role: "client"; siteId: string },
  ttlSeconds = DEFAULT_TTL_SECONDS
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds };
  const headerB64 = b64url(JSON.stringify(header));
  const bodyB64 = b64url(JSON.stringify(body));
  const sig = sign(`${headerB64}.${bodyB64}`);
  return `${headerB64}.${bodyB64}.${sig}`;
}

export function verifyToken(token: string | null | undefined): AuthPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, bodyB64, sig] = parts;
  const expected = sign(`${headerB64}.${bodyB64}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let body: AuthPayload;
  try {
    body = JSON.parse(Buffer.from(bodyB64, "base64url").toString("utf8")) as AuthPayload;
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof body.exp === "number" && body.exp < now) return null;
  return body;
}
