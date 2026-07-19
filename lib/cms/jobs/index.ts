import { DEFAULT_THEME, validateTheme, type ThemeTokens } from "../design/tokens";
import { validateBatch } from "../guardian";
import { store } from "../store";
import { nanoid } from "../store/id";
import type { Site } from "../types";
import {
  exportManagedSnapshot,
  getManagedHomepageSnapshot,
  isManagedHomepagePlaceholder,
  projectCmsContentMapToManagedSnapshotExport,
} from "@/lib/content/managed-site";
import { MANAGED_HOMEPAGE_MANIFEST, MANAGED_HOMEPAGE_PUBLISH_TARGET } from "@/lib/content/managed-site-manifest";
import { digestJson } from "./crypto";
import { JobApiError, errorMessage } from "./errors";
import { memoryJobStore } from "./memory-store";
import { mongoJobStore } from "./mongo-store";
import { cmsJobNamespace } from "./namespace";
import {
  DEFAULT_JOB_DEADLINE_MS,
  JOB_KINDS,
  PUBLISH_JOB_DEADLINE_MS,
  PUBLISH_REPOSITORY,
  PUBLISH_TARGET_ID,
  type ApplyOutcome,
  type CmsJobKind,
  type CmsJobRecord,
  type JobListFilter,
  type JobQueueStore,
  type LeaseCredentials,
  type PublicCmsJob,
  type PublicWorkerRecord,
  type WorkerRecord,
} from "./types";
import { validateWorkerResult } from "./validation";

function pickJobStore(): { store: JobQueueStore; backend: "mongo" | "memory" } {
  const explicit = (process.env.CMS_JOB_STORE || process.env.CMS_STORE || "").toLowerCase();
  if (process.env.NEXT_PHASE === "phase-production-build") return { store: memoryJobStore, backend: "memory" };
  if (process.env.NODE_ENV === "production") {
    if (explicit !== "mongo" && explicit !== "mongodb") throw new Error("Production CMS jobs require CMS_JOB_STORE=mongo or CMS_STORE=mongo");
    if (!process.env.MONGODB_URI) throw new Error("Production CMS jobs require MONGODB_URI");
    return { store: mongoJobStore, backend: "mongo" };
  }
  if (explicit === "mongo" || explicit === "mongodb") {
    if (!process.env.MONGODB_URI) throw new Error("Mongo CMS jobs require MONGODB_URI");
    return { store: mongoJobStore, backend: "mongo" };
  }
  if (explicit === "memory" || explicit === "file") return { store: memoryJobStore, backend: "memory" };
  return process.env.MONGODB_URI ? { store: mongoJobStore, backend: "mongo" } : { store: memoryJobStore, backend: "memory" };
}

const picked = pickJobStore();
export const jobStore = picked.store;
export const JOB_STORE_BACKEND = picked.backend;

function boundedString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string") throw new JobApiError(400, "invalid_request", `${label} must be a string`);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new JobApiError(400, "invalid_request", `${label} must contain 1-${max} characters`);
  return normalized;
}

function templateId(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const id = boundedString(value, "templateId", 100);
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(id)) throw new JobApiError(400, "invalid_template", "templateId contains unsupported characters");
  return id;
}

function newJob(input: {
  id?: string;
  kind: CmsJobKind;
  siteId: string;
  pageId?: string;
  createdByRole: "owner" | "client";
  payload: CmsJobRecord["input"];
  baseDigest: string;
}): CmsJobRecord {
  const now = new Date();
  const deadlineMs = input.kind === "publish" ? PUBLISH_JOB_DEADLINE_MS : DEFAULT_JOB_DEADLINE_MS;
  return {
    namespace: cmsJobNamespace(),
    id: input.id ?? `job_${nanoid(16)}`,
    kind: input.kind,
    status: "queued",
    siteId: input.siteId,
    pageId: input.pageId,
    createdByRole: input.createdByRole,
    input: structuredClone(input.payload),
    baseDigest: input.baseDigest,
    priority: 0,
    attempts: 0,
    maxAttempts: input.kind === "publish" ? 2 : 3,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    availableAt: now.toISOString(),
    deadlineAt: new Date(now.getTime() + deadlineMs).toISOString(),
  };
}

function contentBaseDigest(contentMap: unknown): string {
  return digestJson({ kind: "content", contentMap });
}

function themeBaseDigest(theme: ThemeTokens): string {
  return digestJson({ kind: "theme", theme });
}

