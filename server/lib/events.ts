// Canonical event envelope (PLAN-v2 §4.3). Every session mutation appends one.

export type SSRState = "none" | "confirmed" | "dropped" | "reconfirmed";

export type FlightStatus = "on_time" | "delayed" | "cancelled";

export type WBEventBody =
  | { type: "flight_event"; kind: "gate_change" | "delay"; gate?: string; delayMin?: number }
  | { type: "ssr_update"; value: SSRState }
  | { type: "agent_action"; label: string }
  | { type: "facilities"; airport: string; need: string; result: string }
  | { type: "family_message"; text: string }
  | { type: "flight_update"; kind: string; gate?: string; delayMin?: number }
  | { type: "presence"; who: "requester" | "joiner"; kind: "joined" | "left" }
  | {
      type: "transcript";
      role: "traveler" | "agent" | "joiner";
      lang: string;
      text: string;
      textTranslated?: string;
    };

export type WBEventType = WBEventBody["type"];

// A stored event carries a monotonic seq and a timestamp.
export type WBEvent = WBEventBody & { seq: number; ts: number };

// Cap on retained events per session (oldest dropped beyond this).
export const MAX_EVENTS = 500;
