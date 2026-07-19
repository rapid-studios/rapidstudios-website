import { createHash } from "node:crypto";
import {
  CAPABILITIES,
  GITHUB_BASE_BRANCH,
  GITHUB_REPOSITORY,
  PUBLISH_TARGETS,
} from "./constants.mjs";
import { WorkerError } from "./errors.mjs";

const SLOT_TYPES = new Set(["text", "button", "link", "image"]);
const THEME_KEYS = new Set([
  "bg",
  "surface",
  "text",
  "muted",
  "accent",
  "accentText",
  "headingFont",
  "bodyFont",
  "radius",
  "shadow",
  "intensity",
]);
const COLOR_RE =
  /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|transparent)$/;
const FONT_RE = /^[a-zA-Z0-9 ,'"-]{2,120}$/;
const LENGTH_RE = /^\d{1,3}(\.\d{1,2})?(px|rem|em|%)$/;

export function normalizeJob(raw) {
  const job = plainObject(raw, "job");
  const id = boundedString(job.id, "job.id", 1, 128);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) invalid("job.id is invalid.");

  const queueKind = job.kind;
  const explicitCapability = job.requiredCapability ?? job.capability;
  const capability = CAPABILITIES.includes(explicitCapability)
    ? explicitCapability
    : kindToCapability(explicitCapability ?? queueKind);
  if (!CAPABILITIES.includes(capability)) {
    throw new WorkerError(
      "unsupported_capability",
      `Unsupported capability ${String(capability)}.`,
      { retryable: false },
    );
  }

  const input = plainObject(job.input, "job.input");
  if (capability === "codex.content.v1") {
    if (input.kind !== undefined && input.kind !== "content") invalid("Content input kind mismatch.");
    return Object.freeze({ id, kind: "content", capability, input: normalizeContentInput(input) });
  }
  if (capability === "codex.theme.v1") {
    if (input.kind !== undefined && input.kind !== "theme") invalid("Theme input kind mismatch.");
    return Object.freeze({ id, kind: "theme", capability, input: normalizeThemeInput(input) });
  }
  if (input.kind !== undefined && input.kind !== "publish") invalid("Publish input kind mismatch.");
  return Object.freeze({ id, kind: "publish", capability, input: normalizePublishInput(input, id) });
}

export function normalizeContentInput(input) {
  const instruction = boundedString(input.instruction, "instruction", 1, 12_000);
  const templateId = normalizeOptionalTemplateId(input.templateId);
  const slots = input.slots
    ? normalizeSlotArray(input.slots)
    : normalizeContentMap(input.contentMap);
  if (!slots.length || slots.length > 250) {
    invalid("Content jobs must include 1-250 editable slots.");
  }
  const totalBytes = Buffer.byteLength(JSON.stringify(slots), "utf8");
  if (totalBytes > 256 * 1024) invalid("Content job slots are too large.");
  return Object.freeze({ instruction, templateId, slots: Object.freeze(slots) });
}

export function normalizeThemeInput(input) {
  const instruction = boundedString(input.instruction, "instruction", 1, 12_000);
  const templateId = normalizeOptionalTemplateId(input.templateId);
  const theme = plainObject(
    input.baseTheme ?? input.currentTheme,
    "baseTheme/currentTheme",
  );
  const currentTheme = {};
  for (const key of THEME_KEYS) {
    if (!(key in theme)) invalid(`Current theme is missing ${key}.`);
    currentTheme[key] = validateThemeValue(key, theme[key]);
  }
  const unknown = Object.keys(theme).filter((key) => !THEME_KEYS.has(key));
  if (unknown.length) invalid(`Current theme has unknown keys: ${unknown.join(", ")}.`);
  return Object.freeze({ instruction, templateId, currentTheme: Object.freeze(currentTheme) });
}

export function normalizePublishInput(input, jobId) {
  const targetId = boundedString(input.targetId, "targetId", 1, 80);
  if (!(targetId in PUBLISH_TARGETS)) invalid("Publish target is not allowlisted.");
  if (input.repository !== GITHUB_REPOSITORY) invalid("Publish repository is not allowlisted.");
  const snapshot = plainObject(input.snapshot, "snapshot");
  validateManagedSnapshotEnvelope(snapshot, jobId);
  const serialized = stableJson(snapshot);
  if (Buffer.byteLength(serialized, "utf8") > 1024 * 1024) {
    invalid("Publish snapshot exceeds 1 MiB.");
  }
  return Object.freeze({ targetId, snapshot });
}

