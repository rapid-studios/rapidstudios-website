import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  authenticateWorkerRequest,
  canonicalWorkerRequest,
  sha256Hex,
  signWorkerRequest,
  WORKER_HEADERS,
} from "../../../lib/cms/jobs/crypto.ts";
import {
  PUBLISH_REPOSITORY,
} from "../../../lib/cms/jobs/types.ts";
import { validateWorkerResult } from "../../../lib/cms/jobs/validation.ts";
import { THEME_PRESETS } from "../../../lib/cms/design/presets.ts";
import {
  DEFAULT_THEME,
  contrastRatio,
  validateTheme,
} from "../../../lib/cms/design/tokens.ts";
import {
  DESIGN_GUARDRAILS,
  DESIGN_STYLE_KITS,
  DESIGN_TEMPLATES,
  getDesignStyleKit,
} from "../../../lib/cms/design/templates.ts";
import {
  createManagedHomepageContentMap,
  exportManagedSnapshot,
  exportManagedSnapshotJson,
  getManagedHomepageSnapshot,
  isManagedHomepagePlaceholder,
  projectCmsContentMapToManagedSnapshotExport,
  validateManagedSnapshot,
} from "../../../lib/content/managed-site.ts";
import {
  MANAGED_HOMEPAGE_MANIFEST,
  MANAGED_HOMEPAGE_PUBLISH_TARGET,
} from "../../../lib/content/managed-site-manifest.ts";

function assertJobError(code) {
  return (error) => {
    assert.equal(error?.code, code);
    return true;
  };
}

function job(kind, id = `job-${kind}-12345`) {
  return { id, kind };
}

function signedRequest({
  url = "https://rapidstudios.dev/api/cms/worker/claim?limit=1",
  signedPath = "/api/cms/worker/claim?limit=1",
  body = '{"capabilities":["content"]}',
  signedBody = body,
  workerId = "jaxon-desktop",
  timestamp = String(Math.floor(Date.now() / 1000)),
  nonce = "nonce-pipeline-0001",
  secret,
}) {
  const signature = signWorkerRequest(secret, {
    workerId,
    method: "POST",
    pathAndQuery: signedPath,
    timestamp,
    nonce,
    body: signedBody,
  });
  return new Request(url, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      [WORKER_HEADERS.id]: workerId,
      [WORKER_HEADERS.timestamp]: timestamp,
      [WORKER_HEADERS.nonce]: nonce,
      [WORKER_HEADERS.signature]: signature,
    },
  });
}

test("worker HMAC uses the fixed header names and canonical field order", () => {
  assert.deepEqual(WORKER_HEADERS, {
    id: "x-cms-worker-id",
    timestamp: "x-cms-worker-timestamp",
    nonce: "x-cms-worker-nonce",
    signature: "x-cms-worker-signature",
  });

  const input = {
    workerId: "jaxon-desktop",
    method: "post",
    pathAndQuery: "/api/cms/worker/complete?attempt=2",
    timestamp: "1784428800",
    nonce: "nonce-pipeline-0001",
    bodyHash: "f".repeat(64),
  };
  const canonical = canonicalWorkerRequest(input);
  assert.equal(
    canonical,
    [
      "v1",
      input.workerId,
      input.timestamp,
      input.nonce,
      "POST",
      input.pathAndQuery,
      input.bodyHash,
    ].join("\n")
  );

  const secret = "local-only-test-secret-with-at-least-32-bytes";
  const body = '{"jobId":"job-content-12345"}';
  const expected = createHmac("sha256", secret)
    .update(canonicalWorkerRequest({ ...input, bodyHash: sha256Hex(body) }))
    .digest("base64url");
  assert.equal(signWorkerRequest(secret, { ...input, body }), expected);
});

