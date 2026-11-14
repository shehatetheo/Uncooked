import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "longest-common-prefix",
  title: "Longest Common Prefix",
  difficulty: "easy",
  pattern: "string",
  tags: ["sap", "string"],
  statement: `You get a list of words. Find the longest piece of text that every word starts with.

Return that shared beginning. If the words have no common start at all, return an empty string.`,
  examples: [
    { input: 'strs = ["flower", "flow", "flight"]', output: '"fl"' },
    { input: 'strs = ["dog", "racecar", "car"]', output: '""', note: "the first letters already differ" },
  ],
  constraints: ["1 ≤ len(strs) ≤ 200", "0 ≤ len(strs[i]) ≤ 200", "Comparison is case-sensitive"],
  myWords:
    "Use the first word as the candidate. Go column by column: at position i, every word must have the same character as the first word. The first time a word is too short or disagrees, the prefix ends there.",
  time: "O(n · m)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[str], return the longest substring that appears anywhere in every word",
        "Take list[str], return the length of the shortest word",
        "Take list[str], return the str that every word starts with, as long as possible",
        "Take two strings, return True if one is a prefix of the other",
      ],
      answer: 2,
      explain:
        "Input is list[str], output is a str. It has to be a prefix, meaning it starts at position 0 of every word, and you return the text itself, not its length.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Vertical scan: compare character i of every word against the first word",
        "Hash map counting every character",
        "Generate every prefix of every word and intersect the sets",
        "Binary search over each word's characters",
      ],
      answer: 0,
      explain:
        "Scanning column by column stops at the first mismatch, so you never read more characters than you have to. No extra structure is needed.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n log n) time, O(n) space", "O(n · m) time, O(1) space", "O(n² · m) time, O(1) space", "O(m) time, O(1) space"],
      answer: 1,
      explain:
        "With n words of up to m characters, the worst case reads every character once: O(n · m). You only keep an index, so O(1) extra space.",
    },
  ],
  method: "longestCommonPrefix",
  params: [{ name: "strs" }],
  solution: `def longestCommonPrefix(self, strs):
    for i, ch in enumerate(strs[0]):
        for s in strs:
            if i == len(s) or s[i] != ch: return strs[0][:i]
    return strs[0]`,
  captions: [
    { label: "COLUMN", text: "Walk the first word one position at a time; ch is the character every word must match." },
    { label: "EACH WORD", text: "Check that same position in every word." },
    { label: "MISMATCH", text: "If a word has run out or has a different character, the prefix is everything before position i." },
    { label: "ALL MATCH", text: "The first word survived every column, so the whole word is the prefix." },
  ],
  visual: [
    { line: 0, note: "i = 0, every word must have \"f\" here", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], pointers: { i: 0 } }, { name: "strs[1]", values: ["f", "l", "o", "w"], pointers: { i: 0 } }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], pointers: { i: 0 } }], vars: { ch: "f" } },
    { line: 2, note: "all three have \"f\" at 0, no mismatch", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], hi: [0] }, { name: "strs[1]", values: ["f", "l", "o", "w"], hi: [0] }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], hi: [0] }], vars: { ch: "f" } },
    { line: 0, note: "i = 1, now looking for \"l\"", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], pointers: { i: 1 } }, { name: "strs[1]", values: ["f", "l", "o", "w"], pointers: { i: 1 } }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], pointers: { i: 1 } }], vars: { ch: "l" } },
    { line: 2, note: "all three have \"l\" at 1", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], hi: [0, 1] }, { name: "strs[1]", values: ["f", "l", "o", "w"], hi: [0, 1] }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], hi: [0, 1] }], vars: { ch: "l" } },
    { line: 0, note: "i = 2, now looking for \"o\"", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], pointers: { i: 2 } }, { name: "strs[1]", values: ["f", "l", "o", "w"], pointers: { i: 2 } }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], pointers: { i: 2 } }], vars: { ch: "o" } },
    { line: 2, note: "\"flight\" has \"i\" at 2, not \"o\" → return strs[0][:2]", arrays: [{ name: "strs[0]", values: ["f", "l", "o", "w", "e", "r"], hi: [0, 1], dim: [2, 3, 4, 5] }, { name: "strs[1]", values: ["f", "l", "o", "w"], hi: [0, 1], dim: [2, 3] }, { name: "strs[2]", values: ["f", "l", "i", "g", "h", "t"], hi: [0, 1], pointers: { i: 2 }, dim: [3, 4, 5] }], vars: { ch: "o", return: "\"fl\"" } },
  ],
  tests: {
    visible: [
      { args: [["flower", "flow", "flight"]], expected: "fl" },
      { args: [["dog", "racecar", "car"]], expected: "", label: "nothing in common" },
      { args: [["interview", "internet", "interval"]], expected: "inter" },
    ],
    hidden: [
      { args: [["alone"]], expected: "alone", label: "single word" },
      { args: [["", "abc"]], expected: "", label: "first word is empty" },
      { args: [["abc", "", "abd"]], expected: "", label: "an empty word later in the list" },
      { args: [["abcd", "abc", "ab"]], expected: "ab", label: "a whole word is the prefix" },
      { args: [["same", "same", "same"]], expected: "same", label: "all identical" },
      { args: [["Apple", "apple"]], expected: "", label: "case matters" },
    ],
  },
  hints: [
    "The answer can never be longer than any single word. Pick one word as the candidate and try to disprove it.",
    "Go position by position: does every word have the same character at position i as the first word?",
    "Two things end the prefix: a different character, or a word that is too short to have a position i. Check the length before you index.",
  ],
  followUps: [
    {
      q: "What if the list were sorted alphabetically?",
      a: "Then you only need to compare the first and last word. Everything between them shares at least whatever those two share. Sorting yourself to use this costs O(n log n) string comparisons, so it's not faster overall.",
    },
    {
      q: "What's the brute force?",
      a: "Try every prefix of the first word, longest first, and test it against every word with startswith. That re-reads the same characters and is O(n · m²) in the worst case.",
    },
    {
      q: "What if you had to answer this for millions of words, many times?",
      a: "Build a trie once. The common prefix is the path from the root until a node has more than one child or marks the end of a word.",
    },
  ],
  edgeCases: [
    { input: 'strs = ["abcd", "ab"]', breaks: true, why: "Indexing s[i] without checking the length first raises IndexError when a later word is shorter." },
    { input: 'strs = ["alone"]', breaks: false, why: "With one word there is nothing to disagree with, so the loop finishes and the whole word comes back." },
    { input: 'strs = ["", "abc"]', breaks: false, why: "The outer loop over an empty first word never runs and the function returns \"\"." },
    { input: 'strs = ["Apple", "apple"]', breaks: true, why: "Lowercasing to be helpful gives \"apple\", but the comparison is case-sensitive and the answer is \"\"." },
  ],
  links: { leetcode: "https://leetcode.com/problems/longest-common-prefix/" },
});
