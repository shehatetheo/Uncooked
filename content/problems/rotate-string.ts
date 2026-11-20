import { python } from "@/lib/types";

export default python({
  id: "rotate-string",
  title: "Rotate String",
  difficulty: "Easy",
  tags: ["string"],
  statement: `You get two strings, s and goal. A shift takes the first character of s and moves it to the end. For example, one shift turns abcde into bcdea.

Return True if some number of shifts turns s into goal, and False if no number of shifts can do it. Zero shifts is allowed, so a string always matches itself.`,
  examples: [
    { input: 's = "abcde", goal = "cdeab"', output: "True", note: "Two shifts: abcde, then bcdea, then cdeab." },
    { input: 's = "abcde", goal = "abced"', output: "False", note: "Shifting never swaps two neighbours, so e can't end up before d." },
  ],
  constraints: ["1 ≤ len(s), len(goal) ≤ 100", "Both strings contain only lowercase English letters"],
  signature: "def rotateString(self, s: str, goal: str) -> bool:",
  method: "rotateString",
  params: [{ name: "s" }, { name: "goal" }],
  solution: ["return len(s) == len(goal) and goal in s + s"],
  captions: ["Writing s twice in a row contains every rotation of s, so goal must be the same length and appear inside it."],
  tests: {
    visible: [
      { args: ["abcde", "cdeab"], expected: true },
      { args: ["abcde", "abced"], expected: false },
      { args: ["aa", "a"], expected: false },
    ],
    hidden: [
      { args: ["a", "a"], expected: true },
      { args: ["a", "b"], expected: false },
      { args: ["abab", "baba"], expected: true },
      { args: ["abc", "abcabc"], expected: false },
      { args: ["abc", "acb"], expected: false },
      { args: ["aab", "aba"], expected: true },
    ],
  },
  hints: [
    "Write out every rotation of a short string like abc. What do they all have in common?",
    "Put two copies of s side by side, like abcabc. Where do the rotations of abc show up inside it?",
    "Check that the two strings have the same length, then check whether goal appears inside s joined to itself.",
  ],
  followUps: [
    "The substring search hides the real work. How would you guarantee O(n) time, for example with KMP?",
    "Can you do it with O(1) extra space by comparing characters with wrap-around indexes? What happens to the running time?",
  ],
  time: "O(n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/rotate-string/",
});
