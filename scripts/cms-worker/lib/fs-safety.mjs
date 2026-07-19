import { lstat, mkdir, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { WorkerError } from "./errors.mjs";

export async function ensureOwnedRoot(root) {
  const resolved = path.resolve(root);
  const parsed = path.parse(resolved);
  if (resolved === parsed.root) {
    throw new WorkerError("config_invalid", "Worker data root cannot be a filesystem root.");
  }
  await mkdir(resolved, { recursive: true, mode: 0o700 });
  const stats = await lstat(resolved);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new WorkerError("config_invalid", "Worker data root must be a regular directory.");
  }
  await realpath(resolved);
  return resolved;
}

export function assertInside(root, candidate) {
  const base = path.resolve(root);
  const target = path.resolve(candidate);
  const relative = path.relative(base, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new WorkerError("config_invalid", "A worker path escaped its owned directory.");
  }
  return target;
}

export async function safeRemoveOwnedDirectory(root, candidate, prefix) {
  const target = assertInside(root, candidate);
  if (!path.basename(target).startsWith(prefix)) {
    throw new WorkerError("config_invalid", "Refusing to remove an unexpected worker directory.");
  }
  const stats = await lstat(target).catch(() => null);
  if (!stats) return;
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new WorkerError("config_invalid", "Refusing to remove a non-directory worker path.");
  }
  await rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

export async function assertPathComponentsNotSymlinks(root, target) {
  const absoluteRoot = path.resolve(root);
  const absoluteTarget = assertInside(absoluteRoot, target);
  const relativeParts = path.relative(absoluteRoot, absoluteTarget).split(path.sep);
  let cursor = absoluteRoot;
  for (const part of relativeParts.slice(0, -1)) {
    cursor = path.join(cursor, part);
    const stats = await lstat(cursor).catch(() => null);
    if (stats?.isSymbolicLink()) {
      throw new WorkerError("publish_failed", "A managed path contains a symlink.");
    }
  }
  return absoluteTarget;
}
