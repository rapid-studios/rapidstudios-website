// app/api/cms/sites/[siteId]/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/cms/auth/guard";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  return NextResponse.json({
    id: site.id,
    name: site.name,
    domain: site.domain,
    requiresApproval: site.requiresApproval,
    hasClientPassword: Boolean(site.clientPasswordHash),
    pages: site.pages.map(({ id, route }) => ({ id, route })),
  });
}
