import { python } from "@/lib/types";

export default python({
  id: "maximum-number-of-weeks-for-which-you-can-work",
  title: "Maximum Number of Weeks for Which You Can Work",
  difficulty: "Medium",
  tags: ["greedy", "math", "array"],
  statement: `You have several projects. The list tells you how many milestones each project has. Every week you finish exactly one milestone from one project.

There is one rule: you may not work on the same project two weeks in a row.

You stop when every milestone is done, or when the only milestones left would force you to break the rule. Return the largest number of weeks you can work.`,
  examples: [
    { input: "milestones = [1, 2, 3]", output: "6", note: "Order the weeks by project as 2, 1, 2, 1, 2, 0 (using indexes). All six milestones get done." },
    { input: "milestones = [5, 2, 1]", output: "7", note: "Project 0 is too big. Three other milestones can separate at most four of its five, so one is left over." },
  ],
  constraints: ["1 ≤ len(milestones) ≤ 10⁵", "1 ≤ milestones[i] ≤ 10⁹"],
  signature: "def numberOfWeeks(self, milestones: List[int]) -> int:",
  method: "numberOfWeeks",
  params: [{ name: "milestones" }],
  solution: [
    "total, biggest = sum(milestones), max(milestones)",
    "rest = total - biggest",
    "return total if biggest <= rest + 1 else 2 * rest + 1",
  ],
  captions: [
    "Only two numbers matter: all the milestones together, and the size of the largest project.",
    "rest is every milestone that is not in the largest project.",
    "If the largest project fits in the gaps around the rest, everything gets done. Otherwise we alternate until the rest runs out and fit in one last week.",
  ],
  tests: {
    visible: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[5, 2, 1]], expected: 7 },
      { args: [[4, 4]], expected: 8 },
    ],
    hidden: [
      { args: [[1]], expected: 1 },
      { args: [[10]], expected: 1 },
      { args: [[1, 1]], expected: 2 },
      { args: [[5, 4]], expected: 9 },
      { args: [[9, 3, 2]], expected: 11 },
      { args: [[1000000000, 1, 1]], expected: 5 },
    ],
  },
  hints: [
    "Which project is the one most likely to get you stuck?",
    "Think of the largest project's milestones as needing separators between them. Every milestone from any other project can serve as one separator.",
    "Compare the largest project with the sum of all the others: if it is at most that sum plus one you finish everything, otherwise the answer is twice that sum plus one.",
  ],
  followUps: [
    "Why is the largest project the only one you need to worry about? Convince me the others can always be arranged.",
    "How would you produce an actual week-by-week schedule, not just the count?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/maximum-number-of-weeks-for-which-you-can-work/",
});
