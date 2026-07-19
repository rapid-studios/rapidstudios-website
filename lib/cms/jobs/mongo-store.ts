import { randomBytes } from "node:crypto";
import type { Collection, Filter, WithId } from "mongodb";
import { getCmsMongoDb } from "../store/mongo-client";
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

interface NonceDocument {
  namespace: string;
  nonce: string;
  expiresAt: Date;
}

const globalForJobCollections = globalThis as unknown as {
  __rapidCmsJobsCollection?: Promise<Collection<CmsJobRecord>>;
  __rapidCmsNoncesCollection?: Promise<Collection<NonceDocument>>;
  __rapidCmsWorkersCollection?: Promise<Collection<WorkerRecord>>;
};

async function jobsCollection(): Promise<Collection<CmsJobRecord>> {
  globalForJobCollections.__rapidCmsJobsCollection ??= (async () => {
    const db = await getCmsMongoDb();
    const collection = db.collection<CmsJobRecord>(process.env.MONGODB_JOBS_COLLECTION || "cms_jobs");
    await Promise.all([
      collection.createIndex({ namespace: 1, id: 1 }, { unique: true }),
      collection.createIndex({ namespace: 1, status: 1, priority: -1, availableAt: 1, createdAt: 1 }),
      collection.createIndex({ namespace: 1, siteId: 1, createdAt: -1 }),
      collection.createIndex({ namespace: 1, pageId: 1, createdAt: -1 }),
      collection.createIndex({ namespace: 1, leaseExpiresAt: 1 }),
    ]);
    return collection;
  })();
  return globalForJobCollections.__rapidCmsJobsCollection;
}

