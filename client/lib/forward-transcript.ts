/** POST a final transcript line so the server can translate + append to the event log. */

export type TranscriptRole = "traveler" | "agent" | "joiner";

export async function forwardTranscript(params: {
  sessionId: string;
  requesterKey: string;
  role: TranscriptRole;
  lang: "hi" | "en";
  text: string;
}): Promise<void> {
  const text = params.text.trim();
  if (!text) return;

  const res = await fetch(`/api/session/${params.sessionId}/transcript`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wb-key": params.requesterKey,
    },
    body: JSON.stringify({
      role: params.role,
      lang: params.lang,
      text,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `transcript failed (${res.status})`);
  }
}
