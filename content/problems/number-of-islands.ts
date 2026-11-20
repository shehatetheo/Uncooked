import { python } from "@/lib/types";

export default python({
  id: "number-of-islands",
  title: "Number of Islands",
  difficulty: "Medium",
  tags: ["grid", "dfs", "graph"],
  statement: `You get a grid of characters that works like a map. Each cell is "1" for land or "0" for water.

An island is a group of land cells that touch each other up, down, left or right. Cells that only touch at a corner are not connected. Everything outside the grid is water.

Return how many separate islands the map has.`,
  examples: [
    {
      input: 'grid = [["1", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]]',
      output: "3",
      note: "The three cells in the top left form one island, and the other two land cells each stand alone.",
    },
    {
      input: 'grid = [["1", "0"], ["0", "1"]]',
      output: "2",
      note: "The two land cells only touch at a corner, so they are separate islands.",
    },
  ],
  constraints: ["1 ≤ rows, columns ≤ 300", 'Every cell is "0" or "1"'],
  signature: "def numIslands(self, grid: List[List[str]]) -> int:",
  method: "numIslands",
  params: [{ name: "grid" }],
  solution: [
    "rows, cols = len(grid), len(grid[0])",
    "def sink(r, c):",
    '    if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":',
    '        grid[r][c] = "0"',
    "        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "            sink(r + dr, c + dc)",
    "        return 1",
    "    return 0",
    "return sum(sink(r, c) for r in range(rows) for c in range(cols))",
  ],
  captions: [
    "Save the grid's height and width so the bounds check stays short.",
    "A helper that erases the whole island containing cell (r, c).",
    "Only act if the cell is inside the grid and is still land.",
    "Turn it into water so it can never be counted or visited again.",
    "Look at the four neighbours: down, up, right and left.",
    "Sink each neighbour too, which spreads across the whole island.",
    "We started on land, so this call found one new island.",
    "Water or off the map: there is no island here.",
    "Try every cell. Each island is counted once, by its first cell, then it is gone.",
  ],
  tests: {
    visible: [
      { args: [[["1", "1", "0", "0"], ["1", "0", "0", "1"], ["0", "0", "1", "0"]]], expected: 3 },
      { args: [[["1", "0"], ["0", "1"]]], expected: 2 },
      { args: [[["0", "0"], ["0", "0"]]], expected: 0 },
    ],
    hidden: [
      { args: [[["1"]]], expected: 1 },
      { args: [[["1", "0", "1", "1", "0", "1"]]], expected: 3 },
      { args: [[["1"], ["1"], ["0"], ["1"]]], expected: 2 },
      { args: [[["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]], expected: 1 },
      {
        args: [[["1", "0", "1", "0", "1"], ["0", "1", "0", "1", "0"], ["1", "0", "1", "0", "1"], ["0", "1", "0", "1", "0"], ["1", "0", "1", "0", "1"]]],
        expected: 13,
      },
      {
        args: [[["1", "1", "1", "1", "1"], ["0", "0", "0", "0", "1"], ["1", "1", "1", "0", "1"], ["1", "0", "0", "0", "1"], ["1", "1", "1", "1", "1"]]],
        expected: 1,
      },
    ],
  },
  hints: [
    "When you find a land cell, how can you make sure the rest of its island isn't counted again later?",
    "From one land cell you can reach its whole island by stepping to neighbours. Mark each cell as you visit it.",
    "Scan every cell; each time you hit land, add one to the count and use DFS to turn that whole island into water.",
  ],
  followUps: [
    "What if you are not allowed to change the input grid?",
    "A very large island could make the recursion too deep. How would you rewrite it with BFS and a queue?",
  ],
  time: "O(m · n)",
  space: "O(m · n)",
  link: "https://leetcode.com/problems/number-of-islands/",
});
