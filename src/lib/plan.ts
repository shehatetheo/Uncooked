import { catalog, dueItems, groupStats, statusOf, type CatalogItem } from "@/lib/catalog";
import { problems, sqlProblems } from "@/lib/content";
import { QUIZ_TOPICS, type QuizTopic } from "@/lib/content/types";
import { DAY, SUPER_DAY } from "@/lib/srs";
import type { State } from "@/lib/store";

export interface PlanStep {
  title: string;
  detail: string;
  href: string;
  /** Rough minutes, so the plan can be sized to the day. */
  minutes: number;
}

const unstarted = <T extends { id: string }>(s: State, items: T[]): T[] => items.filter((i) => statusOf(s, i.id) === "not_started");

/** "What to drill today": due reviews first, then new material, then the weakest areas. */
export function todayPlan(s: State, now: number): PlanStep[] {
  const days = Math.max(1, Math.ceil((SUPER_DAY - now) / DAY));
  const steps: PlanStep[] = [];
  const due = dueItems(s, now);
  if (due.length) steps.push({ title: `Review ${due.length} due item${due.length === 1 ? "" : "s"}`, detail: "Spaced repetition queue across every track.", href: "/review", minutes: Math.min(25, due.length * 1.5) });

  if (days <= 1) steps.push({ title: "Night-before run", detail: "15 minutes through everything marked Shaky. Then stop and sleep.", href: "/review?mode=night", minutes: 15 });

  const core = problems.filter((p) => p.tags.includes("core"));
  const newCore = unstarted(s, core);
  // spread what's left of the core list over the days remaining, leaving the last day for review
  const perDay = Math.max(2, Math.ceil(newCore.length / Math.max(1, days - 1)));
  for (const p of newCore.slice(0, perDay)) steps.push({ title: `Learn: ${p.title}`, detail: "Understand, ghost type 3 + 3, solve cold, explain.", href: `/p/${p.id}`, minutes: 20 });

  if (newCore.length === 0) {
    const next = unstarted(s, problems.filter((p) => !p.tags.includes("core")))[0];
    if (next) steps.push({ title: `Learn: ${next.title}`, detail: next.tags.includes("made-up") ? "A made-up problem, like the ones interviewers invent." : "Sorting and strings: what the STAR student was asked.", href: `/p/${next.id}`, minutes: 20 });
  }

  const codeStats = groupStats(s, catalog.filter((c) => c.track === "code")).filter((g) => g.started > 0).sort((a, b) => a.score - b.score);
  const weak = codeStats[0];
  if (weak && weak.score < 0.75) {
    const item = catalog.find((c) => c.track === "code" && c.group === weak.group && statusOf(s, c.id) !== "mastered" && statusOf(s, c.id) !== "not_started");
    if (item) steps.push({ title: `Weakest pattern: ${weak.group}`, detail: `Cold solve ${item.title} again with no hints.`, href: item.href, minutes: 10 });
  }

  const sqlNext = unstarted(s, sqlProblems)[0] ?? sqlProblems.find((p) => statusOf(s, p.id) !== "mastered");
  if (sqlNext) steps.push({ title: `SQL: ${sqlNext.title}`, detail: `${sqlNext.concept}. SQL is its own interview.`, href: `/sql/${sqlNext.id}`, minutes: 10 });

  const topicStats = groupStats(s, catalog.filter((c) => c.kind === "quiz")).sort((a, b) => a.score - b.score);
  const topic = topicStats[0];
  if (topic) {
    const id = (Object.keys(QUIZ_TOPICS) as QuizTopic[]).find((k) => QUIZ_TOPICS[k] === topic.group);
    steps.push({ title: `Quiz: ${topic.group}`, detail: "Ten quick questions from your weakest fundamentals topic.", href: `/quiz?topic=${id}`, minutes: 6 });
  }

  const resume = catalog.filter((c) => c.track === "resume");
  const resumeLeft = unstarted(s, resume).length;
  steps.push({ title: "Resume defense: 6 cards", detail: resumeLeft ? `${resumeLeft} lines you haven't defended yet.` : "Every line has an answer. Tighten the weak ones.", href: "/resume", minutes: 12 });
  steps.push({ title: "60-second intro, out loud", detail: "Timer on. Record it once and listen back.", href: "/behavioral?tab=intro", minutes: 3 });
  return steps;
}

export const firstUnfinished = (s: State): CatalogItem | undefined => catalog.find((c) => c.track === "code" && statusOf(s, c.id) !== "mastered" && statusOf(s, c.id) !== "got_it");
