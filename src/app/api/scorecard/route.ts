import { generateText, Output } from "ai";
import { z } from "zod";
import { problemById } from "@content/index";
import { scorecardPrompt } from "@/lib/ai/prompt";
import { CATEGORIES, MAX_CODE_CHARS, type Scorecard, type ScorecardRequest } from "@/lib/ai/protocol";
import { cleanMessages, cleanRun, explain, fail, limited, markWorking, modelsToTry, worthRetrying } from "@/lib/ai/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const Area = z.object({ score: z.number(), tip: z.string() });
const Card = z.object({
  problemSolving: Area,
  communication: Area,
  codeQuality: Area,
  complexity: Area,
  edgeCases: Area,
  verdict: z.enum(["hire", "lean hire", "lean no"]),
  summary: z.string(),
});

/** The end-of-interview scorecard: five areas scored 1-5 with one tip each, and a verdict. */
export async function POST(req: Request): Promise<Response> {
  if (limited(req)) return fail(429, "rate_limited", "Too many requests in a short time. Wait a few minutes.");
  let body: Partial<ScorecardRequest>;
  try {
    body = (await req.json()) as Partial<ScorecardRequest>;
  } catch {
    return fail(400, "bad_request", "Body must be JSON.");
  }
  const p = typeof body.problemId === "string" ? problemById.get(body.problemId) : undefined;
  const messages = cleanMessages(body.messages);
  if (!p || !messages) return fail(400, "bad_request", "Unknown problem or malformed request.");

  const prompt = scorecardPrompt(p, {
    problemId: p.id,
    messages,
    code: typeof body.code === "string" ? body.code.slice(0, MAX_CODE_CHARS) : "",
    run: cleanRun(body.run),
    solved: body.solved === true,
    minutesUsed: typeof body.minutesUsed === "number" ? body.minutesUsed : 0,
    hintsShown: typeof body.hintsShown === "number" ? body.hintsShown : 0,
    skippedGhost: body.skippedGhost === true,
  });

  let lastError: unknown;
  for (const model of modelsToTry()) {
    try {
      const { output } = await generateText({ model, prompt, output: Output.object({ schema: Card }), maxOutputTokens: 4000, maxRetries: 0, abortSignal: req.signal });
      markWorking(model);
      const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));
      const card: Scorecard = {
        scores: Object.fromEntries(CATEGORIES.map(({ key }) => [key, { score: clamp(output[key].score), tip: output[key].tip.trim() }])) as Scorecard["scores"],
        verdict: output.verdict,
        summary: output.summary.trim(),
      };
      return Response.json(card);
    } catch (e) {
      lastError = e;
      if (!worthRetrying(e)) break;
    }
  }
  console.error("scorecard failed:", lastError);
  const { status, body: err } = explain(lastError);
  return Response.json(err, { status });
}
