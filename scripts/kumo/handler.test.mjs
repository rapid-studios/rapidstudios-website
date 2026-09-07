import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createKumoDemoHandler, deploymentOrigins } from "../../lib/kumo-demo/handler.ts";

const ORIGIN = "https://rapidstudios.dev";
const KEY = "a-test-key-with-at-least-32-bytes-of-material";
const FIXTURE = [{ id: "fictional-deal", title: "Synthetic company" }];
const START = 1_800_000_000_000;

function setup(overrides = {}) {
  let time = START;
  const handler = createKumoDemoHandler({
    signingKey: KEY, allowedOrigins: [ORIGIN], deals: FIXTURE,
    now: () => time, ...overrides,
  });
  return { handler, setTime: (value) => { time = value; } };
}

function request(path, { method = "GET", origin = ORIGIN, headers = {}, body, cookie, ...rest } = {}) {
  const url = `${origin}/api/kumo/${path}`;
  const allHeaders = { host: new URL(url).host, ...headers };
  if (method === "POST" && !("origin" in allHeaders)) allHeaders.origin = origin;
  if (body !== undefined && !("content-type" in allHeaders)) allHeaders["content-type"] = "application/json";
  if (cookie) allHeaders.cookie = cookie;
  return new Request(url, { method, headers: allHeaders, body, ...rest });
}

async function login(handler, status = "active", options = {}) {
  return handler(request("demo/session", { method: "POST", body: JSON.stringify({ status }), ...options }));
}

function cookieFrom(response) {
  return response.headers.get("set-cookie").split(";", 1)[0];
}

test("protected data requires a signed active demo session", async () => {
  const { handler } = setup();
  for (const path of ["entitlement", "deals"]) {
    assert.equal((await handler(request(path))).status, 401);
  }
  assert.equal((await handler(request("demo/billing", { method: "POST", body: '{"status":"active"}' }))).status, 401);
  const response = await login(handler);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "active", plan: "Pro", source: "web", demo: true });
  const cookie = cookieFrom(response);
  assert.deepEqual(await (await handler(request("deals", { cookie }))).json(), FIXTURE);
});

test("one build signing key works across instances and a deployment key rotation rejects old tokens", async () => {
  const first = setup().handler;
  const second = setup().handler;
  const cookie = cookieFrom(await login(first));
  assert.equal((await second(request("deals", { cookie }))).status, 200);
  const rotated = setup({ signingKey: "another-independent-test-signing-key-12345" }).handler;
  assert.equal((await rotated(request("deals", { cookie }))).status, 401);
});

test("billing expiry denies deals and reactivation restores access", async () => {
  const { handler } = setup();
  let cookie = cookieFrom(await login(handler));
  const expired = await handler(request("demo/billing", { method: "POST", cookie, body: '{"status":"expired"}' }));
  assert.equal(expired.status, 200);
  cookie = cookieFrom(expired);
  assert.equal((await handler(request("deals", { cookie }))).status, 403);
  assert.equal((await (await handler(request("entitlement", { cookie }))).json()).status, "expired");
  const active = await handler(request("demo/billing", { method: "POST", cookie, body: '{"status":"active"}' }));
  cookie = cookieFrom(active);
  assert.equal((await handler(request("deals", { cookie }))).status, 200);
});

test("tampering with payload or signature fails authentication", async () => {
  const { handler } = setup();
  const cookie = cookieFrom(await login(handler, "expired"));
  const [name, token] = cookie.split("=");
  const [version, payload, signature] = token.split(".");
  const value = JSON.parse(Buffer.from(payload, "base64url").toString());
  value.status = "active";
  const tampered = Buffer.from(JSON.stringify(value)).toString("base64url");
  const changedSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
  for (const invalid of [`${version}.${tampered}.${signature}`, `${version}.${payload}.${changedSignature}`, "garbage", "x".repeat(1025)]) {
    assert.equal((await handler(request("deals", { cookie: `${name}=${invalid}` }))).status, 401);
  }
});

