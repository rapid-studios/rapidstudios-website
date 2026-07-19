// app/api/cms/sites/[siteId]/pages/[pageId]/pending/[pendingId]/approve/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { validateBatch } from "@/lib/cms/guardian";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string; pageId: string; pendingId: string }> }
) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId, pageId, pendingId } = await params;

  const page = await store.getPage(siteId, pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const entry = (page.pendingChanges || []).find((c) => c.id === pendingId && c.status === "pending");
  if (!entry) return NextResponse.json({ error: "Pending change not found" }, { status: 404 });

  // Re-run the Guardian against the LATEST content (it may have moved on).
  const verdict = validateBatch(page.contentMap, entry.changes);
  if (!verdict.accepted) {
    await store.dequeuePending(siteId, pageId, entry.id, "rejected");
    return NextResponse.json({ approved: false, reason: verdict.reason, results: verdict.results }, { status: 422 });
  }
  const { snapshot } = await store.commitContent(siteId, pageId, verdict.contentMap);
  await store.dequeuePending(siteId, pageId, entry.id, "approved");
  return NextResponse.json({ approved: true, snapshotId: snapshot.id });
}
