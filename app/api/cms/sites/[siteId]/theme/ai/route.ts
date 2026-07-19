// app/api/cms/sites/[siteId]/theme/ai/route.ts
// AI restyle (the OpenDesign-style identity transform). A plain-English brief
// becomes a ThemePatch proposal; the Design Guardian validates every token
// before anything is applied. Owner only. Body: { instruction, apply? }

import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { composeDesignPrompt, getDesignStyleKit, getDesignTemplate } from "@/lib/cms/design/templates";
import { enqueueThemeJob, workerHealth } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  let body: { instruction?: string; apply?: boolean; templateId?: string; styleKitId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.instruction) return NextResponse.json({ error: "instruction is required" }, { status: 400 });

  if (body.templateId && !getDesignTemplate(body.templateId)) {
    return NextResponse.json({ error: "Choose a valid page goal." }, { status: 400 });
  }
  if (body.styleKitId && !getDesignStyleKit(body.styleKitId)) {
    return NextResponse.json({ error: "Choose a valid visual direction." }, { status: 400 });
  }
  try {
    const instruction = composeDesignPrompt({
      instruction: body.instruction,
      templateId: body.templateId,
      styleKitId: body.styleKitId,
    });
    const job = await enqueueThemeJob({ siteId, instruction, templateId: body.templateId });
    const online = (await workerHealth()).some((worker) => worker.online && worker.capabilities.includes("theme"));
    const response = NextResponse.json({
      provider: "local-codex-oauth",
      queued: true,
      accepted: true,
      applied: false,
      jobId: job.id,
      status: job.status,
      workerOnline: online,
      approvalRequired: true,
      templateId: body.templateId ?? null,
      styleKitId: body.styleKitId ?? null,
    }, { status: 202 });
    response.headers.set("location", `/api/cms/jobs/${job.id}`);
    response.headers.set("retry-after", "3");
    return response;
  } catch (error) {
    return jobErrorResponse(error);
  }
}
