import { python } from "@/lib/types";

export default python({
  id: "move-zeroes",
  title: "Move Zeroes",
  difficulty: "Easy",
  tags: ["array", "two pointers"],
  statement: `You get a list of whole numbers. Move every 0 to the end of the list, and keep all the other numbers in their original order.

Change the list in place. Don't build a new list, and don't return anything: the tests look at the list you were given after your function runs.`,
  examples: [
    { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
    { input: "nums = [0]", output: "[0]" },
  ],
  constraints: ["1 ≤ len(nums) ≤ 10⁴", "Change nums in place"],
  signature: "def moveZeroes(self, nums: List[int]) -> None:",
  method: "moveZeroes",
  params: [{ name: "nums" }],
  returns: "arg0",
  solution: [
    "write = 0",
    "for read in range(len(nums)):",
    "    if nums[read] != 0:",
    "        nums[write], nums[read] = nums[read], nums[write]",
    "        write += 1",
  ],
  captions: [
    "write is where the next non-zero number belongs.",
    "read scans every position, left to right.",
    "Only non-zero numbers get moved.",
    "Swap it into the write slot. The zero that was there moves back.",
    "The next non-zero goes one slot later.",
  ],
  tests: {
    visible: [
      { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
    ],
    hidden: [
      { args: [[0, 0, 1]], expected: [1, 0, 0] },
      { args: [[1, 0, 0]], expected: [1, 0, 0] },
      { args: [[0, 0, 0]], expected: [0, 0, 0] },
      { args: [[4, 0, -5, 0, 0, 6, 7]], expected: [4, -5, 6, 7, 0, 0, 0] },
      { args: [[2, 1]], expected: [2, 1] },
    ],
  },
  hints: [
    "Instead of moving zeroes back, think about moving the non-zero numbers forward.",
    "Keep one index for where the next non-zero number should go, and a second index that scans the list.",
    "When the scanner finds a non-zero number, swap it with the write position and move the write position forward.",
  ],
  followUps: ["How many writes does your version do in the worst case? Can you reduce them?", "What if you had to move the zeroes to the front instead?"],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/move-zeroes/",
});
