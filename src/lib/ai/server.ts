import { APICallError } from "ai";
import { GatewayAuthenticationError, GatewayError, GatewayRateLimitError } from "@ai-sdk/gateway";
import { FALLBACK_MODELS, INTERVIEWER_MODEL } from "./config";
import type { ApiError, ChatMessage, RunSummary } from "./protocol";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "./protocol";

/** The model that answered last time goes first, so a failing model isn't retried on every turn. */
let preferred = INTERVIEWER_MODEL;
let preferredAt = 0;
/** A fallback is only preferred for a few minutes, then the main model gets another chance. */
export const modelsToTry = () => [...new Set([Date.now() - preferredAt < 5 * 60_000 ? preferred : INTERVIEWER_MODEL, INTERVIEWER_MODEL, ...FALLBACK_MODELS])];
export const markWorking = (model: string) => {
  preferred = model;
  preferredAt = Date.now();
};

export const fail = (status: number, error: ApiError["error"], message: string) => Response.json({ error, message } satisfies ApiError, { status });

/** Turn a gateway failure into something the candidate can read. */
export function explain(e: unknown): { status: number; body: ApiError } {
  const carried = (e as { statusCode?: unknown } | null)?.statusCode;
  const status = e instanceof GatewayError ? e.statusCode : e instanceof APICallError ? e.statusCode ?? 502 : typeof carried === "number" ? carried : 502;
  const text = e instanceof Error ? e.message : String(e);
  if (e instanceof GatewayRateLimitError || status === 429 || /rate.?limit|too many requests/i.test(text)) return { status: 429, body: { error: "rate_limited", message: "The AI interviewer is rate limited on the free tier right now. Wait a minute and try again. Your code and tests still work." } };
  // the gateway won't serve even free models until the Vercel team has a card on file
  if (/credit card on file|customer_verification_required/i.test(text))
    return { status: 402, body: { error: "needs_card", message: "Vercel AI Gateway needs a credit card on file before it will answer, even for free models. Add one in the Vercel dashboard under AI Gateway, then try again. The coding, tests and ghost guide work without it." } };
  // this model isn't on the free tier: another one may be
  if (/do not have access to this model|RestrictedModels|no_providers_available/i.test(text))
    return { status: 502, body: { error: "model_restricted", message: "The interviewer's model isn't available on the AI Gateway free tier. Pick another one in src/lib/ai/config.ts. The coding, tests and ghost guide still work." } };
  if (status === 402 || /credit|quota|billing|payment/i.test(text)) return { status: 402, body: { error: "no_credits", message: "The AI Gateway free credits have run out for now. The coding, tests and ghost guide still work without the interviewer." } };
  if (e instanceof GatewayAuthenticationError || status === 401 || status === 403 || /oidc|api key|unauthenticated/i.test(text))
    return { status: 502, body: { error: "auth", message: "The AI interviewer couldn't sign in to Vercel AI Gateway. On Vercel, check that no AI_GATEWAY_API_KEY variable is set. Locally, run vercel env pull. The coding part still works." } };
  return { status: 502, body: { error: "unavailable", message: "The AI interviewer isn't reachable right now. The coding, tests and ghost guide still work. Try again in a moment." } };
}

/**
 * Most failures mean "try the next model": rate limits, a model that isn't on
 * the free tier, even running out of credit (the fallbacks cost nothing).
 * Only sign-in problems are the same for every model.
 */
export const worthRetrying = (e: unknown) => !["auth", "needs_card"].includes(explain(e).body.error);

// A small per-instance limiter so a stray tab can't burn the free tier.
const hits = new Map<string, number[]>();
export function limited(req: Request, limit = 90, windowMs = 10 * 60_000): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

/** Validate and tidy the conversation: capped, trimmed, starting with a user turn, roles alternating. */
export function cleanMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n${text}`;
    else out.push({ role, content: text });
  }
  while (out[0]?.role === "assistant") out.shift();
  return out;
}

export function cleanRun(raw: unknown): RunSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<RunSummary>;
  if (typeof r.passed !== "number" || typeof r.total !== "number") return null;
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  return {
    mode: r.mode === "submit" ? "submit" : "run",
    passed: r.passed,
    total: r.total,
    fatal: s(r.fatal, 1200),
    failures: (Array.isArray(r.failures) ? r.failures : []).slice(0, 3).map((f) => ({ input: s(f?.input, 300) ?? "", expected: s(f?.expected, 200) ?? "", got: s(f?.got, 200), error: s(f?.error, 600), hidden: !!f?.hidden })),
  };
}
