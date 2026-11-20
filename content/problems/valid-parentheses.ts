import { python } from "@/lib/types";

export default python({
  id: "valid-parentheses",
  title: "Valid Parentheses",
  difficulty: "Easy",
  tags: ["string", "stack"],
  statement: `You get a string made only of the six bracket characters: ( ) [ ] { }. Decide whether the brackets are balanced.

Balanced means every opening bracket is closed by the same kind of bracket, and brackets close in the reverse of the order they opened. The most recently opened bracket always has to close first.

Return True if the string is balanced and False if it is not.`,
  examples: [
    { input: 's = "()[]{}"', output: "True", note: "Each bracket is closed right away by its own kind." },
    { input: 's = "{[]}"', output: "True", note: "The [ opened last, so it closes first, then the { closes." },
    { input: 's = "([)]"', output: "False", note: "The [ is still open when the ) arrives." },
  ],
  constraints: ["1 ≤ len(s) ≤ 10⁴", "s contains only the characters ( ) [ ] { }"],
  signature: "def isValid(self, s: str) -> bool:",
  method: "isValid",
  params: [{ name: "s" }],
  solution: [
    'pairs = {")": "(", "]": "[", "}": "{"}',
    "stack = []",
    "for c in s:",
    "    if c not in pairs:",
    "        stack.append(c)",
    "    elif not stack or stack.pop() != pairs[c]:",
    "        return False",
    "return not stack",
  ],
  captions: [
    "Map each closing bracket to the opening bracket it needs.",
    "The stack holds the brackets that are open right now, newest on top.",
    "Read the string one character at a time.",
    "Anything that isn't a closer must be an opener.",
    "Push the opener so we remember it is waiting to be closed.",
    "For a closer, the newest opener must exist and be the matching kind.",
    "Nothing open, or the wrong kind on top: the string is not balanced.",
    "Balanced only if no opener is left waiting at the end.",
  ],
  tests: {
    visible: [
      { args: ["()[]{}"], expected: true },
      { args: ["{[]}"], expected: true },
      { args: ["([)]"], expected: false },
    ],
    hidden: [
      { args: ["("], expected: false },
      { args: ["]"], expected: false },
      { args: ["(()"], expected: false },
      { args: ["())"], expected: false },
      { args: ["(]"], expected: false },
      { args: ["{[()()]}[]((({})))"], expected: true },
    ],
  },
  hints: [
    "When you see a closing bracket, which earlier bracket does it have to match?",
    "The most recently opened bracket must close first. Which data structure gives you the newest item first?",
    "Push every opener on a stack; on a closer, pop and check it is the matching kind, and finish by checking the stack is empty.",
  ],
  followUps: [
    "If the string had only one kind of bracket, could you solve it with O(1) extra space?",
    "How would you return the index of the first bracket that breaks the rule instead of just True or False?",
  ],
  time: "O(n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/valid-parentheses/",
});
