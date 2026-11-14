import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "find-price-in-catalog",
  title: "Find the Price in the Catalog",
  difficulty: "easy",
  pattern: "binary-search",
  tags: ["made-up"],
  statement: `Imagine our product catalog has millions of entries and the price column is kept sorted from cheapest to most expensive, with no two prices the same. A customer types in an exact price.

You get the sorted list of prices and the price to look for. Return the position (index) of that price in the list, or -1 if nothing costs exactly that much. The catalog is huge, so looking at every entry is too slow.`,
  examples: [
    { input: "prices = [5, 12, 19, 30, 42, 58], target = 30", output: "3" },
    { input: "prices = [5, 12, 19, 30, 42, 58], target = 20", output: "-1", note: "20 would sit between 19 and 30, but it isn't there" },
  ],
  constraints: ["0 ≤ len(prices) ≤ 10⁶", "prices is sorted ascending with no duplicates", "Expected running time: O(log n)"],
  myWords:
    "Because the list is sorted, looking at the middle entry tells you which half the target must be in. Keep a lo and hi boundary, check the middle, and throw away the half that can't contain it. Repeat until you find it or the range is empty.",
  time: "O(log n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a sorted list[int] and an int, return True if the price exists",
        "Take a sorted list[int] and an int, return the closest price",
        "Take an unsorted list[int] and an int, return the index after sorting",
        "Take a sorted list[int] and an int, return the index of that exact price, or -1",
      ],
      answer: 3,
      explain:
        "Input is a sorted list[int] plus an int target. Output is an int index, with -1 meaning not found. The list is already sorted, and that is the property you are expected to use.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Scan from the left until you pass the target",
        "Binary search: check the middle and halve the range",
        "Put all prices in a hash set",
        "Two pointers stepping in from both ends",
      ],
      answer: 1,
      explain:
        "Sorted input plus a required O(log n) points at binary search. A scan or two pointers is O(n), and a hash set is O(n) to build and loses the index.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(log n) time, O(1) space", "O(n) time, O(1) space", "O(log n) time, O(n) space", "O(n log n) time, O(1) space"],
      answer: 0,
      explain:
        "Each step halves the remaining range, so about log₂(n) steps: 20 steps for a million entries. Only three integers are stored: O(1) space.",
    },
  ],
  method: "findPrice",
  params: [{ name: "prices" }, { name: "target" }],
  solution: `def findPrice(self, prices, target):
    lo, hi = 0, len(prices) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if prices[mid] == target: return mid
        if prices[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
  captions: [
    { label: "RANGE", text: "lo and hi are the first and last index where the target could still be." },
    { label: "LOOP", text: "Keep searching while the range holds at least one entry." },
    { label: "MIDDLE", text: "Pick the middle index of the current range." },
    { label: "FOUND", text: "If the middle price is the target, return its index." },
    { label: "GO RIGHT", text: "Middle is too cheap, so the target can only be to the right of it." },
    { label: "GO LEFT", text: "Middle is too expensive, so the target can only be to the left of it." },
    { label: "NOT FOUND", text: "The range became empty without a match." },
  ],
  visual: [
    { line: 0, note: "the whole list is the range", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 0, hi: 5 } }], vars: { target: "30" } },
    { line: 2, note: "mid = (0 + 5) // 2 = 2, the price there is 19", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 0, mid: 2, hi: 5 } }], vars: { target: "30" } },
    { line: 4, note: "19 < 30: drop the left half, lo = 3", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 3, hi: 5 }, dim: [0, 1, 2] }], vars: { target: "30" } },
    { line: 2, note: "mid = (3 + 5) // 2 = 4, the price there is 42", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 3, mid: 4, hi: 5 }, dim: [0, 1, 2] }], vars: { target: "30" } },
    { line: 5, note: "42 > 30: drop the right half, hi = 3", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 3, hi: 3 }, dim: [0, 1, 2, 4, 5] }], vars: { target: "30" } },
    { line: 2, note: "mid = (3 + 3) // 2 = 3, the price there is 30", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { lo: 3, mid: 3, hi: 3 }, dim: [0, 1, 2, 4, 5] }], vars: { target: "30" } },
    { line: 3, note: "30 is the target → return 3", arrays: [{ name: "prices", values: [5, 12, 19, 30, 42, 58], pointers: { mid: 3 }, hi: [3], dim: [0, 1, 2, 4, 5] }], vars: { target: "30", return: "3" } },
  ],
  tests: {
    visible: [
      { args: [[5, 12, 19, 30, 42, 58], 30], expected: 3 },
      { args: [[5, 12, 19, 30, 42, 58], 20], expected: -1, label: "price falls in a gap" },
      { args: [[99], 99], expected: 0, label: "catalog with one price" },
    ],
    hidden: [
      { args: [[], 5], expected: -1, label: "empty catalog" },
      { args: [[10, 20, 30, 40], 10], expected: 0, label: "cheapest item" },
      { args: [[10, 20, 30, 40], 40], expected: 3, label: "most expensive item" },
      { args: [[10, 20, 30, 40], 5], expected: -1, label: "cheaper than everything" },
      { args: [[10, 20, 30, 40], 45], expected: -1, label: "more expensive than everything" },
      { args: [[1, 3], 3], expected: 1, label: "two items, target is the second" },
      { args: [[2, 4, 6, 8, 10, 12, 14], 12], expected: 5, label: "odd-length list" },
    ],
  },
  hints: [
    "The list is sorted and a plain scan is ruled out. What do you learn about the target's position by looking at just one entry in the middle?",
    "Keep two boundaries, lo and hi. After comparing the middle price with the target, one of the boundaries can jump past the middle.",
    "Loop while lo <= hi, and move the boundaries to mid + 1 or mid - 1. Using mid itself can make the loop run forever.",
  ],
  followUps: [
    {
      q: "What's the brute force and why isn't it good enough here?",
      a: "Scan from the start until you find the price: O(n). For a million entries that's up to a million checks against about 20 with binary search.",
    },
    {
      q: "What if the price isn't there and I want to know where it would be inserted?",
      a: "Return lo instead of -1. When the loop ends, lo is the index of the first price greater than the target. bisect.bisect_left does the same thing.",
    },
    {
      q: "What if the catalog could contain the same price several times and I want the first one?",
      a: "Don't return on a match. Record the index, set hi = mid - 1 and keep searching to the left. Still O(log n).",
    },
  ],
  edgeCases: [
    { input: "prices = [99], target = 99", breaks: true, why: "A loop written as while lo < hi never runs when there is one entry, and returns -1." },
    { input: "prices = [10, 20, 30, 40], target = 45", breaks: true, why: "Updating with lo = mid instead of mid + 1 gets stuck at lo = 2, hi = 3 forever." },
    { input: "prices = [], target = 5", breaks: false, why: "hi starts at -1, the loop is skipped, and -1 is returned." },
    { input: "prices = [10, 20, 30, 40], target = 50", breaks: true, why: "Starting hi at len(prices) while still looping with lo <= hi ends up reading prices[4], one position past the end." },
  ],
  reveal:
    "This is Binary Search, word for word: a sorted list, a target, return the index or -1 in O(log n). The catalog is only decoration.",
  remixOf: "binary-search",
  links: {},
});
