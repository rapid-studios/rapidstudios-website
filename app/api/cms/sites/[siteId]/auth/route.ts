// app/api/cms/sites/[siteId]/auth/route.ts
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { hashPassword } from "@/lib/cms/auth/passwords";
import {
  CLIENT_PASSWORD_MAX_LENGTH,
  CLIENT_PASSWORD_MIN_LENGTH,
  isValidClientPassword,
} from "@/lib/cms/auth/rate-limit";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const denied = requireOwner(request);
  if (denied) return denied;
  const { siteId } = await params;
  let body: { clientPassword?: unknown; requiresApproval?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.clientPassword !== undefined && !isValidClientPassword(body.clientPassword)) {
    return NextResponse.json(
      {
        error: `clientPassword must be between ${CLIENT_PASSWORD_MIN_LENGTH} and ${CLIENT_PASSWORD_MAX_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }
  if (body.requiresApproval !== undefined && typeof body.requiresApproval !== "boolean") {
    return NextResponse.json({ error: "requiresApproval must be a boolean." }, { status: 400 });
  }
  const patch: { clientPasswordHash?: string; requiresApproval?: boolean } = {};
  if (isValidClientPassword(body.clientPassword)) {
    patch.clientPasswordHash = await hashPassword(body.clientPassword);
  }
  if (typeof body.requiresApproval === "boolean") patch.requiresApproval = body.requiresApproval;
  const site = await store.setSiteAuth(siteId, patch);
  return NextResponse.json({
    ok: true,
    siteId: site.id,
    requiresApproval: site.requiresApproval,
    hasClientPassword: Boolean(site.clientPasswordHash),
  });
}
