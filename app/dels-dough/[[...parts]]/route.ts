// Keep the branded demo same-origin without forwarding Rapid Studios credentials.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = "https://dels-dough-counter.chilooby.chatgpt.site";
const API = "/dels-dough/api/demo-receipts";
const SESSION = "x-dels-receipt-session";
const MAX_BODY = 4096;
const STATIC_DIRS = new Set([
  "assets", "atelier", "atelier-cutouts", "bread-story-1080-portrait",
  "bread-story-1080-wide", "flavors", "hero-keyed", "hero-keyed-mobile",
  "hero-spin-mobile", "hero-spin-wide",
]);
const STATIC_REQUEST_HEADERS = ["accept", "range", "if-range", "if-none-match", "if-modified-since"];
const API_REQUEST_HEADERS = ["accept", "content-type", "origin", "referer", "sec-fetch-site", SESSION];
const STATIC_RESPONSE_HEADERS = [
  "content-type", "cache-control", "etag", "last-modified", "accept-ranges", "content-range",
];
const PRIVATE = "private, no-store, max-age=0";
const NOINDEX = "noindex, nofollow, noarchive";

type Context = { params: Promise<{ parts?: string[] }> };

const failure = (status: number, message: string, allow?: string) => Response.json(
  { message }, { status, headers: {
    "cache-control": PRIVATE, "x-robots-tag": NOINDEX, "x-content-type-options": "nosniff",
    ...(allow ? { allow } : {}),
  } },
);

function safePart(part: string) {
  return part !== "." && part !== ".." && /^[A-Za-z0-9_.-]{1,200}$/.test(part);
}

async function readJson(request: Request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return null;
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY)) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const bytes = new Uint8Array(MAX_BODY);
  let offset = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      if (offset + value.length > MAX_BODY) {
        await reader.cancel();
        return null;
      }
      bytes.set(value, offset);
      offset += value.length;
    }
    const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, offset));
    JSON.parse(body);
    return body;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

async function handle(request: Request, { params }: Context) {
  const { parts = [] } = await params;
  const [first, second, action] = parts;
  const shell = parts.length === 0;
  const api = parts.length === 3 && first === "api" && second === "demo-receipts" &&
    (action === "status" || action === "issue" || action === "send");
  const asset = parts.length >= 2 && parts.length <= 8 && STATIC_DIRS.has(first) && parts.every(safePart);
  if (!shell && !api && !asset) return failure(404, "Not found");

  const method = request.method;
  const allowed = api ? action === "status" ? ["GET"] : ["POST"] : ["GET", "HEAD"];
  if (!allowed.includes(method)) return failure(405, "Method not allowed", allowed.join(", "));
  const body = method === "POST" ? await readJson(request) : undefined;
  if (body === null) return failure(400, "Expected a JSON body of at most 4 KB");

  const path = shell ? "/dels-dough" : api ? API + "/" + action : "/" + parts.join("/");
  const headers = new Headers();
  // Construct from an explicit list. Never send browser cookies, authorization
  // or Vercel protection headers to the standalone demo host.
  for (const name of api ? API_REQUEST_HEADERS : STATIC_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set("accept-encoding", "identity");

  try {
    const upstream = await fetch(UPSTREAM + path, {
      method, headers, body, redirect: "manual", cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) {
      await upstream.body?.cancel();
      return failure(502, "Demo upstream redirected");
    }
    const reply = new Headers({ "x-content-type-options": "nosniff" });
    for (const name of api ? ["content-type", SESSION] : STATIC_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value !== null) reply.set(name, value);
    }
    if (api || shell || upstream.status >= 400) reply.set("cache-control", PRIVATE);
    if (api || shell) reply.set("x-robots-tag", NOINDEX);
    if (method === "HEAD" || [204, 205, 304].includes(upstream.status)) {
      await upstream.body?.cancel();
      return new Response(null, { status: upstream.status, headers: reply });
    }
    return new Response(upstream.body, { status: upstream.status, headers: reply });
  } catch {
    return failure(502, "Demo is temporarily unavailable");
  }
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
