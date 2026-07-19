import { randomBytes } from "node:crypto";
import { nanoid } from "../store/id";
import { leaseTokenHash } from "./crypto";
import { cmsJobNamespace } from "./namespace";
import type {
  ApplyOutcome,
  ClaimedJob,
  CmsJobKind,
  CmsJobRecord,
  CmsJobResult,
  JobError,
  JobListFilter,
  JobQueueStore,
  LeaseCredentials,
  WorkerRecord,
} from "./types";

interface MemoryQueueState {
  jobs: Map<string, CmsJobRecord>;
  nonces: Map<string, number>;
  workers: Map<string, WorkerRecord>;
}

const globalForMemoryJobs = globalThis as unknown as {
  __rapidCmsMemoryQueues?: Map<string, MemoryQueueState>;
};

function state(): MemoryQueueState {
  globalForMemoryJobs.__rapidCmsMemoryQueues ??= new Map();
  const namespace = cmsJobNamespace();
  const existing = globalForMemoryJobs.__rapidCmsMemoryQueues.get(namespace);
  if (existing) return existing;
  const created = { jobs: new Map(), nonces: new Map(), workers: new Map() };
  globalForMemoryJobs.__rapidCmsMemoryQueues.set(namespace, created);
  return created;
}

function copy<T>(value: T): T {
  return structuredClone(value);
}

function clearLease(job: CmsJobRecord): void {
  delete job.leaseExpiresAt;
  delete job.heartbeatAt;
  delete job.workerId;
  delete job.claimId;
  delete job.leaseTokenHash;
}

function recoverExpiredJobs(now = new Date()): void {
  const queue = state();
  const nowIso = now.toISOString();
  for (const job of queue.jobs.values()) {
    if (job.status === "queued" && job.deadlineAt <= nowIso) {
      job.status = "failed";
      job.updatedAt = nowIso;
      job.error = { code: "deadline_exceeded", message: "Job deadline elapsed before it could be claimed", at: nowIso, retryable: false };
      continue;
    }
    if (job.status !== "leased" || !job.leaseExpiresAt || job.leaseExpiresAt > nowIso) continue;
    if (job.attempts >= job.maxAttempts || job.deadlineAt <= nowIso) {
      job.status = "failed";
      job.error = { code: "lease_expired", message: "Worker lease expired and no attempts remain", at: nowIso, retryable: false };
    } else {
      job.status = "queued";
      job.availableAt = nowIso;
      job.error = { code: "lease_expired", message: "Worker lease expired; job returned to the queue", at: nowIso, retryable: true };
    }
    job.updatedAt = nowIso;
    clearLease(job);
  }
}

function hasLease(job: CmsJobRecord, credentials: LeaseCredentials, nowIso: string): boolean {
  return (
    job.status === "leased" &&
    job.id === credentials.jobId &&
    job.claimId === credentials.claimId &&
    job.leaseTokenHash === leaseTokenHash(credentials.leaseToken) &&
    (!credentials.workerId || job.workerId === credentials.workerId) &&
    Boolean(job.leaseExpiresAt && job.leaseExpiresAt > nowIso)
  );
}

async function createJob(job: CmsJobRecord): Promise<CmsJobRecord> {
  const queue = state();
  if (job.namespace !== cmsJobNamespace()) throw new Error("Job namespace mismatch");
  if (queue.jobs.has(job.id)) throw new Error(`Job already exists: ${job.id}`);
  queue.jobs.set(job.id, copy(job));
  return copy(job);
}

async function getJob(jobId: string): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(jobId);
  return job ? copy(job) : null;
}

async function listJobs(filter: JobListFilter): Promise<CmsJobRecord[]> {
  recoverExpiredJobs();
  const statuses = filter.statuses ? new Set(filter.statuses) : null;
  return [...state().jobs.values()]
    .filter((job) => !filter.siteId || job.siteId === filter.siteId)
    .filter((job) => !filter.pageId || job.pageId === filter.pageId)
    .filter((job) => !statuses || statuses.has(job.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.min(Math.max(filter.limit || 50, 1), 100))
    .map(copy);
}

async function claimNext(workerId: string, kinds: CmsJobKind[], leaseSeconds: number): Promise<ClaimedJob | null> {
  recoverExpiredJobs();
  const now = new Date();
  const nowIso = now.toISOString();
  const kindSet = new Set(kinds);
  const job = [...state().jobs.values()]
    .filter(
      (candidate) =>
        candidate.status === "queued" &&
        kindSet.has(candidate.kind) &&
        candidate.availableAt <= nowIso &&
        candidate.deadlineAt > nowIso &&
        candidate.attempts < candidate.maxAttempts
    )
    .sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt))[0];
  if (!job) return null;

  const leaseToken = randomBytes(32).toString("base64url");
  const claimId = `claim_${nanoid(16)}`;
  job.status = "leased";
  job.attempts += 1;
  job.workerId = workerId;
  job.claimId = claimId;
  job.leaseTokenHash = leaseTokenHash(leaseToken);
  job.heartbeatAt = nowIso;
  job.leaseExpiresAt = new Date(Math.min(now.getTime() + leaseSeconds * 1000, Date.parse(job.deadlineAt))).toISOString();
  job.updatedAt = nowIso;
  return { job: copy(job), claimId, leaseToken };
}

