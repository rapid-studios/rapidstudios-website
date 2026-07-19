// lib/cms/ingest/fetch-rendered.ts
// Capture the rendered output of a page. Playwright is optional and is only
// supported for local/worker use; Vercel always uses the bounded fetch path.

import { lookup } from "node:dns/promises";
import net from "node:net";
import { Agent } from "undici";

export interface FetchResult {
  html: string;
  mode: "playwright" | "fetch";
}

export const MAX_INGEST_REDIRECTS = 5;
export const MAX_INGEST_BYTES = 5 * 1024 * 1024;

const MAX_URL_LENGTH = 4096;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const blockedAddresses = new net.BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8], // current network / unspecified
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local and cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // deprecated 6to4 relay
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmark networks
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved / limited broadcast
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 96], // unspecified, loopback, and deprecated IPv4-compatible forms
  ["64:ff9b::", 96], // well-known NAT64
  ["64:ff9b:1::", 48], // local-use NAT64
  ["100::", 64], // discard-only
  ["2001::", 23], // IETF special-purpose assignments, including Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4
  ["3fff::", 20], // documentation
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // deprecated site-local
  ["ff00::", 8], // multicast
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv6");
}

// Minimal structural types for the optional Playwright import. The package is
// intentionally not part of the Vercel/serverless bundle.
interface PlaywrightRequest {
  url(): string;
  isNavigationRequest(): boolean;
  redirectedFrom(): PlaywrightRequest | null;
}
interface PlaywrightRoute {
  request(): PlaywrightRequest;
  abort(errorCode?: string): Promise<void>;
  continue(): Promise<void>;
}
interface PlaywrightPage {
  goto(url: string, opts: { timeout: number; waitUntil: string }): Promise<unknown>;
  content(): Promise<string>;
  url(): string;
}
interface PlaywrightContext {
  newPage(): Promise<PlaywrightPage>;
  route(pattern: string, handler: (route: PlaywrightRoute) => Promise<void>): Promise<void>;
}
interface PlaywrightBrowser {
  newContext(opts: { javaScriptEnabled: boolean }): Promise<PlaywrightContext>;
  close(): Promise<void>;
}

export function isRemoteIngestEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.CMS_ALLOW_REMOTE_INGEST === "1";
}

export async function fetchRendered(
  url: string,
  opts: { timeoutMs?: number; waitUntil?: "load" | "domcontentloaded" | "networkidle" } = {}
): Promise<FetchResult> {
  if (!isRemoteIngestEnabled()) {
    throw new Error(
      "Remote URL ingest is disabled in production. Set CMS_ALLOW_REMOTE_INGEST=1 to enable it."
    );
  }

  const parsed = assertHttpUrl(url);
  await assertPublicHost(parsed.hostname);

  const timeoutMs = opts.timeoutMs ?? 30000;
  const waitUntil = opts.waitUntil ?? "networkidle";

  // Playwright is an explicit local/worker opt-in. Route interception validates
  // navigation redirects and subresources before the browser can request them.
  // Vercel is always excluded, even if CMS_ENABLE_PLAYWRIGHT was set by mistake.
  if (process.env.CMS_ENABLE_PLAYWRIGHT === "1" && !process.env.VERCEL) {
    try {
      const spec = ["play", "wright"].join("");
      const playwright = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ spec).catch(
        () => null
      )) as { chromium?: { launch: (o: { headless: boolean }) => Promise<PlaywrightBrowser> } } | null;

      if (playwright?.chromium) {
        const browser = await playwright.chromium.launch({ headless: true });
        try {
          const context = await browser.newContext({ javaScriptEnabled: true });
          let blockedRequestError: Error | null = null;
          let navigationRedirects = 0;

          await context.route("**/*", async (route) => {
            try {
              const browserRequest = route.request();
              const requestedUrl = assertHttpUrl(browserRequest.url());
              await assertPublicHost(requestedUrl.hostname);

              if (browserRequest.isNavigationRequest() && browserRequest.redirectedFrom()) {
                navigationRedirects += 1;
                if (navigationRedirects > MAX_INGEST_REDIRECTS) {
                  throw new Error(`Fetch exceeded the ${MAX_INGEST_REDIRECTS}-redirect limit.`);
                }
              }
              await route.continue();
            } catch (error) {
              blockedRequestError = error as Error;
              await route.abort("blockedbyclient");
            }
          });

          const page = await context.newPage();
          try {
            await page.goto(parsed.href, { timeout: timeoutMs, waitUntil });
          } catch (error) {
            if (blockedRequestError) throw blockedRequestError;
            throw error;
          }

          if (blockedRequestError) throw blockedRequestError;
          const finalUrl = assertHttpUrl(page.url());
          await assertPublicHost(finalUrl.hostname);

          const html = await page.content();
          if (Buffer.byteLength(html, "utf8") > MAX_INGEST_BYTES) {
            throw new Error(`Rendered page exceeds the ${MAX_INGEST_BYTES}-byte ingest limit.`);
          }
          return { html, mode: "playwright" };
        } finally {
          await browser.close();
        }
      }
    } catch {
      // A missing/unavailable browser falls through to the bounded fetch path,
      // which repeats all URL validation rather than trusting browser state.
    }
  }

  const html = await fetchWithValidatedRedirects(parsed, timeoutMs);
  return { html, mode: "fetch" };
}

