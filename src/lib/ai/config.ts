/**
 * The interviewer's model. Change it here and nowhere else.
 *
 * Requests go through Vercel AI Gateway. There is no API key: on Vercel the
 * AI SDK signs each request with the project's OIDC token, as long as no
 * AI_GATEWAY_API_KEY environment variable is set (a key would win over OIDC).
 * Locally: `vercel link`, then `vercel env pull` to get VERCEL_OIDC_TOKEN.
 *
 * Every model here is marked "available to free tier" on
 * vercel.com/ai-gateway/models?freeTier=true. The first one is fast and
 * follows the interviewer's instructions well; it is paid for out of the
 * free tier's monthly credit (about a tenth of a cent per reply).
 */
export const INTERVIEWER_MODEL = "openai/gpt-5-mini";

/**
 * Tried in order if the model above is rate limited, restricted, or the free
 * credit has run out. These two cost nothing at all, so the interviewer keeps
 * working when the credit is gone.
 */
export const FALLBACK_MODELS = ["nvidia/nemotron-3.5-lightning-free", "recursive/flint-v1.0"];

/** Spoken replies are short, so they don't need much thinking. Keeps the reply fast. */
export const REASONING = "low" as const;
