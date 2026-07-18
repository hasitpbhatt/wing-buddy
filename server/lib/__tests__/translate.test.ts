import { describe, it, expect } from "vitest";
import { translate } from "@/lib/translate";

describe("translate", () => {
  it("skips when src === dst", async () => {
    const r = await translate("hello", "en", "en");
    expect(r).toEqual({ text: "hello", translated: true });
  });

  it("maps a scripted hi -> en line", async () => {
    const r = await translate(
      "मुझे दवाई के लिए पानी चाहिए",
      "hi",
      "en"
    );
    expect(r.translated).toBe(true);
    expect(r.text).toBe("I need water for my medicine");
  });

  it("maps a scripted en -> hi line", async () => {
    const r = await translate("I am here to help you", "en", "hi");
    expect(r.translated).toBe(true);
    expect(r.text).toBe("मैं यहाँ आपकी मदद के लिए हूँ");
  });

  it("passes through unmapped text (translated=false) until M3 Anthropic path", async () => {
    const r = await translate("some unmapped sentence", "en", "hi");
    expect(r).toEqual({ text: "some unmapped sentence", translated: false });
  });
});