test("signed sessions expire at 30 minutes and reject invalid time claims", async () => {
  const { handler, setTime } = setup();
  const cookie = cookieFrom(await login(handler));
  setTime(START + 30 * 60 * 1000 - 1);
  assert.equal((await handler(request("deals", { cookie }))).status, 200);
  setTime(START + 30 * 60 * 1000);
  assert.equal((await handler(request("deals", { cookie }))).status, 401);
  setTime(START);
  const base = { demo: true, status: "active", issuedAt: START, expiresAt: START + 1000, nonce: "a".repeat(22) };
  for (const claims of [
    { issuedAt: START + 1 }, { issuedAt: 0 }, { expiresAt: START },
    { expiresAt: START + 30 * 60 * 1000 + 1 }, { demo: false }, { nonce: "short" },
  ]) {
    const payload = Buffer.from(JSON.stringify({ ...base, ...claims })).toString("base64url");
    const signature = createHmac("sha256", KEY).update(`kumo-demo-session-v1.${payload}`).digest("base64url");
    const forged = `__Host-kumo_demo_session=v1.${payload}.${signature}`;
    assert.equal((await handler(request("deals", { cookie: forged }))).status, 401);
  }
});

test("production cookies are secure, HttpOnly, host-only and logout clears the same cookie", async () => {
  const { handler } = setup();
  const response = await login(handler);
  const header = response.headers.get("set-cookie");
  assert.match(header, /^__Host-kumo_demo_session=/);
  for (const attribute of ["Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=1800", "Secure"]) assert.ok(header.includes(attribute));
  assert.ok(!header.includes("Domain="));
  const cleared = await handler(request("logout", { method: "POST", cookie: cookieFrom(response) }));
  assert.equal(cleared.status, 200);
  assert.equal(cleared.headers.get("set-cookie"), "__Host-kumo_demo_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure");
  assert.equal((await handler(request("deals", { cookie: "__Host-kumo_demo_session=" }))).status, 401);
});

test("stateless demonstration limitation: a copied old cookie remains valid until TTL", async () => {
  const { handler, setTime } = setup();
  const oldCookie = cookieFrom(await login(handler));
  await handler(request("logout", { method: "POST", cookie: oldCookie }));
  await handler(request("demo/billing", { method: "POST", cookie: oldCookie, body: '{"status":"expired"}' }));
  assert.equal((await handler(request("deals", { cookie: oldCookie }))).status, 200);
  setTime(START + 30 * 60 * 1000);
  assert.equal((await handler(request("deals", { cookie: oldCookie }))).status, 401);
});

test("mutations reject missing, foreign, HTTP, port and cross-site origins", async () => {
  const { handler } = setup();
  for (const headers of [
    { origin: "" }, { origin: "null" }, { origin: "https://evil.example" },
    { origin: "http://rapidstudios.dev" }, { origin: "https://rapidstudios.dev:444" },
    { origin: "https://rapidstudios.dev:443" }, { origin: ORIGIN, "sec-fetch-site": "cross-site" },
    { origin: ORIGIN, host: "evil.example" },
    { origin: "https://evil.example", "x-forwarded-host": "rapidstudios.dev" },
  ]) {
    assert.equal((await login(handler, "active", { headers })).status, 403);
  }
  for (const origin of ["http://rapidstudios.dev", "https://rapidstudios.dev:444", "https://evil.example"]) {
    assert.equal((await login(handler, "active", { origin })).status, 403);
  }
});

test("only the exact trusted preview host is allowed", async () => {
  const preview = "pitch-preview-123.vercel.app";
  const origins = deploymentOrigins([preview, "rapidstudios.dev", undefined]);
  const { handler } = setup({ allowedOrigins: origins });
  assert.equal((await login(handler, "active", { origin: `https://${preview}` })).status, 200);
  assert.equal((await login(handler, "active", { origin: "https://another.vercel.app" })).status, 403);
  assert.equal((await login(handler, "active", { origin: `https://${preview}`, headers: { origin: ORIGIN } })).status, 403);
  for (const invalid of ["*.vercel.app", "https://preview.vercel.app", "preview.vercel.app:443", "foo..vercel.app", "x.vercel.app/path"]) {
    assert.throws(() => deploymentOrigins([invalid]), /configuration/);
  }
});

