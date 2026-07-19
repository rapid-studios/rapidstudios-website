import { NextResponse } from "next/server";
import { recordWorkerStatus } from "@/lib/cms/jobs";
import { authenticateWorker, jobErrorResponse } from "@/lib/cms/jobs/http";
import { parseWorkerHealthRequest } from "@/lib/cms/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateWorker(request);
    const health = parseWorkerHealthRequest(authenticated.json);
    await recordWorkerStatus(authenticated.workerId, health);
    return NextResponse.json({ accepted: true, receivedAt: new Date().toISOString() });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
