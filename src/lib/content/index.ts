import { cardsRaw, problemsRaw, quizRaw, sqlRaw } from "@content/index.gen";
import { OpenCard, Problem, QuizQuestion, SqlProblem } from "./types";
import type { z } from "zod";

/** Parse content at module load. Invalid content throws, which fails the build. */
function parseAll<S extends z.ZodType>(schema: S, items: unknown[], kind: string): z.infer<S>[] {
  const out: z.infer<S>[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const r = schema.safeParse(item);
    const id = (item as { id?: string })?.id ?? "?";
    if (!r.success) throw new Error(`Invalid ${kind} "${id}":\n${r.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
    if (seen.has(id)) throw new Error(`Duplicate ${kind} id "${id}"`);
    seen.add(id);
    out.push(r.data);
  }
  return out;
}

/** The order the core list is taught in; everything else follows. */
const CORE_ORDER = [
  "two-sum", "contains-duplicate", "valid-anagram", "group-anagrams", "valid-palindrome", "valid-parentheses",
  "reverse-linked-list", "max-depth-binary-tree", "number-of-islands", "binary-search", "best-time-to-buy-sell-stock", "climbing-stairs",
];
const rank = (p: Problem) => {
  const i = CORE_ORDER.indexOf(p.id);
  return i >= 0 ? i : p.tags.includes("made-up") ? 2000 : 1000;
};

export const problems: Problem[] = parseAll(Problem, problemsRaw, "problem").sort((a, b) => rank(a) - rank(b));
export const sqlProblems: SqlProblem[] = parseAll(SqlProblem, sqlRaw, "sql problem");
export const quiz: QuizQuestion[] = parseAll(QuizQuestion, (quizRaw as unknown[][]).flat(), "quiz question");
export const cards: OpenCard[] = parseAll(OpenCard, (cardsRaw as unknown[][]).flat(), "card");

export const problemById = new Map(problems.map((p) => [p.id, p]));
export const sqlById = new Map(sqlProblems.map((p) => [p.id, p]));

/** Disguised variants of a core problem (same pattern, different story). */
export const remixesOf = (id: string): Problem[] => {
  const base = problemById.get(id);
  if (!base) return [];
  const direct = problems.filter((p) => p.remixOf === id);
  return direct.length ? direct : problems.filter((p) => p.id !== id && p.pattern === base.pattern && p.tags.includes("made-up"));
};
