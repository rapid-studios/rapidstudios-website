import { NextResponse } from "next/server";
import { jobStore, recordWorkerStatus } from "@/lib/cms/jobs";
import { authenticateWorker, jobErrorResponse, workerJobPayload } from "@/lib/cms/jobs/http";
import { parseClaimRequest } from "@/lib/cms/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateWorker(request);
    const claimRequest = parseClaimRequest(authenticated.json);
    const claim = await jobStore.claimNext(authenticated.workerId, claimRequest.capabilities, claimRequest.leaseSeconds);
    await recordWorkerStatus(authenticated.workerId, {
      status: claim ? "working" : "idle",
      version: claimRequest.version,
      capabilities: claimRequest.capabilities,
      currentJobId: claim?.job.id,
    });
    if (!claim) return NextResponse.json({ job: null, pollAfterMs: 3_000 });
    return NextResponse.json({
      job: workerJobPayload(claim.job),
      lease: { claimId: claim.claimId, leaseToken: claim.leaseToken, expiresAt: claim.job.leaseExpiresAt },
    });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