async function getActiveLease(credentials: LeaseCredentials): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(credentials.jobId);
  const nowIso = new Date().toISOString();
  return job && hasLease(job, credentials, nowIso) ? copy(job) : null;
}

async function heartbeat(credentials: LeaseCredentials, leaseSeconds: number): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(credentials.jobId);
  const now = new Date();
  const nowIso = now.toISOString();
  if (!job || !hasLease(job, credentials, nowIso)) return null;
  job.heartbeatAt = nowIso;
  job.leaseExpiresAt = new Date(Math.min(now.getTime() + leaseSeconds * 1000, Date.parse(job.deadlineAt))).toISOString();
  job.updatedAt = nowIso;
  return copy(job);
}

async function complete(credentials: LeaseCredentials, result: CmsJobResult): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(credentials.jobId);
  const nowIso = new Date().toISOString();
  if (!job || !hasLease(job, credentials, nowIso)) return null;
  job.status = "completed";
  job.result = copy(result);
  job.completedAt = nowIso;
  job.updatedAt = nowIso;
  delete job.error;
  clearLease(job);
  return copy(job);
}

async function fail(credentials: LeaseCredentials, error: JobError): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(credentials.jobId);
  const now = new Date();
  const nowIso = now.toISOString();
  if (!job || !hasLease(job, credentials, nowIso)) return null;
  const retry = error.retryable && job.attempts < job.maxAttempts && job.deadlineAt > nowIso;
  job.status = retry ? "queued" : "failed";
  job.error = copy(error);
  job.updatedAt = nowIso;
  if (retry) {
    const backoffMs = Math.min(2 ** Math.max(job.attempts - 1, 0) * 5_000, 60_000);
    job.availableAt = new Date(Math.min(now.getTime() + backoffMs, Date.parse(job.deadlineAt))).toISOString();
  }
  clearLease(job);
  return copy(job);
}

async function cancel(jobId: string): Promise<CmsJobRecord | null> {
  recoverExpiredJobs();
  const job = state().jobs.get(jobId);
  if (!job || !["queued", "leased", "completed"].includes(job.status)) return null;
  const nowIso = new Date().toISOString();
  job.status = "cancelled";
  job.cancelledAt = nowIso;
  job.updatedAt = nowIso;
  clearLease(job);
  return copy(job);
}

async function beginApply(jobId: string, applyClaimId: string): Promise<CmsJobRecord | null> {
  const job = state().jobs.get(jobId);
  if (!job || job.status !== "completed" || !job.result || job.kind === "publish") return null;
  const nowIso = new Date().toISOString();
  job.status = "applying";
  job.applyingAt = nowIso;
  job.applyClaimId = applyClaimId;
  job.updatedAt = nowIso;
  return copy(job);
}

async function finishApply(jobId: string, applyClaimId: string, outcome: ApplyOutcome): Promise<CmsJobRecord | null> {
  const job = state().jobs.get(jobId);
  if (!job || job.status !== "applying" || job.applyClaimId !== applyClaimId) return null;
  job.status = outcome.status === "applied" ? "applied" : "apply_failed";
  job.applyOutcome = copy(outcome);
  job.updatedAt = outcome.at;
  delete job.applyClaimId;
  return copy(job);
}

async function consumeNonce(nonce: string, expiresAt: Date): Promise<boolean> {
  const queue = state();
  const now = Date.now();
  for (const [key, expiry] of queue.nonces) if (expiry <= now) queue.nonces.delete(key);
  if (queue.nonces.has(nonce)) return false;
  queue.nonces.set(nonce, expiresAt.getTime());
  return true;
}

async function recordWorker(worker: WorkerRecord): Promise<void> {
  if (worker.namespace !== cmsJobNamespace()) throw new Error("Worker namespace mismatch");
  state().workers.set(worker.workerId, copy(worker));
}

async function listWorkers(): Promise<WorkerRecord[]> {
  return [...state().workers.values()].sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)).map(copy);
}

export const memoryJobStore: JobQueueStore = {
  createJob,
  getJob,
  listJobs,
  claimNext,
  getActiveLease,
  heartbeat,
  complete,
  fail,
  cancel,
  beginApply,
  finishApply,
  consumeNonce,
  recordWorker,
  listWorkers,
};