export function validateContentModelResult(raw, slots) {
  const value = exactObject(raw, "content result", ["changes", "summary"]);
  if (!Array.isArray(value.changes) || value.changes.length > 100) {
    invalid("Content result changes must be an array with at most 100 items.");
  }
  const summary = boundedString(value.summary, "summary", 1, 500);
  const byId = new Map(slots.map((slot) => [slot.slotId, slot]));
  const used = new Set();
  const changes = value.changes.map((candidate) => {
    const change = exactObject(candidate, "change", ["slotId", "newValue"]);
    const slotId = boundedString(change.slotId, "change.slotId", 1, 160);
    if (!byId.has(slotId) || used.has(slotId)) {
      invalid("Content result contains an unknown or duplicate slot id.");
    }
    used.add(slotId);
    const slot = byId.get(slotId);
    const maxLength = slot.constraints.maxLength || 10_000;
    const newValue = boundedString(change.newValue, "change.newValue", 0, maxLength);
    if (slot.constraints.required && !newValue) {
      invalid("Content result cannot empty a required slot.");
    }
    return Object.freeze({ slotId, newValue });
  });
  return Object.freeze({
    kind: "content",
    changes: Object.freeze(changes),
    summary,
  });
}

export function validateThemeModelResult(raw) {
  const value = exactObject(raw, "theme result", ["patch", "summary"]);
  const patchInput = plainObject(value.patch, "patch");
  const unknown = Object.keys(patchInput).filter((key) => !THEME_KEYS.has(key));
  if (unknown.length) invalid(`Theme result has unknown keys: ${unknown.join(", ")}.`);
  const patch = {};
  for (const [key, candidate] of Object.entries(patchInput)) {
    patch[key] = validateThemeValue(key, candidate);
  }
  return Object.freeze({
    kind: "theme",
    patch: Object.freeze(patch),
    summary: boundedString(value.summary, "summary", 1, 500),
  });
}

function kindToCapability(kind) {
  if (kind === "content") return "codex.content.v1";
  if (kind === "theme") return "codex.theme.v1";
  if (kind === "publish") return "git.publish.v1";
  return undefined;
}

export function stableJson(value) {
  const seen = new Set();
  const normalize = (candidate, depth) => {
    if (depth > 30) invalid("Snapshot nesting is too deep.");
    if (candidate === null || typeof candidate === "boolean" || typeof candidate === "string") {
      if (typeof candidate === "string" && candidate.length > 100_000) {
        invalid("Snapshot contains an oversized string.");
      }
      return candidate;
    }
    if (typeof candidate === "number") {
      if (!Number.isFinite(candidate)) invalid("Snapshot contains a non-finite number.");
      return candidate;
    }
    if (!candidate || typeof candidate !== "object") {
      invalid("Snapshot contains a non-JSON value.");
    }
    if (seen.has(candidate)) invalid("Snapshot contains a cycle.");
    seen.add(candidate);
    let result;
    if (Array.isArray(candidate)) {
      if (candidate.length > 5_000) invalid("Snapshot contains an oversized array.");
      result = candidate.map((item) => normalize(item, depth + 1));
    } else {
      const object = plainObject(candidate, "snapshot value");
      result = {};
      for (const key of Object.keys(object).sort()) {
        if (["__proto__", "prototype", "constructor"].includes(key)) {
          invalid("Snapshot contains an unsafe object key.");
        }
        result[key] = normalize(object[key], depth + 1);
      }
    }
    seen.delete(candidate);
    return result;
  };
  return `${JSON.stringify(normalize(value, 0), null, 2)}\n`;
}

