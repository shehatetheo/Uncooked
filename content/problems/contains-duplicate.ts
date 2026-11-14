import { defineProblem } from "@/lib/content/types";

const distinct300 = Array.from({ length: 300 }, (_, i) => i);

export default defineProblem({
  id: "contains-duplicate",
  title: "Contains Duplicate",
  difficulty: "easy",
  pattern: "hash-map",
  tags: ["core"],
  statement: `You get a list of whole numbers. Decide whether any value shows up more than once.

Return True if at least one number repeats, and False if every number is different.`,
  examples: [
    { input: "nums = [1, 2, 3, 1]", output: "True", note: "1 appears twice" },
    { input: "nums = [1, 2, 3, 4]", output: "False" },
  ],
  constraints: ["0 ≤ len(nums) ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"],
  myWords: "A set throws out duplicates. If the set is smaller than the list, something repeated.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int], return the value that appears more than once",
        "Take list[int], return how many values are repeated",
        "Take list[int], return True if any value appears at least twice",
        "Take list[int], return the list with repeats removed",
      ],
      answer: 2,
      explain:
        "Input is list[int]. Output is a bool: True if some value repeats, otherwise False. You never have to say which value repeats or how often.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Nested loops comparing every pair",
        "Build a set and compare its size to the list's",
        "Two pointers from both ends",
        "Binary search for each number",
      ],
      answer: 1,
      explain:
        "A set keeps one copy of each value, so a size difference means a repeat. Nested loops are O(n²), and two pointers or binary search need sorted input.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n²) time, O(1) space", "O(n log n) time, O(n) space", "O(n) time, O(1) space", "O(n) time, O(n) space"],
      answer: 3,
      explain:
        "Each number is hashed once, so O(n) time. The set can hold all n numbers, so O(n) space. Sorting in place saves the space but costs O(n log n) time.",
    },
  ],
  method: "containsDuplicate",
  params: [{ name: "nums" }],
  solution: `def containsDuplicate(self, nums):
    return len(set(nums)) != len(nums)`,
  captions: [
    { label: "COMPARE", text: "Build a set from the list (repeats collapse into one) and return True if it came out shorter than the list." },
  ],
  visual: [
    { line: 0, note: "set(nums) takes each number in turn and keeps one copy of each", arrays: [{ name: "nums", values: [1, 2, 3, 1] }] },
    { line: 0, note: "1 is new, so it goes in", arrays: [{ name: "nums", values: [1, 2, 3, 1], pointers: { i: 0 } }, { name: "set(nums)", values: [1] }] },
    { line: 0, note: "2 and 3 are new too", arrays: [{ name: "nums", values: [1, 2, 3, 1], pointers: { i: 2 } }, { name: "set(nums)", values: [1, 2, 3] }] },
    {
      line: 0,
      note: "The second 1 is already in the set, so nothing is added",
      arrays: [{ name: "nums", values: [1, 2, 3, 1], pointers: { i: 3 }, hi: [0, 3] }, { name: "set(nums)", values: [1, 2, 3], hi: [0] }],
    },
    {
      line: 0,
      note: "The set has 3 items and the list has 4, so something repeated",
      arrays: [{ name: "nums", values: [1, 2, 3, 1], hi: [0, 3] }, { name: "set(nums)", values: [1, 2, 3] }],
      vars: { "len(set)": "3", "len(nums)": "4", return: "True" },
    },
  ],
  tests: {
    visible: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true, label: "several repeats" },
    ],
    hidden: [
      { args: [[]], expected: false, label: "empty list" },
      { args: [[7]], expected: false, label: "single element" },
      { args: [[-1, -2, -3, -1]], expected: true, label: "negative duplicate" },
      { args: [[1, -1, 0]], expected: false, label: "same size, different sign" },
      { args: [distinct300], expected: false, label: "300 distinct numbers" },
      { args: [[...distinct300, 0]], expected: true, label: "repeat is first and last of 301" },
    ],
  },
  hints: [
    "Which Python structure refuses to store the same value twice?",
    "If you pour every number into that structure and there was a repeat, how does its size compare with the list's?",
    "Compare two lengths. No explicit loop is needed.",
  ],
  followUps: [
    { q: "What's the brute force and why is yours better?", a: "Compare every pair: O(n²) time, O(1) space. The set trades O(n) space for O(n) time." },
    {
      q: "Can you do it in O(1) extra space?",
      a: "Sort in place, then compare neighbours: O(n log n) time. If the input is already sorted, it's just the neighbour scan, O(n). Sorting changes the caller's list, so say that out loud.",
    },
    {
      q: "Can you stop as soon as you find a repeat?",
      a: "Yes. Loop, and return True the moment a number is already in the set; otherwise add it. Same big-O, but it exits early when the repeat is near the front.",
    },
  ],
  edgeCases: [
    { input: "nums = [1, 2, 3, 1]", breaks: true, why: "The repeats aren't next to each other. Comparing only neighbours without sorting first misses them." },
    { input: "nums = []", breaks: true, why: "Code that reads nums[0] before looping raises IndexError. The answer is False." },
    { input: "nums = [1, -1]", breaks: false, why: "1 and -1 are different values and hash differently. No repeat." },
    { input: "nums = 100,000 distinct numbers", breaks: true, why: "Nested loops do about 5 billion comparisons and time out. The set does 100,000 inserts." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/contains-duplicate/",
    neetcode: "https://www.youtube.com/watch?v=3OamzN90kPg",
  },
});
