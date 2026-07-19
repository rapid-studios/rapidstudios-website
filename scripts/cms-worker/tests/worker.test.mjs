import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  normalizeJob,
  stableJson,
  validateContentModelResult,
  validateThemeModelResult,
} from "../lib/contracts.mjs";
import { canonicalRequest, signRequest, verifySignature } from "../lib/hmac.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));

test("HMAC canonical request exactly matches the server v1 protocol", () => {
  const fields = {
    workerId: "jaxon-desktop-01",
    timestamp: 1_750_000_000,
    nonce: "abcdefghijklmnopqrstuvwx",
    method: "post",
    path: "/api/cms/worker/claim",
    bodyHash: createHash("sha256").update("{}").digest("hex"),
  };
  const expectedCanonical = [
    "v1",
    fields.workerId,
    String(fields.timestamp),
    fields.nonce,
    "POST",
    fields.path,
    fields.bodyHash,
  ].join("\n");
  assert.equal(canonicalRequest(fields), expectedCanonical);
  const expectedSignature = createHmac("sha256", "x".repeat(32))
    .update(expectedCanonical)
    .digest("base64url");
  assert.equal(signRequest("x".repeat(32), fields), expectedSignature);
  assert.equal(verifySignature("x".repeat(32), fields, expectedSignature), true);
});

test("content compatibility normalization produces a server result envelope", () => {
  const job = normalizeJob({
    id: "job_abc12345",
    kind: "content",
    input: {
      kind: "content",
      instruction: "Make the headline clearer.",
      contentMap: {
        text_1234567890: {
          type: "text",
          value: "Old headline",
          constraints: { maxLength: 80, required: true },
        },
      },
    },
  });
  assert.equal(job.capability, "codex.content.v1");
  const result = validateContentModelResult(
    {
      changes: [{ slotId: "text_1234567890", newValue: "A clearer headline" }],
      summary: "Clarified the primary headline.",
    },
    job.input.slots,
  );
  assert.deepEqual(result, {
    kind: "content",
    changes: [{ slotId: "text_1234567890", newValue: "A clearer headline" }],
    summary: "Clarified the primary headline.",
  });
});

test("theme result remains inside the closed Design Guardian token set", () => {
  const result = validateThemeModelResult({
    patch: { bg: "#101820", accent: "#3b82f6", shadow: "md" },
    summary: "Improved hierarchy with a high-contrast restrained theme.",
  });
  assert.equal(result.kind, "theme");
  assert.equal(result.patch.shadow, "md");
  assert.throws(() =>
    validateThemeModelResult({
      patch: { arbitraryCss: "body { display: none }" },
      summary: "Unsafe",
    }),
  );
});

test("safe no-op proposals complete with an operator-facing summary", () => {
  assert.deepEqual(
    validateContentModelResult(
      { changes: [], summary: "No safe slot change matched the request." },
      [{ slotId: "text_1234567890", type: "text", currentValue: "Keep", constraints: {} }],
    ),
    {
      kind: "content",
      changes: [],
      summary: "No safe slot change matched the request.",
    },
  );
  assert.deepEqual(
    validateThemeModelResult({ patch: {}, summary: "No safe token change was needed." }),
    {
      kind: "theme",
      patch: {},
      summary: "No safe token change was needed.",
    },
  );
});

test("publish jobs accept only the fixed managed target and matching digest", () => {
  const jobId = "job_publish123";
  const withoutHash = {
    schemaVersion: 1,
    publishTarget: {
      repository: "rapid-studios/rapidstudios-website",
      branch: "main",
      path: "content/managed/rapidstudios-homepage.json",
      siteId: "rapidstudios",
      pageId: "homepage",
      route: "/",
      domain: "rapidstudios.dev",
    },
    provenance: {
      source: "local-codex-worker",
      snapshotId: "cms_snapshot123",
      jobId,
      publishedAt: "2026-07-19T00:00:00.000Z",
      publishedBy: "rapidstudios-cms",
    },
    theme: {},
    slots: {},
  };
  const canonical = canonicalJson(withoutHash);
  const snapshot = {
    ...withoutHash,
    contentHash: `sha256:${createHash("sha256").update(canonical).digest("hex")}`,
  };
  const job = normalizeJob({
    id: jobId,
    kind: "publish",
    input: {
      kind: "publish",
      targetId: "rapidstudios-homepage-v1",
      repository: "rapid-studios/rapidstudios-website",
      snapshot,
    },
  });
  assert.equal(job.input.targetId, "rapidstudios-homepage-v1");
  assert.throws(() =>
    normalizeJob({
      id: jobId,
      kind: "publish",
      input: { ...job.input, targetId: "arbitrary-path" },
    }),
  );
});

test("result schemas are valid JSON and canonical JSON sorts object keys", async () => {
  for (const name of ["content-result.schema.json", "theme-result.schema.json"]) {
    const text = await readFile(path.resolve(testDir, "..", "schemas", name), "utf8");
    assert.equal(typeof JSON.parse(text), "object");
  }
  assert.equal(stableJson({ z: 1, a: { y: 2, b: 3 } }), '{\n  "a": {\n    "b": 3,\n    "y": 2\n  },\n  "z": 1\n}\n');
});

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
