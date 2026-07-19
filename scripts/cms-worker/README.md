# Rapid Studios local CMS worker

This outbound-only Windows worker connects the production CMS queue at `https://rapidstudios.dev` to Codex and GitHub on Jaxon's computer. It never sends Codex OAuth credentials to Vercel, MongoDB, GitHub, or the browser.

The operator flow is intentionally simple:

1. A user requests a content, theme, or publish job in Studio.
2. This worker claims it over signed HTTPS.
3. Content/theme jobs run through the locally authenticated Codex CLI and return a constrained JSON proposal for server-side Guardian validation.
4. Publish jobs change one allowlisted JSON snapshot, run validation, push a `cms/<jobId>` branch, and open a pull request. The worker never merges.

## Prerequisites

- Windows user `Jaxon` is logged in and the computer is awake and online.
- `codex login status` reports `Logged in using ChatGPT` for Jaxon.
- GitHub CLI is signed in as exactly `chilooby`.
- Git, Node.js/npm (Node 22 or newer), and GitHub CLI executable paths are known.
- Vercel has a sensitive `CMS_WORKER_KEY` value of at least 32 random bytes. The local secret file contains exactly that same value.

Codex OAuth remains in Jaxon's local Codex profile. Do not copy `.codex/auth.json`, OAuth tokens, GitHub tokens, or the worker secret into this repository.

## One-time local configuration

Create the private worker directory and copy the example:

```powershell
$workerRoot = Join-Path $env:LOCALAPPDATA "RapidStudios\cms-worker"
New-Item -ItemType Directory -Path $workerRoot -Force | Out-Null
Copy-Item .\scripts\cms-worker\config.example.json (Join-Path $workerRoot "config.json")
```

Edit `config.json` and set the absolute Git, GitHub CLI, npm, and Codex executable paths. Keep `baseUrl` at `https://rapidstudios.dev`; the worker rejects every other origin.

Place the existing Vercel `CMS_WORKER_KEY` value in:

```text
%LOCALAPPDATA%\RapidStudios\cms-worker\worker-secret.txt
```

The secret file must contain 32-512 UTF-8 bytes and no commentary. `install.ps1` restricts the config and secret ACLs to Jaxon, SYSTEM, and local Administrators. As an alternative for an interactive session only, the secret can be supplied through the environment variable named by `secretEnv`.

Verify a single poll without installing anything:

```powershell
& "C:\Program Files\nodejs\node.exe" .\scripts\cms-worker\worker.mjs `
  --config "$env:LOCALAPPDATA\RapidStudios\cms-worker\config.json" `
  --once
```

Run the local unit tests:

```powershell
& "C:\Program Files\nodejs\node.exe" --test .\scripts\cms-worker\tests\worker.test.mjs
```

## Scheduled task

The installer copies the worker into a stable folder below `%LOCALAPPDATA%`, registers `RapidStudiosCmsWorker` for Jaxon's logon, runs it with limited privileges, ignores duplicate instances, and restarts failures up to five times at one-minute intervals. It does not run as SYSTEM.

```powershell
.\scripts\cms-worker\install.ps1 `
  -ConfigPath "$env:LOCALAPPDATA\RapidStudios\cms-worker\config.json" `
  -NodeExecutable "C:\Program Files\nodejs\node.exe"
```

The installer does not start the worker unless `-StartNow` is explicitly supplied. Inspect it without revealing secrets:

```powershell
.\scripts\cms-worker\status.ps1 -Deep
```

Uninstall only the scheduled task (the private config and secret are retained for recovery):

```powershell
.\scripts\cms-worker\uninstall.ps1
```

## Codex execution boundary

For content and theme work, the worker creates a clean, isolated clone of `origin/main` and invokes:

```text
codex.exe exec --ephemeral --ignore-user-config --skip-git-repo-check --sandbox read-only --json --output-schema <schema> --output-last-message <temporary-file> -C <clean-clone> -
```

The prompt is sent on stdin. Child processes receive a strict environment allowlist that excludes the CMS worker secret and common deployment/database/API credentials. The clean clone lets Codex discover the repo-local `impeccable` skill; the prompt asks for its clarity, hierarchy, accessibility, and ease-of-use principles without running hooks, a live server, edits, or arbitrary code. Model output must pass the local schema and is independently revalidated by the server's Content/Design Guardian.

## Queue protocol

All requests are `POST` requests to the pinned production origin:

- `/api/cms/worker/health`
- `/api/cms/worker/claim`
- `/api/cms/worker/heartbeat`
- `/api/cms/worker/complete`
- `/api/cms/worker/fail`

The four authentication headers are `x-cms-worker-id`, `x-cms-worker-timestamp`, `x-cms-worker-nonce`, and `x-cms-worker-signature`. Each request uses an 18-byte random nonce and Unix-seconds timestamp. The signature is base64url HMAC-SHA256 over these newline-separated fields:

```text
v1
<workerId>
<timestamp>
<nonce>
<UPPERCASE_METHOD>
<pathname+query>
<lowercase_sha256_of_exact_JSON_body_bytes>
```

The server enforces timestamp skew and one-time nonces. Lease tokens exist only in worker memory and signed request bodies; they are never logged or written to status files.

If an owner cancels a leased job, its next heartbeat loses the lease; the worker aborts the local subprocess tree and does not apply or publish the stale result.

Claim request:

```json
{
  "capabilities": ["content", "theme", "publish"],
  "leaseSeconds": 120,
  "version": "1.0.0"
}
```

Claim response:

```json
{
  "job": { "id": "job_...", "kind": "content", "input": {} },
  "lease": { "claimId": "claim_...", "leaseToken": "...", "expiresAt": "..." }
}
```

Heartbeat, completion, and failure bodies include `jobId`, `claimId`, and `leaseToken`. A completion adds `result`; a failure adds `error: {code,message}` and `retryable`.

Content result:

```json
{
  "kind": "content",
  "changes": [{ "slotId": "existing_slot_id", "newValue": "plain text" }],
  "summary": "Short operator-facing summary"
}
```

Theme result:

```json
{
  "kind": "theme",
  "patch": { "accent": "#3b82f6", "shadow": "md" },
  "summary": "Short operator-facing summary"
}
```

## Git-backed publishing boundary

The only accepted target id is `rapidstudios-homepage-v1`, resolved in worker code to exactly:

```text
content/managed/rapidstudios-homepage.json
```

The repository is fixed to `rapid-studios/rapidstudios-website`, the base is always `origin/main`, and the branch is exactly `cms/<jobId>`. The worker rejects symlinks, validates the snapshot target and content hash, checks the changed-file set twice, installs dependencies with lifecycle scripts disabled, runs lint, CMS security tests, and a production build, then pushes without force and opens a PR as `chilooby`.

Publish result:

```json
{
  "kind": "publish",
  "repository": "rapid-studios/rapidstudios-website",
  "branch": "cms/job_...",
  "commitSha": "40-character-git-sha",
  "prNumber": 123,
  "prUrl": "https://github.com/rapid-studios/rapidstudios-website/pull/123",
  "summary": "Opened a validated pull request; manual review and merge are required."
}
```

No worker path, command, repository, branch prefix, validation command, or pull-request destination is accepted from a queue job.
