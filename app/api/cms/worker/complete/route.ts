import { NextResponse } from "next/server";
import { completeLeasedJob, recordWorkerStatus } from "@/lib/cms/jobs";
import { authenticateWorker, jobErrorResponse } from "@/lib/cms/jobs/http";
import { parseCompleteRequest } from "@/lib/cms/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateWorker(request);
    const completion = parseCompleteRequest(authenticated.json);
    const job = await completeLeasedJob({ ...completion, workerId: authenticated.workerId }, completion.result);
    await recordWorkerStatus(authenticated.workerId, { status: "idle", currentJobId: undefined });
    return NextResponse.json({ accepted: true, job });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
