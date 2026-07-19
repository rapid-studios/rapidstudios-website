// app/api/cms/sites/[siteId]/pages/[pageId]/publish/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { enqueuePublishJob, workerHealth } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId, pageId } = await params;

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((p) => p.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  try {
    const job = await enqueuePublishJob({ siteId, pageId });
    const online = (await workerHealth()).some((worker) => worker.online && worker.capabilities.includes("publish"));
    const response = NextResponse.json({
      published: false,
      queued: true,
      jobId: job.id,
      status: job.status,
      workerOnline: online,
      reviewRequired: true,
      productionChangesAfterMerge: true,
    }, { status: 202 });
    response.headers.set("location", `/api/cms/jobs/${job.id}`);
    response.headers.set("retry-after", "3");
    return response;
  } catch (error) {
    return jobErrorResponse(error);
  }
}
