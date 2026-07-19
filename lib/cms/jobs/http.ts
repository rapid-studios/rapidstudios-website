import { NextResponse } from "next/server";
import { authenticateWorkerRequest, type AuthenticatedWorkerRequest } from "./crypto";
import { JobApiError, errorMessage } from "./errors";
import { jobStore } from "./index";
import type { CmsJobRecord } from "./types";

export function jobErrorResponse(error: unknown): NextResponse {
  if (error instanceof JobApiError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error("CMS job API error", error);
  return NextResponse.json({ error: "CMS job request failed", code: "internal_error", detail: process.env.NODE_ENV === "development" ? errorMessage(error) : undefined }, { status: 500 });
}

export function workerJobPayload(job: CmsJobRecord): Record<string, unknown> {
  return {
    id: job.id,
    kind: job.kind,
    siteId: job.siteId,
    pageId: job.pageId,
    input: structuredClone(job.input),
    baseDigest: job.baseDigest,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    deadlineAt: job.deadlineAt,
    leaseExpiresAt: job.leaseExpiresAt,
  };
}

export function authenticateWorker(request: Request): Promise<AuthenticatedWorkerRequest> {
  return authenticateWorkerRequest(request, (nonce, expiresAt) => jobStore.consumeNonce(nonce, expiresAt));
}
