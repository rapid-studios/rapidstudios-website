// app/api/cms/sites/[siteId]/pages/[pageId]/edit-preview/route.ts
import { NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/cms/auth/guard";
import { injectContentSecurityPolicy, render } from "@/lib/cms/render";
import { injectOverlay } from "@/lib/cms/overlay";
import { injectTheme } from "@/lib/cms/design/tokens";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNEL_NONCE = /^[a-zA-Z0-9_-]{32,128}$/;

// The Studio dashboard fetches this with a Bearer token and injects the HTML
// into the preview iframe via srcdoc, so auth stays header-based.
export async function GET(request: Request, { params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;
  const channelNonce = request.headers.get("x-cms-editor-channel") || "";
  if (!CHANNEL_NONCE.test(channelNonce)) {
    return NextResponse.json({ error: "A valid editor channel is required." }, { status: 400 });
  }
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const page = (site.pages || []).find((pg) => pg.id === pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  const html = injectTheme(render(page.template, page.contentMap), site.theme);
  const editCsp = [
    "default-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "form-action 'none'",
    `script-src 'nonce-${channelNonce}'`,
    "script-src-attr 'none'",
    "style-src 'unsafe-inline' http: https:",
    "img-src data: http: https:",
    "font-src data: http: https:",
    "media-src data: http: https:",
    "connect-src 'none'",
    "worker-src 'none'",
    "manifest-src 'none'",
  ].join("; ");
  const editHtml = injectContentSecurityPolicy(injectOverlay(html, channelNonce), editCsp);
  return new NextResponse(editHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "content-security-policy": `${editCsp}; frame-ancestors 'self'`,
      "x-content-type-options": "nosniff",
    },
  });
}
