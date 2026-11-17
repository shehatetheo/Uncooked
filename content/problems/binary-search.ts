import { defineProblem } from "@/lib/content/types";

const nums = [-1, 0, 3, 5, 9, 12];
const evens300 = Array.from({ length: 300 }, (_, i) => i * 2);

export default defineProblem({
  id: "binary-search",
  title: "Binary Search",
  difficulty: "easy",
  pattern: "binary-search",
  tags: ["core"],
  statement: `You get a list of distinct whole numbers sorted from smallest to largest, and a target number.

Return the index of the target if it's in the list, or -1 if it isn't.

Your solution has to run in O(log n) time, so checking every element one by one is not allowed.`,
  examples: [
    { input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4", note: "9 sits at index 4" },
    { input: "nums = [-1, 0, 3, 5, 9, 12], target = 2", output: "-1", note: "2 is not in the list" },
  ],
  constraints: ["0 ≤ len(nums) ≤ 10⁴", "nums is sorted ascending with no repeats"],
  brief: {
    what: "You're given a list of different whole numbers arranged from smallest to largest, plus a target number. Return the position of the target in the list, or -1 if it isn't there. Checking every element one by one is too slow for this problem.",
    example: "In [-1, 0, 3, 5, 9, 12], the target 9 is the fifth number; positions count from 0, so the answer is 4.",
    watch: "If the target isn't in the list, including when the list is empty, return -1 rather than the position where it would have gone.",
  },
  myWords: "Check the middle and throw away the half that can't contain the target.",
  time: "O(log n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a sorted list[int] and an int, return True if the int is in the list",
        "Take an unsorted list[int] and an int, return the position the int would have after sorting",
        "Take a sorted list[int] and an int, return the int's index, or -1 if it's missing",
        "Take a sorted list[int] and an int, return the value closest to the int",
      ],
      answer: 2,
      explain: "Input is a sorted list[int] plus an int target. Output is an int: the index where the target sits, or -1 when it's absent.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Check the middle of the current window and discard the half that can't hold the target",
        "Scan left to right until you reach the target",
        "Put every value in a hash map of value → index",
        "Two pointers stepping inward one position at a time",
      ],
      answer: 0,
      explain:
        "Because the list is sorted, one comparison with the middle rules out half of what's left. A scan or a hash map both find the answer, but they take O(n), which breaks the O(log n) requirement.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(log n) time, O(log n) space", "O(n log n) time, O(1) space", "O(log n) time, O(1) space"],
      answer: 3,
      explain:
        "The window halves on every step, so it takes about log₂ n steps. The loop keeps only l, r and m: O(1) space. A recursive version would use O(log n) for the call stack.",
    },
  ],
  method: "search",
  params: [{ name: "nums" }, { name: "target" }],
  solution: `def search(self, nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target: return m
        l, r = (m + 1, r) if nums[m] < target else (l, m - 1)
    return -1`,
  captions: [
    { label: "INIT", text: "The search window covers the whole list: l on the first index, r on the last." },
    { label: "LOOP", text: "Keep going while the window still holds at least one element." },
    { label: "MID", text: "Pick the middle index of the window." },
    { label: "FOUND", text: "If the middle value is the target, return its index." },
    { label: "NARROW", text: "Middle too small: move l just past it. Too big: move r just before it." },
    { label: "MISSING", text: "The window emptied without a match." },
  ],
  visual: [
    { line: 0, note: "The window is the whole list", arrays: [{ name: "nums", values: nums, pointers: { l: 0, r: 5 } }], vars: { target: "9" } },
    { line: 2, note: "m = (0 + 5) // 2 = 2, and nums[2] = 3", arrays: [{ name: "nums", values: nums, pointers: { l: 0, m: 2, r: 5 } }], vars: { target: "9", "nums[m]": "3" } },
    {
      line: 4,
      note: "3 < 9, so the target can't be at index 2 or anywhere left of it. l = m + 1 = 3",
      arrays: [{ name: "nums", values: nums, pointers: { l: 3, r: 5 }, dim: [0, 1, 2] }],
      vars: { target: "9" },
    },
    { line: 1, note: "l ≤ r, so the window still has elements", arrays: [{ name: "nums", values: nums, pointers: { l: 3, r: 5 }, dim: [0, 1, 2] }], vars: { target: "9" } },
    {
      line: 2,
      note: "m = (3 + 5) // 2 = 4, and nums[4] = 9",
      arrays: [{ name: "nums", values: nums, pointers: { l: 3, m: 4, r: 5 }, dim: [0, 1, 2] }],
      vars: { target: "9", "nums[m]": "9" },
    },
    {
      line: 3,
      note: "nums[4] is the target: return 4",
      arrays: [{ name: "nums", values: nums, pointers: { m: 4 }, hi: [4], dim: [0, 1, 2] }],
      vars: { target: "9", return: "4" },
    },
  ],
  tests: {
    visible: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, label: "missing, falls between two values" },
      { args: [[5], 5], expected: 0, label: "single element, found" },
    ],
    hidden: [
      { args: [[], 1], expected: -1, label: "empty list" },
      { args: [[5], -5], expected: -1, label: "single element, missing" },
      { args: [[-10, -5, -2, 0, 7], -10], expected: 0, label: "target at index 0, negatives" },
      { args: [[1, 3], 3], expected: 1, label: "two elements, target is last" },
      { args: [evens300, 598], expected: 299, label: "300 elements, target at the end" },
      { args: [evens300, 301], expected: -1, label: "300 elements, target in a gap" },
    ],
  },
  hints: [
    "The list is sorted. If you look at one element and it's too small, what do you know about everything to its left?",
    "Keep two indices marking the part of the list that could still contain the target, and look at the middle of that range each time.",
    "After a miss, move the boundary past the middle (m + 1 or m − 1), not onto it. Loop while l ≤ r, and return -1 once the window is empty.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "A linear scan is O(n). Halving the window is O(log n): about 20 steps for a million elements instead of up to a million.",
    },
    {
      q: "What if the list had duplicates and you needed the first occurrence?",
      a: "Don't return on a match. Record the index, set r = m − 1 and keep searching the left side. Still O(log n).",
    },
    {
      q: "Why m + 1 and m − 1 rather than m?",
      a: "With l = m the window can stop shrinking once l and r are next to each other, and the loop never ends. You've already checked index m, so leaving it out is safe.",
    },
  ],
  edgeCases: [
    { input: "nums = [5], target = 5", breaks: true, why: "With while l < r the loop never runs on a one-element window, and you return -1." },
    { input: "nums = [1, 3], target = 3", breaks: true, why: "Setting l = m instead of m + 1 leaves l stuck on index 0 forever." },
    { input: "nums = [], target = 1", breaks: false, why: "r starts at -1, the loop never runs, and you return -1." },
    { input: "nums = [-1, 0, 3, 5, 9, 12], target = 2", breaks: false, why: "A missing value between two elements: the window closes and you return -1." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/binary-search/",
    neetcode: "https://www.youtube.com/watch?v=s4DPM8ct1pI",
  },
});
