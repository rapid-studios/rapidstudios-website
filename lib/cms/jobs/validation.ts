import { validateTheme, type ThemePatch, type ThemeTokens } from "../design/tokens";
import { validateBatch } from "../guardian";
import type { ContentMap, ProposedChange } from "../types";
import { JobApiError } from "./errors";
import {
  JOB_KINDS,
  MAX_LEASE_SECONDS,
  PUBLISH_BRANCH_PREFIX,
  PUBLISH_REPOSITORY,
  type CmsJobKind,
  type CmsJobRecord,
  type CmsJobResult,
  type ContentJobResult,
  type LeaseCredentials,
  type PublishJobResult,
  type ThemeJobResult,
} from "./types";

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new JobApiError(400, "invalid_request", `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(record: Record<string, unknown>, allowed: readonly string[], required: readonly string[], label: string): void {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(record).find((key) => !allowedSet.has(key));
  if (unknown) throw new JobApiError(400, "unknown_field", `${label} contains unknown field "${unknown}"`);
  const missing = required.find((key) => !(key in record));
  if (missing) throw new JobApiError(400, "missing_field", `${label} is missing "${missing}"`);
}

function string(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") throw new JobApiError(400, "invalid_request", `${label} must be a string`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new JobApiError(400, "invalid_request", `${label} must contain ${min}-${max} characters`);
  }
  return normalized;
}

function optionalString(value: unknown, label: string, max: number): string | undefined {
  if (value === undefined) return undefined;
  return string(value, label, 1, max);
}

export function parseLeaseCredentials(value: unknown, extraAllowed: readonly string[] = []): LeaseCredentials {
  const record = object(value, "request");
  exactKeys(record, ["jobId", "claimId", "leaseToken", ...extraAllowed], ["jobId", "claimId", "leaseToken"], "request");
  return {
    jobId: string(record.jobId, "jobId", 5, 96),
    claimId: string(record.claimId, "claimId", 8, 96),
    leaseToken: string(record.leaseToken, "leaseToken", 32, 128),
  };
}

export interface ClaimRequest {
  capabilities: CmsJobKind[];
  leaseSeconds: number;
  version?: string;
}

export function parseClaimRequest(value: unknown): ClaimRequest {
  const record = object(value, "request");
  exactKeys(record, ["capabilities", "leaseSeconds", "version"], [], "request");
  const capabilities = record.capabilities === undefined ? [...JOB_KINDS] : record.capabilities;
  if (!Array.isArray(capabilities) || capabilities.length === 0 || capabilities.length > JOB_KINDS.length) {
    throw new JobApiError(400, "invalid_capabilities", "capabilities must contain one or more supported job kinds");
  }
  const parsedCapabilities = [...new Set(capabilities.map((kind) => string(kind, "capability", 1, 20)))] as CmsJobKind[];
  if (parsedCapabilities.some((kind) => !JOB_KINDS.includes(kind))) {
    throw new JobApiError(400, "invalid_capabilities", "capabilities contains an unsupported job kind");
  }
  const requestedLease = record.leaseSeconds === undefined ? 120 : Number(record.leaseSeconds);
  if (!Number.isInteger(requestedLease) || requestedLease < 30) {
    throw new JobApiError(400, "invalid_lease", "leaseSeconds must be an integer of at least 30 seconds");
  }
  return {
    capabilities: parsedCapabilities,
    leaseSeconds: Math.min(requestedLease, MAX_LEASE_SECONDS),
    version: optionalString(record.version, "version", 80),
  };
}

export interface HeartbeatRequest extends LeaseCredentials {
  leaseSeconds: number;
  version?: string;
  message?: string;
}

export function parseHeartbeatRequest(value: unknown): HeartbeatRequest {
  const credentials = parseLeaseCredentials(value, ["leaseSeconds", "version", "message"]);
  const record = value as Record<string, unknown>;
  const requestedLease = record.leaseSeconds === undefined ? 120 : Number(record.leaseSeconds);
  if (!Number.isInteger(requestedLease) || requestedLease < 30) {
    throw new JobApiError(400, "invalid_lease", "leaseSeconds must be an integer of at least 30 seconds");
  }
  return {
    ...credentials,
    leaseSeconds: Math.min(requestedLease, MAX_LEASE_SECONDS),
    version: optionalString(record.version, "version", 80),
    message: optionalString(record.message, "message", 500),
  };
}

export interface FailureRequest extends LeaseCredentials {
  code: string;
  message: string;
  retryable: boolean;
}

export function parseFailureRequest(value: unknown): FailureRequest {
  const credentials = parseLeaseCredentials(value, ["error", "retryable"]);
  const record = value as Record<string, unknown>;
  const error = object(record.error, "error");
  exactKeys(error, ["code", "message"], ["code", "message"], "error");
  if (record.retryable !== undefined && typeof record.retryable !== "boolean") {
    throw new JobApiError(400, "invalid_request", "retryable must be a boolean");
  }
  return {
    ...credentials,
    code: string(error.code, "error.code", 1, 64).toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
    message: string(error.message, "error.message", 1, 1000),
    retryable: record.retryable === true,
  };
}

export interface CompleteRequest extends LeaseCredentials {
  result: unknown;
}

export function parseCompleteRequest(value: unknown): CompleteRequest {
  const credentials = parseLeaseCredentials(value, ["result"]);
  const record = value as Record<string, unknown>;
  if (!("result" in record)) throw new JobApiError(400, "missing_field", "request is missing result");
  return { ...credentials, result: record.result };
}

export interface WorkerHealthRequest {
  status: "idle" | "working" | "degraded";
  version?: string;
  capabilities: CmsJobKind[];
  currentJobId?: string;
  startedAt?: string;
  message?: string;
}

export function parseWorkerHealthRequest(value: unknown): WorkerHealthRequest {
  const record = object(value, "request");
  exactKeys(record, ["status", "version", "capabilities", "currentJobId", "startedAt", "message"], ["status", "capabilities"], "request");
  const status = string(record.status, "status", 1, 20);
  if (!(["idle", "working", "degraded"] as string[]).includes(status)) {
    throw new JobApiError(400, "invalid_status", "status must be idle, working, or degraded");
  }
  const claim = parseClaimRequest({ capabilities: record.capabilities, version: record.version });
  const startedAt = optionalString(record.startedAt, "startedAt", 40);
  if (startedAt && Number.isNaN(Date.parse(startedAt))) throw new JobApiError(400, "invalid_request", "startedAt must be an ISO date");
  return {
    status: status as WorkerHealthRequest["status"],
    capabilities: claim.capabilities,
    version: claim.version,
    currentJobId: optionalString(record.currentJobId, "currentJobId", 96),
    startedAt,
    message: optionalString(record.message, "message", 500),
  };
}

function parseSummary(record: Record<string, unknown>): { summary: string; rationale?: string } {
  return {
    summary: string(record.summary, "result.summary", 1, 1000),
    rationale: optionalString(record.rationale, "result.rationale", 4000),
  };
}

function validateContentResult(raw: unknown, contentMap: ContentMap): ContentJobResult {
  const record = object(raw, "result");
  exactKeys(record, ["kind", "changes", "summary", "rationale"], ["kind", "changes", "summary"], "result");
  if (record.kind !== "content") throw new JobApiError(422, "result_kind_mismatch", "Expected a content result");
  if (!Array.isArray(record.changes) || record.changes.length > 100) {
    throw new JobApiError(422, "invalid_result", "Content result must contain 0-100 changes");
  }
  const changes: ProposedChange[] = record.changes.map((rawChange, index) => {
    const change = object(rawChange, `changes[${index}]`);
    exactKeys(change, ["slotId", "newValue"], ["slotId", "newValue"], `changes[${index}]`);
    return {
      slotId: string(change.slotId, `changes[${index}].slotId`, 1, 160),
      newValue: string(change.newValue, `changes[${index}].newValue`, 0, 20_000),
    };
  });
  if (new Set(changes.map((change) => change.slotId)).size !== changes.length) {
    throw new JobApiError(422, "duplicate_slot", "Content result contains duplicate slot ids");
  }
  if (changes.length > 0) {
    const verdict = validateBatch(contentMap, changes);
    if (!verdict.accepted) throw new JobApiError(422, "guardian_rejected", verdict.reason);
  }
  return { kind: "content", changes, ...parseSummary(record) };
}

function validateThemeResult(raw: unknown, currentTheme: ThemeTokens): ThemeJobResult {
  const record = object(raw, "result");
  exactKeys(record, ["kind", "patch", "summary", "rationale"], ["kind", "patch", "summary"], "result");
  if (record.kind !== "theme") throw new JobApiError(422, "result_kind_mismatch", "Expected a theme result");
  const patchRecord = object(record.patch, "result.patch");
  const patch = { ...patchRecord } as ThemePatch;
  if (Object.keys(patch).length > 0) {
    const verdict = validateTheme(currentTheme, patch);
    if (!verdict.accepted) throw new JobApiError(422, "design_guardian_rejected", verdict.reason || "Theme patch was rejected");
  }
  return { kind: "theme", patch, ...parseSummary(record) };
}

function safePublishBranch(value: unknown): string {
  const branch = string(value, "result.branch", PUBLISH_BRANCH_PREFIX.length + 1, 120);
  if (!/^cms\/[a-z0-9][a-z0-9._/-]*$/i.test(branch) || branch.includes("..") || branch.includes("//") || branch.endsWith(".lock")) {
    throw new JobApiError(422, "invalid_publish_branch", "Publish branch must be a safe cms/ branch");
  }
  return branch;
}

function safeUrl(value: unknown, label: string): URL {
  const candidate = string(value, label, 8, 2048);
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("unsafe");
    return url;
  } catch {
    throw new JobApiError(422, "invalid_url", `${label} must be a safe HTTPS URL`);
  }
}

function validatePublishResult(raw: unknown, jobId: string): PublishJobResult {
  const record = object(raw, "result");
  exactKeys(
    record,
    ["kind", "repository", "branch", "commitSha", "prNumber", "prUrl", "previewUrl", "summary"],
    ["kind", "repository", "branch", "commitSha", "prNumber", "prUrl", "summary"],
    "result"
  );
  if (record.kind !== "publish") throw new JobApiError(422, "result_kind_mismatch", "Expected a publish result");
  if (record.repository !== PUBLISH_REPOSITORY) {
    throw new JobApiError(422, "invalid_repository", `Publishing is restricted to ${PUBLISH_REPOSITORY}`);
  }
  const branch = safePublishBranch(record.branch);
  if (branch !== `${PUBLISH_BRANCH_PREFIX}${jobId}`) {
    throw new JobApiError(422, "invalid_publish_branch", `Publish branch must be exactly ${PUBLISH_BRANCH_PREFIX}${jobId}`);
  }
  const commitSha = string(record.commitSha, "result.commitSha", 40, 40);
  if (!/^[a-f0-9]{40}$/i.test(commitSha)) throw new JobApiError(422, "invalid_commit", "commitSha must be a full 40-character Git SHA");
  const prNumber = Number(record.prNumber);
  if (!Number.isSafeInteger(prNumber) || prNumber < 1) throw new JobApiError(422, "invalid_pr", "prNumber must be a positive integer");
  const prUrl = safeUrl(record.prUrl, "result.prUrl");
  if (prUrl.origin !== "https://github.com" || prUrl.pathname !== `/${PUBLISH_REPOSITORY}/pull/${prNumber}` || prUrl.search || prUrl.hash) {
    throw new JobApiError(422, "invalid_pr_url", "Pull request URL does not match the fixed Rapid Studios repository and PR number");
  }
  const preview = record.previewUrl === undefined ? undefined : safeUrl(record.previewUrl, "result.previewUrl");
  if (preview && (preview.port || !(preview.hostname === "rapidstudios.dev" || preview.hostname === "www.rapidstudios.dev" || preview.hostname.endsWith(".vercel.app")))) {
    throw new JobApiError(422, "invalid_preview_url", "previewUrl must be a Rapid Studios or Vercel HTTPS URL");
  }
  const previewUrl = preview?.toString();
  return {
    kind: "publish",
    repository: PUBLISH_REPOSITORY,
    branch,
    commitSha: commitSha.toLowerCase(),
    prNumber,
    prUrl: prUrl.toString(),
    previewUrl,
    summary: string(record.summary, "result.summary", 1, 1000),
  };
}

export function validateWorkerResult(
  job: CmsJobRecord,
  raw: unknown,
  current: { contentMap?: ContentMap; theme?: ThemeTokens }
): CmsJobResult {
  if (job.kind === "content") {
    if (!current.contentMap) throw new JobApiError(409, "missing_page", "The target page no longer exists");
    return validateContentResult(raw, current.contentMap);
  }
  if (job.kind === "theme") {
    if (!current.theme) throw new JobApiError(409, "missing_theme", "The target theme no longer exists");
    return validateThemeResult(raw, current.theme);
  }
  return validatePublishResult(raw, job.id);
}
