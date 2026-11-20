import { python } from "@/lib/types";

export default python({
  id: "daily-temperatures",
  title: "Daily Temperatures",
  difficulty: "Medium",
  tags: ["array", "stack"],
  statement: `You get a list of daily temperatures, one number per day.

For each day, work out how many days you have to wait until a strictly warmer day comes. If no later day is warmer, the answer for that day is 0.

Return a list of those waits, one per day, in the same order.`,
  examples: [
    { input: "temperatures = [73, 74, 75, 71, 69, 72, 76, 73]", output: "[1, 1, 4, 2, 1, 1, 0, 0]", note: "Day 2 is 75, and the next warmer day is day 6 at 76, which is 4 days later." },
    { input: "temperatures = [30, 40, 50, 60]", output: "[1, 1, 1, 0]", note: "Each day is followed by a warmer one, except the last." },
  ],
  constraints: ["1 ≤ len(temperatures) ≤ 10⁵", "30 ≤ temperatures[i] ≤ 100"],
  signature: "def dailyTemperatures(self, temperatures: List[int]) -> List[int]:",
  method: "dailyTemperatures",
  params: [{ name: "temperatures" }],
  solution: [
    "answer = [0] * len(temperatures)",
    "stack = []",
    "for i, t in enumerate(temperatures):",
    "    while stack and temperatures[stack[-1]] < t:",
    "        j = stack.pop()",
    "        answer[j] = i - j",
    "    stack.append(i)",
    "return answer",
  ],
  captions: [
    "Every wait starts at 0, which is already right for days that never get a warmer day.",
    "The stack holds the indexes of days still waiting for a warmer day.",
    "Go through the days in order, with both the index and the temperature.",
    "Today is warmer than the most recent waiting day, so that day's wait is over.",
    "Take that day off the stack.",
    "Its wait is the gap between today and that day.",
    "Today now starts waiting for its own warmer day.",
    "Days left on the stack never found one and keep their 0.",
  ],
  tests: {
    visible: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
    ],
    hidden: [
      { args: [[50]], expected: [0] },
      { args: [[90, 80, 70]], expected: [0, 0, 0] },
      { args: [[70, 70, 70]], expected: [0, 0, 0] },
      { args: [[70, 70, 71]], expected: [2, 1, 0] },
      { args: [[89, 62, 70, 58, 47, 47, 46, 76, 100, 70]], expected: [8, 1, 5, 4, 3, 2, 1, 1, 0, 0] },
    ],
  },
  hints: [
    "When a warm day shows up, it can answer the question for several earlier, cooler days at once.",
    "Keep a list of days that haven't found a warmer day yet. Notice their temperatures never increase from oldest to newest.",
    "Keep a stack of indexes of unresolved days, and for each new day pop every cooler day off the stack and record the gap in days.",
  ],
  followUps: [
    "There is a while loop inside a for loop. Why is the total work still O(n)?",
    "Could you solve it with O(1) extra space besides the answer list, for example by scanning from the right?",
  ],
  time: "O(n)",
  space: "O(n)",
  link: "https://leetcode.com/problems/daily-temperatures/",
});
