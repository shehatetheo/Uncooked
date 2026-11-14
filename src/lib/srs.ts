/** Spaced repetition: a small SM-2 variant with a cram cap before a deadline. */
export type Rating = "again" | "shaky" | "got_it" | "mastered";
export type Status = "not_started" | "learning" | "shaky" | "got_it" | "mastered";

export interface SrsFields {
  ease: number;
  /** Days until the next review. 0 means "again this session". */
  interval: number;
  dueAt: number;
}

export const DAY = 86_400_000;
export const SUPER_DAY = new Date("2026-11-20T09:00:00-05:00").getTime();
export const NEW_SRS: SrsFields = { ease: 2.3, interval: 0, dueAt: 0 };

const clampEase = (e: number) => Math.min(3, Math.max(1.3, Math.round(e * 100) / 100));

/**
 * Next schedule after a self-rating. Before the deadline, intervals are capped
 * at half the days remaining so every item comes back at least once more.
 */
export function schedule(prev: SrsFields, rating: Rating, now: number, deadline: number = SUPER_DAY): SrsFields {
  let { ease, interval } = prev;
  switch (rating) {
    case "again":
      ease = clampEase(ease - 0.2);
      interval = 0;
      break;
    case "shaky":
      ease = clampEase(ease - 0.15);
      interval = 1;
      break;
    case "got_it":
      interval = interval < 1 ? 1 : interval < 3 ? 3 : Math.round(interval * ease);
      break;
    case "mastered":
      ease = clampEase(ease + 0.1);
      interval = interval < 1 ? 3 : Math.round(interval * ease * 1.3);
      break;
  }
  const daysLeft = (deadline - now) / DAY;
  if (daysLeft > 0 && interval > 0) interval = Math.min(interval, Math.max(1, Math.floor(daysLeft / 2)));
  const dueAt = interval === 0 ? now + 10 * 60_000 : now + interval * DAY;
  return { ease, interval, dueAt };
}

/** Local calendar day, used for "two different days" and streaks. */
export const dayKey = (t: number): string => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * A problem is Mastered only after clean (no-hint) cold solves on two
 * different days. The self-rating alone can never grant it.
 */
export function deriveStatus(rating: Rating | undefined, cleanColdDays: string[], touched: boolean, needsColdProof: boolean): Status {
  if (needsColdProof && new Set(cleanColdDays).size >= 2) return "mastered";
  if (!rating) return touched ? "learning" : "not_started";
  if (rating === "again") return "learning";
  if (rating === "shaky") return "shaky";
  if (rating === "mastered" && !needsColdProof) return "mastered";
  return "got_it";
}

export function streak(days: Set<string>, now: number): number {
  let n = 0;
  let t = now;
  if (!days.has(dayKey(t))) t -= DAY; // today not done yet doesn't break the streak
  while (days.has(dayKey(t))) {
    n++;
    t -= DAY;
  }
  return n;
}
