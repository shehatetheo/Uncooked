import { python } from "@/lib/types";

export default python({
  id: "sqrtx",
  title: "Sqrt(x)",
  difficulty: "Easy",
  tags: ["math", "binary search"],
  statement: `You get a whole number x that is zero or more. Return its square root, rounded down to the nearest whole number.

In other words, return the biggest whole number whose square is not larger than x.

You are not allowed to use a built-in square root function or a power operator with 0.5.`,
  examples: [
    { input: "x = 4", output: "2", note: "2 times 2 is exactly 4." },
    { input: "x = 8", output: "2", note: "The real square root is about 2.83, and rounding down gives 2." },
  ],
  constraints: ["0 ≤ x ≤ 2³¹ - 1", "No math.sqrt and no x ** 0.5"],
  signature: "def mySqrt(self, x: int) -> int:",
  method: "mySqrt",
  params: [{ name: "x" }],
  solution: [
    "lo, hi = 0, x",
    "while lo <= hi:",
    "    mid = (lo + hi) // 2",
    "    if mid * mid <= x:",
    "        lo = mid + 1",
    "    else:",
    "        hi = mid - 1",
    "return hi",
  ],
  captions: [
    "The answer is somewhere between 0 and x, so that is our search range.",
    "Keep going while there are still candidates left in the range.",
    "Try the middle candidate.",
    "Is its square small enough to fit inside x?",
    "It fits, so the answer is mid or something bigger. Look in the upper half.",
    "Its square is too big.",
    "So the answer must be smaller than mid. Look in the lower half.",
    "When the range closes, hi sits on the last candidate whose square fit.",
  ],
  tests: {
    visible: [
      { args: [4], expected: 2 },
      { args: [8], expected: 2 },
      { args: [16], expected: 4 },
    ],
    hidden: [
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [2], expected: 1 },
      { args: [15], expected: 3 },
      { args: [2147395599], expected: 46339 },
      { args: [2147483647], expected: 46340 },
    ],
  },
  hints: [
    "As a candidate answer gets bigger, its square only gets bigger. What does that ordering let you do?",
    "Trying 1, 2, 3 and so on works but is slow for large x. You can throw away half of the candidates with each guess.",
    "Binary search between 0 and x for the largest number whose square is at most x.",
  ],
  followUps: [
    "Which pointer do you return when the loop ends, and why that one and not the other?",
    "How would you change this to return the square root as a decimal, accurate to 5 places?",
  ],
  time: "O(log x)",
  space: "O(1)",
  link: "https://leetcode.com/problems/sqrtx/",
});
