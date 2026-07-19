// app/api/cms/sites/[siteId]/pages/[pageId]/ai/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess, isOwner } from "@/lib/cms/auth/guard";
import { validateBatch } from "@/lib/cms/guardian";
import { translate } from "@/lib/cms/translator";
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

  let body: { instruction?: string; apply?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.instruction) return NextResponse.json({ error: "instruction is required" }, { status: 400 });

  // 1) AI proposes (never writes directly).
  const { provider, changes } = await translate(page.contentMap, body.instruction);
  if (changes.length === 0) {
    return NextResponse.json({ provider, changes: [], accepted: false, reason: "No applicable slot changes were proposed." });
  }

  // 2) Guardian validates every proposal.
  const verdict = validateBatch(page.contentMap, changes);
  if (!verdict.accepted) {
    return NextResponse.json({ provider, proposed: changes, accepted: false, reason: verdict.reason, results: verdict.results }, { status: 422 });
  }

  // 3) Optionally apply, respecting the approval gate.
  if (body.apply) {
    if (site.requiresApproval && !isOwner(request)) {
      const queued = await store.queueChanges(siteId, pageId, changes, "ai");
      return NextResponse.json({ provider, proposed: changes, accepted: true, applied: false, queued: true, pendingId: queued.id, results: verdict.results });
    }
    const { snapshot } = await store.commitContent(siteId, pageId, verdict.contentMap);
    return NextResponse.json({ provider, proposed: changes, accepted: true, applied: true, snapshotId: snapshot.id, results: verdict.results });
  }
  return NextResponse.json({ provider, proposed: changes, accepted: true, applied: false, results: verdict.results });
}
