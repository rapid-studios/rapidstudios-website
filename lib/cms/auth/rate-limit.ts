// lib/cms/auth/rate-limit.ts
// Brute-force protection for the login endpoints. Fixed-window, in-memory,
// keyed by client IP + route. State is held on globalThis so it survives warm
// serverless invocations; a cold start resets the window, which is acceptable
// for login throttling (each warm instance still enforces the cap).
// For multi-instance hard guarantees, swap the Map for Upstash Redis; the
// interface below stays the same.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

export const CLIENT_PASSWORD_MIN_LENGTH = 12;
export const CLIENT_PASSWORD_MAX_LENGTH = 128;

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForRl = globalThis as unknown as { __cmsRateLimit?: Map<string, Bucket> };
const buckets = (globalForRl.__cmsRateLimit ||= new Map<string, Bucket>());

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  const raw = fwd?.split(",")[0].trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
  // Bound attacker-controlled fallback headers so rate-limit keys cannot retain
  // arbitrarily large strings in a long-lived server process.
  return raw.slice(0, 64);
}

export function clientLoginRateLimitKey(request: Request, siteId: string): string {
  return JSON.stringify(["client", clientIp(request), siteId.slice(0, 128)]);
}

export function isValidClientPassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= CLIENT_PASSWORD_MIN_LENGTH &&
    password.length <= CLIENT_PASSWORD_MAX_LENGTH
  );
}

export interface RateResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Record an attempt and report whether it is allowed. */
export function checkRateLimit(key: string): RateResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, b);
  }
  b.count += 1;
  const allowed = b.count <= MAX_ATTEMPTS;
  return {
    allowed,
    remaining: Math.max(0, MAX_ATTEMPTS - b.count),
    retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000),
  };
}

/** Clear a key after a successful login so legitimate users aren't penalized. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

// Opportunistic cleanup so the map cannot grow unbounded on long-lived hosts.
export function sweepExpired(): void {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}
