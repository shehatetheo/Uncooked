import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "count-warehouse-zones",
  title: "Count the Warehouse Zones",
  difficulty: "medium",
  pattern: "grid-dfs",
  tags: ["made-up"],
  statement: `Let's say we have a floor plan of a warehouse as a grid. Each cell is either "S" for a shelf or "." for empty floor.

Shelves that touch side by side (up, down, left or right) belong to the same storage zone. Shelves that only touch at a corner are separate. Return how many zones there are.`,
  examples: [
    {
      input: 'floor = [["S","S",".","."], ["S",".",".","S"], [".",".",".","S"], [".","S",".","."]]',
      output: "3",
      note: "an L-shaped zone top left, a vertical pair on the right, and a single shelf at the bottom",
    },
    { input: 'floor = [["S",".","S"], [".","S","."], ["S",".","S"]]', output: "5", note: "diagonal neighbours don't connect" },
  ],
  constraints: ["0 ≤ rows, columns ≤ 50", 'Every cell is "S" or "."', "You may modify the grid"],
  myWords:
    "Scan every cell. Each time you land on a shelf you haven't handled, that's a new zone: count it, then flood outward from it in four directions and erase every shelf you reach, so the same zone is never counted again.",
  time: "O(rows · cols)",
  space: "O(rows · cols)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a grid of str, return the total number of shelf cells",
        "Take a grid of str, return the size of the largest zone",
        "Take a grid of str, return an int: the number of separate groups of side-by-side shelves",
        "Take a grid of str, return True if all shelves are connected",
      ],
      answer: 2,
      explain:
        "Input is list[list[str]] and output is an int. You count groups, not cells: ten connected shelves are one zone.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Scan the grid; on each unvisited shelf, count one zone and flood-fill it with DFS",
        "Sort the cells by row and column",
        "Count the shelves in each row and add them up",
        "Binary search for the first shelf in every row",
      ],
      answer: 0,
      explain:
        "A zone is a connected component. A flood fill from any one of its cells reaches all the others, and marking them as visited makes sure each zone is counted once.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(rows + cols) time, O(1) space", "O(rows · cols) time, O(rows · cols) space", "O((rows · cols)²) time, O(1) space", "O(rows · cols · log(rows · cols)) time, O(1) space"],
      answer: 1,
      explain:
        "Every cell is scanned once and erased at most once: O(rows · cols). The recursion can go as deep as the number of cells if the whole floor is one winding zone, so O(rows · cols) space in the worst case.",
    },
  ],
  method: "countZones",
  params: [{ name: "floor" }],
  solution: `def countZones(self, floor):
    def sink(r, c):
        if not (0 <= r < len(floor) and 0 <= c < len(floor[0])) or floor[r][c] != "S": return 0
        floor[r][c] = "."
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)): sink(r + dr, c + dc)
        return 1
    zones = 0
    for r in range(len(floor)):
        for c in range(len(floor[0])): zones += sink(r, c)
    return zones`,
  captions: [
    { label: "HELPER", text: "sink erases the whole zone that contains cell (r, c) and reports whether there was one." },
    { label: "STOP", text: "Off the grid, or not a shelf (empty or already erased): nothing to do, report 0." },
    { label: "ERASE", text: "Turn this shelf into floor so it can never be counted or visited again." },
    { label: "SPREAD", text: "Do the same for the four side neighbours. This reaches the entire zone." },
    { label: "FOUND", text: "This call started on a shelf, so it stands for one zone." },
    { label: "COUNTER", text: "Zones found so far." },
    { label: "ROWS", text: "Go through every row." },
    { label: "CELLS", text: "Try every cell. Only the first cell of each zone adds 1; the rest of that zone is already erased." },
    { label: "RETURN", text: "The number of times a fresh zone was found." },
  ],
  visual: [
    { line: 7, note: "scan reaches (0,0): a shelf, so sink it", grid: { cells: [["S", "S", ".", "."], ["S", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]], at: [0, 0] }, vars: { zones: "0" } },
    { line: 2, note: "erase (0,0)", grid: { cells: [[".", "S", ".", "."], ["S", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]], at: [0, 0] }, vars: { zones: "0" } },
    { line: 3, note: "spread: (1,0) below and (0,1) to the right are erased too", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]], at: [0, 1] }, vars: { zones: "0" } },
    { line: 4, note: "the first call returns 1: one whole zone is gone", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]], at: [0, 0] }, vars: { zones: "1" } },
    { line: 7, note: "the scan continues; next shelf is at (1,3)", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]], at: [1, 3] }, vars: { zones: "1" } },
    { line: 7, note: "sinking it also erases (2,3): second zone", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "."], [".", ".", ".", "."], [".", "S", ".", "."]], at: [1, 3] }, vars: { zones: "2" } },
    { line: 7, note: "last shelf at (3,1): third zone", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "."], [".", ".", ".", "."], [".", ".", ".", "."]], at: [3, 1] }, vars: { zones: "3" } },
    { line: 8, note: "every cell has been scanned", grid: { cells: [[".", ".", ".", "."], [".", ".", ".", "."], [".", ".", ".", "."], [".", ".", ".", "."]] }, vars: { return: "3" } },
  ],
  tests: {
    visible: [
      { args: [[["S", "S", ".", "."], ["S", ".", ".", "S"], [".", ".", ".", "S"], [".", "S", ".", "."]]], expected: 3 },
      { args: [[["S", ".", "S"], [".", "S", "."], ["S", ".", "S"]]], expected: 5, label: "diagonals don't connect" },
      { args: [[[".", "."], [".", "."]]], expected: 0, label: "no shelves" },
    ],
    hidden: [
      { args: [[]], expected: 0, label: "empty floor plan" },
      { args: [[["S"]]], expected: 1, label: "one cell" },
      { args: [[["S", "S", "S"], ["S", "S", "S"]]], expected: 1, label: "all shelves" },
      { args: [[["S", ".", "S", ".", "S"]]], expected: 3, label: "single row" },
      { args: [[["S"], ["S"], ["."], ["S"]]], expected: 2, label: "single column" },
      { args: [[["S", "S", "S"], [".", ".", "S"], ["S", "S", "S"], ["S", ".", "."], ["S", "S", "S"]]], expected: 1, label: "one zone that snakes around" },
      { args: [[["S", "S", "S"], ["S", ".", "S"], ["S", "S", "S"]]], expected: 1, label: "a ring around empty floor" },
    ],
  },
  hints: [
    "Replace shelves with land and floor with water. Does the picture look familiar?",
    "Counting shelf cells counts too much. You want to count each connected group once, so after finding one cell of a group you have to deal with the rest of that group.",
    "When you find a shelf, flood outward in four directions and mark every shelf you reach, for example by overwriting it with floor. The number of floods you start is the answer.",
  ],
  followUps: [
    {
      q: "What if you're not allowed to modify the floor plan?",
      a: "Keep a visited set of (row, col) pairs instead of overwriting cells. Same time, plus O(rows · cols) extra space for the set.",
    },
    {
      q: "The recursion could get very deep on a big floor. What then?",
      a: "Use an explicit stack or a queue (BFS) instead of recursion. The logic is identical: pop a cell, erase it, push its shelf neighbours.",
    },
    {
      q: "How would you return the size of the largest zone instead?",
      a: "Have the flood fill return how many cells it erased (1 plus the sum from its neighbours) and keep the maximum rather than counting floods.",
    },
  ],
  edgeCases: [
    { input: 'floor = [["S", "."], [".", "S"]]', breaks: true, why: "Checking all eight neighbours joins the two diagonal shelves into one zone. The answer is 2." },
    { input: "floor = []", breaks: true, why: "Reading len(floor[0]) before checking that there are any rows raises IndexError." },
    { input: 'floor = [["S", "S", "S"]]', breaks: true, why: "Without erasing or marking visited shelves, the two neighbours keep calling each other forever, or each cell is counted as its own zone." },
    { input: 'floor = [[".", "."]]', breaks: false, why: "No shelf is ever found, so the count stays 0." },
  ],
  reveal:
    "This is Number of Islands with shelves for land and floor for water: scan the grid and flood-fill each connected group with DFS, counting how many fills you start.",
  remixOf: "number-of-islands",
  links: {},
});
