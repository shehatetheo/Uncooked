import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { techById } from "@content/technical";
import { configured, fail, limited, passcodeOk } from "@/lib/interview/guard";
import { clipMenu } from "@/lib/simulator";

export const runtime = "nodejs";
export const maxDuration = 30;

// a live call needs quick replies, so a fast model at low effort
const MODEL = "claude-sonnet-5-5";
const client = new Anthropic(); // ANTHROPIC_API_KEY, server-side only

const Reply = z.object({
  clip: z.string(),
  say: z.string(),
  wrap: z.boolean(),
  follow: z.boolean(),
});

const SYSTEM = `You are a friendly, sharp software engineer at SAP running a live technical phone interview for the STAR student program (a freshman CS student; Python; easy problems; SQL counts too). This is a voice call: your words are spoken aloud, so talk like a person on a call. One to three short sentences, no lists, no code, no markdown, never more than 45 words.

How to run the question:
- Never give away the solution or name the data structure or pattern they should use. Nudge with questions instead.
- When the candidate asks you a question about the problem, answer it directly and briefly, using the facts given. If the facts don't cover it, tell them to state a reasonable assumption.
- React to what they actually said. If they skipped the brute force, the time and space complexity, or edge cases, ask for the one that matters most next.
- Once the core idea and complexity are covered, ask the follow-up question you are given (set follow to true when you ask it).
- After they answer the follow-up, or when time is nearly up, wrap up warmly in one sentence and set wrap to true.
- In a dry run, you may coach a bit more: if they're stuck, give one small hint. In the real thing, don't hint.

Voice clips: you get a menu of lines that have a recorded voice. If one of them says what you want to say, put its key in clip and copy its text into say exactly. Prefer a clip whenever it fits. Otherwise leave clip empty and write your own line in say.`;

/**
 * One turn of the gauntlet's live interviewer.
 * Body: { questionId, turns: {who, text}[], secondsLeft, dry, followed }
 */
export async function POST(req: Request): Promise<Response> {
  if (!configured()) return fail(503, "not_configured", "The AI interviewer isn't set up on this deployment.");
  if (!passcodeOk(req)) return fail(401, "bad_passcode", "Wrong passcode.");
  if (limited(req, 120)) return fail(429, "rate_limited", "Too many requests. Wait a few minutes.");

  let body: { questionId?: unknown; turns?: unknown; secondsLeft?: unknown; dry?: unknown; followed?: unknown; code?: unknown };
  try {
    const text = await req.text();
    if (text.length > 40_000) return fail(413, "too_large", "Conversation is too long.");
    body = JSON.parse(text) as typeof body;
  } catch {
    return fail(400, "bad_request", "Body must be JSON.");
  }
  const q = typeof body.questionId === "string" ? techById.get(body.questionId) : undefined;
  const turns = Array.isArray(body.turns)
    ? body.turns.filter((t): t is { who: "them" | "you"; text: string } => !!t && typeof t === "object" && (t.who === "them" || t.who === "you") && typeof t.text === "string").slice(-40)
    : null;
  if (!q || !turns?.length) return fail(400, "bad_request", "Unknown question or empty conversation.");

  const menu = clipMenu(q);
  const left = typeof body.secondsLeft === "number" ? Math.round(body.secondsLeft) : null;
  const facts = q.qa.map((x) => `- ${x.q} ${x.a}`).join("\n");
  const context = `Question you asked: ${q.ask}

Facts about the problem, for answering the candidate's questions:
${facts}

What a strong answer covers:
${q.rubric.map((p) => `- ${p.label}`).join("\n")}

The follow-up to ask once the core is covered: ${q.followUp.q}
(A good answer: ${q.followUp.a})

Mode: ${body.dry === true ? "dry run (practice, light coaching allowed)" : "the real thing (no hints)"}.
Follow-up already asked: ${body.followed === true ? "yes" : "no"}.
${left === null ? "" : left <= 0 ? "Time is up: wrap up now." : `Time left on this question: ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}.${left <= 45 ? " Nearly out of time: wrap up unless they're mid-sentence on the follow-up." : ""}`}

Voice clip menu (key: text):
${Object.entries(menu).map(([k, v]) => `${k}: ${v}`).join("\n")}

The candidate's code so far (they type in a shared editor while talking; react to it if it's relevant):
${typeof body.code === "string" && body.code.trim() ? body.code.slice(0, 4000) : "(nothing typed yet)"}

The call so far:
${turns.map((t) => `${t.who === "them" ? "You" : "Candidate"}: ${t.text.slice(0, 2000)}`).join("\n")}

Reply with your next line.`;

  try {
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Reply) },
      system: SYSTEM,
      messages: [{ role: "user", content: context }],
    });
    const out = res.parsed_output;
    if (res.stop_reason === "refusal" || !out || !out.say.trim()) return fail(502, "no_reply", "The interviewer didn't reply.");
    const clip = out.clip && menu[out.clip] ? out.clip : undefined;
    return Response.json({ say: clip ? menu[clip] : out.say.trim(), clip, wrap: out.wrap || (left !== null && left <= 0), follow: out.follow || clip === `${q.id}-follow` });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return fail(502, "bad_key", "the API key was rejected");
    if (e instanceof Anthropic.RateLimitError) return fail(429, "rate_limited", "rate limited, try again in a minute");
    if (e instanceof Anthropic.BadRequestError && /credit balance/i.test(e.message)) return fail(402, "no_credits", "the Anthropic account has no API credits");
    if (e instanceof Anthropic.APIError) return fail(502, "api_error", `Anthropic API error ${e.status ?? ""}`.trim());
    return fail(502, "api_error", "couldn't reach Claude");
  }
}