test("worker authentication rejects body/path tampering, stale signatures, and nonce replay", async () => {
  const previousKey = process.env.CMS_WORKER_KEY;
  const previousSkew = process.env.CMS_WORKER_CLOCK_SKEW_SECONDS;
  const secret = "local-only-test-secret-with-at-least-32-bytes";
  process.env.CMS_WORKER_KEY = secret;
  process.env.CMS_WORKER_CLOCK_SKEW_SECONDS = "120";
  const usedNonces = new Set();
  const consumeNonce = async (nonce) => {
    if (usedNonces.has(nonce)) return false;
    usedNonces.add(nonce);
    return true;
  };

  try {
    const accepted = await authenticateWorkerRequest(
      signedRequest({ secret, nonce: "nonce-pipeline-valid" }),
      consumeNonce
    );
    assert.equal(accepted.workerId, "jaxon-desktop");
    assert.deepEqual(accepted.json, { capabilities: ["content"] });

    await assert.rejects(
      authenticateWorkerRequest(
        signedRequest({
          secret,
          nonce: "nonce-pipeline-body1",
          body: '{"capabilities":["theme"]}',
          signedBody: '{"capabilities":["content"]}',
        }),
        consumeNonce
      ),
      assertJobError("invalid_signature")
    );

    await assert.rejects(
      authenticateWorkerRequest(
        signedRequest({
          secret,
          nonce: "nonce-pipeline-path1",
          url: "https://rapidstudios.dev/api/cms/worker/heartbeat?limit=1",
        }),
        consumeNonce
      ),
      assertJobError("invalid_signature")
    );

    await assert.rejects(
      authenticateWorkerRequest(
        signedRequest({
          secret,
          nonce: "nonce-pipeline-stale",
          timestamp: String(Math.floor(Date.now() / 1000) - 600),
        }),
        consumeNonce
      ),
      assertJobError("expired_signature")
    );

    const replayOptions = { secret, nonce: "nonce-pipeline-replay" };
    await authenticateWorkerRequest(signedRequest(replayOptions), consumeNonce);
    await assert.rejects(
      authenticateWorkerRequest(signedRequest(replayOptions), consumeNonce),
      assertJobError("replayed_request")
    );
  } finally {
    if (previousKey === undefined) delete process.env.CMS_WORKER_KEY;
    else process.env.CMS_WORKER_KEY = previousKey;
    if (previousSkew === undefined) delete process.env.CMS_WORKER_CLOCK_SKEW_SECONDS;
    else process.env.CMS_WORKER_CLOCK_SKEW_SECONDS = previousSkew;
  }
});

test("server accepts only strict, Guardian-safe content and theme worker results", () => {
  const contentMap = {
    hero_title: {
      type: "text",
      value: "Original headline",
      constraints: { required: true, maxLength: 80, allowHtml: false },
    },
  };
  const validContent = {
    kind: "content",
    changes: [{ slotId: "hero_title", newValue: "Clearer headline" }],
    summary: "Clarified the main promise.",
  };
  assert.deepEqual(validateWorkerResult(job("content"), validContent, { contentMap }), {
    ...validContent,
    rationale: undefined,
  });

  assert.throws(
    () => validateWorkerResult(job("content"), { ...validContent, markdown: "# unsafe" }, { contentMap }),
    assertJobError("unknown_field")
  );
  assert.throws(
    () => validateWorkerResult(job("content"), {
      ...validContent,
      changes: [validContent.changes[0], validContent.changes[0]],
    }, { contentMap }),
    assertJobError("duplicate_slot")
  );
  assert.throws(
    () => validateWorkerResult(job("content"), {
      ...validContent,
      changes: [{ slotId: "invented_slot", newValue: "No" }],
    }, { contentMap }),
    assertJobError("guardian_rejected")
  );

  const currentTheme = DESIGN_STYLE_KITS[0].tokens;
  const validTheme = {
    kind: "theme",
    patch: { radius: "12px", shadow: "md" },
    summary: "Made the visual system slightly softer.",
  };
  assert.deepEqual(validateWorkerResult(job("theme"), validTheme, { theme: currentTheme }), {
    ...validTheme,
    rationale: undefined,
  });
  assert.throws(
    () => validateWorkerResult(job("theme"), {
      ...validTheme,
      patch: { css: "body{display:none}" },
    }, { theme: currentTheme }),
    assertJobError("design_guardian_rejected")
  );
  assert.throws(
    () => validateWorkerResult(job("theme"), {
      ...validTheme,
      patch: { accent: "#ffffff", accentText: "#ffffff" },
    }, { theme: currentTheme }),
    assertJobError("design_guardian_rejected")
  );
});

