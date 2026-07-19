import assert from "node:assert/strict";
import test from "node:test";

import {
  assertHttpUrl,
  createPinnedLookup,
  fetchRendered,
  isBlockedIp,
  MAX_INGEST_BYTES,
  MAX_INGEST_REDIRECTS,
} from "../../lib/cms/ingest/fetch-rendered.ts";
import {
  CLIENT_PASSWORD_MAX_LENGTH,
  CLIENT_PASSWORD_MIN_LENGTH,
  checkRateLimit,
  clientLoginRateLimitKey,
  isValidClientPassword,
  resetRateLimit,
} from "../../lib/cms/auth/rate-limit.ts";
import { cmsMutationRejection } from "../../lib/cms/auth/csrf.ts";

test("blocks private, reserved, mapped, and local network addresses", () => {
  for (const ip of [
    "0.0.0.1",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.31.255.255",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::7f00:1",
    "::ffff:127.0.0.1",
    "64:ff9b::7f00:1",
    "2001:db8::1",
    "fc00::1",
    "fe80::1",
    "ff02::1",
  ]) {
    assert.equal(isBlockedIp(ip), true, `${ip} should be blocked`);
  }

  assert.equal(isBlockedIp("1.1.1.1"), false);
  assert.equal(isBlockedIp("2606:4700:4700::1111"), false);
});

test("rejects non-http URLs and embedded credentials", () => {
  assert.throws(() => assertHttpUrl("file:///etc/passwd"), /http\/https/);
  assert.throws(() => assertHttpUrl("https://user:secret@example.com"), /credentials/);
});

test("pins connections to the already-validated DNS answers", async () => {
  const pinnedLookup = createPinnedLookup([
    { address: "1.1.1.1", family: 4 },
    { address: "2606:4700:4700::1111", family: 6 },
  ]);

  const ipv4 = await new Promise((resolve, reject) => {
    pinnedLookup("attacker.example", { family: 4 }, (error, address, family) => {
      if (error) reject(error);
      else resolve({ address, family });
    });
  });
  assert.deepEqual(ipv4, { address: "1.1.1.1", family: 4 });

  const all = await new Promise((resolve, reject) => {
    pinnedLookup("attacker.example", { all: true }, (error, addresses) => {
      if (error) reject(error);
      else resolve(addresses);
    });
  });
  assert.deepEqual(all, [
    { address: "1.1.1.1", family: 4 },
    { address: "2606:4700:4700::1111", family: 6 },
  ]);
});

test("production remote ingest requires an explicit opt-in", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAllow = process.env.CMS_ALLOW_REMOTE_INGEST;
  process.env.NODE_ENV = "production";
  delete process.env.CMS_ALLOW_REMOTE_INGEST;
  try {
    await assert.rejects(fetchRendered("https://1.1.1.1"), /disabled in production/);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousAllow === undefined) delete process.env.CMS_ALLOW_REMOTE_INGEST;
    else process.env.CMS_ALLOW_REMOTE_INGEST = previousAllow;
  }
});

test("blocks cross-origin and originless cookie-authenticated mutations", () => {
  const crossSite = cmsMutationRejection({
    method: "POST",
    expectedOrigin: "https://rapidstudios.dev",
    origin: "https://evil.example",
    fetchSite: "cross-site",
    hasCookieSession: false,
    hasBearerSession: false,
  });
  assert.match(crossSite, /Cross-origin/);

  const originlessCookie = cmsMutationRejection({
    method: "POST",
    expectedOrigin: "https://rapidstudios.dev",
    origin: null,
    fetchSite: null,
    hasCookieSession: true,
    hasBearerSession: false,
  });
  assert.match(originlessCookie, /Origin header/);

  const sameOrigin = cmsMutationRejection({
    method: "POST",
    expectedOrigin: "https://rapidstudios.dev",
    origin: "https://rapidstudios.dev",
    fetchSite: "same-origin",
    hasCookieSession: true,
    hasBearerSession: false,
  });
  assert.equal(sameOrigin, null);

  const bearerApi = cmsMutationRejection({
    method: "POST",
    expectedOrigin: "https://rapidstudios.dev",
    origin: null,
    fetchSite: null,
    hasCookieSession: false,
    hasBearerSession: true,
  });
  assert.equal(bearerApi, null);
});

test("validates redirect targets before following them", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    assert.equal(options?.redirect, "manual");
    assert.ok(options?.dispatcher, "fetch must use the pinned dispatcher");
    return new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } });
  };
  try {
    await assert.rejects(fetchRendered("https://1.1.1.1/start"), /private or reserved/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("revalidates the final response URL", async () => {
  const originalFetch = globalThis.fetch;
  class ResponseWithPrivateUrl extends Response {
    get url() {
      return "http://169.254.169.254/latest/meta-data";
    }
  }
  globalThis.fetch = async () => new ResponseWithPrivateUrl("not allowed");
  try {
    await assert.rejects(fetchRendered("https://1.1.1.1/start"), /private or reserved/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("caps redirect chains", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { location: `/redirect-${calls}` } });
  };
  try {
    await assert.rejects(fetchRendered("https://1.1.1.1/start"), /redirect limit/);
    assert.equal(calls, MAX_INGEST_REDIRECTS + 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("caps streamed response bodies", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new Uint8Array(MAX_INGEST_BYTES + 1));
  try {
    await assert.rejects(fetchRendered("https://1.1.1.1/start"), /byte ingest limit/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("client password policy and rate-limit keys are site scoped", () => {
  assert.equal(isValidClientPassword("x".repeat(CLIENT_PASSWORD_MIN_LENGTH)), true);
  assert.equal(isValidClientPassword("x".repeat(CLIENT_PASSWORD_MIN_LENGTH - 1)), false);
  assert.equal(isValidClientPassword("x".repeat(CLIENT_PASSWORD_MAX_LENGTH + 1)), false);

  const request = new Request("https://rapidstudios.dev", {
    headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
  });
  assert.notEqual(
    clientLoginRateLimitKey(request, "site-a"),
    clientLoginRateLimitKey(request, "site-b")
  );

  const siteAKey = clientLoginRateLimitKey(request, "site-a");
  const siteBKey = clientLoginRateLimitKey(request, "site-b");
  checkRateLimit(siteAKey);
  checkRateLimit(siteBKey);
  resetRateLimit(siteAKey);
  assert.equal(checkRateLimit(siteBKey).remaining, 8);
  resetRateLimit(siteBKey);
});
