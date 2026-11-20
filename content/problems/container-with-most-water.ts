import { python } from "@/lib/types";

export default python({
  id: "container-with-most-water",
  title: "Container With Most Water",
  difficulty: "Medium",
  tags: ["array", "two pointers"],
  statement: `You get a list of heights. Picture a vertical wall at each position, one step apart, where the wall at position i is height[i] tall.

Pick any two walls. Together with the floor they form a container. The water it holds is the distance between the two walls times the height of the shorter wall, because water spills over the shorter one. Walls in between don't get in the way.

Return the largest amount of water any pair of walls can hold.`,
  examples: [
    { input: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", note: "Use the walls at positions 1 and 8: they are 7 apart and the shorter one is 7 tall, so 7 times 7 = 49." },
    { input: "height = [1, 1]", output: "1", note: "The only pair is 1 apart and 1 tall." },
  ],
  constraints: ["2 ≤ len(height) ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
  signature: "def maxArea(self, height: List[int]) -> int:",
  method: "maxArea",
  params: [{ name: "height" }],
  solution: [
    "left, right = 0, len(height) - 1",
    "best = 0",
    "while left < right:",
    "    best = max(best, (right - left) * min(height[left], height[right]))",
    "    if height[left] < height[right]:",
    "        left += 1",
    "    else:",
    "        right -= 1",
    "return best",
  ],
  captions: [
    "Start with the two outermost walls, the widest container possible.",
    "The most water we have seen so far.",
    "Keep going until the two walls meet.",
    "Water for this pair is width times the shorter wall. Keep it if it beats the best.",
    "Which wall is the shorter one? It is the one limiting the water.",
    "The left wall is shorter, so move it inward to look for a taller one.",
    "Otherwise the right wall is the limit, or they are equal.",
    "Move the right wall inward instead.",
    "Every pair that could have won has been considered.",
  ],
  tests: {
    visible: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
    hidden: [
      { args: [[1, 2, 1]], expected: 2 },
      { args: [[0, 0]], expected: 0 },
      { args: [[5, 5, 5, 5]], expected: 15 },
      { args: [[1, 2, 3, 4, 5]], expected: 6 },
      { args: [[2, 3, 4, 5, 18, 17, 6]], expected: 17 },
      { args: [[10000, 1, 1, 10000]], expected: 30000 },
    ],
  },
  hints: [
    "The water depends on two things: how far apart the walls are and how tall the shorter one is.",
    "Start with the widest pair. Moving a wall inward always loses width, so it only pays off if the shorter wall gets replaced by a taller one.",
    "Put one pointer at each end, record the water, and always move the pointer at the shorter wall inward until they meet.",
  ],
  followUps: [
    "Why is it safe to move the shorter wall and never the taller one? Convince me no better pair is skipped.",
    "What does the brute-force version cost, and how does this differ from the Trapping Rain Water problem?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/container-with-most-water/",
});