test("publish results are pinned to the repository, deterministic branch, and matching PR URL", () => {
  const publishJob = job("publish", "publish-job-12345");
  const valid = {
    kind: "publish",
    repository: PUBLISH_REPOSITORY,
    branch: "cms/publish-job-12345",
    commitSha: "a".repeat(40),
    prNumber: 42,
    prUrl: "https://github.com/rapid-studios/rapidstudios-website/pull/42",
    previewUrl: "https://rapidstudios-cms-preview.vercel.app/",
    summary: "Opened a review-only publishing pull request.",
  };
  assert.deepEqual(validateWorkerResult(publishJob, valid, {}), valid);
  assert.throws(
    () => validateWorkerResult(publishJob, { ...valid, repository: "attacker/repository" }, {}),
    assertJobError("invalid_repository")
  );
  assert.throws(
    () => validateWorkerResult(publishJob, { ...valid, branch: "cms/another-job" }, {}),
    assertJobError("invalid_publish_branch")
  );
  assert.throws(
    () => validateWorkerResult(publishJob, { ...valid, prUrl: "https://example.com/pull/42" }, {}),
    assertJobError("invalid_pr_url")
  );
});

test("Codex output schemas are closed at every model-controlled object boundary", async () => {
  const contentSchema = JSON.parse(
    await readFile(new URL("../../cms-worker/schemas/content-result.schema.json", import.meta.url), "utf8")
  );
  const themeSchema = JSON.parse(
    await readFile(new URL("../../cms-worker/schemas/theme-result.schema.json", import.meta.url), "utf8")
  );

  assert.equal(contentSchema.additionalProperties, false);
  assert.deepEqual(contentSchema.required, ["changes", "summary"]);
  assert.equal(contentSchema.properties.changes.items.additionalProperties, false);
  assert.deepEqual(contentSchema.properties.changes.items.required, ["slotId", "newValue"]);
  assert.equal(themeSchema.additionalProperties, false);
  assert.deepEqual(themeSchema.required, ["theme", "summary"]);
  assert.equal(themeSchema.properties.theme.additionalProperties, false);
  assert.deepEqual(
    [...themeSchema.properties.theme.required].sort(),
    Object.keys(themeSchema.properties.theme.properties).sort()
  );
});

