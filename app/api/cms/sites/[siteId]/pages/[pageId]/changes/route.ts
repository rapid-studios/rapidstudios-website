// app/api/cms/sites/[siteId]/pages/[pageId]/changes/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess, isOwner } from "@/lib/cms/auth/guard";
import { validateBatch } from "@/lib/cms/guardian";
import { store } from "@/lib/cms/store";
import type { ProposedChange } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((p) => p.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  let body: { changes?: ProposedChange[]; dryRun?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const verdict = validateBatch(page.contentMap, body.changes || []);
  if (!verdict.accepted) {
    return NextResponse.json({ accepted: false, reason: verdict.reason, results: verdict.results }, { status: 422 });
  }
  if (body.dryRun) {
    return NextResponse.json({ accepted: true, dryRun: true, results: verdict.results });
  }

  // Approval gate: a client editing an approval-gated site queues for review.
  if (site.requiresApproval && !isOwner(request)) {
    const queued = await store.queueChanges(siteId, pageId, body.changes || [], "client");
    return NextResponse.json({ accepted: true, queued: true, pendingId: queued.id, results: verdict.results });
  }

  const { snapshot } = await store.commitContent(siteId, pageId, verdict.contentMap);
  return NextResponse.json({ accepted: true, queued: false, snapshotId: snapshot.id, results: verdict.results });
}
