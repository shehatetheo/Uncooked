import { python } from "@/lib/types";

export default python({
  id: "coin-change",
  title: "Coin Change",
  difficulty: "Medium",
  tags: ["dp", "array"],
  statement: `You get a list of coin values and an amount of money. You have as many coins of each value as you want.

Return the smallest number of coins that add up to exactly the amount. If no combination of coins can make the amount, return -1.

An amount of 0 needs 0 coins.`,
  examples: [
    { input: "coins = [1, 2, 5], amount = 11", output: "3", note: "5 + 5 + 1 = 11, and no two coins can do it." },
    { input: "coins = [2], amount = 3", output: "-1", note: "Coins of 2 only make even amounts." },
    { input: "coins = [1], amount = 0", output: "0" },
  ],
  constraints: ["1 ≤ len(coins) ≤ 12", "1 ≤ coin value ≤ 2³¹ - 1", "0 ≤ amount ≤ 10⁴"],
  signature: "def coinChange(self, coins: List[int], amount: int) -> int:",
  method: "coinChange",
  params: [{ name: "coins" }, { name: "amount" }],
  solution: [
    'dp = [0] + [float("inf")] * amount',
    "for a in range(1, amount + 1):",
    "    for c in coins:",
    "        if c <= a:",
    "            dp[a] = min(dp[a], dp[a - c] + 1)",
    'return dp[amount] if dp[amount] != float("inf") else -1',
  ],
  captions: [
    "dp[a] is the fewest coins that make amount a. Zero needs 0 coins; everything else starts as impossible.",
    "Fill the table from small amounts up, so smaller answers are ready when we need them.",
    "Try each coin as the last coin used to reach a.",
    "A coin bigger than the amount can't be part of it.",
    "Using coin c leaves a - c to make, which we already solved. Add 1 for this coin and keep the smaller count.",
    "If the amount is still infinity, nothing reached it, so answer -1.",
  ],
  tests: {
    visible: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
    ],
    hidden: [
      { args: [[2], 1], expected: -1 },
      { args: [[1], 2], expected: 2 },
      { args: [[1, 3, 4], 6], expected: 2 },
      { args: [[5, 10], 3], expected: -1 },
      { args: [[2, 5, 10, 1], 27], expected: 4 },
      { args: [[186, 419, 83, 408], 6249], expected: 20 },
    ],
  },
  hints: [
    "Always grabbing the biggest coin first can fail. Try coins 1, 3, 4 with amount 6.",
    "If the last coin you use has value c, the rest of the coins must make amount - c in the fewest way. That is the same problem, only smaller.",
    "Build a table of the fewest coins for every amount from 0 up to the target, where each entry is 1 plus the best entry one coin below it.",
  ],
  followUps: [
    "How would you return the actual coins used, not just how many?",
    "What changes if you want the number of different ways to make the amount instead of the fewest coins?",
  ],
  time: "O(amount × coins)",
  space: "O(amount)",
  link: "https://leetcode.com/problems/coin-change/",
});
