import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "valid-anagram",
  title: "Valid Anagram",
  difficulty: "easy",
  pattern: "counting",
  tags: ["core", "string"],
  statement: `You get two strings, s and t. Decide whether t is an anagram of s: the same letters, each used the same number of times, in any order.

Return True if it is and False if not. Every character has to be used, so strings of different lengths can never match.`,
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: "True" },
    { input: 's = "rat", t = "car"', output: "False", note: "t has a c where s has a t" },
  ],
  constraints: ["0 ≤ len(s), len(t) ≤ 5·10⁴", "Lowercase English letters only"],
  myWords: "Counter makes a hash map of letter counts. Same counts means anagram.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take two strings, return True if one is the reverse of the other",
        "Take two strings, return True if they use the same letters the same number of times",
        "Take two strings, return True if they share the same set of letters",
        "Take a list of strings, return the ones that are anagrams of each other",
      ],
      answer: 1,
      explain:
        'Input is two str values. Output is a bool. Counts matter, not just which letters appear: "aab" and "abb" share a letter set but are not anagrams.',
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Two pointers from both ends of each string",
        "Stack: push s, then pop while reading t",
        "Nested loops: for each letter of s, search t",
        "Count the letters of each string and compare the counts",
      ],
      answer: 3,
      explain:
        "Anagrams have identical letter counts, so build a tally for each string and compare. Order doesn't matter, which rules out pointers and stacks. Searching t for every letter of s is O(n²).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(n log n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(n²) space"],
      answer: 0,
      explain:
        "Each string is read once: O(n). With lowercase letters the tallies never hold more than 26 keys, which is O(1). Sorting both strings also works but costs O(n log n).",
    },
  ],
  method: "isAnagram",
  params: [{ name: "s" }, { name: "t" }],
  solution: `def isAnagram(self, s, t):
    return Counter(s) == Counter(t)`,
  captions: [{ label: "COUNT", text: "Tally the letters of each string and return True only if the two tallies are identical." }],
  visual: [
    {
      line: 0,
      note: "Two strings. Count the letters in each",
      arrays: [
        { name: "s", values: ["a", "n", "a", "g", "r", "a", "m"] },
        { name: "t", values: ["n", "a", "g", "a", "r", "a", "m"] },
      ],
    },
    {
      line: 0,
      note: 'Counting s: after "ana"',
      arrays: [{ name: "s", values: ["a", "n", "a", "g", "r", "a", "m"], pointers: { i: 2 }, dim: [3, 4, 5, 6] }],
      map: { name: "Counter(s)", entries: [["a", "2"], ["n", "1"]] },
    },
    {
      line: 0,
      note: "Counter(s) is complete",
      arrays: [{ name: "s", values: ["a", "n", "a", "g", "r", "a", "m"] }],
      map: { name: "Counter(s)", entries: [["a", "3"], ["n", "1"], ["g", "1"], ["r", "1"], ["m", "1"]] },
    },
    {
      line: 0,
      note: "Counter(t): the same letters arrive in a different order",
      arrays: [{ name: "t", values: ["n", "a", "g", "a", "r", "a", "m"] }],
      map: { name: "Counter(t)", entries: [["n", "1"], ["a", "3"], ["g", "1"], ["r", "1"], ["m", "1"]] },
    },
    {
      line: 0,
      note: "Dict equality ignores key order: same keys, same counts",
      vars: { "Counter(s)": "a:3 n:1 g:1 r:1 m:1", "Counter(t)": "n:1 a:3 g:1 r:1 m:1", return: "True" },
    },
  ],
  tests: {
    visible: [
      { args: ["anagram", "nagaram"], expected: true },
      { args: ["rat", "car"], expected: false },
      { args: ["listen", "silent"], expected: true },
    ],
    hidden: [
      { args: ["", ""], expected: true, label: "both empty" },
      { args: ["a", "a"], expected: true, label: "single letter" },
      { args: ["ab", "a"], expected: false, label: "different lengths" },
      { args: ["aacc", "ccac"], expected: false, label: "same letters, different counts" },
      { args: ["abc".repeat(100), "cba".repeat(100)], expected: true, label: "300 letters each" },
      { args: ["a".repeat(200) + "b", "a".repeat(201)], expected: false, label: "one letter off in 201" },
    ],
  },
  hints: [
    "Order doesn't matter in an anagram. What does matter about each letter?",
    "Tally how many times each letter appears in s, then do the same for t.",
    "collections.Counter builds the tally for you, and two Counters compare with ==.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "For each letter of s, find and remove it from t: O(n²). Sorting both strings and comparing is O(n log n). Counting is O(n).",
    },
    {
      q: "Can you do it in O(1) space?",
      a: "For lowercase letters it already is: a tally never has more than 26 keys. You can make that explicit with one list of 26 ints: add for s, subtract for t, then check every slot is zero.",
    },
    {
      q: "What if the strings contain Unicode?",
      a: "Counter still works because it keys on whole characters. A fixed 26-slot list doesn't, and the space becomes O(k) for k distinct characters.",
    },
  ],
  edgeCases: [
    { input: 's = "aacc", t = "ccac"', breaks: true, why: "Comparing set(s) == set(t) says yes, but the counts differ: two a's against one." },
    { input: 's = "ab", t = "a"', breaks: true, why: "A loop that only checks every letter of t appears in s passes. Compare full counts, or check the lengths first." },
    { input: 's = "", t = ""', breaks: false, why: "Two empty tallies are equal, so the answer is True with no special case." },
    { input: 's = "listen", t = "silent"', breaks: false, why: "A plain anagram. Any counting or sorting approach handles it." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/valid-anagram/",
    neetcode: "https://www.youtube.com/watch?v=9UtInBqnCgA",
  },
});
