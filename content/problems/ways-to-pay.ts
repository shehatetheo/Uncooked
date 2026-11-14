import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "ways-to-pay",
  title: "Ways to Pay",
  difficulty: "easy",
  pattern: "dp",
  tags: ["made-up"],
  statement: `Imagine a coffee machine in the office that only takes 1-unit and 2-unit coins, one coin at a time. You get the price of a drink as a whole number.

Return the number of different coin sequences that add up to exactly that price. The order of the coins matters: putting in 1 then 2 is a different sequence from 2 then 1.`,
  examples: [
    { input: "amount = 3", output: "3", note: "1+1+1, 1+2, 2+1" },
    { input: "amount = 4", output: "5", note: "1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2" },
  ],
  constraints: ["1 ≤ amount ≤ 45", "You have as many coins of each kind as you need"],
  myWords:
    "Look at the last coin. It's either a 1, and before it you paid amount − 1, or a 2, and before it you paid amount − 2. So ways(n) = ways(n − 1) + ways(n − 2). Build that up from the bottom, keeping only the last two values.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take an int, return the smallest number of coins needed",
        "Take an int, return an int: how many ordered sequences of 1s and 2s sum to it",
        "Take an int, return a list of every coin sequence",
        "Take an int, return how many 2-unit coins fit into it",
      ],
      answer: 1,
      explain:
        "Input is an int and output is an int. You count the sequences, you don't list them, and order matters, so 1+2 and 2+1 are two different ways.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Greedy: always insert the largest coin first",
        "Recursion that tries both coins at every step, with no memory",
        "Dynamic programming: ways(n) = ways(n − 1) + ways(n − 2), built bottom-up",
        "Binary search on the number of coins",
      ],
      answer: 2,
      explain:
        "The count for an amount depends only on the counts for the two smaller amounts. Plain recursion recomputes the same amounts again and again; building bottom-up computes each once.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(2ⁿ) time, O(n) space", "O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 3,
      explain:
        "One loop of n steps: O(n). Each step only needs the previous two results, so two variables are enough: O(1). A full table would also work but uses O(n) space.",
    },
  ],
  method: "waysToPay",
  params: [{ name: "amount" }],
  solution: `def waysToPay(self, amount):
    a, b = 1, 1
    for _ in range(amount):
        a, b = b, a + b
    return a`,
  captions: [
    { label: "BASE", text: "a is the number of ways to pay 0 (one way: insert nothing). b is the number of ways to pay 1." },
    { label: "BUILD UP", text: "Advance one unit at a time, amount times in total." },
    { label: "SHIFT", text: "Slide the window: a becomes the next amount's count, and b becomes the sum of the previous two." },
    { label: "RETURN", text: "After amount shifts, a holds the number of ways to pay exactly amount." },
  ],
  visual: [
    { line: 0, note: "a = ways to pay 0, b = ways to pay 1", arrays: [{ name: "ways", values: [1, 1, "?", "?"], pointers: { a: 0, b: 1 } }], vars: { amount: "3", a: "1", b: "1" } },
    { line: 2, note: "shift 1: ways to pay 2 is 1 + 1 = 2", arrays: [{ name: "ways", values: [1, 1, 2, "?"], pointers: { a: 1, b: 2 } }], vars: { amount: "3", a: "1", b: "2" } },
    { line: 2, note: "shift 2: ways to pay 3 is 1 + 2 = 3", arrays: [{ name: "ways", values: [1, 1, 2, 3], pointers: { a: 2, b: 3 } }], vars: { amount: "3", a: "2", b: "3" } },
    { line: 2, note: "shift 3: a now sits on amount 3", arrays: [{ name: "ways", values: [1, 1, 2, 3, 5], pointers: { a: 3, b: 4 } }], vars: { amount: "3", a: "3", b: "5" } },
    { line: 3, note: "return a", arrays: [{ name: "ways", values: [1, 1, 2, 3, 5], hi: [3] }], vars: { amount: "3", return: "3" } },
  ],
  tests: {
    visible: [
      { args: [3], expected: 3 },
      { args: [4], expected: 5 },
      { args: [1], expected: 1, label: "only one coin fits" },
    ],
    hidden: [
      { args: [2], expected: 2, label: "1+1 or a single 2" },
      { args: [5], expected: 8 },
      { args: [10], expected: 89 },
      { args: [20], expected: 10946, label: "too many to enumerate by hand" },
      { args: [30], expected: 1346269, label: "naive recursion gets slow here" },
      { args: [45], expected: 1836311903, label: "largest allowed amount" },
    ],
  },
  hints: [
    "Work out the answers for 1, 2, 3, 4 and 5 by hand and look at the sequence of results.",
    "Think about the last coin inserted. It was a 1 or a 2. How many ways were there to reach the amount just before each of those?",
    "ways(n) = ways(n − 1) + ways(n − 2). You never need more than the last two values, so two variables are enough.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is it slow?",
      a: "Recursion that tries a 1 and a 2 at every step. It solves the same sub-amounts over and over and takes roughly O(2ⁿ) time. Remembering results, or building bottom-up, makes it O(n).",
    },
    {
      q: "What if the machine also took 5-unit coins?",
      a: "ways(n) = ways(n − 1) + ways(n − 2) + ways(n − 5). Keep a table of the last five values, or a full list, and sum over the coins that fit.",
    },
    {
      q: "What if the order of coins didn't matter?",
      a: "Then it's a different problem (Coin Change II). With only 1s and 2s you just choose how many 2s to use: amount // 2 + 1 ways.",
    },
  ],
  edgeCases: [
    { input: "amount = 1", breaks: true, why: "A table version that sets ways[2] = 2 up front writes past the end of a table that only has slots 0 and 1." },
    { input: "amount = 30", breaks: true, why: "Plain recursion without memoisation makes millions of calls here and billions at 45." },
    { input: "amount = 3", breaks: true, why: "Counting only how many 2s you use (none or one) gives 2. It treats 1+2 and 2+1 as the same way; the answer is 3." },
    { input: "amount = 4", breaks: false, why: "A mid-sized amount works with any correct recurrence." },
  ],
  reveal:
    "This is Climbing Stairs: paying with 1- and 2-unit coins in order is the same as climbing 1 or 2 steps at a time. The counts are the Fibonacci numbers.",
  remixOf: "climbing-stairs",
  links: {},
});
