import type { RubricPoint, TechQuestion } from "@content/technical";

export interface PointResult {
  id: string;
  label: string;
  max: number;
  earned: number;
  feedback: string;
}

export interface GradeResult {
  score: number;
  points: PointResult[];
  summary: string;
  whatToSay: string;
  example: string;
  followUp: string;
  /** "ai" when Claude graded it, "local" for the in-browser rubric check. */
  source: "ai" | "local";
}

const cache = new Map<string, RegExp>();
const re = (src: string) => {
  let r = cache.get(src);
  if (!r) cache.set(src, (r = new RegExp(src, "i")));
  return r;
};

/** Speech transcripts say symbols as words; normalise the common ones. */
export const normalise = (text: string) =>
  ` ${text} `
    .replace(/[‘’]/g, "'")
    .replace(/\bo\s*of\s*one\b/gi, "o of 1")
    .replace(/\bbig\s*o\b/gi, "big o")
    .replace(/\s+/g, " ");

export const hits = (p: RubricPoint, text: string) => p.detect.every((d) => re(d).test(text));

/** In-browser grading: a point counts when its patterns all appear in the answer. */
export function localGrade(q: TechQuestion, answer: string, code: string, ref: string): GradeResult {
  const text = normalise(`${answer}\n${code}`);
  const points = q.rubric.map((p) => {
    const ok = hits(p, text);
    return { id: p.id, label: p.label, max: p.max, earned: ok ? p.max : 0, feedback: ok ? "Covered." : p.tip };
  });
  const score = points.reduce((a, p) => a + p.earned, 0);
  const missing = points.filter((p) => !p.earned);
  return {
    score,
    points,
    summary: missing.length === 0 ? "Every point covered. Now say it again, faster and calmer." : `Missing ${missing.length} point${missing.length === 1 ? "" : "s"}: ${missing.map((m) => m.label.toLowerCase()).join("; ")}.`,
    whatToSay: q.say,
    example: ref,
    followUp: q.followUp.q,
    source: "local",
  };
}

/** Points heard so far, for the live checklist and pop-ups. */
export function liveCheck(q: TechQuestion, answer: string, code: string) {
  const text = normalise(`${answer}\n${code}`);
  return q.rubric.map((p) => ({ ...p, hit: hits(p, text) }));
}
