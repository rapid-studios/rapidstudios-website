// app/api/cms/sites/[siteId]/ingest-html/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { parseToTemplate } from "@/lib/cms/ingest/parse";
import { summarizeSlots } from "@/lib/cms/overlay";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  let body: { html?: string; route?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.html) return NextResponse.json({ error: "html is required" }, { status: 400 });

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const { template, contentMap } = parseToTemplate(body.html);
  const page = await store.addPage(siteId, { route: body.route || "/", template, contentMap });
  return NextResponse.json({
    mode: "html",
    pageId: page.id,
    route: page.route,
    slotCount: Object.keys(contentMap).length,
    slots: summarizeSlots(contentMap),
  }, { status: 201 });
}
