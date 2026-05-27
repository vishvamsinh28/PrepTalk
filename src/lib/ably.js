import * as Ably from "ably";

export function getAblyRestClient() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    throw new Error("ABLY_API_KEY is not configured.");
  }

  return new Ably.Rest(apiKey);
}
