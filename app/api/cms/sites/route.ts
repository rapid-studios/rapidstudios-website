// app/api/cms/sites/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  return NextResponse.json(await store.listSites());
}

export async function POST(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  let body: { name?: string; domain?: string; requiresApproval?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  const site = await store.createSite({
    name: body.name,
    domain: body.domain,
    requiresApproval: body.requiresApproval,
  });
  return NextResponse.json(site, { status: 201 });
}
