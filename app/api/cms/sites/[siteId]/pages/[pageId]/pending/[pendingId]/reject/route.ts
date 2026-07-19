// app/api/cms/sites/[siteId]/pages/[pageId]/pending/[pendingId]/reject/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
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
  try {
    const entry = await store.dequeuePending(siteId, pageId, pendingId, "rejected");
    return NextResponse.json({ rejected: true, id: entry.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
