import { python } from "@/lib/types";

export default python({
  id: "longest-common-prefix",
  title: "Longest Common Prefix",
  difficulty: "Easy",
  tags: ["string", "array"],
  statement: `You get a list of words. Find the longest piece of text that every word starts with.

Return that shared beginning as a string. If the words don't all start with the same letter, return an empty string.`,
  examples: [
    { input: 'strs = ["flower", "flow", "flight"]', output: '"fl"', note: "All three start with fl, but the third letters are o, o and i." },
    { input: 'strs = ["dog", "racecar", "car"]', output: '""', note: "The first letters already differ, so nothing is shared." },
  ],
  constraints: ["1 ≤ len(strs) ≤ 200", "0 ≤ len(strs[i]) ≤ 200", "Words contain only lowercase English letters"],
  signature: "def longestCommonPrefix(self, strs: List[str]) -> str:",
  method: "longestCommonPrefix",
  params: [{ name: "strs" }],
  solution: [
    "for i, c in enumerate(strs[0]):",
    "    for word in strs:",
    "        if i == len(word) or word[i] != c:",
    "            return strs[0][:i]",
    "return strs[0]",
  ],
  captions: [
    "Use the first word as the candidate and walk its letters by position.",
    "Check that same position in every word.",
    "Stop if this word has run out of letters or has a different letter here.",
    "Everything before position i matched in every word, so that is the answer.",
    "We never stopped, so the whole first word is a prefix of all the others.",
  ],
  tests: {
    visible: [
      { args: [["flower", "flow", "flight"]], expected: "fl" },
      { args: [["dog", "racecar", "car"]], expected: "" },
      { args: [["interview", "internet", "interval"]], expected: "inter" },
    ],
    hidden: [
      { args: [["alone"]], expected: "alone" },
      { args: [["", "abc"]], expected: "" },
      { args: [["same", "same", "same"]], expected: "same" },
      { args: [["ab", "a"]], expected: "a" },
      { args: [["prefix", "pre", "prepare"]], expected: "pre" },
      { args: [["x", "y"]], expected: "" },
    ],
  },
  hints: [
    "The answer can never be longer than the shortest word. What does that tell you about where to stop?",
    "Compare the words column by column: the first letter of every word, then the second letter of every word, and so on.",
    "Walk the letters of the first word by position and return everything before the first position where some word is too short or has a different letter.",
  ],
  followUps: [
    "If the list were sorted alphabetically, which two words would be enough to compare?",
    "If you had to answer many prefix questions on the same huge word list, what data structure would you build first?",
  ],
  time: "O(n · m)",
  space: "O(1)",
  link: "https://leetcode.com/problems/longest-common-prefix/",
});
