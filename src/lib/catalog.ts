import { cards, problems, quiz, sqlProblems } from "@/lib/content";
import { PATTERNS, QUIZ_TOPICS } from "@/lib/content/types";
import type { ItemKind, ItemProgress, State } from "@/lib/store";
import type { Status } from "@/lib/srs";

/** Every trainable item in one flat list, so review and stats treat tracks alike. */
export interface CatalogItem {
  id: string;
  kind: ItemKind;
  track: TrackId;
  title: string;
  /** Pattern, topic or resume section. */
  group: string;
  href: string;
}

export const TRACKS = {
  code: { label: "Coding", href: "/problems" },
  sql: { label: "SQL", href: "/sql" },
  quiz: { label: "Fundamentals", href: "/quiz" },
  resume: { label: "Resume defense", href: "/resume" },
  behavioral: { label: "Behavioral + SAP", href: "/behavioral" },
} as const;
export type TrackId = keyof typeof TRACKS;

const CARD_TRACK: Record<string, { track: TrackId; href: string }> = {
  resume: { track: "resume", href: "/resume" },
  skill: { track: "resume", href: "/resume?tab=skills" },
  consistency: { track: "resume", href: "/resume?tab=consistency" },
  behavioral: { track: "behavioral", href: "/behavioral" },
  sap: { track: "behavioral", href: "/behavioral?tab=sap" },
  "sql-concept": { track: "sql", href: "/sql?tab=concepts" },
};

export const catalog: CatalogItem[] = [
  ...problems.map((p): CatalogItem => ({ id: p.id, kind: "problem", track: "code", title: p.title, group: PATTERNS[p.pattern], href: `/p/${p.id}` })),
  ...sqlProblems.map((p): CatalogItem => ({ id: p.id, kind: "sql", track: "sql", title: p.title, group: p.concept, href: `/sql/${p.id}` })),
  ...quiz.map((q): CatalogItem => ({ id: q.id, kind: "quiz", track: "quiz", title: q.prompt, group: QUIZ_TOPICS[q.topic], href: `/quiz?topic=${q.topic}` })),
  ...cards.map((c): CatalogItem => ({ id: c.id, kind: "card", ...CARD_TRACK[c.track]!, title: c.question, group: c.group })),
];
export const catalogById = new Map(catalog.map((c) => [c.id, c]));

const SCORE: Record<Status, number> = { not_started: 0, learning: 0.25, shaky: 0.4, got_it: 0.75, mastered: 1 };
export const statusOf = (s: State, id: string): Status => s.progress[id]?.status ?? "not_started";
export const mastery = (s: State, ids: string[]): number => (ids.length ? ids.reduce((a, id) => a + SCORE[statusOf(s, id)], 0) / ids.length : 0);

export interface GroupStat {
  group: string;
  total: number;
  started: number;
  mastered: number;
  score: number;
}

export function groupStats(s: State, items: CatalogItem[]): GroupStat[] {
  const by = new Map<string, CatalogItem[]>();
  for (const it of items) by.set(it.group, [...(by.get(it.group) ?? []), it]);
  return [...by.entries()].map(([group, list]) => ({
    group,
    total: list.length,
    started: list.filter((i) => statusOf(s, i.id) !== "not_started").length,
    mastered: list.filter((i) => statusOf(s, i.id) === "mastered").length,
    score: mastery(s, list.map((i) => i.id)),
  }));
}

/** Items whose review is due, oldest first. */
export function dueItems(s: State, now: number): (CatalogItem & { progress: ItemProgress })[] {
  return catalog
    .map((c) => ({ ...c, progress: s.progress[c.id] }))
    .filter((c): c is CatalogItem & { progress: ItemProgress } => !!c.progress && !!c.progress.rating && c.progress.dueAt <= now)
    .sort((a, b) => a.progress.dueAt - b.progress.dueAt);
}

export const shakyItems = (s: State): CatalogItem[] => catalog.filter((c) => ["shaky", "learning"].includes(statusOf(s, c.id)) && !!s.progress[c.id]?.rating);