function validateManagedSnapshotEnvelope(snapshot, jobId) {
  const topKeys = ["schemaVersion", "publishTarget", "provenance", "contentHash", "theme", "slots"];
  if (!hasExactKeys(snapshot, topKeys) || snapshot.schemaVersion !== 1) {
    invalid("Managed snapshot top-level contract is invalid.");
  }
  const publishTarget = plainObject(snapshot.publishTarget, "snapshot.publishTarget");
  const expectedTarget = {
    repository: GITHUB_REPOSITORY,
    branch: GITHUB_BASE_BRANCH,
    path: PUBLISH_TARGETS["rapidstudios-homepage-v1"],
    siteId: "rapidstudios",
    pageId: "homepage",
    route: "/",
    domain: "rapidstudios.dev",
  };
  if (!hasExactKeys(publishTarget, Object.keys(expectedTarget))) {
    invalid("Managed snapshot publishTarget contract is invalid.");
  }
  for (const [key, expected] of Object.entries(expectedTarget)) {
    if (publishTarget[key] !== expected) invalid(`Managed snapshot publishTarget.${key} is invalid.`);
  }

  const provenance = plainObject(snapshot.provenance, "snapshot.provenance");
  if (
    !hasExactKeys(provenance, ["source", "snapshotId", "jobId", "publishedAt", "publishedBy"]) ||
    provenance.source !== "local-codex-worker" ||
    provenance.jobId !== jobId ||
    provenance.publishedBy !== "rapidstudios-cms"
  ) {
    invalid("Managed snapshot provenance does not match this worker job.");
  }
  const publishedAt = new Date(provenance.publishedAt);
  if (Number.isNaN(publishedAt.valueOf()) || publishedAt.toISOString() !== provenance.publishedAt) {
    invalid("Managed snapshot publishedAt is not canonical ISO time.");
  }
  if (
    typeof provenance.snapshotId !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(provenance.snapshotId)
  ) {
    invalid("Managed snapshot snapshotId is invalid.");
  }

  const contentHash = snapshot.contentHash;
  if (typeof contentHash !== "string" || !/^sha256:[a-f0-9]{64}$/.test(contentHash)) {
    invalid("Managed snapshot contentHash is invalid.");
  }
  const withoutHash = {
    schemaVersion: snapshot.schemaVersion,
    publishTarget: snapshot.publishTarget,
    provenance: snapshot.provenance,
    theme: snapshot.theme,
    slots: snapshot.slots,
  };
  const expectedHash = `sha256:${createHash("sha256")
    .update(canonicalJson(withoutHash), "utf8")
    .digest("hex")}`;
  if (contentHash !== expectedHash) invalid("Managed snapshot contentHash does not match its data.");
  plainObject(snapshot.theme, "snapshot.theme");
  plainObject(snapshot.slots, "snapshot.slots");
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const object = plainObject(value, "snapshot hash value");
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
      .join(",")}}`;
  }
  const result = JSON.stringify(value);
  if (result === undefined) invalid("Managed snapshot contains a non-JSON value.");
  return result;
}

function hasExactKeys(record, expected) {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function normalizeContentMap(value) {
  const map = plainObject(value, "contentMap");
  return Object.entries(map).map(([slotId, candidate]) =>
    normalizeSlot({ ...plainObject(candidate, `contentMap.${slotId}`), slotId }),
  );
}

function normalizeOptionalTemplateId(value) {
  if (value === undefined || value === null) return null;
  const id = boundedString(value, "templateId", 1, 100);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) invalid("templateId is invalid.");
  return id;
}

function normalizeSlotArray(value) {
  if (!Array.isArray(value)) invalid("slots must be an array.");
  return value.map((candidate) => normalizeSlot(plainObject(candidate, "slot")));
}

function normalizeSlot(slot) {
  const slotId = boundedString(slot.slotId, "slot.slotId", 1, 160);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(slotId)) invalid("slotId is invalid.");
  if (!SLOT_TYPES.has(slot.type)) invalid(`Slot ${slotId} has an invalid type.`);
  const rawValue = slot.currentValue ?? slot.value;
  const currentValue = boundedString(rawValue, "slot.currentValue", 0, 20_000, {
    trim: false,
  });
  const sourceConstraints = slot.constraints === undefined
    ? {}
    : plainObject(slot.constraints, "slot.constraints");
  const constraints = {};
  if (sourceConstraints.maxLength !== undefined) {
    if (
      !Number.isSafeInteger(sourceConstraints.maxLength) ||
      sourceConstraints.maxLength < 1 ||
      sourceConstraints.maxLength > 20_000
    ) {
      invalid("slot.constraints.maxLength is invalid.");
    }
    constraints.maxLength = sourceConstraints.maxLength;
  }
  if (sourceConstraints.required !== undefined) {
    if (typeof sourceConstraints.required !== "boolean") invalid("slot required is invalid.");
    constraints.required = sourceConstraints.required;
  }
  return Object.freeze({ slotId, type: slot.type, currentValue, constraints });
}

function validateThemeValue(key, value) {
  if (typeof value !== "string") invalid(`Theme token ${key} must be a string.`);
  const result = value.trim();
  if (["bg", "surface", "text", "muted", "accent", "accentText"].includes(key)) {
    if (!COLOR_RE.test(result)) invalid(`Theme token ${key} is not a valid color.`);
  } else if (["headingFont", "bodyFont"].includes(key)) {
    if (!FONT_RE.test(result)) invalid(`Theme token ${key} is not a safe font stack.`);
  } else if (key === "radius") {
    if (!LENGTH_RE.test(result)) invalid("Theme radius is invalid.");
  } else if (key === "shadow") {
    if (!["none", "sm", "md", "lg"].includes(result)) invalid("Theme shadow is invalid.");
  } else if (key === "intensity") {
    if (!["overlay", "tokens"].includes(result)) invalid("Theme intensity is invalid.");
  } else {
    invalid(`Unknown theme token ${key}.`);
  }
  return result;
}

function exactObject(value, label, keys) {
  const object = plainObject(value, label);
  const allowed = new Set(keys);
  const actual = Object.keys(object);
  const unknown = actual.filter((key) => !allowed.has(key));
  const missing = keys.filter((key) => !(key in object));
  if (unknown.length || missing.length) invalid(`${label} has an invalid shape.`);
  return object;
}

function plainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${label} must be an object.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    invalid(`${label} must be a plain object.`);
  }
  return value;
}

function boundedString(value, label, min, max, options = {}) {
  if (typeof value !== "string") invalid(`${label} must be a string.`);
  const result = options.trim === false ? value : value.trim();
  if (result.length < min || result.length > max) {
    invalid(`${label} must contain ${min}-${max} characters.`);
  }
  return result;
}

function invalid(message) {
  throw new WorkerError("job_invalid", message, { retryable: false });
}
