import { cards, problems, quiz, sqlProblems } from "@/lib/content";
import { PATTERNS, QUIZ_TOPICS } from "@/lib/content/types";
import type { CatalogItem, TrackId } from "@/lib/catalog";

const CARD_TRACK: Record<string, { track: TrackId; href: string }> = {
  resume: { track: "resume", href: "/resume" },
  skill: { track: "resume", href: "/resume?tab=skills" },
  consistency: { track: "resume", href: "/resume?tab=consistency" },
  behavioral: { track: "behavioral", href: "/behavioral" },
  sap: { track: "behavioral", href: "/behavioral?tab=sap" },
  "sql-concept": { track: "sql", href: "/sql?tab=concepts" },
};

/**
 * The slim index of every trainable item. Built on the server and handed to
 * the client once, so pages like Home and Stats never download the content itself.
 */
export const buildCatalog = (): CatalogItem[] => [
  ...problems.map((p): CatalogItem => ({ id: p.id, kind: "problem", track: "code", title: p.title, group: PATTERNS[p.pattern], href: `/p/${p.id}`, tags: p.tags })),
  ...sqlProblems.map((p): CatalogItem => ({ id: p.id, kind: "sql", track: "sql", title: p.title, group: p.concept, href: `/sql/${p.id}` })),
  ...quiz.map((q): CatalogItem => ({ id: q.id, kind: "quiz", track: "quiz", title: q.prompt.slice(0, 90), group: QUIZ_TOPICS[q.topic], href: `/quiz?topic=${q.topic}` })),
  ...cards.map((c): CatalogItem => ({ id: c.id, kind: "card", ...CARD_TRACK[c.track]!, title: c.question.slice(0, 90), group: c.group })),
];
