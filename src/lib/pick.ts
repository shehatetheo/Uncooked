import { statusOf } from "@/lib/catalog";
import type { Status } from "@/lib/srs";
import type { State } from "@/lib/store";

const ORDER: Record<Status, number> = { learning: 0, shaky: 1, not_started: 2, got_it: 3, mastered: 4 };

/** Pick n items for a session: due and weak first, then unseen, then solid ones. */
export function pickWeakest<T extends { id: string }>(s: State, items: T[], n: number, now: number): T[] {
  const scored = items.map((it, i) => {
    const p = s.progress[it.id];
    const due = p?.rating && p.dueAt <= now ? -1 : 0;
    // small deterministic shuffle so sessions don't always open on the same card
    const jitter = ((i * 2654435761 + Math.floor(now / 3_600_000)) % 97) / 1000;
    return { it, score: ORDER[statusOf(s, it.id)] + due + jitter };
  });
  return scored.sort((a, b) => a.score - b.score).slice(0, n).map((x) => x.it);
}