async function noncesCollection(): Promise<Collection<NonceDocument>> {
  globalForJobCollections.__rapidCmsNoncesCollection ??= (async () => {
    const db = await getCmsMongoDb();
    const collection = db.collection<NonceDocument>(process.env.MONGODB_WORKER_NONCES_COLLECTION || "cms_worker_nonces");
    await Promise.all([
      collection.createIndex({ namespace: 1, nonce: 1 }, { unique: true }),
      collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    return collection;
  })();
  return globalForJobCollections.__rapidCmsNoncesCollection;
}

async function workersCollection(): Promise<Collection<WorkerRecord>> {
  globalForJobCollections.__rapidCmsWorkersCollection ??= (async () => {
    const db = await getCmsMongoDb();
    const collection = db.collection<WorkerRecord>(process.env.MONGODB_WORKERS_COLLECTION || "cms_workers");
    await Promise.all([
      collection.createIndex({ namespace: 1, workerId: 1 }, { unique: true }),
      collection.createIndex({ namespace: 1, lastSeenAt: -1 }),
    ]);
    return collection;
  })();
  return globalForJobCollections.__rapidCmsWorkersCollection;
}

function clean<T extends { _id?: unknown }>(document: T | null): Omit<T, "_id"> | null {
  if (!document) return null;
  const copy = { ...document };
  delete copy._id;
  return copy;
}

const CLEAR_LEASE = {
  leaseExpiresAt: "",
  heartbeatAt: "",
  workerId: "",
  claimId: "",
  leaseTokenHash: "",
} as const;

async function recoverExpiredJobs(now = new Date()): Promise<void> {
  const collection = await jobsCollection();
  const namespace = cmsJobNamespace();
  const nowIso = now.toISOString();

  await collection.updateMany(
    {
      namespace,
      status: "leased",
      leaseExpiresAt: { $lte: nowIso },
      $or: [{ deadlineAt: { $lte: nowIso } }, { $expr: { $gte: ["$attempts", "$maxAttempts"] } }],
    },
    {
      $set: {
        status: "failed",
        updatedAt: nowIso,
        error: { code: "lease_expired", message: "Worker lease expired and no attempts remain", at: nowIso, retryable: false },
      },
      $unset: CLEAR_LEASE,
    }
  );

  await collection.updateMany(
    {
      namespace,
      status: "leased",
      leaseExpiresAt: { $lte: nowIso },
      deadlineAt: { $gt: nowIso },
      $expr: { $lt: ["$attempts", "$maxAttempts"] },
    },
    {
      $set: {
        status: "queued",
        updatedAt: nowIso,
        availableAt: nowIso,
        error: { code: "lease_expired", message: "Worker lease expired; job returned to the queue", at: nowIso, retryable: true },
      },
      $unset: CLEAR_LEASE,
    }
  );

  await collection.updateMany(
    { namespace, status: "queued", deadlineAt: { $lte: nowIso } },
    {
      $set: {
        status: "failed",
        updatedAt: nowIso,
        error: { code: "deadline_exceeded", message: "Job deadline elapsed before it could be claimed", at: nowIso, retryable: false },
      },
    }
  );
}

async function createJob(job: CmsJobRecord): Promise<CmsJobRecord> {
  if (job.namespace !== cmsJobNamespace()) throw new Error("Job namespace mismatch");
  await (await jobsCollection()).insertOne({ ...job });
  return structuredClone(job);
}

async function getJob(jobId: string): Promise<CmsJobRecord | null> {
  await recoverExpiredJobs();
  const document = await (await jobsCollection()).findOne({ namespace: cmsJobNamespace(), id: jobId });
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function listJobs(filter: JobListFilter): Promise<CmsJobRecord[]> {
  await recoverExpiredJobs();
  const query: Filter<CmsJobRecord> = { namespace: cmsJobNamespace() };
  if (filter.siteId) query.siteId = filter.siteId;
  if (filter.pageId) query.pageId = filter.pageId;
  if (filter.statuses?.length) query.status = { $in: filter.statuses };
  const documents = await (await jobsCollection())
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(filter.limit || 50, 1), 100))
    .toArray();
  return documents.map((document) => clean(document as WithId<CmsJobRecord>) as CmsJobRecord);
}

async function claimNext(workerId: string, kinds: CmsJobKind[], leaseSeconds: number): Promise<ClaimedJob | null> {
  await recoverExpiredJobs();
  const collection = await jobsCollection();
  const now = new Date();
  const nowIso = now.toISOString();
  const claimId = `claim_${nanoid(16)}`;
  const leaseToken = randomBytes(32).toString("base64url");
  const tokenHash = leaseTokenHash(leaseToken);
  const requestedLeaseExpiry = new Date(now.getTime() + leaseSeconds * 1000).toISOString();

  const document = await collection.findOneAndUpdate(
    {
      namespace: cmsJobNamespace(),
      status: "queued",
      kind: { $in: kinds },
      availableAt: { $lte: nowIso },
      deadlineAt: { $gt: nowIso },
      $expr: { $lt: ["$attempts", "$maxAttempts"] },
    },
    [
      {
        $set: {
          status: "leased",
          workerId,
          claimId,
          leaseTokenHash: tokenHash,
          heartbeatAt: nowIso,
          leaseExpiresAt: { $cond: [{ $lt: ["$deadlineAt", requestedLeaseExpiry] }, "$deadlineAt", requestedLeaseExpiry] },
          updatedAt: nowIso,
          attempts: { $add: ["$attempts", 1] },
        },
      },
    ],
    { sort: { priority: -1, createdAt: 1, _id: 1 }, returnDocument: "after" }
  );
  const job = clean(document as (WithId<CmsJobRecord> & { _id?: unknown }) | null) as CmsJobRecord | null;
  return job ? { job, claimId, leaseToken } : null;
}

function leaseFilter(credentials: LeaseCredentials, nowIso: string): Filter<CmsJobRecord> {
  const filter: Filter<CmsJobRecord> = {
    namespace: cmsJobNamespace(),
    id: credentials.jobId,
    status: "leased",
    claimId: credentials.claimId,
    leaseTokenHash: leaseTokenHash(credentials.leaseToken),
    leaseExpiresAt: { $gt: nowIso },
  };
  if (credentials.workerId) filter.workerId = credentials.workerId;
  return filter;
}

async function getActiveLease(credentials: LeaseCredentials): Promise<CmsJobRecord | null> {
  await recoverExpiredJobs();
  const nowIso = new Date().toISOString();
  const document = await (await jobsCollection()).findOne(leaseFilter(credentials, nowIso));
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function heartbeat(credentials: LeaseCredentials, leaseSeconds: number): Promise<CmsJobRecord | null> {
  await recoverExpiredJobs();
  const now = new Date();
  const nowIso = now.toISOString();
  const active = await (await jobsCollection()).findOne(leaseFilter(credentials, nowIso), { projection: { deadlineAt: 1 } });
  if (!active) return null;
  const leaseExpiresAt = new Date(Math.min(now.getTime() + leaseSeconds * 1000, Date.parse(active.deadlineAt))).toISOString();
  const document = await (await jobsCollection()).findOneAndUpdate(
    leaseFilter(credentials, nowIso),
    { $set: { heartbeatAt: nowIso, leaseExpiresAt, updatedAt: nowIso } },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function complete(credentials: LeaseCredentials, result: CmsJobResult): Promise<CmsJobRecord | null> {
  await recoverExpiredJobs();
  const nowIso = new Date().toISOString();
  const document = await (await jobsCollection()).findOneAndUpdate(
    leaseFilter(credentials, nowIso),
    {
      $set: { status: "completed", result, completedAt: nowIso, updatedAt: nowIso },
      $unset: { ...CLEAR_LEASE, error: "" },
    },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function fail(credentials: LeaseCredentials, error: JobError): Promise<CmsJobRecord | null> {
  await recoverExpiredJobs();
  const now = new Date();
  const nowIso = now.toISOString();
  const active = await (await jobsCollection()).findOne(leaseFilter(credentials, nowIso));
  if (!active) return null;
  const retry = error.retryable && active.attempts < active.maxAttempts && active.deadlineAt > nowIso;
  const status = retry ? "queued" : "failed";
  const backoffMs = Math.min(2 ** Math.max(active.attempts - 1, 0) * 5_000, 60_000);
  const availableAt = new Date(Math.min(now.getTime() + backoffMs, Date.parse(active.deadlineAt))).toISOString();
  const document = await (await jobsCollection()).findOneAndUpdate(
    leaseFilter(credentials, nowIso),
    {
      $set: { status, error, updatedAt: nowIso, ...(retry ? { availableAt } : {}) },
      $unset: CLEAR_LEASE,
    },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function cancel(jobId: string): Promise<CmsJobRecord | null> {
  const nowIso = new Date().toISOString();
  const document = await (await jobsCollection()).findOneAndUpdate(
    { namespace: cmsJobNamespace(), id: jobId, status: { $in: ["queued", "leased", "completed"] } },
    { $set: { status: "cancelled", cancelledAt: nowIso, updatedAt: nowIso }, $unset: CLEAR_LEASE },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function beginApply(jobId: string, applyClaimId: string): Promise<CmsJobRecord | null> {
  const nowIso = new Date().toISOString();
  const document = await (await jobsCollection()).findOneAndUpdate(
    { namespace: cmsJobNamespace(), id: jobId, status: "completed", kind: { $in: ["content", "theme"] }, result: { $exists: true } },
    { $set: { status: "applying", applyingAt: nowIso, applyClaimId, updatedAt: nowIso } },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function finishApply(jobId: string, applyClaimId: string, outcome: ApplyOutcome): Promise<CmsJobRecord | null> {
  const status = outcome.status === "applied" ? "applied" : "apply_failed";
  const document = await (await jobsCollection()).findOneAndUpdate(
    { namespace: cmsJobNamespace(), id: jobId, status: "applying", applyClaimId },
    { $set: { status, applyOutcome: outcome, updatedAt: outcome.at }, $unset: { applyClaimId: "" } },
    { returnDocument: "after" }
  );
  return clean(document as WithId<CmsJobRecord> | null) as CmsJobRecord | null;
}

async function consumeNonce(nonce: string, expiresAt: Date): Promise<boolean> {
  try {
    await (await noncesCollection()).insertOne({ namespace: cmsJobNamespace(), nonce, expiresAt });
    return true;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return false;
    throw error;
  }
}

async function recordWorker(worker: WorkerRecord): Promise<void> {
  if (worker.namespace !== cmsJobNamespace()) throw new Error("Worker namespace mismatch");
  await (await workersCollection()).replaceOne(
    { namespace: cmsJobNamespace(), workerId: worker.workerId },
    worker,
    { upsert: true }
  );
}

async function listWorkers(): Promise<WorkerRecord[]> {
  const documents = await (await workersCollection()).find({ namespace: cmsJobNamespace() }).sort({ lastSeenAt: -1 }).toArray();
  return documents.map((document) => clean(document as WithId<WorkerRecord>) as WorkerRecord);
}

export const mongoJobStore: JobQueueStore = {
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
