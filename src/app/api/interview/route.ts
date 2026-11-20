import { streamText, type ModelMessage } from "ai";
import { problemById } from "@content/index";
import { REASONING } from "@/lib/ai/config";
import { contextBlock, EVENT_MARKER, systemPrompt } from "@/lib/ai/prompt";
import { MAX_CODE_CHARS, type InterviewEvent, type InterviewRequest } from "@/lib/ai/protocol";
import { cleanMessages, cleanRun, explain, fail, limited, markWorking, modelsToTry, worthRetrying } from "@/lib/ai/server";
import { PHASES, type Phase } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const EVENTS = Object.keys(EVENT_MARKER) as InterviewEvent[];

/**
 * One interviewer turn, streamed back as plain text.
 * The model is reached through Vercel AI Gateway with the project's OIDC token.
 */
export async function POST(req: Request): Promise<Response> {
  if (limited(req)) return fail(429, "rate_limited", "Too many messages in a short time. Wait a few minutes.");
  let body: Partial<InterviewRequest>;
  try {
    const text = await req.text();
    if (text.length > 200_000) return fail(400, "bad_request", "That conversation is too long.");
    body = JSON.parse(text) as Partial<InterviewRequest>;
  } catch {
    return fail(400, "bad_request", "Body must be JSON.");
  }
  const p = typeof body.problemId === "string" ? problemById.get(body.problemId) : undefined;
  const phase = PHASES.includes(body.phase as Phase) ? (body.phase as Phase) : null;
  const history = cleanMessages(body.messages);
  const event = EVENTS.includes(body.event as InterviewEvent) ? (body.event as InterviewEvent) : undefined;
  if (!p || !phase || !history) return fail(400, "bad_request", "Unknown problem or malformed request.");

  // The conversation must end with a user turn: what the candidate said, or the event marker.
  if (event && history[history.length - 1]?.role !== "user") history.push({ role: "user", content: EVENT_MARKER[event] });
  if (history[history.length - 1]?.role !== "user") return fail(400, "bad_request", "Nothing to reply to.");

  const context = contextBlock(p, {
    phase,
    event,
    code: typeof body.code === "string" ? body.code.slice(0, MAX_CODE_CHARS) : "",
    run: cleanRun(body.run),
    minutesLeft: typeof body.minutesLeft === "number" ? body.minutesLeft : 25,
    hintsShown: typeof body.hintsShown === "number" ? body.hintsShown : 0,
  });
  const messages: ModelMessage[] = history.map((m, i) => (i === history.length - 1 ? { role: "user", content: `${context}\n\n${m.content.startsWith("[") ? m.content : `The candidate says: ${m.content}`}` } : { role: m.role, content: m.content }));

  let lastError: unknown;
  for (const model of modelsToTry()) {
    try {
      const result = streamText({ model, instructions: systemPrompt(p), messages, maxOutputTokens: 1200, reasoning: REASONING, maxRetries: 0, abortSignal: req.signal });
      const parts = result.fullStream[Symbol.asyncIterator]();
      // Wait for the first words before answering, so a dead model can fall through to the next one.
      let first = "";
      while (!first) {
        const { value, done } = await parts.next();
        if (done) break;
        if (value.type === "error") throw value.error;
        if (value.type === "text-delta") first = value.text;
      }
      if (!first) throw new Error("The model returned no text.");
      markWorking(model);
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(encoder.encode(first));
          try {
            for (;;) {
              const { value, done } = await parts.next();
              if (done) break;
              if (value.type === "text-delta") controller.enqueue(encoder.encode(value.text));
              if (value.type === "error") break; // keep what was already said
            }
          } catch {
            /* connection dropped mid-reply: end with what we have */
          }
          controller.close();
        },
      });
      return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-interviewer-model": model } });
    } catch (e) {
      lastError = e;
      if (req.signal.aborted) return new Response(null, { status: 499 });
      if (!worthRetrying(e)) break;
    }
  }
  console.error("interviewer failed:", lastError);
  const { status, body: err } = explain(lastError);
  return Response.json(err, { status });
}
