// Sabre client behind SABRE_MODE (real | mock). Real branch is implemented in
// M3 (auth token cache + Get Reservation + SSR write); until then real ops throw
// NotImplemented and callers fall back to mock per the plan's degradation rule.

import type { Flight } from "./session-store";
import type { SSRState } from "./events";

export type SabreMode = "real" | "mock";

export function sabreMode(): SabreMode {
  return process.env.SABRE_MODE === "real" ? "real" : "mock";
}

class NotImplemented extends Error {
  constructor(op: string) {
    super(`Sabre real ${op} not implemented yet (M3)`);
    this.name = "NotImplemented";
  }
}

// Deterministic demo fixture (PLAN.md:187): UA 2348, 4:15pm, Gate 14A.
const MOCK_FLIGHT: Flight = {
  carrier: "UA",
  number: "2348",
  date: "2026-07-18",
  origin: "SFO",
  dest: "DEN",
  schedDep: "2026-07-18T16:15:00-07:00",
  status: "on_time",
  gate: "14A",
  delayMin: 0,
};

export interface FlightStatusResult {
  status: Flight["status"];
  schedDep: string;
  gate?: string;
  delayMin: number;
}

// --- Public interface (the swappable seam) ---

export async function seedFlight(): Promise<Flight> {
  if (sabreMode() === "mock") return { ...MOCK_FLIGHT };
  throw new NotImplemented("seedFlight"); // M3
}

export async function getFlightStatus(
  carrier: string,
  number: string,
  date: string
): Promise<FlightStatusResult> {
  if (sabreMode() === "mock") {
    return {
      status: MOCK_FLIGHT.status,
      schedDep: MOCK_FLIGHT.schedDep,
      gate: MOCK_FLIGHT.gate,
      delayMin: MOCK_FLIGHT.delayMin,
    };
  }
  throw new NotImplemented("getFlightStatus"); // M3
}

export async function rebook(
  _pnr: string,
  _criteria: unknown
): Promise<{ carrier: string; number: string; schedDep: string; gate?: string }> {
  if (sabreMode() === "mock") {
    return {
      carrier: MOCK_FLIGHT.carrier,
      number: MOCK_FLIGHT.number,
      schedDep: MOCK_FLIGHT.schedDep,
      gate: MOCK_FLIGHT.gate,
    };
  }
  throw new NotImplemented("rebook"); // M3
}

export async function readSSR(_pnr: string): Promise<SSRState> {
  if (sabreMode() === "mock") return "confirmed";
  throw new NotImplemented("readSSR"); // M3
}

export async function addSSR(_pnr: string, _code = "WCHR"): Promise<SSRState> {
  if (sabreMode() === "mock") return "reconfirmed";
  throw new NotImplemented("addSSR"); // M3
}
