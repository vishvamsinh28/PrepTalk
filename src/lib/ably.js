/**
 * @file Ably REST client factory for minting realtime tokens. Only the server
 * holds `ABLY_API_KEY`; browsers get a scoped token from `/api/ably/token`.
 */

import * as Ably from "ably";

/**
 * Builds an Ably REST client from `ABLY_API_KEY`.
 * Constructed per call rather than at module level — the REST client holds no
 * socket, and this way importing the file doesn't throw when the key is absent.
 *
 * @returns {import("ably").Rest} Client for `createTokenRequest`. Never expose
 *   it, or its key, to the browser.
 * @throws {Error} When `ABLY_API_KEY` is not configured.
 */
export function getAblyRestClient() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    throw new Error("ABLY_API_KEY is not configured.");
  }

  return new Ably.Rest(apiKey);
}
