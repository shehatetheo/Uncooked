import { python } from "@/lib/types";

export default python({
  id: "fibonacci-number",
  title: "Fibonacci Number",
  difficulty: "Easy",
  tags: ["math", "dp"],
  statement: `The Fibonacci sequence starts with 0 and then 1. After that, every number is the sum of the two numbers before it: 0, 1, 1, 2, 3, 5, 8, and so on.

You get a whole number n. Return the number at position n in the sequence, where position 0 holds 0 and position 1 holds 1.`,
  examples: [
    { input: "n = 2", output: "1", note: "Position 2 is 0 + 1 = 1." },
    { input: "n = 4", output: "3", note: "The sequence runs 0, 1, 1, 2, 3, so position 4 holds 3." },
  ],
  constraints: ["0 ≤ n ≤ 30"],
  signature: "def fib(self, n: int) -> int:",
  method: "fib",
  params: [{ name: "n" }],
  solution: ["a, b = 0, 1", "for _ in range(n):", "    a, b = b, a + b", "return a"],
  captions: [
    "a is the number at the current position and b is the one after it. We start at position 0.",
    "Step forward n times to reach position n.",
    "Slide the pair along: the next number becomes current, and the new next is the sum of the old two.",
    "After n steps, a holds the number at position n.",
  ],
  tests: {
    visible: [
      { args: [2], expected: 1 },
      { args: [3], expected: 2 },
      { args: [4], expected: 3 },
    ],
    hidden: [
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [10], expected: 55 },
      { args: [20], expected: 6765 },
      { args: [30], expected: 832040 },
    ],
  },
  hints: [
    "To work out the next number, how many earlier numbers do you actually need to remember?",
    "Plain recursion recomputes the same positions again and again. Build up from position 0 instead of down from n.",
    "Keep only the last two numbers in two variables and slide them forward n times.",
  ],
  followUps: [
    "Why is the plain recursive version so slow, and what is its running time?",
    "If n could be huge, like 10 to the 18th, how could you get the answer in O(log n) steps?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/fibonacci-number/",
});
