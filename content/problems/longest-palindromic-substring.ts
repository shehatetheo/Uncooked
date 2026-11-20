import { python } from "@/lib/types";

export default python({
  id: "longest-palindromic-substring",
  title: "Longest Palindromic Substring",
  difficulty: "Medium",
  tags: ["string", "two pointers"],
  statement: `You get a string. Find the longest piece of it that is a palindrome and return that piece.

A palindrome reads the same forwards and backwards, like "racecar" or "bb". The piece must be a substring: its letters sit next to each other in the original string, with nothing skipped.

A single letter counts as a palindrome, so there is always an answer. In our tests exactly one substring is the longest.`,
  examples: [
    { input: 's = "cbbd"', output: '"bb"', note: "The two b's in the middle mirror each other. Nothing longer does." },
    { input: 's = "racecar"', output: '"racecar"', note: "The whole string is already a palindrome." },
    { input: 's = "banana"', output: '"anana"' },
  ],
  constraints: ["1 ≤ len(s) ≤ 1000", "s contains only letters and digits"],
  signature: "def longestPalindrome(self, s: str) -> str:",
  method: "longestPalindrome",
  params: [{ name: "s" }],
  solution: [
    'best = ""',
    "for i in range(len(s)):",
    "    for l, r in ((i, i), (i, i + 1)):",
    "        while l >= 0 and r < len(s) and s[l] == s[r]:",
    "            l, r = l - 1, r + 1",
    "        if r - l - 1 > len(best):",
    "            best = s[l + 1:r]",
    "return best",
  ],
  captions: [
    "The longest palindrome found so far. It starts empty.",
    "Try every position as the middle of a palindrome.",
    "Two kinds of middle: one letter (odd length) or the gap between two letters (even length).",
    "Grow outwards while both ends stay inside the string and the two letters match.",
    "They match, so step one letter further out on each side.",
    "The loop stopped one step too far, so the palindrome sits strictly between l and r.",
    "It beats the best so far, so keep that slice.",
    "After every middle has been tried, best is the answer.",
  ],
  tests: {
    visible: [
      { args: ["cbbd"], expected: "bb" },
      { args: ["racecar"], expected: "racecar" },
      { args: ["banana"], expected: "anana" },
    ],
    hidden: [
      { args: ["a"], expected: "a" },
      { args: ["aaaa"], expected: "aaaa" },
      { args: ["bb"], expected: "bb" },
      { args: ["forgeeksskeegfor"], expected: "geeksskeeg" },
      { args: ["xabay"], expected: "aba" },
      { args: ["abcdcbaz"], expected: "abcdcba" },
    ],
  },
  hints: [
    "A palindrome is symmetric around its middle. What if you started from the middle instead of from the ends?",
    "There are only 2n - 1 possible middles: each letter, and each gap between two neighbouring letters.",
    "For every middle, move a left and a right pointer outwards while the letters match, and remember the longest stretch you reach.",
  ],
  followUps: [
    "Why do you need both the odd and the even middle? Show a string where skipping one gives the wrong answer.",
    "This is O(n²). Have you heard of a linear-time approach, and what is the rough idea behind it?",
  ],
  time: "O(n²)",
  space: "O(1)",
  link: "https://leetcode.com/problems/longest-palindromic-substring/",
});
