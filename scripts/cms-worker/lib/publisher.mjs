import { lstat, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GITHUB_BASE_BRANCH,
  GITHUB_LOGIN,
  GITHUB_REPOSITORY,
  GITHUB_REPOSITORY_URL,
  PUBLISH_TARGETS,
} from "./constants.mjs";
import { stableJson } from "./contracts.mjs";
import { WorkerError } from "./errors.mjs";
import {
  assertPathComponentsNotSymlinks,
  ensureOwnedRoot,
  safeRemoveOwnedDirectory,
} from "./fs-safety.mjs";
import { runProcess, sanitizedChildEnv } from "./process.mjs";

export async function publishManagedSnapshot(job, config, signal) {
  const publishRoot = await ensureOwnedRoot(path.join(config.dataDir, "publish"));
  const jobDir = await mkdtemp(path.join(publishRoot, "job-"));
  const cloneDir = path.join(jobDir, "repo");
  const emptyHooksDir = path.join(jobDir, "empty-hooks");
  await mkdir(emptyHooksDir);
  const deadline = Date.now() + config.publishTimeoutMs;
  const branch = publicationBranch(job.id);
  const targetPath = PUBLISH_TARGETS[job.input.targetId];
  const expectedBytes = stableJson(job.input.snapshot);

  try {
    const account = await verifyGithubAccount(config, jobDir, signal, deadline);
    const remote = await remoteBranch(config, branch, jobDir, signal, deadline);
    if (remote) {
      return await recoverExistingPublication({
        job,
        config,
        signal,
        deadline,
        cloneDir,
        emptyHooksDir,
        branch,
        targetPath,
        expectedBytes,
        expectedSha: remote,
      });
    }

    await cloneBranch(config, cloneDir, emptyHooksDir, GITHUB_BASE_BRANCH, signal, deadline);
    await verifyClone(config, cloneDir, GITHUB_BASE_BRANCH, signal, deadline);
    await git(config, cloneDir, ["config", "core.hooksPath", emptyHooksDir], signal, deadline);
    await git(config, cloneDir, ["checkout", "-b", branch], signal, deadline);

    const absoluteTarget = await checkedManagedTarget(cloneDir, targetPath);
    await writeFile(absoluteTarget, expectedBytes, { encoding: "utf8", flag: "w" });
    await validatePublication(config, cloneDir, targetPath, signal, deadline);

    await git(config, cloneDir, ["config", "user.name", GITHUB_LOGIN], signal, deadline);
    await git(
      config,
      cloneDir,
      ["config", "user.email", `${account.id}+${GITHUB_LOGIN}@users.noreply.github.com`],
      signal,
      deadline,
    );
    await git(config, cloneDir, ["add", "--", targetPath], signal, deadline);
    await git(
      config,
      cloneDir,
      ["commit", "-m", `CMS: publish Rapid Studios homepage (${job.id})`],
      signal,
      deadline,
    );
    const commitSha = (
      await git(config, cloneDir, ["rev-parse", "HEAD"], signal, deadline)
    ).stdout.trim().toLowerCase();
    requireSha(commitSha);
    await assertCommittedFiles(config, cloneDir, targetPath, signal, deadline);

    // No force option is ever used. A collision safely fails at the remote.
    await git(
      config,
      cloneDir,
      ["push", "--set-upstream", "origin", `HEAD:refs/heads/${branch}`],
      signal,
      deadline,
    );
    const pr = await ensurePullRequest(config, cloneDir, job, branch, commitSha, signal, deadline);
    return publishResult(branch, commitSha, pr);
  } finally {
    await safeRemoveOwnedDirectory(publishRoot, jobDir, "job-");
  }
}

