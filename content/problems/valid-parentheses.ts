import { defineProblem } from "@/lib/content/types";

const s = ["{", "[", "]", "}"];

export default defineProblem({
  id: "valid-parentheses",
  title: "Valid Parentheses",
  difficulty: "easy",
  pattern: "stack",
  tags: ["core", "string"],
  statement: `You get a string made only of the six bracket characters: ( ) [ ] { }. Decide whether the brackets are balanced.

Balanced means every opener is closed by the same kind of bracket, and brackets close in the reverse of the order they opened, so the most recent opener always closes first.

Return True if the string is balanced, False if not.`,
  examples: [
    { input: 's = "{[]}"', output: "True" },
    { input: 's = "([)]"', output: "False", note: "the [ is still open when ) arrives" },
    { input: 's = "()[]{}"', output: "True" },
  ],
  constraints: ["0 ≤ len(s) ≤ 10⁴", "Only the characters ( ) [ ] { }"],
  myWords: "Push openers. On a closer, pop and check it matches. Stack must be empty at the end.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a string, return how many bracket pairs it contains",
        "Take a string, return True if it has equal numbers of openers and closers",
        "Take a string of brackets, return True if every bracket is closed by the right type in the right order",
        "Take a string, return the longest balanced substring",
      ],
      answer: 2,
      explain:
        'Input is one str of bracket characters. Output is a bool. Counting isn\'t enough: "([)]" has matching counts but closes in the wrong order.',
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Three counters, one per bracket type",
        "Two pointers from both ends",
        "Hash map of bracket counts",
        "Stack of openers, popped when a closer arrives",
      ],
      answer: 3,
      explain:
        'The most recent opener has to close first, which is last-in, first-out: a stack. Counters miss the ordering in "([)]", and two pointers fail on "()[]" where matching brackets aren\'t mirrored.',
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time, O(n) space", "O(n log n) time, O(1) space"],
      answer: 1,
      explain: "Each character is pushed or popped once: O(n) time. A string of nothing but openers puts all n of them on the stack: O(n) space.",
    },
  ],
  method: "isValid",
  params: [{ name: "s" }],
  solution: `def isValid(self, s):
    pairs, stack = {")": "(", "]": "[", "}": "{"}, []
    for c in s:
        if c not in pairs: stack.append(c)
        elif not stack or stack.pop() != pairs[c]: return False
    return not stack`,
  captions: [
    { label: "INIT", text: "Map each closer to the opener it needs, and start with an empty stack." },
    { label: "SCAN", text: "Read the string one character at a time." },
    { label: "PUSH", text: "Not a closer, so it's an opener: push it and wait for its match." },
    { label: "CHECK", text: "A closer: if the stack is empty, or the opener popped off the top is the wrong type, the string is invalid." },
    { label: "FINISH", text: "Valid only if no opener is still waiting on the stack." },
  ],
  visual: [
    { line: 0, note: "pairs knows which opener each closer needs. The stack is empty", arrays: [{ name: "s", values: s }], stack: { name: "stack", items: [] } },
    { line: 2, note: "{ is an opener: push", arrays: [{ name: "s", values: s, pointers: { c: 0 } }], stack: { name: "stack", items: ["{"] } },
    { line: 2, note: "[ is an opener: push", arrays: [{ name: "s", values: s, pointers: { c: 1 } }], stack: { name: "stack", items: ["{", "["] } },
    {
      line: 3,
      note: "] is a closer. Pop gives [, which is what ] needs. Carry on",
      arrays: [{ name: "s", values: s, pointers: { c: 2 }, hi: [1, 2] }],
      stack: { name: "stack", items: ["{"] },
      vars: { popped: "[", "pairs[c]": "[" },
    },
    {
      line: 3,
      note: "} is a closer. Pop gives {, a match again",
      arrays: [{ name: "s", values: s, pointers: { c: 3 }, hi: [0, 3] }],
      stack: { name: "stack", items: [] },
      vars: { popped: "{", "pairs[c]": "{" },
    },
    { line: 4, note: "End of string and nothing is left open", arrays: [{ name: "s", values: s }], stack: { name: "stack", items: [] }, vars: { return: "True" } },
  ],
  tests: {
    visible: [
      { args: ["{[]}"], expected: true },
      { args: ["([)]"], expected: false, label: "crossed order" },
      { args: ["()[]{}"], expected: true },
    ],
    hidden: [
      { args: [""], expected: true, label: "empty string" },
      { args: ["("], expected: false, label: "single opener" },
      { args: ["]"], expected: false, label: "single closer, nothing to pop" },
      { args: ["(()"], expected: false, label: "opener left over" },
      { args: ["(".repeat(150) + ")".repeat(150)], expected: true, label: "nested 150 deep" },
      { args: ["([{".repeat(50) + "}])".repeat(50)], expected: true, label: "300 characters, mixed types" },
    ],
  },
  hints: [
    "When you meet a closer, which opener does it have to match: the first one you saw, or the most recent one?",
    "Most recent first is last-in, first-out. Keep the openers on a stack and pop when a closer shows up.",
    "There are two ways to fail mid-string (a closer with nothing on the stack, or a popped opener of the wrong type) and one way to fail at the end (openers left over).",
  ],
  followUps: [
    {
      q: "Why can't you just count openers and closers?",
      a: '"([)]" has balanced counts for every type but closes in the wrong order. Counting only works when there is a single bracket type.',
    },
    {
      q: "Can you do it in O(1) space?",
      a: "With one bracket type, yes: one counter that never drops below zero and ends at zero. With several types you have to remember the order of the open brackets, which is O(n) in the worst case.",
    },
    {
      q: "What's the brute force and why is yours better?",
      a: 'Keep deleting "()", "[]" and "{}" until nothing changes, then check the string is empty. Each pass is O(n) and you can need n/2 passes, so O(n²). The stack does it in one pass.',
    },
  ],
  edgeCases: [
    { input: 's = "]"', breaks: true, why: "Popping from an empty stack raises IndexError. Check the stack has something on it before you pop." },
    { input: 's = "(("', breaks: true, why: "Nothing ever mismatches, so returning True after the loop is wrong. The stack has to be empty." },
    { input: 's = "([)]"', breaks: true, why: "A counter per bracket type says balanced. Only a stack catches the crossed order." },
    { input: 's = ""', breaks: false, why: "The loop never runs, and an empty stack means True." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/valid-parentheses/",
    neetcode: "https://www.youtube.com/watch?v=WTzjTskDFMg",
  },
});
