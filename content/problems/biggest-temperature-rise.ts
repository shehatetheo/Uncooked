import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "biggest-temperature-rise",
  title: "Biggest Temperature Rise",
  difficulty: "easy",
  pattern: "greedy",
  tags: ["made-up"],
  statement: `Say a sensor in one of our data centers records the temperature once an hour, and operations wants to know how badly it heated up during the day. You get the readings in the order they were taken.

Return the biggest rise from one reading to any later reading. The earlier reading has to come first in time. If the temperature never goes up, return 0.`,
  examples: [
    { input: "temps = [14, 11, 15, 12, 19, 16]", output: "8", note: "from 11 up to 19" },
    { input: "temps = [20, 18, 15, 9]", output: "0", note: "it only gets colder" },
  ],
  constraints: ["0 ≤ len(temps) ≤ 10⁵", "Readings are whole numbers and can be negative", "The two readings don't have to be next to each other"],
  myWords:
    "For any reading, the best rise that ends there starts at the lowest reading before it. So walk once, keeping the lowest temperature seen so far and the best rise so far. At each reading, update the low, then check the rise from that low.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int], return the highest reading minus the lowest reading",
        "Take list[int], return the biggest jump between two neighbouring readings",
        "Take list[int], return an int: the largest later-minus-earlier difference, or 0 if there is none",
        "Take list[int], return the indices of the coldest and warmest hours",
      ],
      answer: 2,
      explain:
        "Input is list[int] and output is an int. Order matters: the low has to come before the high, so max minus min is wrong when the maximum comes first.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort the readings and subtract the ends",
        "Compare every pair of readings",
        "Binary search for the peak",
        "One greedy pass tracking the lowest reading so far and the best rise so far",
      ],
      answer: 3,
      explain:
        "The best rise ending at any hour uses the minimum before it, and that minimum can be carried along as you go. Sorting would destroy the time order.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n log n) time, O(1) space", "O(n) time, O(1) space", "O(n²) time, O(1) space", "O(n) time, O(n) space"],
      answer: 1,
      explain: "One pass with two running values: O(n) time and O(1) space. The all-pairs version is O(n²).",
    },
  ],
  method: "biggestRise",
  params: [{ name: "temps" }],
  solution: `def biggestRise(self, temps):
    low, best = float("inf"), 0
    for t in temps:
        low = min(low, t)
        best = max(best, t - low)
    return best`,
  captions: [
    { label: "INIT", text: "low is the coldest reading so far (nothing yet, so infinity). best is the biggest rise so far." },
    { label: "SCAN", text: "Take the readings in time order." },
    { label: "NEW LOW", text: "If this reading is colder than anything before, it becomes the new starting point." },
    { label: "BEST RISE", text: "The rise from the coldest earlier reading to this one. Keep it if it beats the record." },
    { label: "RETURN", text: "The biggest rise found, or 0 if it never went up." },
  ],
  visual: [
    { line: 0, note: "no readings seen yet", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16] }], vars: { low: "inf", best: "0" } },
    { line: 3, note: "t = 14: first low, rise 14 − 14 = 0", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 0 } }], vars: { low: "14", best: "0" } },
    { line: 2, note: "t = 11: colder than 14, new low", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 1, low: 1 } }], vars: { low: "11", best: "0" } },
    { line: 3, note: "t = 15: rise 15 − 11 = 4, new best", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 2, low: 1 } }], vars: { low: "11", best: "4" } },
    { line: 3, note: "t = 12: rise is only 1, best stays 4", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 3, low: 1 } }], vars: { low: "11", best: "4" } },
    { line: 3, note: "t = 19: rise 19 − 11 = 8, new best", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 4, low: 1 }, hi: [1, 4] }], vars: { low: "11", best: "8" } },
    { line: 3, note: "t = 16: rise 5, best stays 8", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], pointers: { t: 5, low: 1 }, hi: [1, 4] }], vars: { low: "11", best: "8" } },
    { line: 4, note: "return best", arrays: [{ name: "temps", values: [14, 11, 15, 12, 19, 16], hi: [1, 4] }], vars: { return: "8" } },
  ],
  tests: {
    visible: [
      { args: [[14, 11, 15, 12, 19, 16]], expected: 8 },
      { args: [[20, 18, 15, 9]], expected: 0, label: "only gets colder" },
      { args: [[-5, -2, -8, 1]], expected: 9, label: "below zero" },
    ],
    hidden: [
      { args: [[]], expected: 0, label: "no readings" },
      { args: [[7]], expected: 0, label: "single reading" },
      { args: [[1, 2, 3, 4, 5]], expected: 4, label: "rising all day" },
      { args: [[5, 5, 5]], expected: 0, label: "flat" },
      { args: [[10, 2, 9, 1, 7]], expected: 7, label: "a lower low comes after the best rise" },
      { args: [[30, 10, 20, 0, 5]], expected: 10, label: "highest reading comes first" },
      { args: [[0, 100]], expected: 100, label: "two readings" },
    ],
  },
  hints: [
    "Think of each reading as the end of a rise. Which earlier reading gives the biggest rise to it?",
    "You don't need to look back each time. The lowest reading so far can be kept in one variable as you walk.",
    "At each reading: update the lowest so far, then compare (reading − lowest) with your best. Starting best at 0 covers the case where it never rises.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "Try every earlier and later pair: O(n²). Carrying the minimum along makes it one pass, O(n), with O(1) memory.",
    },
    {
      q: "Why not just max(temps) − min(temps)?",
      a: "Because the low has to come first. In [30, 10, 20, 0, 5] max minus min is 30, but the temperature never rose by more than 10.",
    },
    {
      q: "What if I also want to know when the rise started and ended?",
      a: "Track the index of the current low, and whenever best improves, save that low index and the current index as the answer pair.",
    },
  ],
  edgeCases: [
    { input: "temps = [30, 10, 20, 0, 5]", breaks: true, why: "max minus min gives 30, pairing a high with a low that comes after it. The real answer is 10." },
    { input: "temps = [10, 2, 9, 1, 7]", breaks: true, why: "Finding the global minimum first and only looking after it gives 7 − 1 = 6. The best rise, 2 to 9, happens before the minimum." },
    { input: "temps = []", breaks: true, why: "Starting with low = temps[0] raises IndexError on an empty list." },
    { input: "temps = [1, 2, 3, 4, 5]", breaks: false, why: "When the readings only rise, even last minus first is right." },
  ],
  reveal:
    "This is Best Time to Buy and Sell Stock with temperatures instead of prices: one pass tracking the minimum so far and the best difference so far.",
  remixOf: "best-time-to-buy-sell-stock",
  links: {},
});
