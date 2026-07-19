// app/api/cms/sites/[siteId]/ingest/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { fetchRendered, isRemoteIngestEnabled } from "@/lib/cms/ingest/fetch-rendered";
import { parseToTemplate } from "@/lib/cms/ingest/parse";
import { summarizeSlots } from "@/lib/cms/overlay";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;

  if (!isRemoteIngestEnabled()) {
    return NextResponse.json(
      { error: "Remote URL ingest is disabled in production." },
      { status: 403 }
    );
  }

  const { siteId } = await params;
  let body: { url?: unknown; route?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof body.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ error: "url must be a non-empty string" }, { status: 400 });
  }
  if (body.route !== undefined && typeof body.route !== "string") {
    return NextResponse.json({ error: "route must be a string" }, { status: 400 });
  }

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  try {
    const ingestUrl = body.url.trim();
    const { html, mode } = await fetchRendered(ingestUrl);
    const { template, contentMap } = parseToTemplate(html);
    const route = body.route || new URL(ingestUrl).pathname || "/";
    const page = await store.addPage(siteId, { route, template, contentMap });
    return NextResponse.json({
      mode,
      pageId: page.id,
      route: page.route,
      slotCount: Object.keys(contentMap).length,
      slots: summarizeSlots(contentMap),
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
