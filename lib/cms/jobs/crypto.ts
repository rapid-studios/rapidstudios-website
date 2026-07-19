import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { JobApiError } from "./errors";
import { MAX_WORKER_BODY_BYTES } from "./types";

export const WORKER_HEADERS = {
  id: "x-cms-worker-id",
  timestamp: "x-cms-worker-timestamp",
  nonce: "x-cms-worker-nonce",
  signature: "x-cms-worker-signature",
} as const;

const WORKER_ID_RE = /^[a-zA-Z0-9._-]{1,64}$/;
const NONCE_RE = /^[a-zA-Z0-9_-]{16,128}$/;
const DEFAULT_CLOCK_SKEW_SECONDS = 120;

export function sha256Hex(value: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Stable JSON hashing for state staleness checks. Object keys are sorted. */
export function digestJson(value: unknown): string {
  return sha256Hex(stableJson(value));
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

export function leaseTokenHash(token: string): string {
  return sha256Hex(token);
}

export function canonicalWorkerRequest(input: {
  workerId: string;
  method: string;
  pathAndQuery: string;
  timestamp: string;
  nonce: string;
  bodyHash: string;
}): string {
  return ["v1", input.workerId, input.timestamp, input.nonce, input.method.toUpperCase(), input.pathAndQuery, input.bodyHash].join("\n");
}

export function signWorkerRequest(
  secret: string,
  input: { workerId: string; method: string; pathAndQuery: string; timestamp: string; nonce: string; body: string | Buffer | Uint8Array }
): string {
  const canonical = canonicalWorkerRequest({ ...input, bodyHash: sha256Hex(input.body) });
  return createHmac("sha256", secret).update(canonical).digest("base64url");
}

export async function readLimitedBody(request: Request): Promise<Buffer> {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader) {
    if (!/^\d+$/.test(lengthHeader)) throw new JobApiError(400, "invalid_content_length", "Invalid Content-Length header");
    const length = Number(lengthHeader);
    if (!Number.isFinite(length) || length < 0) throw new JobApiError(400, "invalid_content_length", "Invalid Content-Length header");
    if (length > MAX_WORKER_BODY_BYTES) throw new JobApiError(413, "body_too_large", "Worker request body exceeds 64 KiB");
  }
  if (!request.body) return Buffer.alloc(0);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_WORKER_BODY_BYTES) {
        await reader.cancel();
        throw new JobApiError(413, "body_too_large", "Worker request body exceeds 64 KiB");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

function workerSecret(): string {
  // Vercel's stdin-based secret provisioning may preserve a final newline;
  // local secret files are normalized the same way by the worker.
  const secret = (process.env.CMS_WORKER_KEY || "").trim();
  if (!secret) throw new JobApiError(503, "worker_auth_unconfigured", "Local worker authentication is not configured");
  if (process.env.NODE_ENV === "production" && Buffer.byteLength(secret) < 32) {
    throw new JobApiError(503, "worker_auth_weak", "CMS_WORKER_KEY must contain at least 32 bytes in production");
  }
  return secret;
}

export interface AuthenticatedWorkerRequest {
  workerId: string;
  body: Buffer;
  json: unknown;
}

export async function authenticateWorkerRequest(
  request: Request,
  consumeNonce: (nonce: string, expiresAt: Date) => Promise<boolean>
): Promise<AuthenticatedWorkerRequest> {
  const body = await readLimitedBody(request);
  const workerId = request.headers.get(WORKER_HEADERS.id) || "";
  const timestamp = request.headers.get(WORKER_HEADERS.timestamp) || "";
  const nonce = request.headers.get(WORKER_HEADERS.nonce) || "";
  const signature = request.headers.get(WORKER_HEADERS.signature) || "";

  if (!WORKER_ID_RE.test(workerId)) throw new JobApiError(401, "invalid_worker", "Invalid worker identity");
  if (!NONCE_RE.test(nonce)) throw new JobApiError(401, "invalid_nonce", "Invalid request nonce");
  if (!/^\d{10,13}$/.test(timestamp)) throw new JobApiError(401, "invalid_timestamp", "Invalid request timestamp");
  if (!/^[a-zA-Z0-9_-]{43,44}$/.test(signature)) throw new JobApiError(401, "invalid_signature", "Invalid request signature");

  const timestampNumber = Number(timestamp);
  const timestampSeconds = timestamp.length === 13 ? Math.floor(timestampNumber / 1000) : timestampNumber;
  const configuredSkew = Number(process.env.CMS_WORKER_CLOCK_SKEW_SECONDS || DEFAULT_CLOCK_SKEW_SECONDS);
  const allowedSkew = Number.isFinite(configuredSkew)
    ? Math.min(Math.max(Math.floor(configuredSkew), 30), 900)
    : DEFAULT_CLOCK_SKEW_SECONDS;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > allowedSkew) {
    throw new JobApiError(401, "expired_signature", "Worker request timestamp is outside the allowed window");
  }

  const url = new URL(request.url);
  const canonical = canonicalWorkerRequest({
    workerId,
    method: request.method,
    pathAndQuery: `${url.pathname}${url.search}`,
    timestamp,
    nonce,
    bodyHash: sha256Hex(body),
  });
  const expected = createHmac("sha256", workerSecret()).update(canonical).digest("base64url");
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    throw new JobApiError(401, "invalid_signature", "Invalid request signature");
  }

  const nonceExpiresAt = new Date((timestampSeconds + allowedSkew + 60) * 1000);
  if (!(await consumeNonce(nonce, nonceExpiresAt))) {
    throw new JobApiError(409, "replayed_request", "Worker request nonce has already been used");
  }

  let json: unknown = {};
  if (body.length > 0) {
    try {
      json = JSON.parse(body.toString("utf8")) as unknown;
    } catch {
      throw new JobApiError(400, "invalid_json", "Worker request body must be valid JSON");
    }
  }
  return { workerId, body, json };
}
