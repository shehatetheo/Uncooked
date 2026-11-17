import { PLAN, type PlanDay, type PlanTask } from "@content/plan";
import { catalog } from "@/lib/catalog";
import { dayKey } from "@/lib/srs";
import type { State } from "@/lib/store";

export interface TaskProgress {
  done: boolean;
  have: number;
  need: number;
  auto: boolean;
}

/** Where a task stands, from real progress where possible, else the manual tick. */
export function taskProgress(s: State, t: PlanTask, now: number): TaskProgress {
  const c = t.check;
  const tally = (have: number, need: number): TaskProgress => ({ done: have >= need, have: Math.min(have, need), need, auto: true });
  switch (c.kind) {
    case "solve":
    case "sql":
      return tally(c.ids.filter((id) => s.progress[id]?.phases.cold).length, c.ids.length);
    case "clean-today": {
      const today = dayKey(now);
      return tally(c.ids.filter((id) => s.progress[id]?.cleanColdDays.includes(today)).length, c.ids.length);
    }
    case "cards": {
      const ids = catalog.filter((i) => i.kind === "card" && (!c.prefix || i.id.startsWith(c.prefix)) && (!c.groups || c.groups.includes(i.group))).map((i) => i.id);
      return tally(ids.filter((id) => (s.progress[id]?.attempts ?? 0) > 0).length, Math.min(c.count, ids.length));
    }
    case "quiz": {
      const ids = catalog.filter((i) => i.kind === "quiz" && c.topics.includes(i.group)).map((i) => i.id);
      return tally(ids.filter((id) => (s.progress[id]?.attempts ?? 0) > 0).length, c.count);
    }
    case "phase":
      return tally(c.ids.filter((id) => s.progress[id]?.phases[c.phase]).length, c.ids.length);
    case "mastered":
      return tally(c.ids.filter((id) => s.progress[id]?.status === "mastered").length, c.ids.length);
    case "manual": {
      const done = !!s.planDone[t.id];
      return { done, have: done ? 1 : 0, need: 1, auto: false };
    }
  }
}

/** Today's plan day, the first day if it hasn't started, or null once it's over. */
export function currentDay(now: number): PlanDay | null {
  const key = dayKey(now);
  if (key < PLAN[0]!.date) return PLAN[0]!;
  return PLAN.find((d) => d.date === key) ?? null;
}

export const dayMinutes = (d: PlanDay) => d.tasks.reduce((a, t) => a + t.minutes, 0);
export { PLAN };
