#!/usr/bin/env node

import { rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CmsWorkerApi } from "./lib/api-client.mjs";
import {
  QUEUE_CAPABILITIES,
  WORKER_VERSION,
} from "./lib/constants.mjs";
import { loadConfig } from "./lib/config.mjs";
import { normalizeJob } from "./lib/contracts.mjs";
import { runCodexJob } from "./lib/codex-runner.mjs";
import {
  asWorkerError,
  publicFailure,
  WorkerError,
} from "./lib/errors.mjs";
import { ensureOwnedRoot } from "./lib/fs-safety.mjs";
import { publishManagedSnapshot } from "./lib/publisher.mjs";
import { sleep } from "./lib/process.mjs";

const LEASE_SECONDS = 120;
const MAX_RESULT_BODY_BYTES = 56 * 1024;
const startedAt = new Date().toISOString();

export async function runWorker(config, options = {}) {
  const api = new CmsWorkerApi(config);
  const rootController = new AbortController();
  const onSignal = () => rootController.abort("worker shutdown");
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  await ensureOwnedRoot(config.dataDir);

  let currentJobId = null;
  let consecutiveFailures = 0;
  let nextHealthAt = 0;
  await writeStatus(config, "starting", null);
  safeLog("Local CMS worker starting.");

  try {
    while (!rootController.signal.aborted) {
      try {
        if (Date.now() >= nextHealthAt) {
          await api.health(
            healthBody(currentJobId ? "working" : "idle", currentJobId),
            { signal: rootController.signal },
          );
          nextHealthAt = Date.now() + config.workerHeartbeatMs;
        }

        const claimed = await api.claim(
          {
            capabilities: QUEUE_CAPABILITIES,
            leaseSeconds: LEASE_SECONDS,
            version: WORKER_VERSION,
          },
          { signal: rootController.signal },
        );
        consecutiveFailures = 0;

        if (!claimed?.job) {
          await writeStatus(config, "idle", null);
          if (options.once) return { processed: false };
          const serverDelay = Number(claimed?.pollAfterMs);
          const delay = Number.isFinite(serverDelay)
            ? Math.min(Math.max(serverDelay, 1_000), 60_000)
            : config.pollIntervalMs;
          await sleep(delay, rootController.signal);
          continue;
        }

        const lease = normalizeLease(claimed);
        currentJobId = lease.jobId;
        await writeStatus(config, "working", currentJobId);
        await processClaimedJob(claimed.job, lease, config, api, rootController.signal);
        currentJobId = null;
        nextHealthAt = 0;
        await writeStatus(config, "idle", null);
        if (options.once) return { processed: true };
      } catch (error) {
        if (rootController.signal.aborted) break;
        const safe = asWorkerError(error);
        consecutiveFailures += 1;
        await writeStatus(config, "degraded", currentJobId, safe.code);
        safeLog(`Queue cycle failed (${safe.code}).`);
        if (!safe.retryable) throw safe;
        const backoff = Math.min(30_000, 1_000 * 2 ** Math.min(consecutiveFailures, 5));
        const jitter = Math.floor(Math.random() * 500);
        await sleep(backoff + jitter, rootController.signal);
      }
    }
    await writeStatus(config, "stopped", currentJobId);
    return { processed: false, stopped: true };
  } finally {
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
  }
}

async function processClaimedJob(rawJob, lease, config, api, rootSignal) {
  let job;
  try {
    job = normalizeJob(rawJob);
    if (job.id !== lease.jobId) throw new WorkerError("job_invalid", "Lease job id mismatch.");
  } catch (error) {
    await reportFailure(api, lease, error);
    return;
  }

  safeLog(`Claimed ${job.kind} job ${job.id}.`);
  const jobController = new AbortController();
  const onRootAbort = () => jobController.abort("worker shutdown");
  rootSignal.addEventListener("abort", onRootAbort, { once: true });
  let heartbeatError = null;
  const heartbeat = runJobHeartbeat(api, lease, config, jobController).catch((error) => {
    heartbeatError = asWorkerError(error);
    jobController.abort("lease lost");
  });

  try {
    let result;
    if (job.capability === "git.publish.v1") {
      result = await publishManagedSnapshot(job, config, jobController.signal);
    } else {
      result = await runCodexJob(job, config, jobController.signal);
    }
    if (heartbeatError) throw heartbeatError;
    assertResultSize(lease, result);
    jobController.abort("job completed");
    await heartbeat;
    await retryFinalRequest(
      () => api.complete({ ...lease, result }),
      "complete",
    );
    safeLog(`Completed ${job.kind} job ${job.id}.`);
  } catch (error) {
    jobController.abort("job failed");
    await heartbeat.catch(() => {});
    const safe = heartbeatError || asWorkerError(error);
    if (safe.code === "lease_lost") {
      safeLog(`Stopped ${job.kind} job ${job.id}; its lease is no longer active.`);
      return;
    }
    const failure = rootSignal.aborted
      ? new WorkerError("worker_shutdown", "Worker stopped during the job.", {
          retryable: true,
        })
      : safe;
    try {
      await reportFailure(api, lease, failure);
    } catch (reportError) {
      const reportSafe = asWorkerError(reportError);
      safeLog(`Could not report ${job.kind} job ${job.id} failure (${reportSafe.code}).`);
    }
    safeLog(`Failed ${job.kind} job ${job.id} (${failure.code}).`);
  } finally {
    rootSignal.removeEventListener("abort", onRootAbort);
  }
}

