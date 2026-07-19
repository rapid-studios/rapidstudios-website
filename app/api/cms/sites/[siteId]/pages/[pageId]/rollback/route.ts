// app/api/cms/sites/[siteId]/pages/[pageId]/rollback/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId, pageId } = await params;
  let body: { snapshotId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.snapshotId) return NextResponse.json({ error: "snapshotId is required" }, { status: 400 });
  try {
    const page = await store.rollback(siteId, pageId, body.snapshotId);
    return NextResponse.json({ ok: true, restoredTo: body.snapshotId, route: page.route });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
