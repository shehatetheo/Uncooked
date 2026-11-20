import { python } from "@/lib/types";

export default python({
  id: "maximal-square",
  title: "Maximal Square",
  difficulty: "Medium",
  tags: ["dp", "matrix"],
  statement: `You get a grid where every cell holds the text "1" or the text "0". Note that the cells are strings, not numbers.

Find the biggest square block made only of "1" cells and return its area, which is its side length times itself.

If the grid has no "1" at all, the answer is 0.`,
  examples: [
    {
      input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]',
      output: "4",
      note: "The biggest all-ones square is 2 by 2, in rows 1-2 and columns 2-3 (or 3-4).",
    },
    { input: 'matrix = [["0","1"],["1","0"]]', output: "1", note: "The two 1s only touch at a corner, so the best square is a single cell." },
    { input: 'matrix = [["0"]]', output: "0" },
  ],
  constraints: ["1 ≤ rows, columns ≤ 300", 'Every cell is "0" or "1"'],
  signature: "def maximalSquare(self, matrix: List[List[str]]) -> int:",
  method: "maximalSquare",
  params: [{ name: "matrix" }],
  solution: [
    "rows, cols = len(matrix), len(matrix[0])",
    "dp = [[0] * (cols + 1) for _ in range(rows + 1)]",
    "best = 0",
    "for r in range(rows):",
    "    for c in range(cols):",
    '        if matrix[r][c] == "1":',
    "            dp[r + 1][c + 1] = 1 + min(dp[r][c], dp[r][c + 1], dp[r + 1][c])",
    "            best = max(best, dp[r + 1][c + 1])",
    "return best * best",
  ],
  captions: [
    "Read the size of the grid.",
    "dp holds the side of the biggest square whose bottom-right corner is each cell. The extra row and column of zeros save us edge checks.",
    "The longest side seen so far.",
    "Go through the rows from top to bottom.",
    "And through each row from left to right, so the cells above and to the left are already done.",
    "Only a 1 can be the corner of a square. Remember the cells are strings.",
    "A square ending here is limited by the squares ending above, to the left, and diagonally up-left. Take the smallest and add this cell.",
    "Keep the biggest side we've found.",
    "The question asks for area, so square the side.",
  ],
  tests: {
    visible: [
      {
        args: [[["1", "0", "1", "0", "0"], ["1", "0", "1", "1", "1"], ["1", "1", "1", "1", "1"], ["1", "0", "0", "1", "0"]]],
        expected: 4,
      },
      { args: [[["0", "1"], ["1", "0"]]], expected: 1 },
      { args: [[["0"]]], expected: 0 },
    ],
    hidden: [
      { args: [[["1"]]], expected: 1 },
      { args: [[["1", "1", "1"], ["1", "1", "1"], ["1", "1", "1"]]], expected: 9 },
      { args: [[["1", "1", "1", "1"]]], expected: 1 },
      { args: [[["0", "0", "0"], ["0", "0", "0"]]], expected: 0 },
      { args: [[["1", "1", "1"], ["1", "0", "1"], ["1", "1", "1"]]], expected: 1 },
      { args: [[["1", "1", "1", "0"], ["1", "1", "1", "1"], ["0", "1", "1", "1"], ["0", "1", "1", "1"]]], expected: 9 },
    ],
  },
  hints: [
    "Pick one cell and ask: what is the biggest all-ones square that has this cell as its bottom-right corner?",
    "A square of side 3 ending at a cell needs squares of side at least 2 ending at the cell above it, the cell to its left, and the cell diagonally up-left.",
    "For every 1 cell, store 1 plus the smallest of its three neighbours' stored sides (up, left, up-left), and track the largest side you ever store.",
  ],
  followUps: [
    "Each cell only looks at the current row and the row above. Can you bring the extra space down to one row?",
    "How would the problem change if you wanted the biggest rectangle of 1s instead of the biggest square?",
  ],
  time: "O(m·n)",
  space: "O(m·n)",
  link: "https://leetcode.com/problems/maximal-square/",
});
