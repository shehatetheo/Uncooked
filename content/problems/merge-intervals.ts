import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "merge-intervals",
  title: "Merge Intervals",
  difficulty: "medium",
  pattern: "sorting",
  tags: ["sap", "sorting"],
  statement: `You get a list of intervals, each one a [start, end] pair. They arrive in no particular order and some of them overlap.

Fuse every group of overlapping intervals into a single interval and return what's left, ordered by start. Two intervals that only share an endpoint, like [1, 4] and [4, 5], count as overlapping.`,
  examples: [
    { input: "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]", output: "[[1, 6], [8, 10], [15, 18]]", note: "[1, 3] and [2, 6] overlap" },
    { input: "intervals = [[1, 4], [4, 5]]", output: "[[1, 5]]", note: "touching counts as overlapping" },
  ],
  constraints: ["0 ≤ len(intervals) ≤ 10⁴", "start ≤ end in every interval", "The input is not sorted"],
  myWords:
    "Sort by start so anything that overlaps ends up next to each other. Then walk once: if the current interval starts before the last kept one ends, stretch that one's end; otherwise start a new one.",
  time: "O(n log n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[list[int]], return True if any two intervals overlap",
        "Take list[list[int]], return a list[list[int]] where overlapping intervals are fused into one",
        "Take list[list[int]], return the number of intervals left after merging",
        "Take list[list[int]], return the single longest interval",
      ],
      answer: 1,
      explain:
        "Input is list[list[int]], each inner list a [start, end] pair. Output is also list[list[int]]: the merged intervals themselves, not a count or a yes/no.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Compare every interval with every other one and merge until nothing changes",
        "Hash map of start → end",
        "Sort by start, then one pass that extends or appends",
        "Binary search for each interval's partner",
      ],
      answer: 2,
      explain:
        "After sorting by start, an interval can only overlap the most recent one you kept. That turns an all-pairs problem into one comparison per interval.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(n²) time, O(n) space", "O(n log n) time, O(1) space", "O(n log n) time, O(n) space"],
      answer: 3,
      explain: "The sort costs O(n log n) and dominates the single O(n) pass. The output list can hold up to n intervals, so O(n) space.",
    },
  ],
  method: "merge",
  params: [{ name: "intervals" }],
  solution: `def merge(self, intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
        else: out.append([s, e])
    return out`,
  captions: [
    { label: "INIT", text: "The merged intervals we decide to keep." },
    { label: "SORT + SCAN", text: "Visit intervals in order of start, so overlaps are always neighbours." },
    { label: "EXTEND", text: "If this one starts before the last kept one ends, stretch that end. max() covers an interval fully inside another." },
    { label: "APPEND", text: "Otherwise there's a gap, so this interval starts a new group." },
    { label: "RETURN", text: "Hand back the merged list, already ordered by start." },
  ],
  visual: [
    { line: 0, note: "out starts empty", arrays: [{ name: "intervals", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"] }, { name: "out", values: [] }] },
    { line: 1, note: "sorted by start; first is [1,3]", arrays: [{ name: "sorted", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"], pointers: { cur: 0 } }, { name: "out", values: [] }], vars: { s: "1", e: "3" } },
    { line: 3, note: "out is empty, so keep [1,3]", arrays: [{ name: "sorted", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"], pointers: { cur: 0 } }, { name: "out", values: ["[1,3]"] }], vars: { s: "1", e: "3" } },
    { line: 2, note: "[2,6] starts at 2 ≤ 3, so stretch the end to 6", arrays: [{ name: "sorted", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"], pointers: { cur: 1 } }, { name: "out", values: ["[1,6]"], hi: [0] }], vars: { s: "2", e: "6" } },
    { line: 3, note: "[8,10] starts at 8 > 6, a gap: new interval", arrays: [{ name: "sorted", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"], pointers: { cur: 2 } }, { name: "out", values: ["[1,6]", "[8,10]"], hi: [1] }], vars: { s: "8", e: "10" } },
    { line: 3, note: "[15,18] starts at 15 > 10: new interval", arrays: [{ name: "sorted", values: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"], pointers: { cur: 3 } }, { name: "out", values: ["[1,6]", "[8,10]", "[15,18]"], hi: [2] }], vars: { s: "15", e: "18" } },
    { line: 4, note: "return the three merged intervals", arrays: [{ name: "out", values: ["[1,6]", "[8,10]", "[15,18]"] }], vars: { return: "[[1,6],[8,10],[15,18]]" } },
  ],
  tests: {
    visible: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]], label: "touching intervals merge" },
      { args: [[[1, 4], [0, 4]]], expected: [[0, 4]], label: "unsorted input" },
    ],
    hidden: [
      { args: [[]], expected: [], label: "empty list" },
      { args: [[[5, 7]]], expected: [[5, 7]], label: "single interval" },
      { args: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]], label: "one interval swallows the rest" },
      { args: [[[1, 2], [3, 4], [5, 6]]], expected: [[1, 2], [3, 4], [5, 6]], label: "nothing overlaps" },
      { args: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expected: [[1, 10]], label: "the big one comes last" },
      { args: [[[-5, -1], [-2, 3], [4, 4], [4, 4]]], expected: [[-5, 3], [4, 4]], label: "negatives, duplicates, zero-length" },
    ],
  },
  hints: [
    "Overlaps are hard to spot in a shuffled list. What ordering would guarantee that overlapping intervals sit next to each other?",
    "After sorting by start, compare each interval only with the last one you kept: does it start before that one ends?",
    "When you merge, the new end is the larger of the two ends, not automatically the current one's end.",
  ],
  followUps: [
    {
      q: "What if the input is already sorted by start?",
      a: "Skip the sort. The single pass is O(n) time, and that is the whole algorithm.",
    },
    {
      q: "What's the brute force and why is yours better?",
      a: "Compare every pair and keep merging until nothing changes: O(n²) or worse. Sorting first means each interval is compared once, so the sort's O(n log n) is the total cost.",
    },
    {
      q: "Can you do it in O(1) extra space?",
      a: "Sort in place and overwrite the front of the same list with a write index, then cut off the tail. The sort itself still uses some memory in Python, but no second list is built.",
    },
  ],
  edgeCases: [
    { input: "intervals = [[1, 10], [2, 3]]", breaks: true, why: "Setting the end to the current interval's end shrinks [1, 10] to [1, 3]. You need max of the two ends." },
    { input: "intervals = [[1, 4], [4, 5]]", breaks: true, why: "Using < instead of <= treats touching intervals as separate." },
    { input: "intervals = [[3, 5], [1, 2]]", breaks: false, why: "Sorting puts [1, 2] first; there is a gap, so both are kept as they are." },
    { input: "intervals = [[1, 4], [0, 4]]", breaks: true, why: "Without sorting, [0, 4] is compared against [1, 4] in the wrong order and the start 0 is lost." },
  ],
  links: { leetcode: "https://leetcode.com/problems/merge-intervals/" },
});
