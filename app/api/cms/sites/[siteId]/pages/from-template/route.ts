import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { buildDesignPage } from "@/lib/cms/design/page-template";
import { getDesignStyleKit, getDesignTemplate } from "@/lib/cms/design/templates";
import { validateTheme } from "@/lib/cms/design/tokens";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  let body: { templateId?: string; styleKitId?: string; route?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const designTemplate = body.templateId ? getDesignTemplate(body.templateId) : null;
  const styleKit = body.styleKitId ? getDesignStyleKit(body.styleKitId) : null;
  if (!designTemplate) return NextResponse.json({ error: "Choose a valid page template." }, { status: 400 });
  if (!styleKit) return NextResponse.json({ error: "Choose a valid visual direction." }, { status: 400 });
  const route = normalizeRoute(body.route);
  if (!route) return NextResponse.json({ error: "Route must start with / and contain only URL-safe path characters." }, { status: 400 });
  if (site.pages.some((page) => page.route === route)) {
    return NextResponse.json({ error: `A page already exists at ${route}.` }, { status: 409 });
  }

  const built = buildDesignPage(designTemplate.id, site.name);
  const themeVerdict = validateTheme(styleKit.tokens, styleKit.tokens);
  if (!themeVerdict.accepted || !themeVerdict.theme) {
    return NextResponse.json({ error: themeVerdict.reason ?? "The selected visual direction did not pass the Design Guardian." }, { status: 422 });
  }
  const shouldApplyInitialTheme = site.pages.length === 0;
  const page = await store.addPage(siteId, { route, template: built.html, contentMap: built.contentMap });
  if (shouldApplyInitialTheme) await store.setTheme(siteId, themeVerdict.theme);
  return NextResponse.json({
    pageId: page.id,
    route: page.route,
    templateId: designTemplate.id,
    styleKitId: styleKit.id,
    slotCount: Object.keys(page.contentMap).length,
    draft: true,
    themeApplied: shouldApplyInitialTheme,
  }, { status: 201 });
}

function normalizeRoute(value: unknown): string | null {
  const raw = typeof value === "string" && value.trim() ? value.trim() : "/";
  if (!raw.startsWith("/") || raw.length > 160 || !/^\/[a-zA-Z0-9/_-]*$/.test(raw)) return null;
  return raw !== "/" ? raw.replace(/\/+$/, "") : raw;
}
