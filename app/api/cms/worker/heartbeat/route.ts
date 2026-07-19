import { NextResponse } from "next/server";
import { jobStore, recordWorkerStatus } from "@/lib/cms/jobs";
import { JobApiError } from "@/lib/cms/jobs/errors";
import { authenticateWorker, jobErrorResponse } from "@/lib/cms/jobs/http";
import { parseHeartbeatRequest } from "@/lib/cms/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateWorker(request);
    const heartbeat = parseHeartbeatRequest(authenticated.json);
    const job = await jobStore.heartbeat({ ...heartbeat, workerId: authenticated.workerId }, heartbeat.leaseSeconds);
    if (!job) throw new JobApiError(409, "lease_not_active", "Lease is invalid, expired, cancelled, or already completed");
    await recordWorkerStatus(authenticated.workerId, {
      status: "working",
      version: heartbeat.version,
      currentJobId: job.id,
      message: heartbeat.message,
    });
    return NextResponse.json({ accepted: true, leaseExpiresAt: job.leaseExpiresAt });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
