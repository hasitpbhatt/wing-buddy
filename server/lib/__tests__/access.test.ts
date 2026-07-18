import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  mintRequesterKey,
  verifyRequesterKey,
  hashPin,
  verifyPin,
} from "@/lib/access";

describe("access — signed `t` tokens", () => {
  it("round-trips sign → verify and returns the sessionId", () => {
    const t = signAccessToken("sess-1");
    const v = verifyAccessToken(t);
    expect(v?.sessionId).toBe("sess-1");
    expect(v?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered signature", () => {
    const t = signAccessToken("sess-1");
    const tampered = t.slice(0, -2) + (t.endsWith("aa") ? "bb" : "aa");
    expect(verifyAccessToken(tampered)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const t = signAccessToken("sess-1");
    const [, sig] = t.split(".");
    const forged = Buffer.from("sess-EVIL|" + (Date.now() + 10000)).toString(
      "base64url"
    );
    expect(verifyAccessToken(`${forged}.${sig}`)).toBeNull();
  });

  it("rejects an expired token (TTL elapsed)", () => {
    const t = signAccessToken("sess-1", -1000); // already expired
    expect(verifyAccessToken(t)).toBeNull();
  });

  it("rejects malformed / empty input", () => {
    expect(verifyAccessToken(null)).toBeNull();
    expect(verifyAccessToken("")).toBeNull();
    expect(verifyAccessToken("no-dot")).toBeNull();
  });
});

describe("access — requesterKey", () => {
  it("mints unique keys and verifies in constant time", () => {
    const a = mintRequesterKey();
    const b = mintRequesterKey();
    expect(a).not.toBe(b);
    expect(verifyRequesterKey(a, a)).toBe(true);
    expect(verifyRequesterKey(a, b)).toBe(false);
    expect(verifyRequesterKey("", a)).toBe(false);
  });
});

describe("access — PIN", () => {
  it("hashes and verifies a PIN", () => {
    const h = hashPin("1234");
    expect(h).not.toBe("1234");
    expect(verifyPin("1234", h)).toBe(true);
    expect(verifyPin("9999", h)).toBe(false);
    expect(verifyPin("1234", undefined)).toBe(false);
  });
});
