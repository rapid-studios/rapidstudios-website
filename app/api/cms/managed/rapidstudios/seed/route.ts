import { NextResponse } from "next/server";

import { requireOwner } from "@/lib/cms/auth/guard";
import { ensureManagedRapidStudiosSite } from "@/lib/cms/managed/rapidstudios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  try {
    const result = await ensureManagedRapidStudiosSite();
    return NextResponse.json({
      ok: true,
      createdSite: result.createdSite,
      createdPage: result.createdPage,
      siteId: result.site.id,
      pageId: "homepage",
      route: "/",
      domain: result.site.domain,
    }, { status: result.createdSite || result.createdPage ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: "The managed Rapid Studios site could not be initialized." }, { status: 500 });
  }
}