test("development permits only loopback HTTP and production never accepts its cookie", async () => {
  const { handler } = setup({ allowLocalHttp: true });
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"]) {
    const response = await login(handler, "active", { origin });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie"), /^kumo_demo_session=/);
    assert.ok(!response.headers.get("set-cookie").includes("Secure"));
    const cookie = cookieFrom(response);
    assert.equal((await handler(request("deals", { origin, cookie }))).status, 200);
    assert.equal((await setup().handler(request("deals", { cookie }))).status, 401);
  }
  assert.equal((await login(handler, "active", { origin: "http://192.168.1.2:3000" })).status, 403);
  assert.equal((await login(setup().handler, "active", { origin: "http://localhost:3000" })).status, 403);
});

test("only exact JSON status objects are accepted", async () => {
  const { handler } = setup();
  for (const body of ["", "{", "null", "[]", '"active"', "{}", '{"status":"unknown"}', '{"status":"active","admin":true}']) {
    const response = await handler(request("demo/session", { method: "POST", body }));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  const response = await login(handler, "active", { headers: { "content-type": "text/plain" } });
  assert.equal(response.status, 415);
});

test("body size is bounded for declared and streamed payloads, including logout", async () => {
  const { handler } = setup();
  assert.equal((await login(handler, "active", { headers: { "content-length": "4097" } })).status, 413);
  assert.equal((await login(handler, "active", { headers: { "content-length": "bad" } })).status, 400);
  for (const path of ["demo/session", "logout"]) {
    let cancelled = false;
    const body = new ReadableStream({
      pull(controller) { controller.enqueue(new Uint8Array(3000)); },
      cancel() { cancelled = true; },
    });
    const response = await handler(request(path, { method: "POST", body, duplex: "half" }));
    assert.equal(response.status, 413);
    assert.equal(cancelled, true);
  }
});

test("interrupted streams return a bounded error response", async () => {
  const { handler } = setup();
  const body = new ReadableStream({ pull(controller) { controller.error(new Error("private transport detail")); } });
  const response = await handler(request("demo/session", { method: "POST", body, duplex: "half" }));
  assert.equal(response.status, 400);
  assert.ok(!(await response.text()).includes("private transport detail"));
});

test("unknown paths and unsupported methods cannot reach the fixture", async () => {
  const { handler } = setup();
  const cookie = cookieFrom(await login(handler));
  for (const path of ["constructor", "deals.json", "session-key.generated.json", "deals/", "%2E%2E/lib/kumo-demo/deals.json"]) {
    assert.equal((await handler(request(path, { cookie }))).status, 404);
  }
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]) {
    const response = await handler(request("deals", { method, cookie }));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
    if (method === "HEAD") assert.equal(await response.text(), "");
  }
});

test("API responses never enable CORS or cache session-dependent data", async () => {
  const { handler } = setup();
  for (const response of [await login(handler), await handler(request("deals")), await handler(request("unknown"))]) {
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  }
});

test("invalid signing or origin configuration fails closed without echoing secrets", () => {
  assert.throws(() => setup({ signingKey: "private-short-value" }), (error) => !error.message.includes("private-short-value"));
  for (const allowedOrigins of [[], ["http://rapidstudios.dev"], ["https://*.vercel.app"], ["https://rapidstudios.dev:444"], ["https://rapidstudios.dev/"]]) {
    assert.throws(() => setup({ allowedOrigins }), /explicit HTTPS/);
  }
  assert.throws(() => setup({ sessionTTL: 0 }), /lifetime/);
  assert.throws(() => setup({ sessionTTL: 3_600_001 }), /lifetime/);
});
