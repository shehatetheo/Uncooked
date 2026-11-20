import { python } from "@/lib/types";

export default python({
  id: "remove-duplicates-from-sorted-array",
  title: "Remove Duplicates from Sorted Array",
  difficulty: "Easy",
  tags: ["array", "two pointers"],
  statement: `You get a list of whole numbers sorted from smallest to largest. Some numbers repeat.

Rearrange the list in place so that each different number appears once at the front, still in sorted order. Return k, the count of different numbers.

Only the first k positions matter. Whatever is left after them is ignored. The tests check that you returned the right k and that the first k items are the right ones.`,
  examples: [
    { input: "nums = [1, 1, 2]", output: "2, nums = [1, 2, _]", note: "Two different numbers. The first two slots hold 1 and 2." },
    { input: "nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]", output: "5, nums = [0, 1, 2, 3, 4, _, _, _, _, _]" },
  ],
  constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "nums is sorted in non-decreasing order", "Use O(1) extra memory"],
  signature: "def removeDuplicates(self, nums: List[int]) -> int:",
  method: "removeDuplicates",
  params: [{ name: "nums" }],
  returns: "prefix",
  solution: [
    "k = 1",
    "for i in range(1, len(nums)):",
    "    if nums[i] != nums[i - 1]:",
    "        nums[k] = nums[i]",
    "        k += 1",
    "return k",
  ],
  captions: [
    "The first number is always kept, so one slot is already filled.",
    "Scan from the second number on.",
    "In a sorted list, a number is new exactly when it differs from the one before it.",
    "Copy the new number into the next free slot at the front.",
    "One more unique number placed.",
    "k is both the count and the length of the cleaned-up front part.",
  ],
  tests: {
    visible: [
      { args: [[1, 1, 2]], expected: [1, 2] },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
      { args: [[5]], expected: [5] },
    ],
    hidden: [
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[2, 2, 2, 2]], expected: [2] },
      { args: [[-3, -3, -1, 0, 0, 0, 7]], expected: [-3, -1, 0, 7] },
      { args: [[1, 1]], expected: [1] },
      { args: [[1, 2, 2]], expected: [1, 2] },
    ],
  },
  hints: [
    "The list is sorted. Where do equal numbers end up relative to each other?",
    "You only need to compare each number with the one right before it.",
    "Keep a write index k. Every time nums[i] differs from nums[i - 1], copy it to nums[k] and move k forward.",
  ],
  followUps: ["What if each number were allowed to appear at most twice?", "Why does this need the list to be sorted? What would you do if it weren't?"],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
});
