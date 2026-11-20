import { python } from "@/lib/types";

export default python({
  id: "best-time-to-buy-and-sell-stock",
  title: "Best Time to Buy and Sell Stock",
  difficulty: "Easy",
  tags: ["array", "greedy"],
  statement: `You get a list of prices for one stock, one price per day, in day order. You may buy one share on one day and sell it on a later day.

Return the biggest profit you could make, which is the selling price minus the buying price. You have to buy before you sell.

If there is no way to make money, return 0.`,
  examples: [
    { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5", note: "Buy at 1 on day 2 and sell at 6 on day 5." },
    { input: "prices = [7, 6, 4, 3, 1]", output: "0", note: "The price only falls, so the best choice is not to trade." },
  ],
  constraints: ["1 ≤ len(prices) ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
  signature: "def maxProfit(self, prices: List[int]) -> int:",
  method: "maxProfit",
  params: [{ name: "prices" }],
  solution: [
    "low, best = prices[0], 0",
    "for price in prices:",
    "    low = min(low, price)",
    "    best = max(best, price - low)",
    "return best",
  ],
  captions: [
    "Track the cheapest price so far and the best profit so far. Not trading gives 0.",
    "Walk the days once, treating each day as a possible selling day.",
    "Update the cheapest price we could have bought at up to today.",
    "Selling today after buying at that cheapest price: keep it if it beats the best.",
    "After the last day, best is the biggest profit possible.",
  ],
  tests: {
    visible: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2 },
    ],
    hidden: [
      { args: [[5]], expected: 0 },
      { args: [[3, 3, 3, 3]], expected: 0 },
      { args: [[1, 2]], expected: 1 },
      { args: [[3, 2, 6, 5, 0, 3]], expected: 4 },
      { args: [[2, 1, 2, 1, 0, 1, 2]], expected: 2 },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], expected: 9 },
    ],
  },
  hints: [
    "If you had to sell on one particular day, which earlier day would you want to have bought on?",
    "Trying every pair of days is O(n²). As you move forward, can you remember just one fact about all the days behind you?",
    "Walk the prices once, keep the lowest price seen so far, and at each day compare today's price minus that low against the best profit.",
  ],
  followUps: [
    "What if you could buy and sell as many times as you like, holding at most one share at a time?",
    "How would you also return which day to buy on and which day to sell on?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
});
