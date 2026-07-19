// app/api/cms/sites/[siteId]/pages/[pageId]/pending/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId, pageId } = await params;
  try {
    const pending = await store.listPending(siteId, pageId);
    return NextResponse.json({ pending });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
