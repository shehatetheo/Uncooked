import { python } from "@/lib/types";

export default python({
  id: "monotone-increasing-digits",
  title: "Monotone Increasing Digits",
  difficulty: "Medium",
  tags: ["greedy", "math", "string"],
  statement: `You get a whole number n that is zero or more. Return the biggest number that is less than or equal to n and whose digits never go down when read from left to right.

Never going down means each digit is at least as big as the digit before it. Equal neighbours are fine, so 1123 and 999 both qualify, but 1232 does not because the 2 at the end is smaller than the 3 before it.

If n already has this property, the answer is n itself.`,
  examples: [
    { input: "n = 10", output: "9", note: "In 10 the digits drop from 1 to 0, so the best we can do is 9." },
    { input: "n = 1234", output: "1234", note: "The digits already never go down." },
    { input: "n = 332", output: "299", note: "331, 330 and everything down to 300 still contain a drop. 299 is the first number that doesn't." },
  ],
  constraints: ["0 ≤ n ≤ 10⁹"],
  signature: "def monotoneIncreasingDigits(self, n: int) -> int:",
  method: "monotoneIncreasingDigits",
  params: [{ name: "n" }],
  solution: [
    "digits = list(str(n))",
    "mark = len(digits)",
    "for i in range(len(digits) - 1, 0, -1):",
    "    if digits[i - 1] > digits[i]:",
    "        digits[i - 1] = str(int(digits[i - 1]) - 1)",
    "        mark = i",
    'return int("".join(digits[:mark]) + "9" * (len(digits) - mark))',
  ],
  captions: [
    "Split the number into a list of digit characters so single digits can be changed.",
    "mark is where the run of 9s will begin. Starting past the end means no 9s yet.",
    "Scan from the last digit back to the first, comparing each digit with the one before it.",
    "A drop: the earlier digit is bigger than the later one.",
    "Lower the earlier digit by one. That makes the number smaller, which frees everything after it.",
    "Everything from here to the end can now be 9, the biggest digit there is.",
    "Keep the digits before the mark, fill the rest with 9s, and turn it back into a number.",
  ],
  tests: {
    visible: [
      { args: [10], expected: 9 },
      { args: [1234], expected: 1234 },
      { args: [332], expected: 299 },
    ],
    hidden: [
      { args: [0], expected: 0 },
      { args: [9], expected: 9 },
      { args: [1000], expected: 999 },
      { args: [120], expected: 119 },
      { args: [1232], expected: 1229 },
      { args: [668841], expected: 667999 },
    ],
  },
  hints: [
    "Find the first place where a digit is smaller than the digit before it. Something to the left of that spot has to get smaller.",
    "Once you lower one digit by 1, the number is already below n. What is the best thing to put in every position after it?",
    "Scan the digits from right to left; at each drop, lower the left digit by one and remember that position, then fill everything after the last remembered position with 9s.",
  ],
  followUps: [
    "Why scan from right to left? Walk through 332 scanning left to right and show what goes wrong.",
    "How would you solve the mirror problem: the smallest number greater than or equal to n whose digits never go down?",
  ],
  time: "O(d)",
  space: "O(d)",
  link: "https://leetcode.com/problems/monotone-increasing-digits/",
});
