export class WorkerError extends Error {
  constructor(code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "WorkerError";
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.publicMessage = options.publicMessage || publicMessageFor(code);
    this.status = options.status;
  }
}

export function asWorkerError(error, fallbackCode = "worker_error") {
  if (error instanceof WorkerError) return error;
  return new WorkerError(fallbackCode, "An internal worker operation failed.", {
    cause: error,
    retryable: true,
  });
}

export function publicFailure(error) {
  const safe = asWorkerError(error);
  return {
    code: safe.code,
    message: safe.publicMessage,
    retryable: Boolean(safe.retryable),
  };
}

function publicMessageFor(code) {
  const messages = {
    aborted: "The operation was cancelled.",
    branch_exists: "A publication branch already exists for this job.",
    codex_failed: "The local Codex run did not complete successfully.",
    codex_output_invalid: "Codex returned an invalid structured result.",
    config_invalid: "The local worker configuration is invalid.",
    github_auth_invalid: "The local GitHub CLI is not signed in as chilooby.",
    job_invalid: "The server supplied an invalid job contract.",
    lease_lost: "The job lease is no longer valid.",
    process_failed: "A required local validation process failed.",
    publish_changed_files: "Publishing changed a file outside the managed allowlist.",
    publish_failed: "The Git-backed publication did not complete.",
    request_failed: "The worker could not reach the CMS queue.",
    request_rejected: "The CMS queue rejected the worker request.",
    secret_invalid: "The worker signing secret is missing or invalid.",
    unsupported_capability: "This worker does not support the requested job capability.",
    worker_error: "The local worker encountered an unexpected error.",
    worker_shutdown: "The local worker stopped before the job completed.",
  };
  return messages[code] || messages.worker_error;
}