function publishBaseDigest(site: Site, pageId: string): string {
  const page = site.pages.find((candidate) => candidate.id === pageId);
  if (!page) throw new JobApiError(404, "page_not_found", "Page not found");
  return digestJson({
    kind: "publish",
    route: page.route,
    template: page.template,
    contentMap: page.contentMap,
    theme: site.theme ?? null,
  });
}

export async function enqueueContentJob(input: {
  siteId: string;
  pageId: string;
  instruction: string;
  templateId?: string;
  createdByRole: "owner" | "client";
}): Promise<PublicCmsJob> {
  const site = await store.getSite(input.siteId);
  if (!site) throw new JobApiError(404, "site_not_found", "Site not found");
  const page = site.pages.find((candidate) => candidate.id === input.pageId);
  if (!page) throw new JobApiError(404, "page_not_found", "Page not found");
  const payload: CmsJobRecord["input"] = {
    kind: "content",
    instruction: boundedString(input.instruction, "instruction", 12_000),
    contentMap: structuredClone(page.contentMap),
    templateId: templateId(input.templateId),
  };
  const job = newJob({
    kind: "content",
    siteId: input.siteId,
    pageId: input.pageId,
    createdByRole: input.createdByRole,
    payload,
    baseDigest: contentBaseDigest(page.contentMap),
  });
  return sanitizeJob(await jobStore.createJob(job));
}

export async function enqueueThemeJob(input: {
  siteId: string;
  instruction: string;
  templateId?: string;
  createdByRole?: "owner";
}): Promise<PublicCmsJob> {
  const site = await store.getSite(input.siteId);
  if (!site) throw new JobApiError(404, "site_not_found", "Site not found");
  const currentTheme = site.theme ?? DEFAULT_THEME;
  const payload: CmsJobRecord["input"] = {
    kind: "theme",
    instruction: boundedString(input.instruction, "instruction", 12_000),
    currentTheme: structuredClone(currentTheme),
    templateId: templateId(input.templateId),
  };
  const job = newJob({
    kind: "theme",
    siteId: input.siteId,
    createdByRole: "owner",
    payload,
    baseDigest: themeBaseDigest(currentTheme),
  });
  return sanitizeJob(await jobStore.createJob(job));
}

export async function enqueuePublishJob(input: {
  siteId: string;
  pageId: string;
  createdByRole?: "owner";
}): Promise<PublicCmsJob> {
  const site = await store.getSite(input.siteId);
  if (!site) throw new JobApiError(404, "site_not_found", "Site not found");
  const page = site.pages.find((candidate) => candidate.id === input.pageId);
  if (!page) throw new JobApiError(404, "page_not_found", "Page not found");
  if (
    site.id !== MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId ||
    page.id !== MANAGED_HOMEPAGE_PUBLISH_TARGET.pageId ||
    page.route !== MANAGED_HOMEPAGE_PUBLISH_TARGET.route ||
    site.domain !== MANAGED_HOMEPAGE_PUBLISH_TARGET.domain
  ) {
    throw new JobApiError(409, "unmanaged_publish_target", "Publishing is restricted to the managed Rapid Studios homepage");
  }
  const placeholder = /(?:\{\{[^}]+\}\}|\[\s*(?:placeholder|todo|tbd)[^\]]*\]|\blorem ipsum\b)/i;
  for (const definition of MANAGED_HOMEPAGE_MANIFEST) {
    const value = page.contentMap[definition.slotId]?.value;
    if (typeof value !== "string" || !value.trim() || placeholder.test(value)) {
      throw new JobApiError(422, "managed_snapshot_incomplete", `Managed slot ${definition.key} is missing or still contains placeholder copy`);
    }
  }
  const checkedInSnapshot = getManagedHomepageSnapshot();
  const stillBootstrap =
    isManagedHomepagePlaceholder(checkedInSnapshot) &&
    MANAGED_HOMEPAGE_MANIFEST.every(
      (definition) => page.contentMap[definition.slotId]?.value === checkedInSnapshot.slots[definition.key]
    );
  if (stillBootstrap) {
    throw new JobApiError(422, "managed_snapshot_placeholder", "Edit and approve at least one managed homepage field before the first publish");
  }
  const jobId = `job_${nanoid(16)}`;
  let snapshot;
  try {
    const projected = projectCmsContentMapToManagedSnapshotExport({
      contentMap: page.contentMap,
      provenance: {
        source: "local-codex-worker",
        snapshotId: `cms_${nanoid(16)}`,
        jobId,
        publishedAt: new Date().toISOString(),
        publishedBy: "rapidstudios-cms",
      },
      theme: site.theme ?? DEFAULT_THEME,
    });
    snapshot = exportManagedSnapshot(projected);
  } catch (error) {
    throw new JobApiError(422, "managed_snapshot_invalid", errorMessage(error));
  }
  const payload: CmsJobRecord["input"] = {
    kind: "publish",
    targetId: PUBLISH_TARGET_ID,
    repository: PUBLISH_REPOSITORY,
    snapshot,
  };
  const job = newJob({
    id: jobId,
    kind: "publish",
    siteId: input.siteId,
    pageId: input.pageId,
    createdByRole: "owner",
    payload,
    baseDigest: publishBaseDigest(site, input.pageId),
  });
  return sanitizeJob(await jobStore.createJob(job));
}

