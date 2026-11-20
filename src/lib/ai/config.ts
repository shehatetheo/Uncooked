/**
 * The interviewer's model. Change it here and nowhere else.
 *
 * Requests go through Vercel AI Gateway. There is no API key: on Vercel the
 * AI SDK signs each request with the project's OIDC token, as long as no
 * AI_GATEWAY_API_KEY environment variable is set (a key would win over OIDC).
 * Locally: `vercel link`, then `vercel env pull` to get VERCEL_OIDC_TOKEN.
 *
 * These are the zero-cost chat models in the gateway catalog
 * (vercel.com/ai-gateway/models?freeTier=true). The first one that answers is
 * used; the others are tried in order if it is rate limited or unavailable.
 */
export const INTERVIEWER_MODEL = "reflection/beam-free";
export const FALLBACK_MODELS = ["nvidia/nemotron-3.5-lightning-free", "recursive/flint-v1.0"];

/** Spoken replies are short, so they don't need much thinking. Keeps the reply fast. */
export const REASONING = "low" as const;
