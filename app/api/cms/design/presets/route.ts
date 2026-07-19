// app/api/cms/design/presets/route.ts
// The design-system library (OpenDesign's "150 systems, switch and re-render"
// concept). Requires any valid CMS auth.

import { NextResponse } from "next/server";
import { getAuth } from "@/lib/cms/auth/guard";
import { THEME_PRESETS } from "@/lib/cms/design/presets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAuth(request)) return NextResponse.json({ error: "Authentication required" }, { status: 403 });
  return NextResponse.json({ presets: THEME_PRESETS });
}
