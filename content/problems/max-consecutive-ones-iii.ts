import { python } from "@/lib/types";

export default python({
  id: "max-consecutive-ones-iii",
  title: "Max Consecutive Ones III",
  difficulty: "Medium",
  tags: ["array", "sliding window"],
  statement: `You get a list that contains only 0s and 1s, and a number k. You are allowed to change at most k of the 0s into 1s.

Return the length of the longest run of 1s in a row that you can get after making those changes.

You don't have to use all k changes.`,
  examples: [
    { input: "nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2", output: "6", note: "Flip the 0s at indexes 5 and 10. Indexes 5 to 10 are then six 1s in a row." },
    { input: "nums = [1, 0, 1], k = 0", output: "1", note: "With no flips allowed, the longest run is a single 1." },
  ],
  constraints: ["1 ≤ len(nums) ≤ 10⁵", "Every value is 0 or 1", "0 ≤ k ≤ len(nums)"],
  signature: "def longestOnes(self, nums: List[int], k: int) -> int:",
  method: "longestOnes",
  params: [{ name: "nums" }, { name: "k" }],
  solution: [
    "left = zeros = best = 0",
    "for right, n in enumerate(nums):",
    "    zeros += n == 0",
    "    while zeros > k:",
    "        zeros -= nums[left] == 0",
    "        left += 1",
    "    best = max(best, right - left + 1)",
    "return best",
  ],
  captions: [
    "The window starts at left. zeros counts the 0s inside it, best is the longest valid window seen.",
    "Grow the window one item at a time by moving its right edge.",
    "If the new item is a 0, the window now holds one more zero.",
    "More than k zeros can't all be flipped, so the window is too greedy.",
    "The item about to leave on the left might be a 0. If so, the count drops.",
    "Move the left edge in by one.",
    "The window is valid again, so its length is a candidate answer.",
    "The longest valid window is the longest run we can make.",
  ],
  tests: {
    visible: [
      { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
      { args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
      { args: [[1, 0, 1], 0], expected: 1 },
    ],
    hidden: [
      { args: [[0], 0], expected: 0 },
      { args: [[0], 1], expected: 1 },
      { args: [[1, 1, 1, 1], 0], expected: 4 },
      { args: [[0, 0, 0, 0], 2], expected: 2 },
      { args: [[1, 0, 1, 0, 1], 5], expected: 5 },
      { args: [[0, 1, 1, 0, 1, 1, 1, 0, 1], 1], expected: 6 },
    ],
  },
  hints: [
    "Forget about flipping. Say the same goal in another way: what must be true about a stretch of the list for it to become all 1s?",
    "You want the longest stretch that contains at most k zeros. Checking every stretch is O(n²); can you reuse work as the stretch moves?",
    "Slide a window: push the right edge forward one step at a time, and whenever it holds more than k zeros, pull the left edge in until it doesn't.",
  ],
  followUps: [
    "What if the numbers arrive as a stream and you can't go back to read old ones?",
    "Can you write it so the window never shrinks, only slides? Why does that still give the right answer?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/max-consecutive-ones-iii/",
});
