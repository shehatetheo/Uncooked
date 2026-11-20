import { python } from "@/lib/types";

export default python({
  id: "longest-consecutive-sequence",
  title: "Longest Consecutive Sequence",
  difficulty: "Medium",
  tags: ["array", "hash set"],
  statement: `You get a list of whole numbers in no particular order. It may be empty and it may contain repeats.

Find the longest streak of consecutive values, like 4, 5, 6, 7, where each value is one more than the last. The values can sit anywhere in the list; they don't need to be next to each other. Repeats only count once.

Return the length of that streak. Your solution should run in O(n) time, so sorting the list is not allowed.`,
  examples: [
    { input: "nums = [100, 4, 200, 1, 3, 2]", output: "4", note: "The streak is 1, 2, 3, 4." },
    { input: "nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]", output: "9", note: "Every value from 0 through 8 is present." },
    { input: "nums = []", output: "0", note: "An empty list has no streak." },
  ],
  constraints: ["0 ≤ len(nums) ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹", "Must run in O(n) time"],
  signature: "def longestConsecutive(self, nums: List[int]) -> int:",
  method: "longestConsecutive",
  params: [{ name: "nums" }],
  solution: [
    "seen = set(nums)",
    "best = 0",
    "for n in seen:",
    "    if n - 1 not in seen:",
    "        end = n",
    "        while end + 1 in seen:",
    "            end += 1",
    "        best = max(best, end - n + 1)",
    "return best",
  ],
  captions: [
    "Put every number in a set, so lookups are instant and repeats disappear.",
    "The longest streak found so far. It stays 0 for an empty list.",
    "Go through each distinct number.",
    "Only start counting if nothing comes right before it, meaning it is the start of a streak.",
    "end will walk to the last number of this streak.",
    "Keep stepping up while the next value exists.",
    "Move end one value higher.",
    "The streak runs from n to end. Keep its length if it is the longest.",
    "Each streak was walked exactly once, from its start.",
  ],
  tests: {
    visible: [
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { args: [[]], expected: 0 },
    ],
    hidden: [
      { args: [[5]], expected: 1 },
      { args: [[1, 2, 0, 1]], expected: 3 },
      { args: [[0, -1, 1, -2]], expected: 4 },
      { args: [[7, 7, 7]], expected: 1 },
      { args: [[10, 20, 30]], expected: 1 },
      { args: [[1000000000, 999999999, -1000000000]], expected: 2 },
    ],
  },
  hints: [
    "Sorting would line the streaks up, but it costs O(n log n). What lets you ask whether a value is present in O(1)?",
    "With all the numbers in a set, how can you tell whether a number is the very first value of its streak?",
    "Put the numbers in a set, and only from numbers with no predecessor in the set, count upward to find how long that streak runs.",
  ],
  followUps: [
    "There is a while loop inside the for loop. Why is this still O(n) and not O(n²)?",
    "What happens to the running time if you drop the check for the start of a streak?",
  ],
  time: "O(n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/longest-consecutive-sequence/",
});
