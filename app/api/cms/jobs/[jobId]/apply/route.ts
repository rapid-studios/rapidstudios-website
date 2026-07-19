import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { applyCompletedJob } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  try {
    const { jobId } = await params;
    const result = await applyCompletedJob(jobId);
    return NextResponse.json({ applied: true, alreadyApplied: result.alreadyApplied, job: result.job });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
