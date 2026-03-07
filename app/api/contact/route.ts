import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  note?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const errors: Record<string, string> = {};

  if (!body.name?.trim()) errors.name = "Name is required.";
  if (!body.email?.trim()) errors.email = "Email is required.";
  if (body.email && !body.email.includes("@")) errors.email = "Use a valid email address.";
  if (!body.note?.trim()) errors.note = "A short project note helps.";
  if (body.note && body.note.trim().length < 12) errors.note = "Add a bit more context so the next step is useful.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  return NextResponse.json({
    success: true
  });
}