async function runJobHeartbeat(api, lease, config, controller) {
  let failures = 0;
  while (!controller.signal.aborted) {
    try {
      await sleep(config.jobHeartbeatMs, controller.signal);
      if (controller.signal.aborted) return;
      await api.jobHeartbeat(
        {
          ...lease,
          leaseSeconds: LEASE_SECONDS,
          version: WORKER_VERSION,
          message: "Processing locally",
        },
        { signal: controller.signal },
      );
      failures = 0;
    } catch (error) {
      if (controller.signal.aborted) return;
      const safe = asWorkerError(error);
      failures += 1;
      if (safe.code === "lease_lost" || failures >= 3) {
        controller.abort("lease lost");
        throw new WorkerError("lease_lost", "Job heartbeat could not renew the lease.");
      }
    }
  }
}

async function reportFailure(api, lease, error) {
  const failure = publicFailure(error);
  return await retryFinalRequest(
    () =>
      api.fail({
        ...lease,
        error: { code: failure.code, message: failure.message },
        retryable: failure.retryable,
      }),
    "fail",
  );
}

async function retryFinalRequest(request, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const safe = asWorkerError(error);
      if (safe.code === "lease_lost") throw safe;
      lastError = safe;
      if (!safe.retryable || attempt === 3) break;
      await sleep(300 * attempt);
    }
  }
  throw new WorkerError("request_failed", `Could not ${label} the job after retries.`, {
    cause: lastError,
    retryable: true,
  });
}

function normalizeLease(claimed) {
  const jobId = String(claimed?.job?.id || "");
  const claimId = String(claimed?.lease?.claimId || "");
  const leaseToken = String(claimed?.lease?.leaseToken || "");
  if (
    !/^[A-Za-z0-9][A-Za-z0-9_-]{4,95}$/.test(jobId) ||
    !/^[A-Za-z0-9][A-Za-z0-9_-]{7,95}$/.test(claimId) ||
    !/^[A-Za-z0-9_-]{32,128}$/.test(leaseToken)
  ) {
    throw new WorkerError("job_invalid", "Claim response contained invalid lease credentials.");
  }
  return Object.freeze({ jobId, claimId, leaseToken });
}

function assertResultSize(lease, result) {
  const bytes = Buffer.byteLength(JSON.stringify({ ...lease, result }), "utf8");
  if (bytes > MAX_RESULT_BODY_BYTES) {
    throw new WorkerError("codex_output_invalid", "Structured result exceeds the queue body limit.", {
      retryable: false,
    });
  }
}

function healthBody(status, currentJobId) {
  const body = {
    status,
    version: WORKER_VERSION,
    capabilities: QUEUE_CAPABILITIES,
    startedAt,
    message: status === "degraded" ? "Needs operator attention" : "Ready",
  };
  if (currentJobId) body.currentJobId = currentJobId;
  return body;
}

async function writeStatus(config, state, currentJobId, code) {
  const statusPath = path.join(config.dataDir, "status.json");
  const temporaryPath = path.join(config.dataDir, "status.next.json");
  const value = {
    workerId: config.workerId,
    state,
    version: WORKER_VERSION,
    currentJobId: currentJobId || null,
    code: code || null,
    startedAt,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  try {
    await rename(temporaryPath, statusPath);
  } catch {
    // Windows cannot atomically replace an existing file in every configuration.
    await writeFile(statusPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }
}

function safeLog(message) {
  process.stdout.write(`[${new Date().toISOString()}] ${message}\n`);
}

function parseArgs(argv) {
  let configPath;
  let once = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--config") {
      configPath = argv[index + 1];
      index += 1;
    } else if (arg === "--once") {
      once = true;
    } else if (arg === "--help" || arg === "-h") {
      return { help: true };
    } else {
      throw new WorkerError("config_invalid", `Unknown worker argument: ${arg}`);
    }
  }
  if (!configPath) {
    const local = process.env.LOCALAPPDATA;
    if (!local) throw new WorkerError("config_invalid", "--config is required.");
    configPath = path.join(local, "RapidStudios", "cms-worker", "config.json");
  }
  return { configPath, once };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      "Usage: node scripts/cms-worker/worker.mjs [--config <absolute-path>] [--once]\n",
    );
    return;
  }
  const config = await loadConfig(args.configPath);
  await runWorker(config, { once: args.once });
}

const isEntrypoint = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isEntrypoint) {
  main().catch((error) => {
    const safe = asWorkerError(error);
    process.stderr.write(`Rapid Studios CMS worker stopped (${safe.code}): ${safe.publicMessage}\n`);
    process.exitCode = 1;
  });
}
