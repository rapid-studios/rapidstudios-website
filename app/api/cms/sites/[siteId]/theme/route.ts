// app/api/cms/sites/[siteId]/theme/route.ts
// The design lane. GET returns the current theme (site access). PUT applies a
// token patch or preset (owner only): every value passes the Design Guardian
// before it lands. DELETE removes the theme (restores original design).

import { NextResponse } from "next/server";
import { requireOwner, requireSiteAccess } from "@/lib/cms/auth/guard";
import { DEFAULT_THEME, validateTheme, type ThemePatch } from "@/lib/cms/design/tokens";
import { getPreset } from "@/lib/cms/design/presets";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const denied = requireSiteAccess(request, siteId);
  if (denied) return denied;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  return NextResponse.json({ theme: site.theme ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  let body: { patch?: ThemePatch; presetId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // A preset is just a pre-authored full patch; it still goes through the
  // Design Guardian like everything else.
  let patch: ThemePatch | undefined = body.patch;
  if (body.presetId) {
    const preset = getPreset(body.presetId);
    if (!preset) return NextResponse.json({ error: `Unknown preset: ${body.presetId}` }, { status: 404 });
    patch = { ...preset.tokens, ...(body.patch || {}) };
  }
  if (!patch || Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "patch or presetId is required" }, { status: 400 });
  }

  const base = site.theme ?? DEFAULT_THEME;
  const verdict = validateTheme(base, patch);
  if (!verdict.accepted || !verdict.theme) {
    return NextResponse.json({ accepted: false, reason: verdict.reason }, { status: 422 });
  }
  await store.setTheme(siteId, verdict.theme);
  return NextResponse.json({ accepted: true, theme: verdict.theme });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  await store.setTheme(siteId, null);
  return NextResponse.json({ accepted: true, theme: null });
}
