// Build-time merge: copies server/app/api + server/lib into client/
// so Vercel builds one Next.js app containing client UI + server APIs.
// Run before `next build` — never commit the merged output.

import { cpSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const log = (msg) => process.stderr.write(`[merge] ${msg}\n`);

// 1. Delete client/app/api/ (stale stubs removed earlier; rebuild from server/)
log("clearing client/app/api/ …");
rmSync(resolve(ROOT, "client", "app", "api"), { recursive: true, force: true });

// 2. Delete the 4 stale client lib files that server/ replaces.
//    If they were already cleaned they won't exist — safe no-op.
for (const f of ["access.ts", "events.ts", "session-store.ts", "vocalbridge.ts"]) {
  const p = resolve(ROOT, "client", "lib", f);
  try { rmSync(p, { force: true }); log(`removed client/lib/${f}`); } catch {}
}

// 3. Copy server/app/api → client/app/api (skip __tests__ dirs)
cpSync(
  resolve(ROOT, "server", "app", "api"),
  resolve(ROOT, "client", "app", "api"),
  {
    recursive: true,
    filter: (src) => !src.includes("__tests__"),
  }
);
log("copied server/app/api → client/app/api");

// 4. Copy server/lib/ → client/lib/ (overwrites anything in client/lib/)
cpSync(
  resolve(ROOT, "server", "lib"),
  resolve(ROOT, "client", "lib"),
  {
    recursive: true,
  }
);
log("copied server/lib → client/lib");

log("merge complete");