async function recoverExistingPublication(context) {
  const {
    job,
    config,
    signal,
    deadline,
    cloneDir,
    emptyHooksDir,
    branch,
    targetPath,
    expectedBytes,
    expectedSha,
  } = context;
  await cloneBranch(config, cloneDir, emptyHooksDir, branch, signal, deadline);
  await verifyClone(config, cloneDir, branch, signal, deadline);
  await git(config, cloneDir, ["config", "core.hooksPath", emptyHooksDir], signal, deadline);
  await git(
    config,
    cloneDir,
    ["fetch", "--no-tags", "origin", `${GITHUB_BASE_BRANCH}:refs/remotes/origin/${GITHUB_BASE_BRANCH}`],
    signal,
    deadline,
  );
  const head = (
    await git(config, cloneDir, ["rev-parse", "HEAD"], signal, deadline)
  ).stdout.trim().toLowerCase();
  requireSha(head);
  if (head !== expectedSha) {
    throw new WorkerError("branch_exists", "Existing CMS branch changed during recovery.");
  }
  const absoluteTarget = await checkedManagedTarget(cloneDir, targetPath);
  const actualBytes = await readFile(absoluteTarget, "utf8");
  if (actualBytes !== expectedBytes) {
    throw new WorkerError("branch_exists", "Existing CMS branch does not contain this job snapshot.");
  }
  await assertRangeFiles(config, cloneDir, targetPath, signal, deadline);
  const pr = await ensurePullRequest(config, cloneDir, job, branch, head, signal, deadline);
  return publishResult(branch, head, pr);
}

async function verifyGithubAccount(config, cwd, signal, deadline) {
  const result = await gh(
    config,
    cwd,
    ["api", "user", "--jq", ".login + \":\" + (.id | tostring)"],
    signal,
    deadline,
  );
  const match = result.stdout.trim().match(/^([A-Za-z0-9-]+):(\d+)$/);
  if (!match || match[1].toLowerCase() !== GITHUB_LOGIN.toLowerCase()) {
    throw new WorkerError("github_auth_invalid", "GitHub CLI account is not chilooby.");
  }
  return { login: match[1], id: match[2] };
}

async function remoteBranch(config, branch, cwd, signal, deadline) {
  const result = await runProcess(
    config.publish.gitExecutable,
    ["ls-remote", "--exit-code", "--heads", GITHUB_REPOSITORY_URL, `refs/heads/${branch}`],
    commandOptions(cwd, signal, deadline, "publish_failed"),
  );
  if (result.code === 2) return null;
  if (result.code !== 0) {
    throw new WorkerError("publish_failed", "Could not check the publication branch.", {
      retryable: true,
    });
  }
  const match = result.stdout.trim().match(/^([a-f0-9]{40})\s+refs\/heads\//i);
  if (!match) throw new WorkerError("publish_failed", "Remote branch response was invalid.");
  return match[1].toLowerCase();
}

async function cloneBranch(config, cloneDir, emptyHooksDir, branch, signal, deadline) {
  const result = await runProcess(
    config.publish.gitExecutable,
    [
      "-c",
      `core.hooksPath=${emptyHooksDir}`,
      "clone",
      "--filter=blob:none",
      "--no-tags",
      "--single-branch",
      "--branch",
      branch,
      GITHUB_REPOSITORY_URL,
      cloneDir,
    ],
    commandOptions(path.dirname(cloneDir), signal, deadline, "publish_failed", 4 * 1024 * 1024),
  );
  if (result.code !== 0) {
    throw new WorkerError("publish_failed", "Could not create an isolated publication clone.", {
      retryable: true,
    });
  }
}

async function verifyClone(config, cloneDir, branch, signal, deadline) {
  const origin = (
    await git(config, cloneDir, ["remote", "get-url", "origin"], signal, deadline)
  ).stdout.trim();
  const current = (
    await git(config, cloneDir, ["branch", "--show-current"], signal, deadline)
  ).stdout.trim();
  if (origin !== GITHUB_REPOSITORY_URL || current !== branch) {
    throw new WorkerError("publish_failed", "Publication clone failed origin or branch verification.");
  }
}

async function checkedManagedTarget(cloneDir, targetPath) {
  const absolute = await assertPathComponentsNotSymlinks(
    cloneDir,
    path.resolve(cloneDir, ...targetPath.split("/")),
  );
  const stats = await lstat(absolute).catch(() => null);
  if (!stats?.isFile() || stats.isSymbolicLink()) {
    throw new WorkerError("publish_failed", "The fixed managed snapshot file is missing or unsafe.");
  }
  return absolute;
}

async function validatePublication(config, cloneDir, targetPath, signal, deadline) {
  await assertWorkingFiles(config, cloneDir, targetPath, signal, deadline);
  await git(config, cloneDir, ["diff", "--check", "--", targetPath], signal, deadline);

  await npm(
    config,
    cloneDir,
    ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
    signal,
    deadline,
  );
  await npm(config, cloneDir, ["run", "lint"], signal, deadline);
  const tests = await runProcess(
    process.execPath,
    ["--test", "scripts/cms/security-hardening.test.mjs"],
    commandOptions(cloneDir, signal, deadline, "publish_failed", 8 * 1024 * 1024),
  );
  if (tests.code !== 0) {
    throw new WorkerError("publish_failed", "CMS security tests failed before publication.", {
      retryable: false,
    });
  }
  await npm(config, cloneDir, ["run", "build"], signal, deadline);
  await assertWorkingFiles(config, cloneDir, targetPath, signal, deadline);
}

async function assertWorkingFiles(config, cloneDir, targetPath, signal, deadline) {
  const status = await git(
    config,
    cloneDir,
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    signal,
    deadline,
  );
  const records = status.stdout.split("\0").filter(Boolean);
  const files = records.map((record) => {
    if (record.length < 4 || record.slice(0, 2).includes("R") || record.slice(0, 2).includes("C")) {
      throw new WorkerError("publish_changed_files", "Publication contains an unsafe Git status.");
    }
    return normalizeGitPath(record.slice(3));
  });
  assertExactManagedFiles(files, targetPath);
}

async function assertCommittedFiles(config, cloneDir, targetPath, signal, deadline) {
  const diff = await git(
    config,
    cloneDir,
    ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "HEAD"],
    signal,
    deadline,
  );
  assertExactManagedFiles(diff.stdout.split("\0").filter(Boolean).map(normalizeGitPath), targetPath);
}

