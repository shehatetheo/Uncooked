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
  tags?: string[];
}

export const TRACKS = {
  code: { label: "Coding", href: "/problems" },
  sql: { label: "SQL", href: "/sql" },
  quiz: { label: "Fundamentals", href: "/quiz" },
  resume: { label: "Resume defense", href: "/resume" },
  behavioral: { label: "Behavioral + SAP", href: "/behavioral" },
} as const;
export type TrackId = keyof typeof TRACKS;

/**
 * Filled once by <CatalogProvider> in the root layout, before any page renders.
 * These are live bindings, so every importer sees the loaded catalog.
 */
export let catalog: CatalogItem[] = [];
export let catalogById = new Map<string, CatalogItem>();
export function setCatalog(items: CatalogItem[]) {
  if (catalog === items) return;
  catalog = items;
  catalogById = new Map(items.map((c) => [c.id, c]));
}

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
