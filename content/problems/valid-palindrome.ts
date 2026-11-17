import { defineProblem } from "@/lib/content/types";

const raw = ["T", "a", "c", "o", "␣", "c", "a", "t", "."];
const clean = ["t", "a", "c", "o", "c", "a", "t"];

export default defineProblem({
  id: "valid-palindrome",
  title: "Valid Palindrome",
  difficulty: "easy",
  pattern: "two-pointers",
  tags: ["core", "string"],
  statement: `You get a string that can contain letters, digits, spaces and punctuation. Decide whether it reads the same forwards and backwards once you ignore everything that isn't a letter or digit and treat uppercase and lowercase as the same.

Return True if it does, False if not. A string with no letters or digits at all counts as a palindrome.`,
  examples: [
    { input: 's = "Taco cat."', output: "True", note: 'cleans up to "tacocat"' },
    { input: 's = "race a car"', output: "False", note: '"raceacar" backwards is "racaecar"' },
  ],
  constraints: ["0 ≤ len(s) ≤ 2·10⁵", "Printable ASCII characters"],
  brief: {
    what: "You're given a string that can contain letters, digits, spaces and punctuation. Return True if it reads the same forwards and backwards once you ignore everything except letters and digits and treat upper and lower case as the same, and False otherwise.",
    example: "\"Taco cat.\" cleans up to \"tacocat\", which reads the same from either end, so the answer is True.",
    watch: "A string with no letters or digits at all, like \".,?\" or an empty string, counts as a palindrome, and digits matter: \"0P\" is False.",
  },
  myWords:
    "Keep letters and digits, lowercase them, compare to the reverse. Follow-up for O(1) space: two pointers from both ends.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a string, return True if its letters and digits read the same both ways, ignoring case",
        "Take a string, return it with punctuation removed and reversed",
        "Take a string, return True if it is exactly equal to its reverse",
        "Take a string, return the longest palindrome inside it",
      ],
      answer: 0,
      explain:
        'Input is one str. Output is a bool. Only letters and digits count and case is ignored, so "Taco cat." passes even though the raw string is not its own reverse.',
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Stack: push the first half, pop against the second half",
        "Hash map of character counts",
        "Clean the string, then compare it with its reverse (or walk two pointers inward)",
        "Sort the characters and compare",
      ],
      answer: 2,
      explain:
        "A palindrome is about mirrored positions: the first character against the last, the second against the second-to-last. Filter-and-reverse is the short version; two pointers from both ends is the same check without the copy. Counting or sorting throws the order away.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: [
        "O(n log n) time; O(n) space",
        "O(n) time; O(n) space as written, O(1) with two pointers",
        "O(n²) time; O(1) space",
        "O(log n) time; O(1) space",
      ],
      answer: 1,
      explain:
        "Every character is looked at a constant number of times: O(n). The cleaned copy costs O(n) space. Two pointers on the original string skip the copy and bring the space down to O(1).",
    },
  ],
  method: "isPalindrome",
  params: [{ name: "s" }],
  solution: `def isPalindrome(self, s):
    s = [c.lower() for c in s if c.isalnum()]
    return s == s[::-1]`,
  captions: [
    { label: "CLEAN", text: "Keep only the letters and digits, lowercased, as a list of characters." },
    { label: "COMPARE", text: "Return True if that list equals itself reversed." },
  ],
  visual: [
    { line: 0, note: "The raw string, one character per cell (␣ is a space)", arrays: [{ name: "s", values: raw }] },
    { line: 0, note: "isalnum() is False for the space and the full stop, so they're dropped", arrays: [{ name: "s", values: raw, dim: [4, 8] }] },
    { line: 0, note: "Lowercase what's left: T becomes t", arrays: [{ name: "s", values: clean, hi: [0] }] },
    {
      line: 1,
      note: "Build the reverse with s[::-1]",
      arrays: [
        { name: "s", values: clean },
        { name: "s[::-1]", values: [...clean].reverse() },
      ],
    },
    {
      line: 1,
      note: "Every position matches its mirror",
      arrays: [
        { name: "s", values: clean, hi: [0, 1, 2, 3, 4, 5, 6] },
        { name: "s[::-1]", values: [...clean].reverse(), hi: [0, 1, 2, 3, 4, 5, 6] },
      ],
      vars: { return: "True" },
    },
  ],
  tests: {
    visible: [
      { args: ["Taco cat."], expected: true },
      { args: ["race a car"], expected: false },
      { args: ["A man, a plan, a canal: Panama"], expected: true, label: "mixed case and punctuation" },
    ],
    hidden: [
      { args: [""], expected: true, label: "empty string" },
      { args: [".,?"], expected: true, label: "only punctuation" },
      { args: ["a"], expected: true, label: "single letter" },
      { args: ["0P"], expected: false, label: "digit against letter" },
      { args: ["ab_a"], expected: true, label: "underscore is ignored" },
      { args: ["ab".repeat(150) + "a"], expected: true, label: "301 characters, palindrome" },
    ],
  },
  hints: [
    "Punctuation, spaces and case are noise. What does the string look like once you strip them out?",
    "str.isalnum() tells you whether a character is a letter or digit, and str.lower() removes the case difference.",
    "Once it's clean, a palindrome equals its own reverse. Slicing with [::-1] reverses a list or string.",
  ],
  followUps: [
    {
      q: "Can you do it in O(1) space?",
      a: "Two pointers, one at each end. Skip anything that isn't alphanumeric, compare the lowercased pair, move both inward. Return False on the first mismatch, True when the pointers meet.",
    },
    {
      q: "Why build a list instead of adding characters to a string in a loop?",
      a: "Strings are immutable, so cleaned += c can copy the whole string each time: O(n²) in the worst case. A list comprehension is O(n).",
    },
    {
      q: "Besides memory, when does the two-pointer version win?",
      a: "It stops at the first mismatch, so a long string that fails near the ends returns almost immediately. Reverse-and-compare always cleans the whole string first.",
    },
  ],
  edgeCases: [
    { input: 's = ".,"', breaks: true, why: "Nothing is left after cleaning. Two-pointer code that skips punctuation without checking l < r walks off the end." },
    { input: 's = "0P"', breaks: true, why: "Using isalpha() instead of isalnum() drops the 0 and wrongly returns True." },
    { input: 's = "Aa"', breaks: true, why: "Comparing without lowercasing sees A and a as different characters." },
    { input: 's = ""', breaks: false, why: "An empty list equals its reverse, so True falls out with no special case." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/valid-palindrome/",
    neetcode: "https://www.youtube.com/watch?v=jJXJ16kPFWg",
  },
});
