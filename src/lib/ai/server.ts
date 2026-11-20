import { APICallError } from "ai";
import { GatewayAuthenticationError, GatewayError, GatewayRateLimitError } from "@ai-sdk/gateway";
import { FALLBACK_MODELS, INTERVIEWER_MODEL } from "./config";
import type { ApiError, ChatMessage, RunSummary } from "./protocol";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "./protocol";

/** The model that answered last time goes first, so a dead model isn't retried on every turn. */
let preferred = INTERVIEWER_MODEL;
export const modelsToTry = () => [...new Set([preferred, INTERVIEWER_MODEL, ...FALLBACK_MODELS])];
export const markWorking = (model: string) => {
  preferred = model;
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
  if (status === 402 || /credit|quota|billing|payment/i.test(text)) return { status: 402, body: { error: "no_credits", message: "The AI Gateway free credits have run out for now. The coding, tests and ghost guide still work without the interviewer." } };
  if (e instanceof GatewayAuthenticationError || status === 401 || status === 403 || /oidc|api key|unauthenticated/i.test(text))
    return { status: 502, body: { error: "auth", message: "The AI interviewer couldn't sign in to Vercel AI Gateway. On Vercel, check that no AI_GATEWAY_API_KEY variable is set. Locally, run vercel env pull. The coding part still works." } };
  return { status: 502, body: { error: "unavailable", message: "The AI interviewer isn't reachable right now. The coding, tests and ghost guide still work. Try again in a moment." } };
}

/** Rate limiting and model errors mean "try the next model"; auth and credit errors won't be fixed by another model. */
export const worthRetrying = (e: unknown) => !["auth", "no_credits", "needs_card"].includes(explain(e).body.error);

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
