import { NextResponse } from "next/server";
import { requireOwner, requireSiteAccess } from "@/lib/cms/auth/guard";
import { jobStore, sanitizeJob } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const existing = await jobStore.getJob(jobId);
    if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    const denied = existing.kind === "content" ? requireSiteAccess(request, existing.siteId) : requireOwner(request);
    if (denied) return denied;
    const cancelled = await jobStore.cancel(jobId);
    if (!cancelled) {
      const latest = await jobStore.getJob(jobId);
      return NextResponse.json({ error: `Job cannot be cancelled while its status is ${latest?.status || "unknown"}` }, { status: 409 });
    }
    return NextResponse.json(sanitizeJob(cancelled));
  } catch (error) {
    return jobErrorResponse(error);
  }
}
