import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "schedules-overlap",
  title: "Do the Schedules Clash?",
  difficulty: "easy",
  pattern: "sorting",
  tags: ["made-up", "sorting"],
  statement: `Suppose two colleagues each send you their meetings for the day, and you want to know whether you can ever book them into the same room. You get two schedules, a and b. Each is a list of [start, end] meetings, in no particular order.

Return True if any meeting in one schedule overlaps a meeting in the other, and False if the two schedules never clash. A meeting that starts exactly when another one ends is not a clash. Within a single schedule the meetings never overlap each other.`,
  examples: [
    { input: "a = [[9, 11], [13, 15]], b = [[10, 12]]", output: "True", note: "9–11 and 10–12 share the hour from 10 to 11" },
    { input: "a = [[9, 10], [12, 13]], b = [[10, 12], [14, 15]]", output: "False", note: "back-to-back meetings only touch" },
  ],
  constraints: ["0 ≤ len(a), len(b) ≤ 10⁴", "start < end for every meeting", "Meetings inside one schedule don't overlap each other", "Neither schedule is sorted"],
  brief: {
    what: "You're given two people's meetings for the day, each meeting written as [start, end], in no particular order. Return True if any meeting from one schedule overlaps any meeting from the other, and False if they never clash.",
    example: "The 9–11 meeting in a and the 10–12 meeting in b both cover the hour from 10 to 11, so the answer is True.",
    watch: "A meeting that starts exactly when another ends, like 9–10 and 10–12, is not a clash, and either schedule can be empty.",
  },
  myWords:
    "Each schedule is clash-free on its own, so pour both into one list. If that combined list has any overlap, it must be between the two people. Sort by start and compare each meeting with the one before it: a clash is a meeting that starts before the previous one has ended.",
  time: "O(n log n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take two lists of [start, end] pairs, return True if any meeting from one overlaps any meeting from the other",
        "Take two lists of [start, end] pairs, return the merged schedule",
        "Take two lists of [start, end] pairs, return the first free slot both people share",
        "Take one list of [start, end] pairs, return how many rooms are needed",
      ],
      answer: 0,
      explain:
        "Input is two list[list[int]] values and output is a bool. You only have to say whether a clash exists, not where it is or how to fix it.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Compare every meeting in a with every meeting in b",
        "Hash set of every minute that is booked",
        "Binary search each meeting of a in b",
        "Combine both lists, sort by start, compare each meeting with its neighbour",
      ],
      answer: 3,
      explain:
        "Once meetings are sorted by start, any overlap shows up between neighbours. Checking all pairs is O(n · m), and a set of minutes depends on how long the meetings are.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n · m) time, O(1) space", "O(n log n) time, O(n) space", "O(n) time, O(n) space", "O(n log n) time, O(1) space"],
      answer: 1,
      explain:
        "With n meetings in total, the sort is O(n log n) and the scan is O(n). The combined sorted list takes O(n) space.",
    },
  ],
  method: "schedulesOverlap",
  params: [{ name: "a" }, { name: "b" }],
  solution: `def schedulesOverlap(self, a, b):
    meetings = sorted(a + b)
    for i in range(1, len(meetings)):
        if meetings[i][0] < meetings[i - 1][1]: return True
    return False`,
  captions: [
    { label: "COMBINE + SORT", text: "Put both schedules in one list and sort it. Pairs sort by start time first." },
    { label: "NEIGHBOURS", text: "Walk the sorted meetings from the second one on." },
    { label: "CLASH", text: "If this meeting starts before the previous one ends, they overlap. Strictly less, so back-to-back is fine." },
    { label: "NO CLASH", text: "Every meeting started after the one before it finished." },
  ],
  visual: [
    { line: 0, note: "two schedules", arrays: [{ name: "a", values: ["[9,11]", "[13,15]"] }, { name: "b", values: ["[10,12]"] }] },
    { line: 0, note: "combined and sorted by start", arrays: [{ name: "meetings", values: ["[9,11]", "[10,12]", "[13,15]"] }] },
    { line: 1, note: "i = 1: compare [10,12] with the meeting before it", arrays: [{ name: "meetings", values: ["[9,11]", "[10,12]", "[13,15]"], pointers: { i: 1 } }], vars: { start: "10", "previous end": "11" } },
    { line: 2, note: "10 < 11, it starts before the previous one ends → True", arrays: [{ name: "meetings", values: ["[9,11]", "[10,12]", "[13,15]"], pointers: { i: 1 }, hi: [0, 1] }], vars: { start: "10", "previous end": "11", return: "True" } },
  ],
  tests: {
    visible: [
      { args: [[[9, 11], [13, 15]], [[10, 12]]], expected: true },
      { args: [[[9, 10], [12, 13]], [[10, 12], [14, 15]]], expected: false, label: "back-to-back is not a clash" },
      { args: [[[8, 9]], [[8, 9]]], expected: true, label: "identical meetings" },
    ],
    hidden: [
      { args: [[], []], expected: false, label: "both schedules empty" },
      { args: [[[1, 5]], []], expected: false, label: "one schedule empty" },
      { args: [[[1, 10]], [[3, 4]]], expected: true, label: "one meeting inside another" },
      { args: [[[14, 16], [9, 10]], [[12, 13], [10, 12]]], expected: false, label: "unsorted input, no clash" },
      { args: [[[1, 2], [3, 4], [20, 30]], [[5, 6], [7, 8], [29, 31]]], expected: true, label: "the only clash is at the very end" },
      { args: [[[15, 18], [5, 8]], [[1, 6]]], expected: true, label: "unsorted input with a clash" },
      { args: [[[1, 2], [3, 4], [5, 6]], [[2, 3], [4, 5], [6, 7]]], expected: false, label: "perfectly interleaved" },
    ],
  },
  hints: [
    "You're told each person's own meetings never overlap. So if you mixed all the meetings together, what would any overlap have to be?",
    "In a list sorted by start time, you don't need to compare every pair. Which single meeting can the current one clash with first?",
    "A clash means: this meeting's start is strictly less than the previous meeting's end.",
  ],
  followUps: [
    {
      q: "What if both schedules are already sorted?",
      a: "Skip the sort and walk them with two pointers: check the two current meetings for overlap, then advance whichever one ends first. O(n + m) time and O(1) space.",
    },
    {
      q: "What's the brute force?",
      a: "Compare every meeting in a with every meeting in b: two meetings overlap when each starts before the other ends. That's O(n · m).",
    },
    {
      q: "What if a person's own meetings could overlap each other?",
      a: "Then mixing the lists would report clashes inside one schedule. Sort each schedule separately and use the two-pointer sweep, which only ever compares a meeting from a with a meeting from b.",
    },
  ],
  edgeCases: [
    { input: "a = [[9, 10]], b = [[10, 11]]", breaks: true, why: "Using <= reports back-to-back meetings as a clash." },
    { input: "a = [[14, 16], [9, 10]], b = [[10, 12]]", breaks: true, why: "Comparing neighbours without sorting first sees 9 < 16 and reports a false clash inside schedule a." },
    { input: "a = [], b = []", breaks: false, why: "The combined list is empty, the loop never runs, and the answer is False." },
    { input: "a = [[1, 10]], b = [[3, 4]]", breaks: true, why: "Checking only whether start or end times are equal misses a meeting that sits completely inside another." },
  ],
  reveal:
    "This is Meeting Rooms: sort intervals by start and check each one against its neighbour. It is the yes/no sibling of Merge Intervals; the only disguise is that the intervals arrive in two lists.",
  links: {},
});