async function assertRangeFiles(config, cloneDir, targetPath, signal, deadline) {
  const diff = await git(
    config,
    cloneDir,
    ["diff", "--name-only", "-z", `origin/${GITHUB_BASE_BRANCH}...HEAD`, "--"],
    signal,
    deadline,
  );
  assertExactManagedFiles(diff.stdout.split("\0").filter(Boolean).map(normalizeGitPath), targetPath);
}

function assertExactManagedFiles(files, targetPath) {
  const unique = [...new Set(files)];
  if (unique.length !== 1 || unique[0] !== targetPath) {
    throw new WorkerError("publish_changed_files", "Only the fixed managed snapshot may change.");
  }
}

async function ensurePullRequest(config, cwd, job, branch, commitSha, signal, deadline) {
  let matches = await listPullRequests(config, cwd, branch, signal, deadline);
  if (matches.length === 0) {
    const bodyPath = path.join(cwd, ".git", "CMS_PR_BODY.md");
    await writeFile(
      bodyPath,
      [
        "## Managed CMS publication",
        "",
        `- Queue job: \`${job.id}\``,
        "- Target: Rapid Studios homepage managed snapshot",
        "- Validation: dependency install (scripts disabled), lint, CMS security tests, production build",
        "",
        "This worker never merges pull requests. Review the Vercel preview and merge manually.",
        "",
      ].join("\n"),
      "utf8",
    );
    await gh(
      config,
      cwd,
      [
        "pr",
        "create",
        "--repo",
        GITHUB_REPOSITORY,
        "--base",
        GITHUB_BASE_BRANCH,
        "--head",
        branch,
        "--title",
        `CMS: publish Rapid Studios homepage (${job.id})`,
        "--body-file",
        bodyPath,
      ],
      signal,
      deadline,
    );
    matches = await listPullRequests(config, cwd, branch, signal, deadline);
  }
  if (matches.length !== 1) {
    throw new WorkerError("publish_failed", "Publication branch does not have exactly one pull request.");
  }
  const pr = matches[0];
  if (pr.state === "CLOSED") {
    throw new WorkerError("publish_failed", "The publication pull request is closed.");
  }
  if (String(pr.headRefOid || "").toLowerCase() !== commitSha) {
    throw new WorkerError("publish_failed", "Pull request head does not match the publication commit.");
  }
  const expectedUrl = `https://github.com/${GITHUB_REPOSITORY}/pull/${pr.number}`;
  if (pr.url !== expectedUrl || !Number.isSafeInteger(pr.number) || pr.number < 1) {
    throw new WorkerError("publish_failed", "GitHub returned an invalid pull request identity.");
  }
  return pr;
}

