import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Canonical v1 request format. Each field occupies one UTF-8 line:
 * v1 / workerId / timestamp / nonce / METHOD / path+query / sha256(body bytes).
 */
export function canonicalRequest({
  workerId,
  timestamp,
  nonce,
  method,
  path,
  bodyHash,
}) {
  return [
    "v1",
    workerId,
    String(timestamp),
    nonce,
    String(method).toUpperCase(),
    path,
    bodyHash,
  ].join("\n");
}

export function signRequest(secret, fields) {
  const canonical = canonicalRequest(fields);
  return createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(canonical, "utf8")
    .digest("base64url");
}

// Exported for protocol tests and server-side parity checks.
export function verifySignature(secret, fields, candidate) {
  const expected = Buffer.from(signRequest(secret, fields), "utf8");
  const received = Buffer.from(String(candidate || ""), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
