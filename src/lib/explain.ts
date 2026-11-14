/** "Explain it like I'm the interviewer": flags what a spoken answer skipped. */
export interface ExplainCheck {
  key: "approach" | "complexity" | "edge" | "brute";
  label: string;
  hit: boolean;
  tip: string;
}

const has = (text: string, patterns: RegExp[]) => patterns.some((p) => p.test(text));

export function checkExplanation(text: string): ExplainCheck[] {
  const t = text.toLowerCase();
  return [
    {
      key: "approach",
      label: "Approach and data structure",
      hit: has(t, [/hash|dict|map|set|stack|pointer|sort|recurs|dfs|bfs|binary|counter|loop|scan|queue|heap/]),
      tip: "Name the data structure and say why it fits.",
    },
    {
      key: "complexity",
      label: "Time and space complexity",
      hit: has(t, [/o\(\s*[^)]+\)/, /linear|constant|quadratic|logarithmic|n log n|complexity/]),
      tip: "State time and space out loud, e.g. O(n) time, O(n) space.",
    },
    {
      key: "edge",
      label: "Edge cases",
      hit: has(t, [/edge|empty|single|one element|duplicate|negative|null|none|zero|tie|case|punctuation/]),
      tip: "Mention at least one input that could break it: empty, single item, duplicates.",
    },
    {
      key: "brute",
      label: "Brute force and why this is better",
      hit: has(t, [/brute|naive|nested|every pair|instead of|rather than|n\^2|n²|o\(n\s*\*\s*n\)|slower/]),
      tip: "Say the obvious slow way first, then why yours beats it.",
    },
  ];
}
