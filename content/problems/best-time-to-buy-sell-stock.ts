import { defineProblem } from "@/lib/content/types";

const prices = [7, 1, 5, 3, 6, 4];
const rising300 = Array.from({ length: 300 }, (_, i) => i + 1);
const falling300 = Array.from({ length: 300 }, (_, i) => 300 - i);

export default defineProblem({
  id: "best-time-to-buy-sell-stock",
  title: "Best Time to Buy and Sell Stock",
  difficulty: "easy",
  pattern: "greedy",
  tags: ["core"],
  statement: `You get a list of prices for one stock, one price per day, in order. You may buy on one day and sell on a later day.

Return the biggest profit you can make from a single buy followed by a single sell. If no trade makes money, return 0.`,
  examples: [
    { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5", note: "buy at 1, sell later at 6" },
    { input: "prices = [7, 6, 4, 3, 1]", output: "0", note: "the price only falls, so don't trade" },
  ],
  constraints: ["0 ≤ len(prices) ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
  brief: {
    what: "You're given a stock's price for each day, in order. You can buy once and then sell once on a later day; return the largest profit that one trade could make, or 0 if no trade makes money.",
    example: "With [7, 1, 5, 3, 6, 4], buying on the day the price is 1 and selling later when it's 6 earns 6 - 1 = 5, and no other buy-then-sell pair does better, so the answer is 5.",
    watch: "The sale must come after the purchase, so a low price that comes after the high one doesn't help; an empty list or a single day means 0.",
  },
  myWords: 'Track the cheapest price so far and the best "sell today" profit.',
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int], return the difference between the highest and lowest price",
        "Take list[int], return the largest profit from one buy and one later sell, or 0",
        "Take list[int], return the days to buy and sell on",
        "Take list[int], return the total profit from as many trades as you like",
      ],
      answer: 1,
      explain:
        "Input is list[int] of daily prices. Output is an int: a sell price minus an earlier buy price, never below 0. Highest minus lowest is wrong when the highest price comes before the lowest.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort the prices and subtract the smallest from the largest",
        "Nested loops over every buy day and every later sell day",
        "Binary search for the lowest price",
        "One pass tracking the lowest price so far and the best profit so far",
      ],
      answer: 3,
      explain:
        "For any sell day, the best buy is the cheapest price before it, so that one number is all you need to carry forward. Sorting destroys the day order, and nested loops are O(n²).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n²) time, O(1) space", "O(n log n) time, O(n) space", "O(n) time, O(1) space", "O(n) time, O(n) space"],
      answer: 2,
      explain: "One pass over n prices with two running numbers, lo and best. Nothing grows with the input, so O(1) space.",
    },
  ],
  method: "maxProfit",
  params: [{ name: "prices" }],
  solution: `def maxProfit(self, prices):
    lo, best = float("inf"), 0
    for p in prices: lo, best = min(lo, p), max(best, p - lo)
    return best`,
  captions: [
    { label: "INIT", text: "lo is the cheapest price seen so far (infinity until there is one). best is the best profit so far." },
    { label: "SCAN", text: "For each price: update the cheapest price, and check whether selling today beats the best profit." },
    { label: "RETURN", text: "best is the largest profit found, or 0 if no trade made money." },
  ],
  visual: [
    { line: 0, note: "No prices seen yet", arrays: [{ name: "prices", values: prices }], vars: { lo: "inf", best: "0" } },
    { line: 1, note: "p = 7: the cheapest so far is 7. There's no earlier day to have bought on", arrays: [{ name: "prices", values: prices, pointers: { p: 0 } }], vars: { lo: "7", best: "0" } },
    { line: 1, note: "p = 1: a new low. Selling here would lose money (1 − 7), so best stays 0", arrays: [{ name: "prices", values: prices, pointers: { p: 1 } }], vars: { lo: "1", best: "0" } },
    { line: 1, note: "p = 5: sell today for 5 − 1 = 4", arrays: [{ name: "prices", values: prices, pointers: { p: 2 }, hi: [1, 2] }], vars: { lo: "1", best: "4" } },
    { line: 1, note: "p = 3: 3 − 1 = 2, not better", arrays: [{ name: "prices", values: prices, pointers: { p: 3 } }], vars: { lo: "1", best: "4" } },
    { line: 1, note: "p = 6: 6 − 1 = 5, a new best", arrays: [{ name: "prices", values: prices, pointers: { p: 4 }, hi: [1, 4] }], vars: { lo: "1", best: "5" } },
    { line: 1, note: "p = 4: 4 − 1 = 3, not better", arrays: [{ name: "prices", values: prices, pointers: { p: 5 } }], vars: { lo: "1", best: "5" } },
    { line: 2, note: "Buy at 1, sell at 6", arrays: [{ name: "prices", values: prices, hi: [1, 4] }], vars: { lo: "1", best: "5", return: "5" } },
  ],
  tests: {
    visible: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0, label: "prices only fall" },
      { args: [[2, 4, 1]], expected: 2, label: "lowest price comes after the best sale" },
    ],
    hidden: [
      { args: [[]], expected: 0, label: "empty list" },
      { args: [[5]], expected: 0, label: "single day" },
      { args: [[3, 3, 3, 3]], expected: 0, label: "flat prices" },
      { args: [[3, 2, 6, 5, 0, 3]], expected: 4, label: "best trade is before the lowest price" },
      { args: [rising300], expected: 299, label: "300 days, always rising" },
      { args: [[...falling300, 500]], expected: 499, label: "300 falling days, then a spike" },
    ],
  },
  hints: [
    "Suppose you have to sell today. Which earlier day would you have wanted to buy on?",
    "That is always the cheapest price before today, and you can keep it up to date as you walk without ever looking back.",
    "Carry two numbers through one loop: the lowest price so far, and the best value of today's price minus that lowest price.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "Try every buy day with every later sell day: O(n²). Tracking the running minimum gets the same answer in one pass, O(n) time and O(1) space.",
    },
    {
      q: "Why not just take max(prices) − min(prices)?",
      a: "The lowest price might come after the highest. In [7, 1, 5, 3, 6, 4] that gives 6, but the 7 is before the 1, and you have to buy before you sell.",
    },
    {
      q: "What if you could make as many trades as you want?",
      a: "Add up every day-to-day rise: the sum of max(0, prices[i] − prices[i−1]). Still one pass and O(1) space.",
    },
  ],
  edgeCases: [
    { input: "prices = [7, 6, 4, 3, 1]", breaks: true, why: "Solutions that always make a trade return a negative number. The answer is 0." },
    { input: "prices = [2, 4, 1]", breaks: true, why: "Buying at the overall minimum (1) leaves no later day to sell on. The best trade is 2 → 4." },
    { input: "prices = []", breaks: true, why: "Starting with lo = prices[0] raises IndexError on an empty list." },
    { input: "prices = [3, 3, 3]", breaks: false, why: "Flat prices: every profit is 0 and best never moves." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    neetcode: "https://www.youtube.com/watch?v=1pkOgXD63yU",
  },
});
