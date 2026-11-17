import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "mirrored-serial",
  title: "Mirrored Serial Number",
  difficulty: "easy",
  pattern: "two-pointers",
  tags: ["made-up", "string"],
  statement: `Suppose marketing wants to give a prize to customers whose device serial number is "mirrored". You get one serial number as a string. It can contain letters, digits, dashes and spaces.

A serial is mirrored if it reads the same forwards and backwards once you ignore everything that isn't a letter or digit, and treat upper and lower case as equal. Return True if it is mirrored, False otherwise.`,
  examples: [
    { input: 'code = "AB-12-21-ba"', output: "True", note: 'cleaned up it reads "ab1221ba"' },
    { input: 'code = "SN-100"', output: "False", note: '"sn100" backwards is "001ns"' },
  ],
  constraints: ["0 ≤ len(code) ≤ 10⁵", "A serial with no letters or digits counts as mirrored"],
  brief: {
    what: "You're given one serial number as a string, which can mix letters, digits, dashes and spaces. Return True if it reads the same forwards and backwards once you ignore everything except letters and digits and treat upper and lower case as equal, and False otherwise.",
    example: "\"AB-12-21-ba\" cleans up to \"ab1221ba\", which reads the same from either end, so the answer is True.",
    watch: "A serial with no letters or digits at all, such as an empty string or just \"- - -\", counts as mirrored, so the answer is True.",
  },
  myWords:
    "Two pointers, one from each end, walking towards each other. Skip anything that isn't a letter or digit. Compare the two characters in lower case: a mismatch means False. If the pointers meet, True.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a str, return True if its letters and digits read the same in both directions, ignoring case and separators",
        "Take a str, return the str reversed",
        "Take two strings, return True if one is the reverse of the other",
        "Take a str, return True if it contains the same characters as its reverse",
      ],
      answer: 0,
      explain:
        "Input is a str and output is a bool. Dashes and spaces are skipped rather than compared, and \"A\" matches \"a\".",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Hash map counting each character",
        "Stack: push the first half, pop against the second half",
        "Two pointers moving inward from both ends, skipping separators",
        "Sort the characters and compare",
      ],
      answer: 2,
      explain:
        "A mirror check compares position i from the left with position i from the right. Two pointers do that directly and can step over separators without building a new string.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n log n) time, O(1) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 3,
      explain:
        "Each step moves at least one pointer, so together they cover the string once: O(n). Only two indices are stored, so O(1) space. Building a cleaned copy would also be O(n) time but O(n) space.",
    },
  ],
  method: "isMirrored",
  params: [{ name: "code" }],
  solution: `def isMirrored(self, code):
    i, j = 0, len(code) - 1
    while i < j:
        if not code[i].isalnum(): i += 1
        elif not code[j].isalnum(): j -= 1
        elif code[i].lower() != code[j].lower(): return False
        else: i, j = i + 1, j - 1
    return True`,
  captions: [
    { label: "INIT", text: "One pointer at each end of the serial." },
    { label: "LOOP", text: "Keep going until the pointers meet or cross." },
    { label: "SKIP LEFT", text: "If the left character is a separator, step over it." },
    { label: "SKIP RIGHT", text: "Same on the right side." },
    { label: "MISMATCH", text: "Both are letters or digits now. If they differ ignoring case, it isn't mirrored." },
    { label: "MOVE IN", text: "They match, so move both pointers one step towards the middle." },
    { label: "MIRRORED", text: "Every pair matched." },
  ],
  visual: [
    { line: 0, note: "i at the left end, j at the right end", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 0, j: 10 } }] },
    { line: 5, note: "\"A\" and \"a\" match ignoring case, move both in", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 1, j: 9 }, dim: [0, 10] }] },
    { line: 5, note: "\"B\" and \"b\" match, move both in", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 2, j: 8 }, dim: [0, 1, 9, 10] }] },
    { line: 2, note: "left is a dash, skip it", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 3, j: 8 }, dim: [0, 1, 2, 9, 10] }] },
    { line: 3, note: "right is a dash, skip it", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 3, j: 7 }, dim: [0, 1, 2, 8, 9, 10] }] },
    { line: 5, note: "\"1\" and \"1\" match, move both in", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 4, j: 6 }, dim: [0, 1, 2, 3, 7, 8, 9, 10] }] },
    { line: 5, note: "\"2\" and \"2\" match, both land on index 5", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 5, j: 5 }, dim: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10] }] },
    { line: 6, note: "i is no longer less than j → True", arrays: [{ name: "code", values: ["A", "B", "-", "1", "2", "-", "2", "1", "-", "b", "a"], pointers: { i: 5, j: 5 } }], vars: { return: "True" } },
  ],
  tests: {
    visible: [
      { args: ["AB-12-21-ba"], expected: true },
      { args: ["SN-100"], expected: false },
      { args: ["x9-9X"], expected: true, label: "case is ignored" },
    ],
    hidden: [
      { args: [""], expected: true, label: "empty serial" },
      { args: ["- - -"], expected: true, label: "only separators" },
      { args: ["A"], expected: true, label: "single character" },
      { args: ["0P"], expected: false, label: "digit against letter" },
      { args: ["12 3-21"], expected: true, label: "odd length with a middle character" },
      { args: ["Ab-ba-"], expected: true, label: "separator at the very end" },
      { args: ["ab-1-ca"], expected: false, label: "mismatch near the middle" },
    ],
  },
  hints: [
    "Mirrored means the first real character equals the last, the second equals the second to last, and so on.",
    "Put one index at each end. Before comparing, each index has to be standing on a letter or digit.",
    "Handle one thing per loop step: skip left, or skip right, or compare. That keeps the index checks simple and stops you running off the ends.",
  ],
  followUps: [
    {
      q: "What's the shorter version, and what does it cost?",
      a: "Build a cleaned lower-case string and compare it with its reverse: clean == clean[::-1]. It's O(n) time too, but O(n) extra space for the copies.",
    },
    {
      q: "Why does your loop never go out of bounds on a string of only dashes?",
      a: "Every index access happens inside while i < j, and each step moves exactly one pointer by one, so they meet before either leaves the string.",
    },
    {
      q: "What if exactly one character may be removed to make it mirrored?",
      a: "At the first mismatch, try skipping the left character or the right character and check whether either remaining stretch is mirrored. Still O(n).",
    },
  ],
  edgeCases: [
    { input: 'code = "AB-12-21-ba"', breaks: true, why: "Comparing the raw string with its reverse fails on the case difference between \"AB\" and \"ba\"." },
    { input: 'code = "- - -"', breaks: true, why: "An inner while loop that skips separators without checking i < j runs off the end of the string." },
    { input: 'code = "0P"', breaks: true, why: "Keeping only letters with isalpha drops the 0, leaving \"p\", which looks mirrored." },
    { input: 'code = "abba"', breaks: false, why: "No separators and no case differences, so even the simplest reverse check works." },
  ],
  reveal:
    "This is Valid Palindrome with a serial number instead of a sentence: two pointers moving inward, skipping non-alphanumeric characters and comparing in lower case.",
  remixOf: "valid-palindrome",
  links: {},
});
