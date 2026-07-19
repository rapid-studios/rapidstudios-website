import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  normalizeJob,
  stableJson,
  validateContentModelResult,
  validateThemeModelResult,
} from "../lib/contracts.mjs";
import { canonicalRequest, signRequest, verifySignature } from "../lib/hmac.mjs";
import { npmEnvironment, npmInvocation } from "../lib/publisher.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));

const CURRENT_THEME = Object.freeze({
  bg: "#101822",
  surface: "#121c2a",
  text: "#f3f7ff",
  muted: "#8fa8c9",
  accent: "#3b8af0",
  accentText: "#101822",
  headingFont: "Inter, ui-sans-serif, system-ui, sans-serif",
  bodyFont: "Inter, ui-sans-serif, system-ui, sans-serif",
  radius: "24px",
  shadow: "lg",
  intensity: "tokens",
});

test("worker sleep keeps the process alive until the next queue poll", () => {
  const processModule = pathToFileURL(path.resolve(testDir, "../lib/process.mjs")).href;
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { sleep } from ${JSON.stringify(processModule)}; await sleep(25); process.stdout.write("done");`,
    ],
    { encoding: "utf8", timeout: 2_000 },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stdout, "done");
});

test("Windows publishing invokes npm through node without a command shell", () => {
  const invocation = npmInvocation(
    "C:\\RapidStudios\\runtime\\node\\npm.cmd",
    ["run", "build"],
    "win32",
    "C:\\RapidStudios\\runtime\\node\\node.exe",
  );
  assert.equal(invocation.executable, "C:\\RapidStudios\\runtime\\node\\node.exe");
  assert.deepEqual(invocation.args, [
    "C:\\RapidStudios\\runtime\\node\\node_modules\\npm\\bin\\npm-cli.js",
    "run",
    "build",
  ]);
  assert.equal(
    invocation.npmCliPath,
    "C:\\RapidStudios\\runtime\\node\\node_modules\\npm\\bin\\npm-cli.js",
  );

  const unixInvocation = npmInvocation("/usr/bin/npm", ["ci"], "linux", "/usr/bin/node");
  assert.deepEqual(unixInvocation, {
    executable: "/usr/bin/npm",
    args: ["ci"],
    npmCliPath: null,
  });

  assert.deepEqual(
    npmEnvironment(
      { Path: "C:\\Windows\\System32", PATH: "ignored-duplicate", TEMP: "C:\\Temp" },
      "C:\\RapidStudios\\runtime\\node\\node.exe",
      "win32",
    ),
    {
      Path: "C:\\RapidStudios\\runtime\\node;C:\\Windows\\System32",
      TEMP: "C:\\Temp",
    },
  );
});

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
  const result = validateThemeModelResult(
    {
      theme: {
        ...CURRENT_THEME,
        bg: "#101820",
        accent: "#3b82f6",
        shadow: "md",
      },
      summary: "Improved hierarchy with a high-contrast restrained theme.",
    },
    CURRENT_THEME,
  );
  assert.equal(result.kind, "theme");
  assert.deepEqual(result.patch, {
    bg: "#101820",
    accent: "#3b82f6",
    shadow: "md",
  });
  assert.throws(() =>
    validateThemeModelResult(
      {
        theme: { ...CURRENT_THEME, arbitraryCss: "body { display: none }" },
        summary: "Unsafe",
      },
      CURRENT_THEME,
    ),
  );
  assert.throws(() =>
    validateThemeModelResult(
      {
        theme: { ...CURRENT_THEME, bg: undefined },
        summary: "Missing a required token",
      },
      CURRENT_THEME,
    ),
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
    validateThemeModelResult(
      { theme: { ...CURRENT_THEME }, summary: "No safe token change was needed." },
      CURRENT_THEME,
    ),
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
  const themeSchema = JSON.parse(
    await readFile(path.resolve(testDir, "..", "schemas", "theme-result.schema.json"), "utf8"),
  );
  assert.deepEqual(
    [...themeSchema.properties.theme.required].sort(),
    Object.keys(themeSchema.properties.theme.properties).sort(),
  );
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
