import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Shared protections for routes that spend Anthropic API credits. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;

export function limited(req: Request, limit = 60): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

const digest = (s: string) => createHash("sha256").update(s).digest();
export function passcodeOk(req: Request): boolean {
  const expected = process.env.INTERVIEW_PASSCODE;
  const given = req.headers.get("x-interview-passcode");
  if (!expected || !given) return false;
  return timingSafeEqual(digest(given.trim()), digest(expected));
}

export const configured = () => !!process.env.ANTHROPIC_API_KEY && !!process.env.INTERVIEW_PASSCODE;
export const fail = (status: number, error: string, message: string) => Response.json({ error, message }, { status });
