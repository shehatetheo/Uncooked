import Anthropic from "@anthropic-ai/sdk";
import { createHash, timingSafeEqual } from "node:crypto";
import { FEEDBACK_PROMPT, systemPrompt } from "@/lib/interview/prompt";
import { isRound, MAX_TURN_CHARS, MAX_TURNS, type Turn } from "@/lib/interview/rounds";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the server environment only

// Best-effort brake per server instance, on top of the passcode.
const hits = new Map<string, number[]>();
const LIMIT = 60;
const WINDOW_MS = 10 * 60_000;
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

const digest = (s: string) => createHash("sha256").update(s).digest();
function passcodeOk(given: string | null): boolean {
  const expected = process.env.INTERVIEW_PASSCODE;
  if (!expected || !given) return false;
  return timingSafeEqual(digest(given.trim()), digest(expected));
}

const fail = (status: number, error: string, message: string) => Response.json({ error, message }, { status });

function parseTurns(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_TURNS) return null;
  const out: Turn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") return null;
    const { role, content } = t as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || content.length > MAX_TURN_CHARS) return null;
    if (content.trim()) out.push({ role, content });
  }
  return out;
}

/**
 * One interviewer turn (or the closing feedback), streamed back as plain text.
 * Body: { round, mode: "turn" | "feedback", messages: Turn[], minutesLeft? }
 * Header: x-interview-passcode
 */
export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY || !process.env.INTERVIEW_PASSCODE) return fail(503, "not_configured", "The AI interviewer isn't set up on this deployment.");
  if (!passcodeOk(req.headers.get("x-interview-passcode"))) return fail(401, "bad_passcode", "Wrong passcode.");
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
  if (limited(ip)) return fail(429, "rate_limited", "Too many requests. Wait a few minutes.");

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_TURNS * MAX_TURN_CHARS) return fail(413, "too_large", "Conversation is too long.");
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return fail(400, "bad_request", "Body must be JSON.");
  }
  const { round, mode, minutesLeft } = body;
  const turns = parseTurns(body.messages);
  if (!isRound(round) || (mode !== "turn" && mode !== "feedback") || !turns) return fail(400, "bad_request", "Invalid interview request.");

  const feedback = mode === "feedback";
  const messages: Anthropic.Beta.BetaMessageParam[] = turns.length ? turns.map((t) => ({ role: t.role, content: t.content })) : [];
  // The conversation must open with a user turn.
  if (!messages.length || messages[0]!.role !== "user") messages.unshift({ role: "user", content: "(The candidate has joined the call. Greet them in one sentence and begin.)" });
  if (feedback) messages.push({ role: "user", content: FEEDBACK_PROMPT });
  else if (typeof minutesLeft === "number" && messages[messages.length - 1]!.role === "user") {
    // Operator note after the latest user turn; keeps the cached prefix intact.
    const note = minutesLeft <= 0 ? "Time is up. Thank the candidate and close the interview in one or two sentences, without asking another question." : minutesLeft <= 2 ? `About ${Math.max(1, Math.round(minutesLeft))} minute left. Start wrapping up: one last short question at most.` : null;
    if (note) messages.push({ role: "system", content: note });
  }

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: feedback ? 16000 : 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: feedback ? "medium" : "low" },
    system: [{ type: "text", text: systemPrompt(round), cache_control: { type: "ephemeral" } }],
    messages,
  });

  // Pull the first event before answering, so API errors (no credits, bad key)
  // become a proper HTTP status instead of a broken stream.
  const events = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.Beta.BetaRawMessageStreamEvent>;
  try {
    first = await events.next();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return fail(502, "bad_key", "The Anthropic API key was rejected.");
    if (e instanceof Anthropic.RateLimitError) return fail(429, "rate_limited", "Anthropic rate limit hit. Wait a minute and try again.");
    if (e instanceof Anthropic.BadRequestError && /credit balance/i.test(e.message)) return fail(402, "no_credits", "The Anthropic account has no API credits. Add credits under Plans & Billing in the Anthropic Console.");
    if (e instanceof Anthropic.APIError) return fail(502, "api_error", `Anthropic API error ${e.status ?? ""}`.trim());
    return fail(502, "api_error", "Could not reach the Anthropic API.");
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (ev: Anthropic.Beta.BetaRawMessageStreamEvent) => {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") controller.enqueue(encoder.encode(ev.delta.text));
      };
      try {
        if (!first.done) emit(first.value);
        for (let r = await events.next(); !r.done; r = await events.next()) emit(r.value);
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode(" (The interviewer couldn't respond to that. Try saying it another way.)"));
      } catch {
        controller.enqueue(encoder.encode(" (The connection dropped. Say that again.)"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(body$, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
