// app/api/cms/sites/[siteId]/pages/[pageId]/ai/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess, isOwner } from "@/lib/cms/auth/guard";
import { enqueueContentJob, workerHealth } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((p) => p.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  let body: { instruction?: string; apply?: boolean; templateId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.instruction) return NextResponse.json({ error: "instruction is required" }, { status: 400 });

  try {
    const job = await enqueueContentJob({
      siteId,
      pageId,
      instruction: body.instruction,
      templateId: body.templateId,
      createdByRole: isOwner(request) ? "owner" : "client",
    });
    const online = (await workerHealth()).some((worker) => worker.online && worker.capabilities.includes("content"));
    const response = NextResponse.json({
      provider: "local-codex-oauth",
      queued: true,
      accepted: true,
      applied: false,
      jobId: job.id,
      status: job.status,
      workerOnline: online,
      approvalRequired: true,
    }, { status: 202 });
    response.headers.set("location", `/api/cms/jobs/${job.id}`);
    response.headers.set("retry-after", "3");
    return response;
  } catch (error) {
    return jobErrorResponse(error);
  }
}
