import { NextResponse } from "next/server";
import { sessionCount } from "@/lib/session-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, sessions: await sessionCount() });
}
