import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "voucher-pair",
  title: "Spend the Voucher",
  difficulty: "easy",
  pattern: "hash-map",
  tags: ["made-up"],
  statement: `Imagine a customer in our web shop has a voucher, and the voucher only works if the basket total matches its value exactly. You get the list of item prices in the shop and the voucher value.

Exactly one pair of items adds up to the voucher. Return the positions (indices) of those two items in the price list, smaller index first. The customer can't buy the same item twice.`,
  examples: [
    { input: "prices = [30, 45, 20, 70], voucher = 65", output: "[1, 2]", note: "45 + 20 = 65" },
    { input: "prices = [50, 50], voucher = 100", output: "[0, 1]", note: "two different items with the same price" },
  ],
  constraints: ["2 ≤ len(prices) ≤ 10⁴", "Prices are whole numbers, 0 or more", "Exactly one valid pair exists", "The list is not sorted"],
  brief: {
    what: "You're given a list of item prices and a voucher value. Exactly one pair of different items adds up to the voucher; return the positions of those two items in the list, smaller position first.",
    example: "With prices [30, 45, 20, 70] and voucher 65, 45 + 20 = 65, and those items sit at positions 1 and 2, so the answer is [1, 2].",
    watch: "You can't use the same item twice, but two different items can have the same price: [50, 50] with voucher 100 gives [0, 1].",
  },
  myWords:
    'Walk the prices once. For each price, the only partner that works is voucher minus that price, so ask "have I already seen that?" with a hash map of price → index. Check before storing so an item never pairs with itself.',
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[int] and an int, return the two prices that add up to the voucher",
        "Take list[int] and an int, return True if the voucher can be spent exactly",
        "Take list[int] and an int, return the indices of the two items whose prices sum to the voucher",
        "Take list[int] and an int, return the largest number of items the voucher can buy",
      ],
      answer: 2,
      explain:
        "Input is list[int] plus an int. Output is list[int] with two positions in the price list, not the prices themselves, and exactly two items, not as many as possible.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort the prices, then two pointers",
        "Hash map of price → index, one pass",
        "Try every pair with nested loops",
        "Dynamic programming over the voucher value",
      ],
      answer: 1,
      explain:
        "For each price you know exactly which partner price you need, so a hash map lookup settles it in O(1). Sorting would scramble the indices you have to return.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n²) time, O(1) space", "O(n log n) time, O(1) space", "O(n) time, O(1) space", "O(n) time, O(n) space"],
      answer: 3,
      explain: "One pass with O(1) lookups is O(n) time. The map may hold almost every price before the pair is found, so O(n) space.",
    },
  ],
  method: "findPair",
  params: [{ name: "prices" }, { name: "voucher" }],
  solution: `def findPair(self, prices, voucher):
    seen = {}
    for i, p in enumerate(prices):
        if voucher - p in seen: return [seen[voucher - p], i]
        seen[p] = i`,
  captions: [
    { label: "INIT", text: "Empty hash map: price → the index where we saw it." },
    { label: "SCAN", text: "Walk the price list once, keeping the index and the price." },
    { label: "CHECK", text: "If the partner price (voucher − p) was seen earlier, return its index and this one." },
    { label: "STORE", text: "Otherwise remember this price's index for a later partner." },
  ],
  visual: [
    { line: 0, note: "seen starts empty", arrays: [{ name: "prices", values: [30, 45, 20, 70] }], map: { name: "seen", entries: [] }, vars: { voucher: "65" } },
    { line: 1, note: "i = 0, p = 30", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 0 } }], map: { name: "seen", entries: [] }, vars: { voucher: "65", need: "35" } },
    { line: 3, note: "35 not seen, store 30 → 0", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 0 } }], map: { name: "seen", entries: [["30", "0"]] }, vars: { voucher: "65" } },
    { line: 1, note: "i = 1, p = 45", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 1 } }], map: { name: "seen", entries: [["30", "0"]] }, vars: { voucher: "65", need: "20" } },
    { line: 3, note: "20 not seen, store 45 → 1", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 1 } }], map: { name: "seen", entries: [["30", "0"], ["45", "1"]] }, vars: { voucher: "65" } },
    { line: 1, note: "i = 2, p = 20", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 2 } }], map: { name: "seen", entries: [["30", "0"], ["45", "1"]] }, vars: { voucher: "65", need: "45" } },
    { line: 2, note: "45 is in seen → return [1, 2]", arrays: [{ name: "prices", values: [30, 45, 20, 70], pointers: { i: 2 }, hi: [1, 2] }], map: { name: "seen", entries: [["30", "0"], ["45", "1"]] }, vars: { voucher: "65", return: "[1, 2]" } },
  ],
  tests: {
    visible: [
      { args: [[30, 45, 20, 70], 65], expected: [1, 2] },
      { args: [[50, 50], 100], expected: [0, 1], label: "two items with the same price" },
      { args: [[5, 80, 15, 95], 100], expected: [0, 3], label: "first and last item" },
    ],
    hidden: [
      { args: [[10, 20, 30, 40, 50], 90], expected: [3, 4], label: "pair at the end" },
      { args: [[25, 10, 25, 60], 50], expected: [0, 2], label: "equal prices that are not neighbours" },
      { args: [[0, 99, 1, 0], 0], expected: [0, 3], label: "free items" },
      { args: [[12, 8, 4, 16], 16], expected: [0, 2], label: "half the voucher appears only once" },
      { args: [[7, 3], 10], expected: [0, 1], label: "only two items" },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 1000], 1009], expected: [8, 9], label: "one very large price" },
    ],
  },
  hints: [
    "Strip away the shop. You have a list of numbers and a target, and you need two positions. Have you seen that before?",
    "For a price p, the partner must cost voucher − p. What lets you ask \"have I seen that price, and where?\" instantly?",
    "Look up the partner before you store the current price, so one item can't be used twice.",
  ],
  followUps: [
    {
      q: "What if the price list were sorted?",
      a: "Two pointers from both ends: move the left one up if the sum is too small, the right one down if it's too big. O(n) time and O(1) space.",
    },
    {
      q: "What's the brute force and why is yours better?",
      a: "Check every pair of items: O(n²). The hash map spends O(n) memory to answer each \"is the partner here?\" in O(1), giving O(n) overall.",
    },
    {
      q: "What if there might be no valid pair?",
      a: "The loop would finish without returning. Return an empty list or None after it, and agree with the interviewer which one they want.",
    },
  ],
  edgeCases: [
    { input: "prices = [50, 50], voucher = 100", breaks: true, why: "Looking the partner up with prices.index(voucher - p) finds index 0 both times, so the first 50 gets paired with itself." },
    { input: "prices = [12, 8, 4, 16], voucher = 16", breaks: true, why: "A check that doesn't exclude the current item finds 8 + 8 and uses index 1 twice." },
    { input: "prices = [0, 99, 1, 0], voucher = 0", breaks: false, why: "Zero works like any other price: 0 − 0 = 0 is found at index 0 when you reach index 3." },
  ],
  reveal:
    "This is Two Sum with prices instead of numbers: a hash map of value → index and one pass looking for the complement.",
  remixOf: "two-sum",
  links: {},
});
