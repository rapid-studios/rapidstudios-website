// app/api/cms/sites/[siteId]/theme/ai/route.ts
// AI restyle (the OpenDesign-style identity transform). A plain-English brief
// becomes a ThemePatch proposal; the Design Guardian validates every token
// before anything is applied. Owner only. Body: { instruction, apply? }

import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { DEFAULT_THEME, validateTheme } from "@/lib/cms/design/tokens";
import { translateDesign } from "@/lib/cms/design/translator";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  let body: { instruction?: string; apply?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.instruction) return NextResponse.json({ error: "instruction is required" }, { status: 400 });

  // 1) AI proposes a token patch (never writes, never emits CSS).
  const { provider, patch, presetId } = await translateDesign(site.theme ?? DEFAULT_THEME, body.instruction);
  if (!patch || Object.keys(patch).length === 0) {
    return NextResponse.json({ provider, accepted: false, reason: "No applicable theme changes were proposed." });
  }

  // 2) The Design Guardian validates every token value.
  const base = site.theme ?? DEFAULT_THEME;
  const verdict = validateTheme(base, patch);
  if (!verdict.accepted || !verdict.theme) {
    return NextResponse.json({ provider, proposed: patch, accepted: false, reason: verdict.reason }, { status: 422 });
  }

  // 3) Optionally apply.
  if (body.apply) {
    await store.setTheme(siteId, verdict.theme);
    return NextResponse.json({ provider, presetId, proposed: patch, accepted: true, applied: true, theme: verdict.theme });
  }
  return NextResponse.json({ provider, presetId, proposed: patch, accepted: true, applied: false, theme: verdict.theme });
}
