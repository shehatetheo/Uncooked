import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "top-k-frequent-elements",
  title: "Top K Frequent Elements",
  difficulty: "medium",
  pattern: "counting",
  tags: ["sap", "sorting"],
  statement: `You get a list of whole numbers and a number k. Some values show up more often than others.

Return the k values that appear most often. The order of your answer doesn't matter. You can assume the answer is unique: there is never a tie at the cut-off.`,
  examples: [
    { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]", note: "1 appears three times, 2 twice" },
    { input: "nums = [1], k = 1", output: "[1]" },
  ],
  constraints: ["1 ≤ len(nums) ≤ 10⁵", "1 ≤ k ≤ number of distinct values", "The top k is unique"],
  brief: {
    what: "You're given a list of whole numbers and a number k. Return the k values that appear most often in the list, in any order.",
    example: "In [1, 1, 1, 2, 2, 3], 1 appears three times, 2 twice and 3 once, so with k = 2 the answer is [1, 2].",
    watch: "Return the values themselves, not how often they appear; the order of your answer doesn't matter, and there is never a tie at the cut-off.",
  },
  myWords:
    "Count each value with a Counter. A count can never exceed len(nums), so make one bucket per possible count and drop each value into the bucket for its count. Read the buckets from the highest count down until you have k values. No sorting needed.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int] and an int k, return the k largest values",
        "Take list[int] and an int k, return how often the k-th most common value appears",
        "Take list[int] and an int k, return a list[int] of the k values that occur most often",
        "Take list[int] and an int k, return the values that appear exactly k times",
      ],
      answer: 2,
      explain:
        "Input is list[int] plus an int k. Output is list[int] holding the k most common values themselves, in any order. It is about how often a value appears, not how big it is.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort the list and take the last k numbers",
        "Two pointers from both ends",
        "Nested loops counting each value by rescanning the list",
        "Count with a hash map, then bucket the values by their count",
      ],
      answer: 3,
      explain:
        "Counting gives value → frequency. Because a frequency is at most n, an array of n + 1 buckets indexed by frequency orders the values without a comparison sort.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n log n) time, O(n) space", "O(n) time, O(n) space", "O(n log k) time, O(k) space", "O(n²) time, O(1) space"],
      answer: 1,
      explain:
        "Counting is O(n), filling the buckets is O(n), and reading them is O(n). The counter and the buckets each take O(n) space. Sorting the counts would be O(n log n).",
    },
  ],
  method: "topKFrequent",
  params: [{ name: "nums" }, { name: "k" }],
  compare: "unordered",
  solution: `def topKFrequent(self, nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for n, c in count.items(): buckets[c].append(n)
    out = []
    for c in range(len(nums), 0, -1):
        out.extend(buckets[c])
        if len(out) >= k: return out[:k]`,
  captions: [
    { label: "COUNT", text: "Tally how many times each value appears: value → count." },
    { label: "BUCKETS", text: "One empty bucket per possible count, 0 through len(nums). The index is the count." },
    { label: "FILL", text: "Drop each value into the bucket that matches its count." },
    { label: "RESULT", text: "The answer list, filled from the most frequent values down." },
    { label: "HIGH TO LOW", text: "Walk the buckets from the largest possible count down to 1." },
    { label: "TAKE", text: "Add every value that has this count." },
    { label: "DONE", text: "Stop as soon as k values are collected." },
  ],
  visual: [
    { line: 0, note: "count every value", arrays: [{ name: "nums", values: [1, 1, 1, 2, 2, 3] }], map: { name: "count", entries: [["1", "3"], ["2", "2"], ["3", "1"]] }, vars: { k: "2" } },
    { line: 1, note: "7 empty buckets, index = count", arrays: [{ name: "buckets", values: ["[]", "[]", "[]", "[]", "[]", "[]", "[]"] }], map: { name: "count", entries: [["1", "3"], ["2", "2"], ["3", "1"]] }, vars: { k: "2" } },
    { line: 2, note: "1 goes in bucket 3, 2 in bucket 2, 3 in bucket 1", arrays: [{ name: "buckets", values: ["[]", "[3]", "[2]", "[1]", "[]", "[]", "[]"], hi: [1, 2, 3] }], map: { name: "count", entries: [["1", "3"], ["2", "2"], ["3", "1"]] }, vars: { k: "2" } },
    { line: 4, note: "buckets 6, 5, 4 are empty, nothing to take", arrays: [{ name: "buckets", values: ["[]", "[3]", "[2]", "[1]", "[]", "[]", "[]"], pointers: { c: 4 }, dim: [5, 6] }, { name: "out", values: [] }], vars: { k: "2" } },
    { line: 5, note: "c = 3: take [1]", arrays: [{ name: "buckets", values: ["[]", "[3]", "[2]", "[1]", "[]", "[]", "[]"], pointers: { c: 3 }, dim: [4, 5, 6] }, { name: "out", values: [1] }], vars: { k: "2" } },
    { line: 5, note: "c = 2: take [2]", arrays: [{ name: "buckets", values: ["[]", "[3]", "[2]", "[1]", "[]", "[]", "[]"], pointers: { c: 2 }, dim: [3, 4, 5, 6] }, { name: "out", values: [1, 2] }], vars: { k: "2" } },
    { line: 6, note: "out has k = 2 values → return [1, 2]", arrays: [{ name: "out", values: [1, 2], hi: [0, 1] }], vars: { k: "2", return: "[1, 2]" } },
  ],
  tests: {
    visible: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[1], 1], expected: [1], label: "single element" },
      { args: [[4, 4, 4, 6, 6, 6, 6, 5], 2], expected: [6, 4], label: "any order is accepted" },
    ],
    hidden: [
      { args: [[7, 7, 7, 7], 1], expected: [7], label: "all the same value" },
      { args: [[5, 3, 5, 3, 9], 2], expected: [5, 3], label: "tie inside the top k" },
      { args: [[-1, -1, 2, 2, 2, 3], 2], expected: [2, -1], label: "negative values" },
      { args: [[1, 2, 3, 4], 4], expected: [1, 2, 3, 4], label: "k equals the number of distinct values" },
      { args: [[9, 8, 9, 8, 9, 7, 6, 9, 8], 1], expected: [9], label: "k = 1" },
      { args: [[0, 0, 0, 1, 1, 2, 3, 3, 3, 3], 3], expected: [3, 0, 1], label: "most frequent value appears last" },
    ],
  },
  hints: [
    "First turn the list into value → how many times it appears. What structure does that in one pass?",
    "Sorting the counts works but costs O(n log n). Notice that no count can be larger than len(nums).",
    "Make a list of len(nums) + 1 buckets where bucket c holds the values that appear c times, then read it from the back.",
  ],
  followUps: [
    {
      q: "What's the simpler solution, and what does it cost?",
      a: "Counter(nums).most_common(k), or sort the distinct values by count. Both are O(n log n) in the worst case. Bucketing by count removes the sort.",
    },
    {
      q: "What if k is tiny and the data is huge?",
      a: "Keep a min-heap of size k over the counts: O(n log k) time and only O(k) space beyond the counter. heapq.nlargest(k, count, key=count.get) does exactly this.",
    },
    {
      q: "What if there were a tie at the cut-off?",
      a: "The answer would stop being unique. You'd ask the interviewer for a tie-break rule, such as the smaller value first, and sort the boundary bucket accordingly.",
    },
  ],
  edgeCases: [
    { input: "nums = [5, 5, 5, 5], k = 1", breaks: true, why: "The count equals len(nums). With only len(nums) buckets instead of len(nums) + 1, buckets[4] is out of range." },
    { input: "nums = [1, 1, 3], k = 1", breaks: true, why: "Sorting by value and taking the largest returns [3]. The most frequent value is 1." },
    { input: "nums = [-1, -1, 2], k = 1", breaks: true, why: "Using the value itself as a list index breaks on negatives. Only the count is used as an index." },
    { input: "nums = [1], k = 1", breaks: false, why: "One value with count 1 lands in buckets[1] and is returned." },
  ],
  links: { leetcode: "https://leetcode.com/problems/top-k-frequent-elements/" },
});
