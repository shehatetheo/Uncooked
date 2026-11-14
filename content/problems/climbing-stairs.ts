import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "climbing-stairs",
  title: "Climbing Stairs",
  difficulty: "easy",
  pattern: "dp",
  tags: ["core"],
  statement: `You're climbing a staircase with n steps. Each move takes you up either 1 step or 2 steps.

Return how many different sequences of moves land you exactly on the top step. Order matters: a 1 followed by a 2 is a different way from a 2 followed by a 1.`,
  examples: [
    { input: "n = 3", output: "3", note: "1+1+1, 1+2, 2+1" },
    { input: "n = 2", output: "2", note: "1+1, 2" },
  ],
  constraints: ["1 ≤ n ≤ 45"],
  myWords: "ways(n) = ways(n-1) + ways(n-2), which is Fibonacci. Keep two numbers.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take an int n, return the fewest moves needed to climb n steps",
        "Take an int n, return every sequence of moves as a list",
        "Take a list of step heights, return the cheapest path to the top",
        "Take an int n, return the number of distinct ordered ways to climb n steps using 1s and 2s",
      ],
      answer: 3,
      explain:
        "Input is one int, the number of steps. Output is one int, a count of move sequences. You're counting the ways, not listing them and not minimising moves.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Recursion that tries both moves at every step, with no caching",
        "Dynamic programming: ways(n) = ways(n−1) + ways(n−2), keeping only the last two values",
        "Greedy: take 2 steps whenever you can",
        "Binary search on the answer",
      ],
      answer: 1,
      explain:
        "Your last move was either a 1 (from step n−1) or a 2 (from step n−2), so those two counts add up. That is the Fibonacci recurrence. Plain recursion recomputes the same steps again and again and is exponential.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(2ⁿ) time, O(n) space", "O(n) time, O(n) space", "O(n²) time, O(1) space"],
      answer: 0,
      explain: "The loop runs n times and keeps two integers. A memo table or a full DP array is also O(n) time, but it uses O(n) space you don't need.",
    },
  ],
  method: "climbStairs",
  params: [{ name: "n" }],
  solution: `def climbStairs(self, n):
    a, b = 1, 1
    for _ in range(n): a, b = b, a + b
    return a`,
  captions: [
    { label: "INIT", text: "a is the number of ways to reach the current step, b the ways to reach the next one. Both start at 1 (step 0 and step 1)." },
    { label: "STEP", text: "Slide forward n times: the new count is the sum of the two before it." },
    { label: "RETURN", text: "After n slides, a is the number of ways to reach step n." },
  ],
  visual: [
    {
      line: 0,
      note: "One way to stand at the bottom (do nothing), one way to reach step 1",
      arrays: [{ name: "ways to reach step 0, 1, 2, …", values: [1, 1], pointers: { a: 0, b: 1 } }],
      vars: { n: "3", a: "1", b: "1" },
    },
    {
      line: 1,
      note: "Slide 1: a takes b's value, and b becomes 1 + 1 = 2",
      arrays: [{ name: "ways to reach step 0, 1, 2, …", values: [1, 1, 2], pointers: { a: 1, b: 2 } }],
      vars: { n: "3", a: "1", b: "2" },
    },
    {
      line: 1,
      note: "Slide 2: b becomes 1 + 2 = 3",
      arrays: [{ name: "ways to reach step 0, 1, 2, …", values: [1, 1, 2, 3], pointers: { a: 2, b: 3 } }],
      vars: { n: "3", a: "2", b: "3" },
    },
    {
      line: 1,
      note: "Slide 3: b becomes 2 + 3 = 5, and a now sits on step 3",
      arrays: [{ name: "ways to reach step 0, 1, 2, …", values: [1, 1, 2, 3, 5], pointers: { a: 3, b: 4 } }],
      vars: { n: "3", a: "3", b: "5" },
    },
    {
      line: 2,
      note: "Three ways to reach step 3: 1+1+1, 1+2, 2+1",
      arrays: [{ name: "ways to reach step 0, 1, 2, …", values: [1, 1, 2, 3, 5], pointers: { a: 3 }, hi: [3] }],
      vars: { n: "3", return: "3" },
    },
  ],
  tests: {
    visible: [
      { args: [3], expected: 3 },
      { args: [2], expected: 2 },
      { args: [5], expected: 8 },
    ],
    hidden: [
      { args: [1], expected: 1, label: "one step" },
      { args: [4], expected: 5, label: "first value past the examples" },
      { args: [10], expected: 89 },
      { args: [20], expected: 10946 },
      { args: [30], expected: 1346269, label: "too slow for uncached recursion" },
      { args: [45], expected: 1836311903, label: "largest n" },
    ],
  },
  hints: [
    "Think about the very last move you make to land on step n. Where could you have been standing just before it?",
    "Either on step n−1 (then a 1-step) or on step n−2 (then a 2-step). So the count for n is the sum of the counts for those two.",
    "You never need more than the two most recent counts. Start both at 1 and roll them forward n times.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "Recursion that branches into a 1-step and a 2-step at every stair: O(2ⁿ) time, because it recomputes the same stairs over and over. The loop computes each one once.",
    },
    {
      q: "Can you do it in O(1) space?",
      a: "This already is: only a and b are kept. The O(n) space versions are memoised recursion and a full DP array.",
    },
    {
      q: "What if you could also take 3 steps at a time?",
      a: "Same idea with three terms: ways(n) = ways(n−1) + ways(n−2) + ways(n−3), with three rolling numbers. For k allowed step sizes it's O(n·k) time.",
    },
  ],
  edgeCases: [
    { input: "n = 1", breaks: true, why: "A DP array version that sets dp[2] = 2 before its loop writes past the end of a two-slot array." },
    { input: "n = 3", breaks: true, why: "Treating 1+2 and 2+1 as the same way gives 2. Order matters, so the answer is 3." },
    { input: "n = 45", breaks: true, why: "Uncached recursion makes billions of calls and times out. The loop does 45 additions." },
    { input: "n = 2", breaks: false, why: "Two ways, 1+1 and 2. The recurrence gives 1 + 1 = 2." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/climbing-stairs/",
    neetcode: "https://www.youtube.com/watch?v=Y0lT9Fck7qI",
  },
});