export function sanitizeJob(job: CmsJobRecord): PublicCmsJob {
  return {
    id: job.id,
    kind: job.kind,
    status: job.status,
    siteId: job.siteId,
    pageId: job.pageId,
    createdByRole: job.createdByRole,
    input: structuredClone(job.input),
    baseDigest: job.baseDigest,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    deadlineAt: job.deadlineAt,
    completedAt: job.completedAt,
    cancelledAt: job.cancelledAt,
    result: job.result ? structuredClone(job.result) : undefined,
    error: job.error ? structuredClone(job.error) : undefined,
    applyOutcome: job.applyOutcome ? structuredClone(job.applyOutcome) : undefined,
  };
}

export async function getJob(jobId: string): Promise<PublicCmsJob | null> {
  const job = await jobStore.getJob(jobId);
  return job ? sanitizeJob(job) : null;
}

export async function listJobs(filter: JobListFilter): Promise<PublicCmsJob[]> {
  return (await jobStore.listJobs(filter)).map(sanitizeJob);
}

async function currentState(job: CmsJobRecord): Promise<{
  digest: string;
  site: Site;
  contentMap?: Site["pages"][number]["contentMap"];
  theme?: ThemeTokens;
}> {
  const site = await store.getSite(job.siteId);
  if (!site) throw new JobApiError(409, "site_removed", "The target site no longer exists");
  if (job.kind === "theme") {
    const theme = site.theme ?? DEFAULT_THEME;
    return { digest: themeBaseDigest(theme), site, theme };
  }
  if (!job.pageId) throw new JobApiError(409, "page_removed", "The target page no longer exists");
  const page = site.pages.find((candidate) => candidate.id === job.pageId);
  if (!page) throw new JobApiError(409, "page_removed", "The target page no longer exists");
  if (job.kind === "content") return { digest: contentBaseDigest(page.contentMap), site, contentMap: page.contentMap };
  return { digest: publishBaseDigest(site, page.id), site, contentMap: page.contentMap };
}

async function failLeaseForRejection(credentials: LeaseCredentials, error: JobApiError): Promise<void> {
  await jobStore.fail(credentials, {
    code: error.code,
    message: error.message.slice(0, 1000),
    at: new Date().toISOString(),
    retryable: false,
  });
}

export async function completeLeasedJob(credentials: LeaseCredentials, rawResult: unknown): Promise<PublicCmsJob> {
  const job = await jobStore.getActiveLease(credentials);
  if (!job) throw new JobApiError(409, "lease_not_active", "Lease is invalid, expired, cancelled, or already completed");
  try {
    const current = await currentState(job);
    if (current.digest !== job.baseDigest) {
      throw new JobApiError(409, "base_stale", "The CMS changed after this job was queued; the proposal was not accepted");
    }
    const result = validateWorkerResult(job, rawResult, { contentMap: current.contentMap, theme: current.theme });
    const completed = await jobStore.complete(credentials, result);
    if (!completed) throw new JobApiError(409, "lease_not_active", "Lease changed before completion could be recorded");
    return sanitizeJob(completed);
  } catch (error) {
    const apiError = error instanceof JobApiError ? error : new JobApiError(500, "completion_failed", errorMessage(error));
    await failLeaseForRejection(credentials, apiError);
    throw apiError;
  }
}

export interface ApplyJobResponse {
  job: PublicCmsJob;
  alreadyApplied: boolean;
}

