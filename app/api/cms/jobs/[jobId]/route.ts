import { NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/cms/auth/guard";
import { getJob } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const job = await getJob(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    const denied = requireSiteAccess(request, job.siteId);
    if (denied) return denied;
    return NextResponse.json(job);
  } catch (error) {
    return jobErrorResponse(error);
  }
}
