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

/* ───── asking the interviewer ───── */

export const ASK_GENERIC = "Good question. Assume the simplest reasonable case, and say your assumption out loud.";
const QUESTION_START = /^(can|could|do|does|is|are|should|would|will|what|how|when|which|who|where|may|am i|so is|so can|so do|quick question)\b/i;

/** A short turn that reads like a question to the interviewer, not an answer. */
export function isQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const n = t.split(/\s+/).length;
  if (n > 30) return false;
  // "Can numbers repeat? I'll assume yes." asks and answers itself: that's an answer
  if (/\?\s*$/.test(t)) return true;
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.length === 1 && n <= 18 && QUESTION_START.test(t) && !/\bassum/i.test(t);
}

const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(es|s)$/, "");

/** Which prepared question this matches best, by keyword overlap; -1 if none. */
export function matchQuestion(q: TechQuestion, text: string): number {
  const said = new Set(text.split(/\s+/).map(stem).filter(Boolean));
  let best = -1;
  let bestHits = 0;
  q.qa.forEach((item, i) => {
    const hits = item.keys.filter((k) => said.has(stem(k))).length;
    if (hits > bestHits) {
      best = i;
      bestHits = hits;
    }
  });
  return best;
}

/* ───── the gauntlet ───── */

export interface GauntletRound { id: string; seconds: number; label: string }
/** Five questions, each on its own clock: about 25 minutes, like a real technical round. */
export const GAUNTLET: GauntletRound[] = [
  { id: "t-two-sum", seconds: 240, label: "Warm-up" },
  { id: "t-sql-joins", seconds: 180, label: "Rapid fire" },
  { id: "t-parentheses", seconds: 300, label: "The stack" },
  { id: "t-group-anagrams", seconds: 360, label: "The hash map" },
  { id: "t-merge-intervals", seconds: 420, label: "Boss round" },
];
export const GAUNTLET_INTRO = "Hey, thanks for hopping on the call. This is the gauntlet: five questions, each one on its own clock. Think out loud, ask me anything about the problem, and keep an eye on the time. Ready? Here's the first one.";
export const GAUNTLET_NEXT = "Okay. Next question, and the clock starts now.";
export const GAUNTLET_END = "That's the gauntlet. Thanks for your time today. Let's see how you did.";
export const ONE_MIN_LINE = "Quick heads-up: about a minute left on this one.";
export const TIME_UP_LINE = "And that's time. Let's stop there.";

/** How done you are, on the app's own scale: not cooked is good. */
export function verdict(score: number): { title: string; line: string } {
  if (score >= 90) return { title: "Uncooked", line: "Interview-ready. Walk in calm." };
  if (score >= 75) return { title: "Barely warm", line: "Strong. Tighten the points you dropped and you're there." };
  if (score >= 55) return { title: "Simmering", line: "The ideas are there. Say complexity and edge cases every time." };
  if (score >= 35) return { title: "Cooked", line: "Rerun the dry run, then go again for real." };
  return { title: "Burnt", line: "Go back to the Top 10 interview for these five, then come back." };
}

export const clock = (s: number) => `${s < 0 ? "-" : ""}${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

/** Lines with a recorded voice clip. Using one means the candidate hears the real voice, not the browser's. */
export function clipMenu(q: TechQuestion): Record<string, string> {
  const menu: Record<string, string> = {};
  for (const [k, v] of Object.entries(PROBE_LINES)) menu[`probe-${k}`] = v;
  q.qa.forEach((item, i) => (menu[`${q.id}-qa-${i}`] = item.a));
  menu[`${q.id}-follow`] = followLine(q);
  menu["ask-generic"] = ASK_GENERIC;
  menu["sim-wrap"] = WRAP_LINE;
  return menu;
}

/* ───── the feedback rubric: a score out of 5 per attribute, each with one fix ───── */

export interface RoundInput { q: TechQuestion; points: { id: string; earned: number; max: number }[]; seconds: number; limit: number; said: string }
export interface Attribute { name: string; score: number; tip: string }

const FILLERS = /\b(um+|uh+|erm|like|you know|basically|kind of|sort of|i mean)\b/gi;
export const fillerCount = (text: string) => (text.match(FILLERS) ?? []).length;

const AREA: Record<Probe, "comm" | "solve" | "complexity" | "edge"> = { clarify: "comm", example: "comm", brute: "solve", core: "solve", why: "solve", alt: "solve", complexity: "complexity", edge: "edge" };
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Scores five attributes across every round, the way a hiring rubric would. */
export function attributes(rounds: RoundInput[]): Attribute[] {
  const sums = { comm: [0, 0], solve: [0, 0], complexity: [0, 0], edge: [0, 0] } as Record<string, [number, number]>;
  for (const r of rounds)
    for (const p of r.points) {
      const rp = r.q.rubric.find((x) => x.id === p.id);
      const area = rp ? AREA[probeOf(rp)] : "solve";
      sums[area]![0] += p.earned;
      sums[area]![1] += p.max;
    }
  const of = (k: string) => (sums[k]![1] ? (sums[k]![0] / sums[k]![1]) * 5 : 0);
  const words = rounds.reduce((a, r) => a + r.said.split(/\s+/).filter(Boolean).length, 0);
  const fillers = rounds.reduce((a, r) => a + fillerCount(r.said), 0);
  const fillerRate = words ? fillers / words : 0;
  // talking enough and cleanly is part of communication
  const comm = Math.max(0, of("comm") - (fillerRate > 0.06 ? 1 : fillerRate > 0.03 ? 0.5 : 0) - (words < 60 * rounds.length ? 0.5 : 0));
  const onTime = rounds.length ? rounds.filter((r) => r.seconds <= r.limit).length / rounds.length : 0;
  const pace = rounds.length ? rounds.reduce((a, r) => a + Math.min(1, r.seconds / r.limit), 0) / rounds.length : 0;
  // finishing inside the clock, without rushing through in a quarter of it
  const time = onTime * 4 + (pace >= 0.35 ? 1 : pace * 2.8);
  return [
    { name: "Problem solving", score: round1(of("solve")), tip: of("solve") >= 4.5 ? "Solid approaches. Keep saying the brute force first, then improve it." : "Always say the brute force and its cost first, then the better idea and why it's better." },
    { name: "Communication", score: round1(comm), tip: fillerRate > 0.03 ? `About ${Math.round(fillerRate * 100)} filler words per hundred. Pause instead of saying "um" or "like".` : of("comm") < 4 ? "Open every answer with one clarifying question, and give a quick example." : "Clear and structured. Keep thinking out loud." },
    { name: "Complexity", score: round1(of("complexity")), tip: of("complexity") >= 4.5 ? "You name time and space every time. Keep it up." : "End every answer with time AND space, in one sentence: \"O(n) time, O(n) space.\"" },
    { name: "Edge cases", score: round1(of("edge")), tip: of("edge") >= 4.5 ? "You test the corners without being asked." : "Before saying you're done, name two edge cases: empty input and duplicates or ties." },
    { name: "Time management", score: round1(Math.min(5, time)), tip: onTime < 1 ? "You ran over the clock. Get to the core idea in the first minute, details after." : pace < 0.35 ? "You finished fast. Use the spare time to add an example and edge cases." : "Good pacing, inside the clock every time." },
  ];
}
