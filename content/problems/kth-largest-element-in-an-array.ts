import { python } from "@/lib/types";

export default python({
  id: "kth-largest-element-in-an-array",
  title: "Kth Largest Element in an Array",
  difficulty: "Medium",
  tags: ["array", "heap"],
  statement: `You get a list of whole numbers and a number k. Return the kth largest number in the list.

That means the number you would find at position k if the list were sorted from biggest to smallest, counting from 1. Duplicates count as separate entries, so in [5, 5, 4] the 2nd largest is 5.

Try to do it without sorting the whole list.`,
  examples: [
    { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5", note: "The largest is 6 and the next one down is 5." },
    { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4", note: "From the top: 6, 5, 5, 4. The two 5s count separately." },
  ],
  constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
  signature: "def findKthLargest(self, nums: List[int], k: int) -> int:",
  method: "findKthLargest",
  params: [{ name: "nums" }, { name: "k" }],
  solution: [
    "heap = []",
    "for n in nums:",
    "    heapq.heappush(heap, n)",
    "    if len(heap) > k:",
    "        heapq.heappop(heap)",
    "return heap[0]",
  ],
  captions: [
    "A min-heap that will hold the k largest numbers seen so far.",
    "Look at each number once.",
    "Add it to the heap.",
    "If the heap now holds more than k numbers, one of them is not in the top k.",
    "Remove the smallest, which is the one that cannot be in the top k.",
    "The heap holds the k largest, and its smallest item, at the front, is the kth largest.",
  ],
  tests: {
    visible: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
    ],
    hidden: [
      { args: [[2, 1], 2], expected: 1 },
      { args: [[7, 7, 7], 2], expected: 7 },
      { args: [[-1, -5, -3], 1], expected: -1 },
      { args: [[-1, -5, -3], 3], expected: -5 },
      { args: [[5, 2, 9, 9, 1], 2], expected: 9 },
      { args: [[10000, -10000, 0], 2], expected: 0 },
    ],
  },
  hints: [
    "Sorting everything works but does more than you need. You only care about the top k numbers.",
    "If you kept just the k largest numbers seen so far, which one of them would be the answer?",
    "Keep a min-heap of size k: push each number, pop the smallest whenever the heap grows past k, and the top of the heap at the end is the answer.",
  ],
  followUps: [
    "Can you get O(n) time on average? Walk me through quickselect and its worst case.",
    "What if the numbers arrive as an endless stream and you must report the kth largest after each one?",
  ],
  time: "O(n log k)",
  space: "O(k)",
  link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
});
