import { python } from "@/lib/types";

export default python({
  id: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["array", "hash map"],
  statement: `You get a list of whole numbers and a target number. Exactly two of the numbers add up to the target.

Return the positions (indexes) of those two numbers. You can't use the same position twice. The order of the two indexes doesn't matter.`,
  examples: [
    { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", note: "nums[0] + nums[1] is 2 + 7 = 9." },
    { input: "nums = [3, 3], target = 6", output: "[0, 1]", note: "The same value can appear twice, at two different positions." },
  ],
  constraints: ["2 ≤ len(nums) ≤ 10⁴", "Numbers and the target can be negative", "Exactly one valid pair exists"],
  signature: "def twoSum(self, nums: List[int], target: int) -> List[int]:",
  method: "twoSum",
  params: [{ name: "nums" }, { name: "target" }],
  compare: "unordered",
  solution: [
    "seen = {}",
    "for i, n in enumerate(nums):",
    "    if target - n in seen:",
    "        return [seen[target - n], i]",
    "    seen[n] = i",
  ],
  captions: [
    "A dictionary from each number we've passed to its index.",
    "Walk the list once, keeping both the index and the number.",
    "The partner we need is target minus this number. Have we seen it?",
    "Yes: return the partner's index and this one.",
    "No: remember this number. Storing after checking stops a number pairing with itself.",
  ],
  tests: {
    visible: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
    hidden: [
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
      { args: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { args: [[1, 5, 9, 14, 20], 34], expected: [3, 4] },
      { args: [[5, 75, 25], 100], expected: [1, 2] },
    ],
  },
  hints: [
    "For each number, what exact value would its partner need to be?",
    "Checking every pair is O(n²). Which data structure answers \"have I seen this value?\" in O(1)?",
    "Keep a dictionary from number to index. For each number, look up target minus it before you store it.",
  ],
  followUps: ["What if the list were already sorted? Can you do it with O(1) extra space?", "What if there could be several valid pairs and you had to return all of them?"],
  time: "O(n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/two-sum/",
});
