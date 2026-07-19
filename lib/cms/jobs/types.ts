import type { ThemePatch, ThemeTokens } from "../design/tokens";
import type { ContentMap, ProposedChange } from "../types";
import type { ManagedHomepageSnapshot } from "@/lib/content/managed-site";

export const JOB_KINDS = ["content", "theme", "publish"] as const;
export type CmsJobKind = (typeof JOB_KINDS)[number];

export type CmsJobStatus =
  | "queued"
  | "leased"
  | "completed"
  | "failed"
  | "cancelled"
  | "applying"
  | "applied"
  | "apply_failed";

export interface ContentJobInput {
  kind: "content";
  instruction: string;
  contentMap: ContentMap;
  templateId?: string;
}

export interface ThemeJobInput {
  kind: "theme";
  instruction: string;
  currentTheme: ThemeTokens;
  templateId?: string;
}

export interface PublishJobInput {
  kind: "publish";
  targetId: typeof PUBLISH_TARGET_ID;
  repository: typeof PUBLISH_REPOSITORY;
  snapshot: ManagedHomepageSnapshot;
}

export type CmsJobInput = ContentJobInput | ThemeJobInput | PublishJobInput;

export interface ContentJobResult {
  kind: "content";
  changes: ProposedChange[];
  summary: string;
  rationale?: string;
}

export interface ThemeJobResult {
  kind: "theme";
  patch: ThemePatch;
  summary: string;
  rationale?: string;
}

export interface PublishJobResult {
  kind: "publish";
  repository: typeof PUBLISH_REPOSITORY;
  branch: string;
  commitSha: string;
  prNumber: number;
  prUrl: string;
  previewUrl?: string;
  summary: string;
}

export type CmsJobResult = ContentJobResult | ThemeJobResult | PublishJobResult;

export interface JobError {
  code: string;
  message: string;
  at: string;
  retryable: boolean;
}

export interface ApplyOutcome {
  status: "applied" | "failed";
  at: string;
  snapshotId?: string;
  code?: string;
  message?: string;
}

export interface CmsJobRecord {
  namespace: string;
  id: string;
  kind: CmsJobKind;
  status: CmsJobStatus;
  siteId: string;
  pageId?: string;
  createdByRole: "owner" | "client";
  input: CmsJobInput;
  baseDigest: string;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  availableAt: string;
  deadlineAt: string;
  leaseExpiresAt?: string;
  heartbeatAt?: string;
  workerId?: string;
  claimId?: string;
  leaseTokenHash?: string;
  result?: CmsJobResult;
  error?: JobError;
  applyingAt?: string;
  applyClaimId?: string;
  applyOutcome?: ApplyOutcome;
  completedAt?: string;
  cancelledAt?: string;
}

export interface PublicCmsJob {
  id: string;
  kind: CmsJobKind;
  status: CmsJobStatus;
  siteId: string;
  pageId?: string;
  createdByRole: "owner" | "client";
  input: CmsJobInput;
  baseDigest: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  deadlineAt: string;
  completedAt?: string;
  cancelledAt?: string;
  result?: CmsJobResult;
  error?: JobError;
  applyOutcome?: ApplyOutcome;
}

export interface WorkerRecord {
  namespace: string;
  workerId: string;
  status: "idle" | "working" | "degraded";
  version?: string;
  capabilities: CmsJobKind[];
  currentJobId?: string;
  lastSeenAt: string;
  startedAt?: string;
  message?: string;
}

export interface PublicWorkerRecord {
  workerId: string;
  status: WorkerRecord["status"] | "offline";
  reportedStatus: WorkerRecord["status"];
  version?: string;
  capabilities: CmsJobKind[];
  currentJobId?: string;
  lastSeenAt: string;
  online: boolean;
  message?: string;
}

export interface LeaseCredentials {
  jobId: string;
  claimId: string;
  leaseToken: string;
  /** Bound by authenticated routes; never accepted from the request body. */
  workerId?: string;
}

export interface ClaimedJob {
  job: CmsJobRecord;
  claimId: string;
  leaseToken: string;
}

export interface JobListFilter {
  siteId?: string;
  pageId?: string;
  statuses?: CmsJobStatus[];
  limit?: number;
}

export interface JobQueueStore {
  createJob(job: CmsJobRecord): Promise<CmsJobRecord>;
  getJob(jobId: string): Promise<CmsJobRecord | null>;
  listJobs(filter: JobListFilter): Promise<CmsJobRecord[]>;
  claimNext(workerId: string, kinds: CmsJobKind[], leaseSeconds: number): Promise<ClaimedJob | null>;
  getActiveLease(credentials: LeaseCredentials): Promise<CmsJobRecord | null>;
  heartbeat(credentials: LeaseCredentials, leaseSeconds: number): Promise<CmsJobRecord | null>;
  complete(credentials: LeaseCredentials, result: CmsJobResult): Promise<CmsJobRecord | null>;
  fail(credentials: LeaseCredentials, error: JobError): Promise<CmsJobRecord | null>;
  cancel(jobId: string): Promise<CmsJobRecord | null>;
  beginApply(jobId: string, applyClaimId: string): Promise<CmsJobRecord | null>;
  finishApply(jobId: string, applyClaimId: string, outcome: ApplyOutcome): Promise<CmsJobRecord | null>;
  consumeNonce(nonce: string, expiresAt: Date): Promise<boolean>;
  recordWorker(worker: WorkerRecord): Promise<void>;
  listWorkers(): Promise<WorkerRecord[]>;
}

export const PUBLISH_REPOSITORY = "rapid-studios/rapidstudios-website" as const;
export const PUBLISH_BRANCH_PREFIX = "cms/" as const;
export const PUBLISH_TARGET_ID = "rapidstudios-homepage-v1" as const;

export const MAX_WORKER_BODY_BYTES = 64 * 1024;
export const DEFAULT_JOB_DEADLINE_MS = 30 * 60 * 1000;
export const PUBLISH_JOB_DEADLINE_MS = 60 * 60 * 1000;
export const DEFAULT_LEASE_SECONDS = 120;
export const MAX_LEASE_SECONDS = 300;
