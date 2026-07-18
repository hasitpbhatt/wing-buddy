// Hindi <-> English bridge. Phrase map covers the scripted demo lines; anything
// else falls through. M3 upgrades the fallback to the Anthropic API
// (claude-haiku-4-5) behind this same signature. Skips when src === dst.

export type Lang = "hi" | "en";

// Scripted demo lines (both directions) — deterministic, offline.
const PHRASES: Array<{ hi: string; en: string }> = [
  {
    hi: "मेरी फ्लाइट का टाइम बदल गया है और मुझे व्हीलचेयर चाहिए",
    en: "My flight time has changed and I need a wheelchair",
  },
  {
    hi: "मुझे दवाई के लिए पानी चाहिए",
    en: "I need water for my medicine",
  },
  {
    hi: "मैं यहाँ आपकी मदद के लिए हूँ",
    en: "I am here to help you",
  },
];

function lookup(text: string, src: Lang, dst: Lang): string | null {
  const needle = text.trim();
  for (const p of PHRASES) {
    if (p[src] === needle) return p[dst];
  }
  return null;
}

export interface TranslateResult {
  text: string;
  translated: boolean; // false = passthrough (no mapping / no API yet)
}

export async function translate(
  text: string,
  src: Lang,
  dst: Lang
): Promise<TranslateResult> {
  if (src === dst) return { text, translated: true };

  const mapped = lookup(text, src, dst);
  if (mapped) return { text: mapped, translated: true };

  // TODO (M3): call Anthropic claude-haiku-4-5 here. Until then, passthrough.
  return { text, translated: false };
}
