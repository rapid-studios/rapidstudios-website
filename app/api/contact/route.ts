import { NextResponse } from "next/server";
import { sendInquiryEmails, type ContactInquiry } from "@/lib/email/resend";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  note?: string;
  /** Honeypot field -- must be empty */
  website?: string;
};

// Simple in-memory rate limiting per IP
const submissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = submissions.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) return true;

  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

function validateEmail(email: string): boolean {
  // RFC-compliant enough for form validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot check -- if the hidden "website" field has a value, it's a bot
  if (body.website) {
    // Return success to not tip off the bot
    return NextResponse.json({ success: true });
  }

  // Validation
  const errors: Record<string, string> = {};

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const company = body.company?.trim() ?? "";
  const projectType = body.projectType?.trim() ?? "";
  const note = body.note?.trim() ?? "";

  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!validateEmail(email)) errors.email = "Use a valid email address.";
  if (!note) errors.note = "A short project note helps us prepare.";
  else if (note.length < 12) errors.note = "Add a bit more context so the next step is useful.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const inquiry: ContactInquiry = { name, email, company, projectType, note };

  // Send emails -- failures are logged but don't prevent success response
  if (process.env.RESEND_API_KEY) {
    const results = await sendInquiryEmails(inquiry);

    if (!results.customer.success) {
      console.error("[contact] Customer email failed:", results.customer.error, { name, email });
    }
    if (!results.internal.success) {
      console.error("[contact] Internal notification failed:", results.internal.error, { name, email, company, projectType, note: note.slice(0, 200) });
    }
  } else {
    console.warn("[contact] RESEND_API_KEY not set -- skipping emails. Inquiry:", {
      name,
      email,
      company,
      projectType,
      note: note.slice(0, 100)
    });
  }

  return NextResponse.json({ success: true });
}
