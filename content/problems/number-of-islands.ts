import { defineProblem } from "@/lib/content/types";

// 20×20 chessboard: no two land cells share an edge, so each one is its own island.
const checkerboard = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => ((r + c) % 2 === 0 ? "1" : "0")));
const allLand8 = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "1"));

export default defineProblem({
  id: "number-of-islands",
  title: "Number of Islands",
  difficulty: "medium",
  pattern: "grid-dfs",
  tags: ["core"],
  statement: `You get a grid of strings where "1" is land and "0" is water. Count the islands.

An island is a group of land cells connected up, down, left or right. Diagonal neighbours don't count as connected, and everything outside the grid is water.

Return the number of separate islands. You're allowed to modify the grid, and the grid can be empty.`,
  examples: [
    {
      input: 'grid = [["1","1","0","0"], ["1","0","0","1"], ["0","0","1","0"]]',
      output: "3",
      note: "(1,3) and (2,2) only touch diagonally, so they are separate islands",
    },
    { input: 'grid = [["1","1","1"], ["0","1","0"], ["1","1","1"]]', output: "1", note: "one connected shape" },
  ],
  constraints: ["0 ≤ rows, cols ≤ 300", 'Each cell is the string "1" or "0", not a number'],
  myWords: 'Visit every cell. On land, sink the whole island (DFS turning "1" into "0") and count 1.',
  time: "O(m·n)",
  space: "O(m·n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        'Take a 2D grid of "1"/"0" strings, return how many separate groups of connected land it has',
        'Take a 2D grid of "1"/"0" strings, return the number of land cells',
        'Take a 2D grid of "1"/"0" strings, return the area of the largest island',
        'Take a 2D grid of "1"/"0" strings, return True if all the land is connected',
      ],
      answer: 0,
      explain:
        'Input is list[list[str]]: the cells are the strings "1" and "0", not ints. Output is an int, the number of groups of land joined horizontally or vertically.',
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        'Count the "1" cells and divide by the average island size',
        "Scan every cell; on land, flood-fill the whole island with DFS and count one",
        "Sort the cells, then two pointers",
        "Dynamic programming over rows, reusing the row above",
      ],
      answer: 1,
      explain:
        "Each island has to be counted exactly once. When the scan hits land, a DFS sinks every cell connected to it, so the rest of that island can't trigger another count. A row-by-row DP can't tell when two arms of land join up further down.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: [
        "O(m + n) time, O(1) space",
        "O((m·n)²) time, O(1) space",
        "O(m·n) time, O(m·n) space",
        "O(m·n · log(m·n)) time, O(m·n) space",
      ],
      answer: 2,
      explain:
        "Each of the m·n cells is sunk at most once and checked a constant number of times: O(m·n). If the grid is all land, the recursion goes m·n calls deep, so the call stack is O(m·n) space.",
    },
  ],
  method: "numIslands",
  params: [{ name: "grid" }],
  solution: `def numIslands(self, grid):
    def sink(r, c):
        if 0 <= r < len(grid) and 0 <= c < len(grid[0]) and grid[r][c] == "1":
            grid[r][c] = "0"; sink(r+1, c); sink(r-1, c); sink(r, c+1); sink(r, c-1)
            return 1
        return 0
    return sum(sink(r, c) for r in range(len(grid)) for c in range(len(grid[0])))`,
  captions: [
    { label: "HELPER", text: "sink(r, c) tries to remove the island that cell (r, c) belongs to." },
    { label: "CHECK", text: "Only act if the cell is inside the grid and is still land." },
    { label: "SINK", text: "Turn the cell into water so it can't be counted again, then sink its four neighbours." },
    { label: "FOUND", text: "This call started on land, so report 1 island." },
    { label: "MISS", text: "Out of bounds or water: report 0." },
    { label: "COUNT", text: "Call sink on every cell and add up the results." },
  ],
  visual: [
    {
      line: 5,
      note: "The sum calls sink on every cell, row by row, starting at (0,0)",
      grid: { cells: [["1", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 0] },
      vars: { count: "0" },
    },
    {
      line: 1,
      note: "(0,0) is inside the grid and is land",
      grid: { cells: [["1", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 0] },
      vars: { count: "0" },
    },
    {
      line: 2,
      note: "Turn (0,0) into water, then call sink on its four neighbours, down first",
      grid: { cells: [["0", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 0] },
      vars: { count: "0" },
    },
    {
      line: 2,
      note: "(1,0) is land: sink it. Its own neighbours are water or outside the grid",
      grid: { cells: [["0", "1", "0", "0"], ["0", "0", "0", "1"], ["0", "0", "1", "0"]], at: [1, 0] },
      vars: { count: "0" },
    },
    {
      line: 2,
      note: "Back in the (0,0) call: the right neighbour (0,1) is land, so sink it as well",
      grid: { cells: [["0", "0", "0", "0"], ["0", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 1] },
      vars: { count: "0" },
    },
    {
      line: 3,
      note: "The whole island is gone. The call that started at (0,0) returns 1",
      grid: { cells: [["0", "0", "0", "0"], ["0", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 0] },
      vars: { count: "1" },
    },
    {
      line: 4,
      note: "The scan moves on. (0,1) is water now, so sink returns 0 and the island isn't counted twice",
      grid: { cells: [["0", "0", "0", "0"], ["0", "0", "0", "1"], ["0", "0", "1", "0"]], at: [0, 1] },
      vars: { count: "1" },
    },
    {
      line: 5,
      note: "(1,3) and (2,2) each sink and return 1. They only touch diagonally, so they count separately: 1 + 1 + 1",
      grid: { cells: [["0", "0", "0", "0"], ["0", "0", "0", "0"], ["0", "0", "0", "0"]], at: [2, 2] },
      vars: { count: "3", return: "3" },
    },
  ],
  tests: {
    visible: [
      { args: [[["1", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]]], expected: 3 },
      { args: [[["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]], expected: 1, label: "one connected shape" },
      { args: [[["0", "0"], ["0", "0"]]], expected: 0, label: "all water" },
    ],
    hidden: [
      { args: [[]], expected: 0, label: "empty grid" },
      { args: [[["1"]]], expected: 1, label: "single land cell" },
      { args: [[["1", "0", "1", "1", "0", "1"]]], expected: 3, label: "single row" },
      { args: [[["1", "0"], ["0", "1"]]], expected: 2, label: "diagonal cells are not connected" },
      { args: [checkerboard], expected: 200, label: "20×20 chessboard, 200 islands" },
      { args: [allLand8], expected: 1, label: "8×8 all land" },
    ],
  },
  hints: [
    "Counting land cells overcounts. You need a way to count each island exactly once, however many cells it has.",
    "When your scan reaches a land cell, that's a new island. Before moving on, visit every land cell connected to it and mark it so the scan can't count it again.",
    'Marking can be as simple as overwriting "1" with "0". A recursive helper that checks bounds, checks for land, marks the cell and then calls itself on the four neighbours does the whole flood fill.',
  ],
  followUps: [
    {
      q: "What if you're not allowed to modify the grid?",
      a: "Keep a visited set of (r, c) pairs and check it instead of overwriting cells. Same O(m·n) time, with O(m·n) extra space for the set.",
    },
    {
      q: "The grid is huge and one island covers all of it. What goes wrong?",
      a: "The recursion can go m·n calls deep and hit Python's recursion limit. Switch to BFS with a deque, or DFS with an explicit stack.",
    },
    {
      q: "Is there another way to solve it?",
      a: "Union-find: join each land cell with its right and down land neighbours, then count the distinct roots. It's the better fit when land gets added over time and you need the count after every update.",
    },
  ],
  edgeCases: [
    { input: "grid = []", breaks: true, why: "Reading len(grid[0]) up front raises IndexError when there are no rows." },
    { input: 'grid = [["1","0"], ["0","1"]]', breaks: true, why: "Checking all eight neighbours merges the two diagonal cells into one island. The answer is 2." },
    { input: 'grid = [["1"]]', breaks: true, why: 'Comparing with the integer 1 (grid[r][c] == 1) is never true for the string "1", so the count stays 0.' },
    { input: 'grid = [["0","0"], ["0","0"]]', breaks: false, why: "No land, so sink never finds anything and the sum is 0." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/number-of-islands/",
    neetcode: "https://www.youtube.com/watch?v=pV2kpPD66nE",
  },
});