async function fetchWithValidatedRedirects(initialUrl: URL, timeoutMs: number): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let currentUrl = initialUrl;
  let redirects = 0;

  while (true) {
    // Resolve once, validate every answer, then pin the connection to those
    // exact addresses. A second resolver lookup inside fetch would leave a
    // DNS-rebinding window between validation and the network connection.
    const validatedAddresses = await assertPublicHost(currentUrl.hostname);
    const dispatcher = createPinnedDispatcher(validatedAddresses);

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new Error("Fetch timed out.");

    try {
      const response = await fetch(currentUrl, {
        headers: { "user-agent": "rapidstudios-cms-ingest/1.0" },
        redirect: "manual",
        signal: AbortSignal.timeout(remainingMs),
        dispatcher,
      } as RequestInit & { dispatcher: Agent });

      // Do not trust Response.url: validate it just like an input URL. With a
      // manual redirect this should match currentUrl, but the check also protects
      // alternate runtimes and future fetch implementation changes.
      const responseUrl = assertHttpUrl(response.url || currentUrl.href);
      await assertPublicHost(responseUrl.hostname);

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => undefined);
        if (!location) throw new Error(`Redirect response ${response.status} did not include a Location header.`);
        if (redirects >= MAX_INGEST_REDIRECTS) {
          throw new Error(`Fetch exceeded the ${MAX_INGEST_REDIRECTS}-redirect limit.`);
        }

        const nextUrl = assertHttpUrl(new URL(location, responseUrl).href);
        await assertPublicHost(nextUrl.hostname);
        currentUrl = nextUrl;
        redirects += 1;
        continue;
      }

      if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
      return await readBodyWithLimit(response, MAX_INGEST_BYTES);
    } finally {
      await dispatcher.close();
    }
  }
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength) {
    const length = Number(declaredLength);
    if (Number.isFinite(length) && length > maxBytes) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error(`Fetched page exceeds the ${maxBytes}-byte ingest limit.`);
    }
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new Error(`Fetched page exceeds the ${maxBytes}-byte ingest limit.`);
    }
    html += decoder.decode(value, { stream: true });
  }

  html += decoder.decode();
  return html;
}

export function assertHttpUrl(url: string): URL {
  if (typeof url !== "string" || url.length === 0 || url.length > MAX_URL_LENGTH) {
    throw new Error("URL must be a non-empty string no longer than 4096 characters.");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Only http/https URLs are allowed, got: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs containing embedded credentials are not allowed.");
  }
  if (!parsed.hostname) throw new Error("URL must include a hostname.");
  return parsed;
}

interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

/** Resolve the host and reject private, reserved, loopback and link-local IPs. */
export async function assertPublicHost(hostname: string): Promise<ResolvedAddress[]> {
  const normalized = normalizeHostname(hostname);

  if (net.isIP(normalized)) {
    if (isBlockedIp(normalized)) {
      throw new Error(`Refusing to fetch a private or reserved address: ${normalized}`);
    }
    return [{ address: normalized, family: net.isIPv6(normalized) ? 6 : 4 }];
  }

  const lower = normalized.toLowerCase().replace(/\.+$/, "");
  const blockedName =
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".home") ||
    lower.endsWith(".lan") ||
    lower.endsWith(".test") ||
    lower.endsWith(".invalid") ||
    lower.endsWith(".example") ||
    lower.endsWith(".onion");
  if (blockedName) throw new Error(`Refusing to fetch a local or reserved hostname: ${hostname}`);

  let addresses: { address: string }[];
  try {
    addresses = await lookup(normalized, { all: true, verbatim: true });
  } catch {
    throw new Error(`Could not resolve host: ${hostname}`);
  }
  if (addresses.length === 0) throw new Error(`Could not resolve host: ${hostname}`);

  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      throw new Error(`Host ${hostname} resolves to a blocked address (${address}).`);
    }
  }
  return addresses.map(({ address }) => ({
    address,
    family: net.isIPv6(address) ? 6 : 4,
  }));
}

type PinnedLookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | ResolvedAddress[],
  family?: number
) => void;

/** Create a per-request dispatcher whose DNS callback can only return vetted IPs. */
function createPinnedDispatcher(addresses: ResolvedAddress[]): Agent {
  return new Agent({ connect: { lookup: createPinnedLookup(addresses) as never } });
}

/** Exposed for deterministic regression tests of the DNS-rebinding boundary. */
export function createPinnedLookup(addresses: ResolvedAddress[]) {
  return (
    _hostname: string,
    options: number | { all?: boolean; family?: number },
    callback: PinnedLookupCallback
  ) => {
    const requestedFamily = typeof options === "number" ? options : options.family || 0;
    const matches = addresses.filter(({ family }) => requestedFamily === 0 || requestedFamily === family);
    if (matches.length === 0) {
      const error = Object.assign(new Error("No validated address matches the requested IP family."), {
        code: "ENOTFOUND",
      });
      callback(error, "", 0);
      return;
    }
    if (typeof options === "object" && options.all) {
      callback(null, matches);
      return;
    }
    callback(null, matches[0].address, matches[0].family);
  };
}

export function isBlockedIp(ip: string): boolean {
  const normalized = normalizeHostname(ip);
  if (net.isIPv4(normalized)) return blockedAddresses.check(normalized, "ipv4");
  if (net.isIPv6(normalized)) return blockedAddresses.check(normalized, "ipv6");
  return false;
}

function normalizeHostname(hostname: string): string {
  if (hostname.startsWith("[") && hostname.endsWith("]")) return hostname.slice(1, -1);
  return hostname;
}
