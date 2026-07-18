import { randomUUID, randomBytes } from "node:crypto";
import {
  type FlightStatus,
  type SSRState,
  type WBEvent,
  type WBEventBody,
  MAX_EVENTS,
} from "./events";
import { mintRequesterKey } from "./access";

export interface Flight {
  carrier: string;
  number: string;
  date: string; // ISO date
  origin: string;
  dest: string;
  schedDep: string; // ISO datetime
  status: FlightStatus;
  gate: string;
  delayMin: number;
}

export interface Session {
  sessionId: string;
  roomName: string;
  createdAt: number;
  requesterKey: string;
  shareCode: string;
  pinHash?: string;
  language: "hi";
  flight: Flight;
  ssr: SSRState;
  presence: { requester: boolean; joiner: boolean };
  seq: number;
  events: WBEvent[];
}

export interface CreateSeed {
  flight: Flight;
  pinHash?: string;
}

// In-memory store — valid ONLY because Cloud Run runs one warm container
// (min=max=1). The get/create/append/mutate surface is the KV-swap seam.
const sessions = new Map<string, Session>();

function shareCode(): string {
  // 6 chars, unambiguous uppercase alphabet (no 0/O/1/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function createSession(seed: CreateSeed): Session {
  const sessionId = randomUUID();
  const session: Session = {
    sessionId,
    roomName: `wingbuddy-${sessionId.slice(0, 8)}`,
    createdAt: Date.now(),
    requesterKey: mintRequesterKey(),
    shareCode: shareCode(),
    pinHash: seed.pinHash,
    language: "hi",
    flight: seed.flight,
    ssr: "none",
    presence: { requester: false, joiner: false },
    seq: 0,
    events: [],
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function getSessionByShareCode(code: string): Session | undefined {
  const upper = code.trim().toUpperCase();
  for (const s of sessions.values()) {
    if (s.shareCode === upper) return s;
  }
  return undefined;
}

// Append an event: assigns a monotonic seq + timestamp, caps the log.
export function appendEvent(session: Session, body: WBEventBody): WBEvent {
  session.seq += 1;
  const event: WBEvent = { ...body, seq: session.seq, ts: Date.now() };
  session.events.push(event);
  if (session.events.length > MAX_EVENTS) {
    session.events.splice(0, session.events.length - MAX_EVENTS);
  }
  return event;
}

// Events strictly newer than `since` (monotonic seq).
export function eventsSince(session: Session, since: number): WBEvent[] {
  return session.events.filter((e) => e.seq > since);
}

// Mutate under a callback, so all writes flow through one place.
export function mutateSession(
  session: Session,
  fn: (s: Session) => void
): Session {
  fn(session);
  return session;
}

export function sessionCount(): number {
  return sessions.size;
}

// Test-only: clear the store between cases.
export function __resetStore(): void {
  sessions.clear();
}
