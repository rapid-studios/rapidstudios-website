// app/api/cms/sites/[siteId]/pages/[pageId]/preview/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/cms/auth/guard";
import { injectContentSecurityPolicy, render } from "@/lib/cms/render";
import { injectTheme } from "@/lib/cms/design/tokens";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREVIEW_CSP = [
  "default-src 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "script-src 'none'",
  "script-src-attr 'none'",
  "style-src 'unsafe-inline' http: https:",
  "img-src data: http: https:",
  "font-src data: http: https:",
  "media-src data: http: https:",
  "connect-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
].join("; ");

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((pg) => pg.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const html = injectTheme(render(page.template, page.contentMap), site.theme);
  return new NextResponse(injectContentSecurityPolicy(html, PREVIEW_CSP), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "content-security-policy": `${PREVIEW_CSP}; frame-ancestors 'self'`,
      "x-content-type-options": "nosniff",
    },
  });
}
