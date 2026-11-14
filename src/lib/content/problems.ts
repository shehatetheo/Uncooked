import raw from "@content/gen/problems";
import { parseAll } from "./parse";
import { Problem } from "./types";

/** The order the core list is taught in; everything else follows. */
const CORE_ORDER = [
  "two-sum", "contains-duplicate", "valid-anagram", "group-anagrams", "valid-palindrome", "valid-parentheses",
  "reverse-linked-list", "max-depth-binary-tree", "number-of-islands", "binary-search", "best-time-to-buy-sell-stock", "climbing-stairs",
];
const rank = (p: Problem) => {
  const i = CORE_ORDER.indexOf(p.id);
  return i >= 0 ? i : p.tags.includes("made-up") ? 2000 : 1000;
};

export const problems: Problem[] = parseAll(Problem, raw, "problem").sort((a, b) => rank(a) - rank(b));
export const problemById = new Map(problems.map((p) => [p.id, p]));

/** Disguised variants of a core problem (same pattern, different story). */
export const remixesOf = (id: string): Problem[] => {
  const base = problemById.get(id);
  if (!base) return [];
  const direct = problems.filter((p) => p.remixOf === id);
  return direct.length ? direct : problems.filter((p) => p.id !== id && p.pattern === base.pattern && p.tags.includes("made-up"));
};
