import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BODY_LIMIT = 4096;
const SESSION_TTL = 30 * 60 * 1000;
const COOKIE = "kumo_demo_session";
const ROUTES: Record<string, "GET" | "POST"> = {
  "/api/kumo/demo/session": "POST",
  "/api/kumo/entitlement": "GET",
  "/api/kumo/deals": "GET",
  "/api/kumo/demo/billing": "POST",
  "/api/kumo/logout": "POST",
};

type Status = "active" | "expired";
type Session = {
  demo: true;
  status: Status;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};
type Options = {
  signingKey: string;
  allowedOrigins: readonly string[];
  deals: readonly unknown[];
  allowLocalHttp?: boolean;
  sessionTTL?: number;
  now?: () => number;
};

class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

function failure(status: number, message: string, extra: Record<string, string> = {}) {
  return json(status, { error: message, demo: true }, extra);
}

function isStatus(value: unknown): value is Status {
  return value === "active" || value === "expired";
}

function exactHttpsOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value && !url.port &&
      !url.hostname.includes("*");
  } catch {
    return false;
  }
}

/** Only call with trusted deployment configuration, never request headers. */
export function deploymentOrigins(hostnames: readonly (string | undefined)[]) {
  const origins = new Set(["https://rapidstudios.dev", "https://www.rapidstudios.dev"]);
  for (const host of hostnames) {
    if (!host) continue;
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host) || host.includes("..")) {
      throw new Error("Invalid demo deployment hostname configuration.");
    }
    const origin = `https://${host}`;
    if (!exactHttpsOrigin(origin)) throw new Error("Invalid demo deployment hostname configuration.");
    origins.add(origin);
  }
  return [...origins];
}

async function readBody(request: Request) {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) {
    throw new RequestError(400, "Invalid content length.");
  }
  if (declared !== null && Number(declared) > BODY_LIMIT) {
    await request.body?.cancel().catch(() => {});
    throw new RequestError(413, "Request body is too large.");
  }
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > BODY_LIMIT) {
        await reader.cancel().catch(() => {});
        throw new RequestError(413, "Request body is too large.");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, "Request was interrupted.");
  } finally {
    reader.releaseLock();
  }
}

async function readStatus(request: Request): Promise<Status> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new RequestError(415, "Use application/json.");
  }
  const raw = await readBody(request);
  let body: unknown;
  try { body = JSON.parse(raw); }
  catch { throw new RequestError(400, "Request body must be valid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 1 || !("status" in body) || !isStatus(body.status)) {
    throw new RequestError(400, "Provide only status: active or expired.");
  }
  return body.status;
}

function sign(session: Session, key: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", key).update(`kumo-demo-session-v1.${payload}`).digest("base64url");
  return `v1.${payload}.${signature}`;
}

function decode(token: string, key: string, ttl: number, now: number): Session | undefined {
  if (token.length > 1024) return;
  const match = /^v1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return;
  const signature = Buffer.from(match[2], "base64url");
  const expected = createHmac("sha256", key).update(`kumo-demo-session-v1.${match[1]}`).digest();
  if (signature.toString("base64url") !== match[2] || signature.length !== expected.length ||
      !timingSafeEqual(signature, expected)) return;
  try {
    const value = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
    if (!value || value.demo !== true || !isStatus(value.status) ||
        !Number.isSafeInteger(value.issuedAt) || !Number.isSafeInteger(value.expiresAt) ||
        value.issuedAt <= 0 || value.issuedAt > now || value.expiresAt <= now ||
        value.expiresAt <= value.issuedAt || value.expiresAt - value.issuedAt > ttl ||
        typeof value.nonce !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(value.nonce)) return;
    return value as Session;
  } catch { return; }
}

function entitlement(session: { status: Status }) {
  return { status: session.status, plan: "Pro", source: "web", demo: true };
}

/**
 * Synthetic demonstration only. These public controls do not authenticate a real
 * person or verify a purchase. Signed cookies work across instances; a copied old
 * cookie remains replayable until its 30-minute expiry or deployment key rotation.
 * Real billing needs shared entitlement and revocation storage plus trusted webhooks.
 */
export function createKumoDemoHandler({
  signingKey, allowedOrigins, deals, allowLocalHttp = false,
  sessionTTL = SESSION_TTL, now = Date.now,
}: Options) {
  if (typeof signingKey !== "string" || Buffer.byteLength(signingKey) < 32) {
    throw new Error("Demo signing key must contain at least 32 bytes.");
  }
  if (!Number.isSafeInteger(sessionTTL) || sessionTTL <= 0 || sessionTTL > 60 * 60 * 1000) {
    throw new Error("Demo session lifetime must be positive and at most one hour.");
  }
  if (!Array.isArray(allowedOrigins) || !allowedOrigins.length || !allowedOrigins.every(exactHttpsOrigin)) {
    throw new Error("Demo origins must be explicit HTTPS origins without ports.");
  }
  const origins = new Set(allowedOrigins);

  return async function handleKumoDemo(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const expectedMethod = Object.hasOwn(ROUTES, url.pathname) ? ROUTES[url.pathname] : undefined;
      if (!expectedMethod) return failure(404, "Not found.");
      if (request.method !== expectedMethod) {
        const response = failure(405, "Method not allowed.", { Allow: expectedMethod });
        return request.method === "HEAD" ? new Response(null, { status: response.status, headers: response.headers }) : response;
      }

      const local = allowLocalHttp && url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      const host = request.headers.get("host") || url.host;
      if (host !== url.host || (!local && !origins.has(url.origin))) {
        return failure(403, "This demo requires an allowed origin.");
      }
      if (request.method === "POST" &&
          (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site")) {
        return failure(403, "A same-origin request is required.");
      }

      const cookieName = `${local ? "" : "__Host-"}${COOKIE}`;
      const cookie = (token: string, seconds: number) =>
        `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${local ? "" : "; Secure"}`;
      const entry = (request.headers.get("cookie") || "").split(";")
        .map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
      const session = decode(entry?.slice(cookieName.length + 1) || "", signingKey, sessionTTL, now());
      const issue = (status: Status) => {
        const issuedAt = now();
        const value: Session = {
          demo: true, status, issuedAt, expiresAt: issuedAt + sessionTTL,
          nonce: randomBytes(16).toString("base64url"),
        };
        return json(200, entitlement(value), {
          "Set-Cookie": cookie(sign(value, signingKey), Math.ceil(sessionTTL / 1000)),
        });
      };

      if (url.pathname === "/api/kumo/demo/session") return issue(await readStatus(request));
      if (url.pathname === "/api/kumo/logout") {
        await readBody(request);
        return json(200, { ok: true, demo: true }, { "Set-Cookie": cookie("", 0) });
      }
      if (!session) return failure(401, "Start a demo session first.");
      if (url.pathname === "/api/kumo/entitlement") return json(200, entitlement(session));
      if (url.pathname === "/api/kumo/demo/billing") return issue(await readStatus(request));
      if (session.status !== "active") return failure(403, "An active demo subscription is required.");
      return json(200, deals);
    } catch (error) {
      if (error instanceof RequestError) return failure(error.status, error.message);
      return failure(500, "The demo is temporarily unavailable.");
    }
  };
}
