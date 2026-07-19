import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/cms/auth/guard";
import { workerHealth } from "@/lib/cms/jobs";
import { jobErrorResponse } from "@/lib/cms/jobs/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireOwner(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ workers: await workerHealth() });
  } catch (error) {
    return jobErrorResponse(error);
  }
}
