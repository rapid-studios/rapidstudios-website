// app/api/cms/sites/[siteId]/pages/[pageId]/publish/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { publishToVercel } from "@/lib/cms/publish";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId, pageId } = await params;

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((p) => p.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const projectName =
    (site.domain || site.name || site.id)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "rapidstudios-site";
  try {
    const result = await publishToVercel(page, { projectName, theme: site.theme });
    return NextResponse.json({
      published: true,
      dryRun: result.dryRun,
      url: result.url,
      deploymentId: result.deploymentId,
      bytes: result.bytes,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
