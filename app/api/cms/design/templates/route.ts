import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { DESIGN_GUARDRAILS, DESIGN_STYLE_KITS, DESIGN_TEMPLATES } from "@/lib/cms/design/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  return NextResponse.json({
    templates: DESIGN_TEMPLATES,
    styleKits: DESIGN_STYLE_KITS,
    guardrails: DESIGN_GUARDRAILS,
  });
}