async function listPullRequests(config, cwd, branch, signal, deadline) {
  const response = await gh(
    config,
    cwd,
    [
      "pr",
      "list",
      "--repo",
      GITHUB_REPOSITORY,
      "--head",
      branch,
      "--state",
      "all",
      "--limit",
      "2",
      "--json",
      "number,url,headRefOid,state",
    ],
    signal,
    deadline,
  );
  try {
    const parsed = JSON.parse(response.stdout);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return parsed;
  } catch (error) {
    throw new WorkerError("publish_failed", "GitHub returned invalid pull request JSON.", {
      cause: error,
      retryable: true,
    });
  }
}

function publishResult(branch, commitSha, pr) {
  return Object.freeze({
    kind: "publish",
    repository: GITHUB_REPOSITORY,
    branch,
    commitSha,
    prNumber: pr.number,
    prUrl: pr.url,
    summary: "Opened a validated GitHub pull request for the managed Rapid Studios homepage. Manual review and merge are required.",
  });
}

async function git(config, cwd, args, signal, deadline) {
  const result = await runProcess(
    config.publish.gitExecutable,
    ["-C", cwd, ...args],
    commandOptions(cwd, signal, deadline, "publish_failed"),
  );
  if (result.code !== 0) {
    throw new WorkerError("publish_failed", `Git command failed with code ${result.code}.`, {
      retryable: true,
    });
  }
  return result;
}

async function gh(config, cwd, args, signal, deadline) {
  const result = await runProcess(
    config.publish.githubCliExecutable,
    args,
    commandOptions(cwd, signal, deadline, "publish_failed"),
  );
  if (result.code !== 0) {
    throw new WorkerError("publish_failed", `GitHub CLI command failed with code ${result.code}.`, {
      retryable: true,
    });
  }
  return result;
}

async function npm(config, cwd, args, signal, deadline) {
  const result = await runProcess(
    config.publish.npmExecutable,
    args,
    commandOptions(cwd, signal, deadline, "publish_failed", 8 * 1024 * 1024),
  );
  if (result.code !== 0) {
    throw new WorkerError("publish_failed", `Validation command failed with code ${result.code}.`, {
      retryable: false,
    });
  }
  return result;
}

function commandOptions(cwd, signal, deadline, failureCode, maxOutputBytes = 2 * 1024 * 1024) {
  const remaining = deadline - Date.now();
  if (remaining < 1_000) {
    throw new WorkerError(failureCode, "Publication exceeded its total time limit.", {
      retryable: true,
    });
  }
  return {
    cwd,
    env: sanitizedChildEnv({
      CI: "1",
      GIT_TERMINAL_PROMPT: "0",
      NEXT_TELEMETRY_DISABLED: "1",
      npm_config_audit: "false",
      npm_config_fund: "false",
    }),
    signal,
    timeoutMs: Math.min(remaining, 10 * 60_000),
    maxOutputBytes,
    failureCode,
  };
}

function publicationBranch(jobId) {
  const id = String(jobId);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(id)) {
    throw new WorkerError("job_invalid", "Job id cannot form a safe CMS branch.");
  }
  return `cms/${id}`;
}

function normalizeGitPath(value) {
  return String(value).replaceAll("\\", "/");
}

function requireSha(value) {
  if (!/^[a-f0-9]{40}$/.test(value)) {
    throw new WorkerError("publish_failed", "Git returned an invalid commit SHA.");
  }
}
