import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_ENDPOINTS, PINNED_ORIGIN } from "./constants.mjs";
import { WorkerError } from "./errors.mjs";

const MAX_CONFIG_BYTES = 64 * 1024;
const MIN_SECRET_BYTES = 32;
const MAX_SECRET_BYTES = 512;
const ENDPOINT_RE = /^\/api\/cms\/worker\/[A-Za-z0-9_{}\/-]*$/;

export async function loadConfig(configPath) {
  const absoluteConfigPath = path.resolve(configPath);
  const configText = await readBoundedRegularFile(absoluteConfigPath, MAX_CONFIG_BYTES);
  let raw;
  try {
    raw = JSON.parse(configText);
  } catch (error) {
    throw new WorkerError("config_invalid", "Worker config is not valid JSON.", {
      cause: error,
    });
  }
  requireObject(raw, "config");

  const workerId = requireString(raw.workerId, "workerId", 3, 80);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]+$/.test(workerId)) {
    invalid("workerId may contain only letters, digits, dots, underscores, and hyphens.");
  }

  const baseUrl = raw.baseUrl || PINNED_ORIGIN;
  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    invalid("baseUrl must be an absolute URL.");
  }
  if (baseUrl !== origin || origin !== PINNED_ORIGIN) {
    invalid(`baseUrl is pinned to ${PINNED_ORIGIN}.`);
  }

  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData || !path.isAbsolute(localAppData)) {
    invalid("LOCALAPPDATA is required for the Windows worker.");
  }
  const allowedDataRoot = path.resolve(localAppData, "RapidStudios", "cms-worker");
  const dataDir = path.resolve(raw.dataDir || allowedDataRoot);
  if (dataDir !== allowedDataRoot && !isInside(allowedDataRoot, dataDir)) {
    invalid("dataDir must stay inside LOCALAPPDATA\\RapidStudios\\cms-worker.");
  }

  const secretEnv = raw.secretEnv || "RAPIDSTUDIOS_CMS_WORKER_SECRET";
  if (!/^[A-Z][A-Z0-9_]{2,80}$/.test(secretEnv)) {
    invalid("secretEnv must be an uppercase environment-variable name.");
  }
  let secret = process.env[secretEnv]?.trim();
  let secretFile = null;
  if (!secret) {
    secretFile = path.resolve(
      raw.secretFile || path.join(dataDir, "worker-secret.txt"),
    );
    if (secretFile !== dataDir && !isInside(dataDir, secretFile)) {
      invalid("secretFile must stay inside the configured dataDir.");
    }
    secret = (await readBoundedRegularFile(secretFile, MAX_SECRET_BYTES)).trim();
  }
  const secretBytes = Buffer.byteLength(secret || "", "utf8");
  if (secretBytes < MIN_SECRET_BYTES || secretBytes > MAX_SECRET_BYTES) {
    throw new WorkerError(
      "secret_invalid",
      `The HMAC secret must contain ${MIN_SECRET_BYTES}-${MAX_SECRET_BYTES} UTF-8 bytes.`,
    );
  }

  const codexExecutable = await requireExecutable(
    raw.codexExecutable ||
      "C:\\Users\\Jaxon\\.codex\\plugins\\.plugin-appserver\\codex.exe",
    "codexExecutable",
  );

  const publishRaw = requireObject(raw.publish, "publish");
  const publish = Object.freeze({
    gitExecutable: await requireExecutable(
      publishRaw.gitExecutable,
      "publish.gitExecutable",
    ),
    githubCliExecutable: await requireExecutable(
      publishRaw.githubCliExecutable,
      "publish.githubCliExecutable",
    ),
    npmExecutable: await requireExecutable(
      publishRaw.npmExecutable,
      "publish.npmExecutable",
    ),
  });

  const endpoints = validateEndpoints(raw.endpoints || {});
  const config = {
    configPath: absoluteConfigPath,
    workerId,
    baseUrl: origin,
    dataDir,
    secret,
    secretFile,
    codexExecutable,
    publish,
    endpoints,
    pollIntervalMs: boundedInteger(raw.pollIntervalMs, 5_000, 1_000, 60_000),
    workerHeartbeatMs: boundedInteger(
      raw.workerHeartbeatMs,
      30_000,
      5_000,
      5 * 60_000,
    ),
    jobHeartbeatMs: boundedInteger(
      raw.jobHeartbeatMs,
      15_000,
      3_000,
      60_000,
    ),
    requestTimeoutMs: boundedInteger(
      raw.requestTimeoutMs,
      30_000,
      3_000,
      2 * 60_000,
    ),
    codexTimeoutMs: boundedInteger(
      raw.codexTimeoutMs,
      10 * 60_000,
      30_000,
      30 * 60_000,
    ),
    publishTimeoutMs: boundedInteger(
      raw.publishTimeoutMs,
      20 * 60_000,
      60_000,
      45 * 60_000,
    ),
  };

  return Object.freeze(config);
}

function validateEndpoints(overrides) {
  requireObject(overrides, "endpoints");
  const unknown = Object.keys(overrides).filter((key) => !(key in DEFAULT_ENDPOINTS));
  if (unknown.length) invalid(`Unknown endpoint keys: ${unknown.join(", ")}.`);
  const endpoints = {};
  for (const [key, fallback] of Object.entries(DEFAULT_ENDPOINTS)) {
    const value = overrides[key] || fallback;
    if (typeof value !== "string" || !ENDPOINT_RE.test(value) || value.includes("..")) {
      invalid(`Endpoint ${key} must remain beneath /api/cms/worker/.`);
    }
    if (value.includes("{jobId}")) invalid(`Endpoint ${key} cannot contain placeholders.`);
    endpoints[key] = value;
  }
  return Object.freeze(endpoints);
}

async function requireExecutable(value, label) {
  const candidate = requireString(value, label, 3, 2048);
  if (!path.isAbsolute(candidate)) invalid(`${label} must be an absolute path.`);
  const resolved = path.resolve(candidate);
  const stats = await lstat(resolved).catch(() => null);
  if (!stats?.isFile() || stats.isSymbolicLink()) {
    invalid(`${label} must point to an existing, non-symlink file.`);
  }
  return resolved;
}

async function readBoundedRegularFile(filePath, maxBytes) {
  const stats = await lstat(filePath).catch(() => null);
  if (!stats?.isFile() || stats.isSymbolicLink() || stats.size > maxBytes) {
    invalid("A required local worker file is missing, too large, or not a regular file.");
  }
  // Resolve after lstat so an attacker cannot smuggle a symlink as a config/secret.
  await realpath(filePath);
  return await readFile(filePath, "utf8");
}

function boundedInteger(value, fallback, min, max) {
  const n = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) {
    invalid(`Numeric configuration must be an integer between ${min} and ${max}.`);
  }
  return n;
}

function requireString(value, label, min, max) {
  if (typeof value !== "string") invalid(`${label} must be a string.`);
  const result = value.trim();
  if (result.length < min || result.length > max) {
    invalid(`${label} must contain ${min}-${max} characters.`);
  }
  return result;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${label} must be an object.`);
  }
  return value;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function invalid(message) {
  throw new WorkerError("config_invalid", message, { retryable: false });
}
