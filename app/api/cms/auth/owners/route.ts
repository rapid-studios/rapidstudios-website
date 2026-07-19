// app/api/cms/auth/owners/route.ts
// Multi-user owner accounts. GET lists accounts, POST creates one. Owner only,
// so the first account is bootstrapped by logging in with the master key.

import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { hashPassword } from "@/lib/cms/auth/passwords";
import { CLIENT_PASSWORD_MAX_LENGTH, CLIENT_PASSWORD_MIN_LENGTH } from "@/lib/cms/auth/rate-limit";
import { store } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  return NextResponse.json({ owners: await store.listOwners() });
}

export async function POST(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  let body: { email?: string; password?: string; name?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.email || body.email.length > 320 || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (
    !body.password ||
    body.password.length < CLIENT_PASSWORD_MIN_LENGTH ||
    body.password.length > CLIENT_PASSWORD_MAX_LENGTH
  ) {
    return NextResponse.json(
      { error: `Password must be between ${CLIENT_PASSWORD_MIN_LENGTH} and ${CLIENT_PASSWORD_MAX_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.length > 100)) {
    return NextResponse.json({ error: "Name must be a string no longer than 100 characters." }, { status: 400 });
  }
  try {
    const owner = await store.createOwner({
      email: body.email,
      passwordHash: await hashPassword(body.password),
      name: body.name,
    });
    return NextResponse.json({ ok: true, id: owner.id, email: owner.email }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
