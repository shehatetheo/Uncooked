import type { Probe, RubricPoint, TechQuestion } from "@content/technical";

/**
 * The interview simulator's interviewer: after each turn, it looks at which
 * rubric points are still missing and asks for the most natural next one,
 * the way a real interviewer steers. Lines match recorded voice clips.
 */
export const PROBE_LINES: Record<Probe | "more", string> = {
  clarify: "Before you go further, do you have any questions about the input, or assumptions you'd want to check with me?",
  brute: "Okay. What's the simplest way you could solve it, even if it's slow? And what would that cost?",
  core: "Can you walk me through exactly how that would work, step by step?",
  why: "Why that choice? What would go wrong with the obvious alternative?",
  alt: "Is there another way you could do it?",
  example: "Can you give me a quick example?",
  complexity: "Got it. And what's the time and space complexity of that?",
  edge: "What edge cases would you test before calling it done?",
  more: "Mm-hm. Keep going, talk me through the rest.",
};
export const INTRO_LINE = "Hi, thanks for coming in today. I'm going to give you a problem, and I'd like you to think out loud the whole way. I care more about how you get there than the final answer. Ready? Here it is.";
export const NEXT_LINE = "Alright, nice work. Let's move on to the next one.";
export const WRAP_LINE = "Great, that's everything I need for this one. Let's see how you did.";
export const followLine = (q: TechQuestion) => `Nice. One follow-up: ${q.followUp.q.charAt(0).toLowerCase()}${q.followUp.q.slice(1)}`;

const DEFAULT_PROBE: Record<string, Probe> = {
  clarify: "clarify", rules: "clarify", restate: "clarify", runs: "clarify",
  brute: "brute",
  complexity: "complexity", space: "complexity",
  edge: "edge", separate: "edge", end: "edge", once: "edge",
  negate: "why", immutable: "why", wherehaving: "why",
  alt: "alt", example: "example",
};
export const probeOf = (p: RubricPoint): Probe => p.probe ?? DEFAULT_PROBE[p.id] ?? "core";

/** The order a real interviewer tends to ask in. */
const ORDER: Probe[] = ["clarify", "brute", "core", "why", "example", "alt", "complexity", "edge"];
export const MAX_PROBES = 4;

export type Step = { kind: "probe"; probe: Probe | "more" } | { kind: "follow" } | { kind: "wrap" };

/**
 * What the interviewer does next.
 * @param missing rubric points not yet heard
 * @param asked probes already used for this question
 * @param words how many words the candidate has said in total
 * @param followed whether the follow-up has been asked
 */
export function nextStep(missing: RubricPoint[], asked: (Probe | "more")[], words: number, followed: boolean): Step {
  if (followed) return { kind: "wrap" };
  // They barely said anything: invite them to keep going, once.
  if (words < 25 && !asked.includes("more")) return { kind: "probe", probe: "more" };
  const probesUsed = asked.filter((a) => a !== "more").length;
  if (probesUsed < MAX_PROBES) {
    const open = new Set(missing.map(probeOf));
    // clarify only makes sense early on
    if (probesUsed > 0) open.delete("clarify");
    const probe = ORDER.find((p) => open.has(p) && !asked.includes(p));
    if (probe) return { kind: "probe", probe };
  }
  return { kind: "follow" };
}
