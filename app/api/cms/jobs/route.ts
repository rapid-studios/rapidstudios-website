import { NextResponse } from "next/server";
import { getAuth, requireOwner, requireSiteAccess } from "@/lib/cms/auth/guard";
import { JobApiError } from "@/lib/cms/jobs/errors";
import { jobErrorResponse } from "@/lib/cms/jobs/http";
import { enqueueContentJob, enqueuePublishJob, enqueueThemeJob, listJobs } from "@/lib/cms/jobs";
import type { CmsJobStatus } from "@/lib/cms/jobs/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set<CmsJobStatus>(["queued", "leased", "completed", "failed", "cancelled", "applying", "applied", "apply_failed"]);

export async function GET(request: Request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: "CMS access required" }, { status: 403 });
    const url = new URL(request.url);
    const requestedSiteId = url.searchParams.get("siteId") || undefined;
    const siteId = auth.role === "client" ? auth.siteId : requestedSiteId;
    if (auth.role === "client" && requestedSiteId && requestedSiteId !== auth.siteId) {
      return NextResponse.json({ error: "Access denied for this site" }, { status: 403 });
    }
    const statuses = (url.searchParams.get("status") || "")
      .split(",")
      .map((status) => status.trim())
      .filter(Boolean) as CmsJobStatus[];
    if (statuses.some((status) => !STATUSES.has(status))) throw new JobApiError(400, "invalid_status", "status contains an unsupported value");
    const limitValue = Number(url.searchParams.get("limit") || 50);
    if (!Number.isInteger(limitValue) || limitValue < 1) throw new JobApiError(400, "invalid_limit", "limit must be a positive integer");
    return NextResponse.json(
      await listJobs({
        siteId,
        pageId: url.searchParams.get("pageId") || undefined,
        statuses: statuses.length ? statuses : undefined,
        limit: Math.min(limitValue, 100),
      })
    );
  } catch (error) {
    return jobErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuth(request);
    if (!auth) return NextResponse.json({ error: "CMS access required" }, { status: 403 });
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      throw new JobApiError(400, "invalid_json", "Request body must be valid JSON");
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new JobApiError(400, "invalid_request", "Request body must be an object");
    const body = raw as Record<string, unknown>;
    if (typeof body.kind !== "string") throw new JobApiError(400, "missing_kind", "kind is required");
    if (typeof body.siteId !== "string") throw new JobApiError(400, "missing_site", "siteId is required");

    if (body.kind === "content") {
      const denied = requireSiteAccess(request, body.siteId);
      if (denied) return denied;
      const allowed = new Set(["kind", "siteId", "pageId", "instruction", "templateId"]);
      const unknown = Object.keys(body).find((key) => !allowed.has(key));
      if (unknown) throw new JobApiError(400, "unknown_field", `Unknown content job field "${unknown}"`);
      if (typeof body.pageId !== "string") throw new JobApiError(400, "missing_page", "pageId is required");
      return NextResponse.json(
        await enqueueContentJob({
          siteId: body.siteId,
          pageId: body.pageId,
          instruction: body.instruction as string,
          templateId: body.templateId as string | undefined,
          createdByRole: auth.role,
        }),
        { status: 202 }
      );
    }

    const denied = requireOwner(request);
    if (denied) return denied;
    if (body.kind === "theme") {
      const allowed = new Set(["kind", "siteId", "instruction", "templateId"]);
      const unknown = Object.keys(body).find((key) => !allowed.has(key));
      if (unknown) throw new JobApiError(400, "unknown_field", `Unknown theme job field "${unknown}"`);
      return NextResponse.json(
        await enqueueThemeJob({
          siteId: body.siteId,
          instruction: body.instruction as string,
          templateId: body.templateId as string | undefined,
        }),
        { status: 202 }
      );
    }
    if (body.kind === "publish") {
      const allowed = new Set(["kind", "siteId", "pageId"]);
      const unknown = Object.keys(body).find((key) => !allowed.has(key));
      if (unknown) throw new JobApiError(400, "unknown_field", `Unknown publish job field "${unknown}"`);
      if (typeof body.pageId !== "string") throw new JobApiError(400, "missing_page", "pageId is required");
      return NextResponse.json(await enqueuePublishJob({ siteId: body.siteId, pageId: body.pageId }), { status: 202 });
    }
    throw new JobApiError(400, "invalid_kind", "kind must be content, theme, or publish");
  } catch (error) {
    return jobErrorResponse(error);
  }
}
