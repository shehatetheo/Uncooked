import { python } from "@/lib/types";

export default python({
  id: "maximum-subarray",
  title: "Maximum Subarray",
  difficulty: "Medium",
  tags: ["array", "dp"],
  statement: `You get a list of whole numbers, which can be positive, negative or zero.

A subarray is a run of numbers that sit next to each other in the list. It must contain at least one number.

Find the subarray whose numbers add up to the biggest total, and return that total.`,
  examples: [
    { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", note: "The run [4, -1, 2, 1] adds up to 6." },
    { input: "nums = [1]", output: "1", note: "With one number, that number is the only choice." },
    { input: "nums = [5, 4, -1, 7, 8]", output: "23", note: "Taking the whole list is best here." },
  ],
  constraints: ["1 ≤ len(nums) ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
  signature: "def maxSubArray(self, nums: List[int]) -> int:",
  method: "maxSubArray",
  params: [{ name: "nums" }],
  solution: ["best = nums[0]", "cur = 0", "for n in nums:", "    cur = max(n, cur + n)", "    best = max(best, cur)", "return best"],
  captions: [
    "Start the best total at the first number, so an all-negative list still works.",
    "cur is the best total of a run that ends at the number we are on.",
    "Walk the list once.",
    "Either extend the run we had, or start fresh at this number if the old run was dragging us down.",
    "Remember the largest run total seen anywhere.",
    "That is the biggest total of any run.",
  ],
  tests: {
    visible: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
    hidden: [
      { args: [[-1]], expected: -1 },
      { args: [[-3, -2, -5]], expected: -2 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [[-2, 1]], expected: 1 },
      { args: [[8, -19, 5, -4, 20]], expected: 21 },
      { args: [[10000, -1, 10000]], expected: 19999 },
    ],
  },
  hints: [
    "Think about the best run that ends exactly at each position, not the best run overall.",
    "If the best run ending just before this number has a negative total, is it worth keeping?",
    "Keep a running total that restarts at the current number whenever extending would be worse, and track the largest running total you ever see.",
  ],
  followUps: [
    "How would you also return where the best run starts and ends, not just its total?",
    "What if the list were circular, so a run could wrap from the end back to the start?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/maximum-subarray/",
});
