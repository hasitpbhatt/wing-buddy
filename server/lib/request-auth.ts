// Request-level auth helpers, layered on lib/access.ts.
//  - requester calls carry `x-wb-key`.
//  - joiner/presenter calls carry a signed `t` token (query param).
// state/events accept EITHER; transcript requires requesterKey; disrupt/relay
// require `t` (and derive the sessionId from it).

import { verifyRequesterKey, verifyAccessToken } from "./access";
import type { Session } from "./session-store";

export function hasRequesterKey(req: Request, session: Session): boolean {
  const key = req.headers.get("x-wb-key");
  return !!key && verifyRequesterKey(key, session.requesterKey);
}

export function hasValidTFor(url: URL, sessionId: string): boolean {
  const v = verifyAccessToken(url.searchParams.get("t"));
  return !!v && v.sessionId === sessionId;
}

// Either credential — for /state and /events.
export function canReadSession(
  req: Request,
  url: URL,
  session: Session
): boolean {
  return hasRequesterKey(req, session) || hasValidTFor(url, session.sessionId);
}

// Resolve the sessionId a `t` token authorizes (for disrupt/relay).
export function sessionIdFromT(url: URL): string | null {
  const v = verifyAccessToken(url.searchParams.get("t"));
  return v ? v.sessionId : null;
}
