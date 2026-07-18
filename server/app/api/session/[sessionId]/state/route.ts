import { NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";
import { canReadSession } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await ctx.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }
  if (!canReadSession(req, new URL(req.url), session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    sessionId: session.sessionId,
    flight: session.flight,
    ssr: session.ssr,
    presence: session.presence,
    seq: session.seq,
  });
}
