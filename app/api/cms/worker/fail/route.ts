import { NextResponse } from "next/server";
import { jobStore, recordWorkerStatus, sanitizeJob } from "@/lib/cms/jobs";
import { JobApiError } from "@/lib/cms/jobs/errors";
import { authenticateWorker, jobErrorResponse } from "@/lib/cms/jobs/http";
import { parseFailureRequest } from "@/lib/cms/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateWorker(request);
    const failure = parseFailureRequest(authenticated.json);
    const job = await jobStore.fail({ ...failure, workerId: authenticated.workerId }, {
      code: failure.code,
      message: failure.message,
      at: new Date().toISOString(),
      retryable: failure.retryable,
    });
    if (!job) throw new JobApiError(409, "lease_not_active", "Lease is invalid, expired, cancelled, or already completed");
    await recordWorkerStatus(authenticated.workerId, { status: "idle", currentJobId: undefined });
    return NextResponse.json({ accepted: true, job: sanitizeJob(job) });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