export async function applyCompletedJob(jobId: string): Promise<ApplyJobResponse> {
  const before = await jobStore.getJob(jobId);
  if (!before) throw new JobApiError(404, "job_not_found", "Job not found");
  if (before.status === "applied") return { job: sanitizeJob(before), alreadyApplied: true };
  if (before.kind === "publish") throw new JobApiError(409, "publish_not_applicable", "Publish jobs are completed by their pull request result");
  if (before.status !== "completed" || !before.result) {
    throw new JobApiError(409, "job_not_ready", `Job cannot be applied while its status is ${before.status}`);
  }

  const applyClaimId = `apply_${nanoid(16)}`;
  const applying = await jobStore.beginApply(jobId, applyClaimId);
  if (!applying) {
    const latest = await jobStore.getJob(jobId);
    if (latest?.status === "applied") return { job: sanitizeJob(latest), alreadyApplied: true };
    throw new JobApiError(409, "apply_in_progress", "This proposal is already being applied or is no longer applicable");
  }

  try {
    const result = applying.result;
    if (!result) throw new JobApiError(409, "missing_result", "Completed job has no stored proposal");
    const current = await currentState(applying);
    if (current.digest !== applying.baseDigest) {
      throw new JobApiError(409, "base_stale", "The CMS changed after this proposal was generated; nothing was applied");
    }

    let outcome: ApplyOutcome;
    if (applying.kind === "content" && result.kind === "content" && result.changes.length === 0) {
      outcome = { status: "applied", at: new Date().toISOString() };
    } else if (applying.kind === "theme" && result.kind === "theme" && Object.keys(result.patch).length === 0) {
      outcome = { status: "applied", at: new Date().toISOString() };
    } else if (applying.kind === "content" && result.kind === "content" && applying.pageId && current.contentMap) {
      const verdict = validateBatch(current.contentMap, result.changes);
      if (!verdict.accepted) throw new JobApiError(422, "guardian_rejected", verdict.reason);
      const committed = await store.commitContent(applying.siteId, applying.pageId, verdict.contentMap);
      outcome = { status: "applied", at: new Date().toISOString(), snapshotId: committed.snapshot.id };
    } else if (applying.kind === "theme" && result.kind === "theme" && current.theme) {
      const verdict = validateTheme(current.theme, result.patch);
      if (!verdict.accepted || !verdict.theme) {
        throw new JobApiError(422, "design_guardian_rejected", verdict.reason || "Theme proposal was rejected");
      }
      await store.setTheme(applying.siteId, verdict.theme);
      outcome = { status: "applied", at: new Date().toISOString() };
    } else {
      throw new JobApiError(409, "result_kind_mismatch", "Stored proposal does not match its job kind");
    }

    const applied = await jobStore.finishApply(jobId, applyClaimId, outcome);
    if (!applied) throw new JobApiError(500, "apply_state_lost", "The CMS changed but its job outcome could not be finalized");
    return { job: sanitizeJob(applied), alreadyApplied: false };
  } catch (error) {
    const apiError = error instanceof JobApiError ? error : new JobApiError(500, "apply_failed", errorMessage(error));
    await jobStore.finishApply(jobId, applyClaimId, {
      status: "failed",
      at: new Date().toISOString(),
      code: apiError.code,
      message: apiError.message.slice(0, 1000),
    });
    throw apiError;
  }
}

export async function recordWorkerStatus(
  workerId: string,
  patch: Omit<Partial<WorkerRecord>, "namespace" | "workerId" | "lastSeenAt"> & Pick<WorkerRecord, "status">
): Promise<void> {
  const existing = (await jobStore.listWorkers()).find((worker) => worker.workerId === workerId);
  await jobStore.recordWorker({
    namespace: cmsJobNamespace(),
    workerId,
    status: patch.status,
    capabilities: [...new Set((patch.capabilities ?? existing?.capabilities ?? [...JOB_KINDS]).filter((kind) => JOB_KINDS.includes(kind)))],
    version: patch.version ?? existing?.version,
    currentJobId: patch.currentJobId,
    lastSeenAt: new Date().toISOString(),
    startedAt: patch.startedAt ?? existing?.startedAt,
    message: patch.message,
  });
}

export async function workerHealth(): Promise<PublicWorkerRecord[]> {
  const configured = Number(process.env.CMS_WORKER_OFFLINE_SECONDS || 180);
  const offlineSeconds = Number.isFinite(configured) ? Math.min(Math.max(Math.floor(configured), 60), 3600) : 180;
  const cutoff = Date.now() - offlineSeconds * 1000;
  return (await jobStore.listWorkers()).map((worker) => {
    const online = Date.parse(worker.lastSeenAt) >= cutoff;
    return {
      workerId: worker.workerId,
      status: online ? worker.status : "offline",
      reportedStatus: worker.status,
      version: worker.version,
      capabilities: worker.capabilities,
      currentJobId: worker.currentJobId,
      lastSeenAt: worker.lastSeenAt,
      online,
      message: worker.message,
    };
  });
}
