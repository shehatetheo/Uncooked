import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "two-sum",
  title: "Two Sum",
  difficulty: "easy",
  pattern: "hash-map",
  tags: ["core"],
  statement: `You get a list of whole numbers and a target. Exactly one pair of numbers in the list adds up to the target.

Return the positions (indices) of that pair, smaller index first. You can't use the same position twice.`,
  examples: [
    { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", note: "2 + 7 = 9" },
    { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
  ],
  constraints: ["2 ≤ len(nums) ≤ 10⁴", "Exactly one valid pair exists"],
  myWords:
    'Walk the list once. For each number, ask "have I already seen target minus this number?" using a hash map of number → index. O(n) instead of checking every pair.',
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int] and an int, return the two indices whose values sum to the target",
        "Take list[int] and an int, return the two values that sum to the target",
        "Take list[int], return True if any pair sums to the target",
        "Take a sorted list[int], return every pair that sums to the target",
      ],
      answer: 0,
      explain: "Input is list[int] plus an int target. Output is list[int] of two indices, not the values themselves.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: ["Hash map of value → index, one pass", "Sort, then two pointers", "Nested loops over every pair", "Binary search for each number"],
      answer: 0,
      explain:
        "A hash map answers \"have I seen the number I need?\" in O(1). Sorting would lose the original indices, and nested loops are O(n²).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n log n) time, O(1) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 0,
      explain: "One pass over n numbers with O(1) lookups. The map can hold up to n entries, so O(n) space.",
    },
  ],
  method: "twoSum",
  params: [{ name: "nums" }, { name: "target" }],
  solution: `def twoSum(self, nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen: return [seen[target - n], i]
        seen[n] = i`,
  captions: [
    { label: "INIT", text: "Empty hash map: number → the index where we saw it." },
    { label: "SCAN", text: "Walk the list once, keeping both the index and the number." },
    { label: "CHECK", text: "If the partner (target − n) was already seen, return its index and this one." },
    { label: "STORE", text: "Otherwise remember this number's index for later partners." },
  ],
  visual: [
    { line: 0, note: "seen starts empty", arrays: [{ name: "nums", values: [2, 7, 11, 15] }], map: { name: "seen", entries: [] }, vars: { target: "9" } },
    { line: 1, note: "i = 0, n = 2", arrays: [{ name: "nums", values: [2, 7, 11, 15], pointers: { i: 0 } }], map: { name: "seen", entries: [] }, vars: { target: "9", need: "7" } },
    { line: 3, note: "7 not seen yet, store 2 → 0", arrays: [{ name: "nums", values: [2, 7, 11, 15], pointers: { i: 0 } }], map: { name: "seen", entries: [["2", "0"]] }, vars: { target: "9" } },
    { line: 1, note: "i = 1, n = 7", arrays: [{ name: "nums", values: [2, 7, 11, 15], pointers: { i: 1 } }], map: { name: "seen", entries: [["2", "0"]] }, vars: { target: "9", need: "2" } },
    { line: 2, note: "2 is in seen → return [0, 1]", arrays: [{ name: "nums", values: [2, 7, 11, 15], pointers: { i: 1 }, hi: [0, 1] }], map: { name: "seen", entries: [["2", "0"]] }, vars: { target: "9", return: "[0, 1]" } },
  ],
  tests: {
    visible: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1], label: "duplicate values" },
    ],
    hidden: [
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], label: "negatives" },
      { args: [[0, 4, 3, 0], 0], expected: [0, 3], label: "zeros" },
      { args: [[1, 5, 5, 11], 10], expected: [1, 2], label: "pair is two equal numbers" },
      { args: [[1000000, -1000000, 7, 8], 15], expected: [2, 3], label: "pair at the end" },
    ],
  },
  hints: [
    "For each number n, the only partner that works is target − n. What structure tells you instantly whether you've seen it?",
    "Store each number's index in a dict as you go: seen[n] = i.",
    "Check for the partner before you store the current number, so a number never pairs with itself.",
  ],
  followUps: [
    { q: "What if the list were already sorted?", a: "Two pointers from both ends: O(n) time and O(1) space, no map needed." },
    { q: "Why check before storing?", a: "So [3, 3] with target 6 works and a single 3 can't pair with itself." },
    { q: "What's the brute force and why is yours better?", a: "Check every pair, O(n²). The map trades O(n) space for O(n) time." },
  ],
  edgeCases: [
    { input: "nums = [3, 3], target = 6", breaks: true, why: "A map built before scanning overwrites the first 3, or pairs an index with itself." },
    { input: "nums = [-3, 4, 3, 90], target = 0", breaks: false, why: "Negatives work the same; subtraction handles them." },
    { input: "nums = [3, 2, 4], target = 6", breaks: true, why: "A naive check finds 3 + 3 = 6 using index 0 twice." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/two-sum/",
    neetcode: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
  },
});
