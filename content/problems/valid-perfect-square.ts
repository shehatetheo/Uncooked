import { python } from "@/lib/types";

export default python({
  id: "valid-perfect-square",
  title: "Valid Perfect Square",
  difficulty: "Easy",
  tags: ["math", "binary search"],
  statement: `You get a positive whole number. Return True if it is a perfect square, and False if it is not.

A perfect square is a whole number multiplied by itself. For example 16 is a perfect square because it is 4 times 4, but 14 is not.

You are not allowed to use a built-in square root function.`,
  examples: [
    { input: "num = 16", output: "True", note: "4 times 4 is 16." },
    { input: "num = 14", output: "False", note: "3 times 3 is 9 and 4 times 4 is 16, so 14 is skipped." },
  ],
  constraints: ["1 ≤ num ≤ 2³¹ - 1", "No math.sqrt and no num ** 0.5"],
  signature: "def isPerfectSquare(self, num: int) -> bool:",
  method: "isPerfectSquare",
  params: [{ name: "num" }],
  solution: [
    "lo, hi = 1, num",
    "while lo <= hi:",
    "    mid = (lo + hi) // 2",
    "    if mid * mid == num:",
    "        return True",
    "    if mid * mid < num:",
    "        lo = mid + 1",
    "    else:",
    "        hi = mid - 1",
    "return False",
  ],
  captions: [
    "If a whole square root exists, it lies between 1 and num.",
    "Keep going while there are still candidates left in the range.",
    "Try the middle candidate.",
    "Does it multiply by itself to give exactly num?",
    "Then num is a perfect square and we are done.",
    "Otherwise check whether the square came out too small.",
    "Too small, so the root can only be in the upper half.",
    "The square came out too big.",
    "So the root can only be in the lower half.",
    "The range emptied without an exact hit, so no whole number squares to num.",
  ],
  tests: {
    visible: [
      { args: [16], expected: true },
      { args: [14], expected: false },
      { args: [1], expected: true },
    ],
    hidden: [
      { args: [2], expected: false },
      { args: [25], expected: true },
      { args: [24], expected: false },
      { args: [808201], expected: true },
      { args: [2147395600], expected: true },
      { args: [2147483647], expected: false },
    ],
  },
  hints: [
    "You are really asking: is there a whole number whose square is exactly num?",
    "Squares grow as the number grows, so one guess tells you whether the root is higher or lower than your guess.",
    "Binary search between 1 and num, comparing the square of the middle value to num until you hit it or run out of range.",
  ],
  followUps: [
    "In a language with fixed-size integers, mid times mid could overflow. How would you guard against that?",
    "Do you know a way to do this without binary search, for example Newton's method or adding up odd numbers?",
  ],
  time: "O(log n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/valid-perfect-square/",
});