test("design templates and style kits form a complete, internally valid library", () => {
  assert.ok(DESIGN_TEMPLATES.length >= 9);
  assert.ok(DESIGN_STYLE_KITS.length >= 8);
  assert.equal(new Set(DESIGN_TEMPLATES.map(({ id }) => id)).size, DESIGN_TEMPLATES.length);
  assert.equal(new Set(DESIGN_STYLE_KITS.map(({ id }) => id)).size, DESIGN_STYLE_KITS.length);

  for (const template of DESIGN_TEMPLATES) {
    assert.match(template.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(template.name.length > 0);
    assert.ok(template.primaryConversion.length > 0);
    assert.ok(template.sections.some(({ type, required }) => type === "hero" && required));
    assert.ok(template.sections.some(({ required }) => required));
    assert.ok(template.promptStarters.length > 0);
    assert.ok(template.sourceUrls.every((source) => source.startsWith("https://")));
    for (const styleKitId of template.recommendedStyleKitIds) {
      assert.ok(getDesignStyleKit(styleKitId), `${template.id} references missing style ${styleKitId}`);
    }
  }

  assert.equal(DESIGN_GUARDRAILS.accessibilityTarget, "WCAG 2.2 AA");
  assert.match(DESIGN_GUARDRAILS.preferredTargetSize, /44x44/);
  assert.ok(DESIGN_GUARDRAILS.prohibited.some((rule) => rule.includes("raw HTML or CSS")));
});

test("every theme preset passes the Design Guardian contrast thresholds", () => {
  for (const preset of THEME_PRESETS) {
    const verdict = validateTheme(DEFAULT_THEME, preset.tokens);
    assert.equal(verdict.accepted, true, `${preset.id}: ${verdict.reason}`);
    assert.ok(verdict.theme);
    assert.ok(verdict.contrast);
    assert.ok(verdict.contrast.textOnBackground >= 4.5, preset.id);
    assert.ok(verdict.contrast.mutedOnBackground >= 4.5, preset.id);
    assert.ok(verdict.contrast.accentTextOnAccent >= 4.5, preset.id);
    assert.ok(verdict.contrast.accentOnBackground >= 3, preset.id);
    assert.equal(
      contrastRatio(preset.tokens.accentText, preset.tokens.accent),
      verdict.contrast.accentTextOnAccent
    );
  }
});

test("checked-in managed snapshot validates, hashes deterministically, and uses the one publish allowlist", async () => {
  const rawSnapshot = JSON.parse(
    await readFile(new URL("../../../content/managed/rapidstudios-homepage.json", import.meta.url), "utf8")
  );
  const snapshot = validateManagedSnapshot(rawSnapshot);
  assert.deepEqual(snapshot.publishTarget, MANAGED_HOMEPAGE_PUBLISH_TARGET);
  assert.deepEqual(getManagedHomepageSnapshot(), snapshot);
  assert.equal(isManagedHomepagePlaceholder(snapshot), false);
  assert.equal(snapshot.provenance.source, "local-codex-worker");
  assert.ok(snapshot.provenance.jobId);

  const bootstrapSnapshot = exportManagedSnapshot({
    schemaVersion: 1,
    publishTarget: MANAGED_HOMEPAGE_PUBLISH_TARGET,
    provenance: {
      source: "bootstrap",
      snapshotId: "rapidstudios-homepage-bootstrap-test",
      jobId: null,
      publishedAt: "2026-07-19T00:00:00.000Z",
      publishedBy: "rapidstudios-cms-bootstrap",
    },
    theme: snapshot.theme,
    slots: Object.fromEntries(
      MANAGED_HOMEPAGE_MANIFEST.map(({ key, defaultValue }) => [key, defaultValue])
    ),
  });
  assert.equal(isManagedHomepagePlaceholder(bootstrapSnapshot), true);

  const exported = {
    schemaVersion: snapshot.schemaVersion,
    publishTarget: snapshot.publishTarget,
    provenance: snapshot.provenance,
    theme: snapshot.theme,
    slots: snapshot.slots,
  };
  assert.equal(exportManagedSnapshot(exported).contentHash, snapshot.contentHash);
  const exportedJson = exportManagedSnapshotJson(exported);
  assert.equal(exportedJson, exportManagedSnapshotJson(structuredClone(exported)));
  assert.equal(JSON.parse(exportedJson).contentHash, snapshot.contentHash);

  const badHash = structuredClone(rawSnapshot);
  badHash.contentHash = `sha256:${"0".repeat(64)}`;
  assert.throws(() => validateManagedSnapshot(badHash), /contentHash mismatch/);

  const wrongPath = structuredClone(rawSnapshot);
  wrongPath.publishTarget.path = "app/page.tsx";
  assert.throws(() => validateManagedSnapshot(wrongPath), /path must be exactly/);

  const extraField = { ...structuredClone(rawSnapshot), arbitrary: true };
  assert.throws(() => validateManagedSnapshot(extraField), /invalid key set/);
});

test("managed homepage projection is a closed manifest with immutable slot constraints", () => {
  const snapshot = getManagedHomepageSnapshot();
  const slotIds = MANAGED_HOMEPAGE_MANIFEST.map(({ slotId }) => slotId);
  assert.ok(MANAGED_HOMEPAGE_MANIFEST.length >= 80);
  assert.equal(new Set(slotIds).size, slotIds.length);
  assert.ok(slotIds.every((slotId) => /^(?:text|button)_[a-f0-9]{10}$/.test(slotId)));
  assert.ok(MANAGED_HOMEPAGE_MANIFEST.every(({ required }) => required === true));

  const contentMap = createManagedHomepageContentMap(snapshot.slots);
  const provenance = {
    source: "local-codex-worker",
    snapshotId: "snapshot-job-publish-12345",
    jobId: "job-publish-12345",
    publishedAt: "2026-07-19T12:00:00.000Z",
    publishedBy: "jaxon-desktop",
  };
  const projected = projectCmsContentMapToManagedSnapshotExport({
    contentMap,
    provenance,
    theme: snapshot.theme,
  });
  assert.deepEqual(projected.slots, snapshot.slots);
  assert.deepEqual(projected.publishTarget, MANAGED_HOMEPAGE_PUBLISH_TARGET);

  const withUnknownSlot = structuredClone(contentMap);
  withUnknownSlot.attacker_slot = {
    type: "text",
    value: "No",
    constraints: { required: true, maxLength: 2, allowHtml: false },
  };
  assert.throws(
    () => projectCmsContentMapToManagedSnapshotExport({
      contentMap: withUnknownSlot,
      provenance,
      theme: snapshot.theme,
    }),
    /invalid key set/
  );

  const weakened = structuredClone(contentMap);
  weakened[MANAGED_HOMEPAGE_MANIFEST[0].slotId].constraints.required = false;
  assert.throws(
    () => projectCmsContentMapToManagedSnapshotExport({
      contentMap: weakened,
      provenance,
      theme: snapshot.theme,
    }),
    /constraints do not match/
  );
});
