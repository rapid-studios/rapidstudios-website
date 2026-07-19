// app/api/cms/sites/[siteId]/pages/[pageId]/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/cms/auth/guard";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;
  const page = await store.getPage(siteId, pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json({
    id: page.id,
    route: page.route,
    versions: page.versions.map((v) => ({ id: v.id, createdAt: v.createdAt })),
    contentMap: page.contentMap,
  });
}
