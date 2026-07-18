// CORS for a cross-origin client (owned by another dev). Origins are read from
// CORS_ALLOWED_ORIGINS (comma-separated). A disallowed origin simply gets no
// Access-Control-Allow-Origin header, so the browser blocks it.

// Matches Next's route-handler shape: optional segment context (dynamic params).
type RouteHandler = (
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx?: any
) => Promise<Response> | Response;

function allowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeadersFor(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-wb-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && allowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// Preflight handler — export as `OPTIONS` from each route.
export function corsPreflight(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeadersFor(req.headers.get("origin")),
  });
}

// Wrap a GET/POST handler so its response carries CORS headers.
export function withCors(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    const res = await handler(req, ctx);
    const cors = corsHeadersFor(req.headers.get("origin"));
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  };
}
