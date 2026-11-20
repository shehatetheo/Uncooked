import { experimental_generateSpeech as generateSpeech, gateway } from "ai";
import { SPEECH_MODEL, SPEECH_VOICE } from "@/lib/ai/config";
import { explain, fail, limited } from "@/lib/ai/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * One sentence of the interviewer's reply as audio. Played through a normal
 * audio element, which works where the browser's built-in voice is silent.
 */
export async function POST(req: Request): Promise<Response> {
  if (limited(req, 400)) return fail(429, "rate_limited", "Too many requests in a short time.");
  let text = "";
  try {
    text = String(((await req.json()) as { text?: unknown }).text ?? "").trim().slice(0, 600);
  } catch {
    /* handled below */
  }
  if (!text) return fail(400, "bad_request", "Nothing to say.");
  try {
    const { audio } = await generateSpeech({ model: gateway.speech(SPEECH_MODEL), text, voice: SPEECH_VOICE, outputFormat: "mp3", maxRetries: 1, abortSignal: req.signal });
    return new Response(audio.uint8Array as BodyInit, { headers: { "content-type": audio.mediaType || "audio/mpeg", "cache-control": "no-store" } });
  } catch (e) {
    console.error("speech failed:", e);
    const { status, body } = explain(e);
    return Response.json(body, { status });
  }
}
