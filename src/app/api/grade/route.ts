import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { techById } from "@content/technical";
import { problemById } from "@/lib/content/problems";
import { sqlById } from "@/lib/content/sql";
import { configured, fail, limited, passcodeOk } from "@/lib/interview/guard";
import type { GradeResult } from "@/lib/technical";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const client = new Anthropic(); // ANTHROPIC_API_KEY, server-side only

const Graded = z.object({
  points: z.array(z.object({ id: z.string(), earned: z.number(), feedback: z.string() })),
  summary: z.string(),
  whatToSay: z.string(),
  example: z.string(),
  followUp: z.string(),
});

const SYSTEM = `You grade answers in a practice technical interview for the SAP STAR student program (freshman CS student, Python, easy-to-medium problems, SQL is a separate interview). The candidate's answer is a speech-recognition transcript, possibly with some typed code; read it charitably and ignore recognition errors and filler words.

Grade strictly against the rubric you are given. For each rubric point, award an integer from 0 to its max:
- full points when the idea is clearly and correctly stated, even briefly;
- partial points when it is vague, incomplete, or partly wrong;
- 0 when it is missing or wrong.
Never give points for something the candidate didn't say or write. Keep each point's feedback to one sentence: what they said well, or exactly what was missing.

Then write:
- summary: two sentences, honest and encouraging, the single most important fix first;
- whatToSay: the answer they should give if this question comes up, written to be spoken out loud in first person, under 130 words, keeping what they did well and fixing what they missed;
- example: a short, correct Python solution (or SQL query for SQL questions), with no explanation and no markdown fences;
- followUp: one follow-up question a real interviewer would ask next, based on this answer.`;

/** Grade one technical-interview answer against its rubric. */
export async function POST(req: Request): Promise<Response> {
  if (!configured()) return fail(503, "not_configured", "AI grading isn't set up on this deployment.");
  if (!passcodeOk(req)) return fail(401, "bad_passcode", "Wrong passcode.");
  if (limited(req)) return fail(429, "rate_limited", "Too many requests. Wait a few minutes.");

  let body: { questionId?: unknown; answer?: unknown; code?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return fail(400, "bad_request", "Body must be JSON.");
  }
  const q = typeof body.questionId === "string" ? techById.get(body.questionId) : undefined;
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 8000) : "";
  const code = typeof body.code === "string" ? body.code.slice(0, 6000) : "";
  if (!q || !answer.trim() && !code.trim()) return fail(400, "bad_request", "Unknown question or empty answer.");

  const reference = q.kind === "sql" ? sqlById.get(q.ref)?.solution ?? "" : problemById.get(q.ref)?.solution ?? "";
  const rubric = q.rubric.map((p) => `- id "${p.id}" (max ${p.max}): ${p.label}`).join("\n");
  const prompt = `Question asked: ${q.ask}

Rubric (points add up to 100):
${rubric}

Reference solution, for your judgment only:
${reference}

Candidate's spoken answer:
"""${answer || "(nothing said)"}"""

Candidate's typed code:
"""${code || "(none)"}"""`;

  try {
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 12000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Graded) },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return fail(502, "no_grade", "The grader couldn't score that answer. Using the in-browser grade.");
    const out = res.parsed_output;
    const points = q.rubric.map((p) => {
      const g = out.points.find((x) => x.id === p.id);
      const earned = Math.max(0, Math.min(p.max, Math.round(g?.earned ?? 0)));
      return { id: p.id, label: p.label, max: p.max, earned, feedback: g?.feedback ?? p.tip };
    });
    const result: GradeResult = {
      score: points.reduce((a, p) => a + p.earned, 0),
      points,
      summary: out.summary,
      whatToSay: out.whatToSay,
      example: out.example,
      followUp: out.followUp,
      source: "ai",
    };
    return Response.json(result);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return fail(502, "bad_key", "The Anthropic API key was rejected.");
    if (e instanceof Anthropic.RateLimitError) return fail(429, "rate_limited", "Anthropic rate limit hit. Try again in a minute.");
    if (e instanceof Anthropic.BadRequestError && /credit balance/i.test(e.message)) return fail(402, "no_credits", "The Anthropic account has no API credits, so this was graded in the browser instead.");
    if (e instanceof Anthropic.APIError) return fail(502, "api_error", `Anthropic API error ${e.status ?? ""}`.trim());
    return fail(502, "api_error", "Could not reach the grader.");
  }
}
