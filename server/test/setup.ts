import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./msw";

// Deterministic env for the hermetic suite. Only set if not already provided.
const defaults: Record<string, string> = {
  ACCESS_TOKEN_SECRET: "test-secret-do-not-use-in-prod",
  VOICE_BRIDGE_WINGBUDDY: "vb-test-key",
  SABRE_MODE: "mock",
  SABRE_APP_USERNAME: "TESTUSER",
  SABRE_APP_PASS: "testpass",
  SABRE_PCC: "TEST",
  SABRE_DOMAIN: "AS",
  SABRE_BASE_URL: "https://api-crt.cert.havail.sabre.com",
  SABRE_TEST_PNR: "ABC123",
  CORS_ALLOWED_ORIGINS: "https://client.test",
  NEXT_PUBLIC_APP_URL: "https://server.test",
  ANTHROPIC_API_KEY: "sk-ant-test",
};
for (const [k, v] of Object.entries(defaults)) {
  if (!process.env[k]) process.env[k] = v;
}

// Fail tests on unhandled external HTTP so nothing silently hits the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
