import { python } from "@/lib/types";

export default python({
  id: "sort-array-by-increasing-frequency",
  title: "Sort Array by Increasing Frequency",
  difficulty: "Easy",
  tags: ["array", "hash map", "sorting"],
  statement: `You get a list of whole numbers. Sort it by how often each value appears, with the rarest values first.

When two values appear the same number of times, the larger value goes first.

Return the sorted list. It has the same numbers as the input, repeats included.`,
  examples: [
    { input: "nums = [4, 4, 7, 7, 7, 9]", output: "[9, 4, 4, 7, 7, 7]", note: "9 appears once, 4 twice and 7 three times." },
    { input: "nums = [5, 8, 2, 8, 5]", output: "[2, 8, 8, 5, 5]", note: "5 and 8 both appear twice, so the larger one, 8, goes first." },
  ],
  constraints: ["1 ≤ len(nums) ≤ 100", "-100 ≤ nums[i] ≤ 100"],
  signature: "def frequencySort(self, nums: List[int]) -> List[int]:",
  method: "frequencySort",
  params: [{ name: "nums" }],
  solution: ["count = Counter(nums)", "return sorted(nums, key=lambda n: (count[n], -n))"],
  captions: [
    "Count how many times each value appears.",
    "Sort by count first. The negated value breaks ties so the larger number comes first.",
  ],
  tests: {
    visible: [
      { args: [[4, 4, 7, 7, 7, 9]], expected: [9, 4, 4, 7, 7, 7] },
      { args: [[5, 8, 2, 8, 5]], expected: [2, 8, 8, 5, 5] },
      { args: [[-1, 1, -6, 4, 5, -6, 1, 4, 1]], expected: [5, -1, 4, 4, -6, -6, 1, 1, 1] },
    ],
    hidden: [
      { args: [[7]], expected: [7] },
      { args: [[3, 3, 3]], expected: [3, 3, 3] },
      { args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
      { args: [[-3, -3, -1, -1, 0]], expected: [0, -1, -1, -3, -3] },
      { args: [[100, -100, 100, -100]], expected: [100, 100, -100, -100] },
      { args: [[9, 9, 9, 1, 1, 5]], expected: [5, 1, 1, 9, 9, 9] },
    ],
  },
  hints: [
    "Before you can sort by frequency, what do you need to know about every value?",
    "Python can sort by a key you compute for each item. A tuple key compares its first part, then its second part on ties.",
    "Count the values with a Counter, then sort with the key (count of the value, negative of the value).",
  ],
  followUps: [
    "The values are limited to -100 through 100. Can you use that to avoid a comparison sort?",
    "What would you change if ties had to keep the order the values first appeared in the input?",
  ],
  time: "O(n log n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/sort-array-by-increasing-frequency/",
});
