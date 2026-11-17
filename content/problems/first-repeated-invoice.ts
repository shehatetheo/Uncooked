import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "first-repeated-invoice",
  title: "First Repeated Invoice",
  difficulty: "easy",
  pattern: "hash-map",
  tags: ["made-up"],
  statement: `Let's say our accounting system receives invoice numbers one after another, and sometimes a supplier submits the same invoice twice. You get the list of invoice numbers in the order they arrived.

Return the first invoice number that arrives for a second time. If no invoice is ever repeated, return an empty string. Invoice numbers are compared exactly, so "inv-1" and "INV-1" are different.`,
  examples: [
    { input: 'invoices = ["INV-7", "INV-3", "INV-7", "INV-3"]', output: '"INV-7"', note: "INV-7 is the first one to show up again" },
    { input: 'invoices = ["A1", "B2", "C3"]', output: '""', note: "no repeats" },
    { input: 'invoices = ["A1", "B2", "B2", "A1"]', output: '"B2"', note: "B2 repeats before A1 does" },
  ],
  constraints: ["0 ≤ len(invoices) ≤ 10⁵", "Each invoice number is a non-empty string"],
  brief: {
    what: "You're given invoice numbers in the order they arrived. Return the first invoice number that arrives for a second time, or an empty string if nothing is ever repeated.",
    example: "In [\"INV-7\", \"INV-3\", \"INV-7\", \"INV-3\"], the third arrival is INV-7 again, which happens before INV-3 shows up a second time, so the answer is \"INV-7\".",
    watch: "You want the invoice whose second arrival comes first, not the earliest invoice that repeats: [\"A1\", \"B2\", \"B2\", \"A1\"] gives \"B2\", and \"inv-1\" and \"INV-1\" are different.",
  },
  myWords:
    "Keep a set of the invoice numbers seen so far. For each new one, if it's already in the set, that's the answer. Otherwise add it. If the loop ends, nothing repeated.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[str], return how many invoices are duplicates",
        "Take list[str], return the list with duplicates removed",
        "Take list[str], return the invoice number that appears most often",
        "Take list[str], return the first str whose second arrival comes earliest, or \"\" if none repeats",
      ],
      answer: 3,
      explain:
        "Input is list[str] and output is a single str. You report the first moment a repeat happens, which is not necessarily the invoice that appeared first or most often.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Hash set of what you've seen, checked as you scan",
        "Sort the invoice numbers and compare neighbours",
        "For each invoice, scan everything before it",
        "Count everything with a Counter, then return any key with count 2",
      ],
      answer: 0,
      explain:
        "A set answers \"have I seen this already?\" in O(1) and lets you stop at the first repeat. Sorting or counting everything first loses the arrival order.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n log n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 1,
      explain: "One pass with O(1) set operations is O(n) time. If nothing repeats, the set ends up holding all n invoice numbers: O(n) space.",
    },
  ],
  method: "firstRepeat",
  params: [{ name: "invoices" }],
  solution: `def firstRepeat(self, invoices):
    seen = set()
    for inv in invoices:
        if inv in seen: return inv
        seen.add(inv)
    return ""`,
  captions: [
    { label: "INIT", text: "An empty set of the invoice numbers seen so far." },
    { label: "SCAN", text: "Take the invoices in arrival order." },
    { label: "REPEAT", text: "If this number is already in the set, it is the first repeat. Return it." },
    { label: "REMEMBER", text: "Otherwise record it as seen." },
    { label: "NONE", text: "The whole list went by without a repeat." },
  ],
  visual: [
    { line: 0, note: "seen starts empty", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"] }, { name: "seen", values: [] }] },
    { line: 1, note: "first invoice: INV-7", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"], pointers: { inv: 0 } }, { name: "seen", values: [] }] },
    { line: 3, note: "not seen before, add it", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"], pointers: { inv: 0 } }, { name: "seen", values: ["INV-7"] }] },
    { line: 3, note: "INV-3 is new too, add it", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"], pointers: { inv: 1 } }, { name: "seen", values: ["INV-7", "INV-3"] }] },
    { line: 1, note: "third invoice: INV-7 again", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"], pointers: { inv: 2 } }, { name: "seen", values: ["INV-7", "INV-3"] }] },
    { line: 2, note: "INV-7 is already in seen → return it", arrays: [{ name: "invoices", values: ["INV-7", "INV-3", "INV-7", "INV-3"], pointers: { inv: 2 }, hi: [0, 2] }, { name: "seen", values: ["INV-7", "INV-3"], hi: [0] }], vars: { return: "\"INV-7\"" } },
  ],
  tests: {
    visible: [
      { args: [["INV-7", "INV-3", "INV-7", "INV-3"]], expected: "INV-7" },
      { args: [["A1", "B2", "C3"]], expected: "", label: "no repeats" },
      { args: [["A1", "B2", "B2", "A1"]], expected: "B2", label: "the earliest repeat, not the earliest invoice" },
    ],
    hidden: [
      { args: [[]], expected: "", label: "empty list" },
      { args: [["X"]], expected: "", label: "single invoice" },
      { args: [["X", "X"]], expected: "X", label: "immediate repeat" },
      { args: [["inv-1", "INV-1"]], expected: "", label: "case matters" },
      { args: [["a", "b", "c", "d", "a"]], expected: "a", label: "repeat at the very end" },
      { args: [["1", "2", "3", "2", "1", "3"]], expected: "2", label: "several repeats, the first one wins" },
      { args: [["Q", "Q", "Q"]], expected: "Q", label: "same invoice three times" },
    ],
  },
  hints: [
    "At each invoice the question is simply: has this exact number arrived before?",
    "A list would answer that with a slow scan. Which structure answers \"is this in here?\" in constant time?",
    "Check the set first, then add. The first time the check succeeds, you have the answer.",
  ],
  followUps: [
    {
      q: "Can you do it in O(1) extra space?",
      a: "Only by paying in time. Sort in place and compare neighbours for O(n log n), but that loses arrival order, so it can tell you whether a repeat exists, not which came first. The set is the right trade.",
    },
    {
      q: "What's the brute force?",
      a: "For each invoice, scan all the earlier ones for a match: O(n²). The set replaces that inner scan with an O(1) lookup.",
    },
    {
      q: "What if I only wanted to know whether any repeat exists?",
      a: "Then it is Contains Duplicate: return len(set(invoices)) != len(invoices), or return True and False from the same loop.",
    },
  ],
  edgeCases: [
    { input: 'invoices = ["A1", "B2", "B2", "A1"]', breaks: true, why: "Counting everything and returning the first invoice with count 2 gives A1. The first repeat to happen is B2." },
    { input: 'invoices = ["inv-1", "INV-1"]', breaks: true, why: "Lowercasing before comparing reports a repeat that isn't one." },
    { input: "invoices = []", breaks: false, why: "The loop never runs and the function returns \"\"." },
    { input: 'invoices = ["A1", "B2", "C3"]', breaks: true, why: "Forgetting the final return gives None instead of the empty string." },
  ],
  reveal:
    "This is Contains Duplicate with a small twist: a hash set of what you've seen, checked as you scan. Instead of returning True at the first repeat, you return the repeated value.",
  remixOf: "contains-duplicate",
  links: {},
});
