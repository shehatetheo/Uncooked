import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "group-scrambled-codes",
  title: "Group the Scrambled Codes",
  difficulty: "medium",
  pattern: "hash-map",
  tags: ["made-up", "string", "sorting"],
  statement: `Imagine a faulty label printer in the warehouse that sometimes prints the characters of a product code in the wrong order. You get the list of codes as they were scanned.

Two scans belong to the same product if they use exactly the same characters the same number of times, just in a different order. Put the scans into groups, one group per product. The order of the groups, and the order inside each group, doesn't matter.`,
  examples: [
    { input: 'codes = ["ab12", "b1a2", "zz9", "9zz", "q7"]', output: '[["ab12", "b1a2"], ["zz9", "9zz"], ["q7"]]' },
    { input: 'codes = ["x1"]', output: '[["x1"]]' },
  ],
  constraints: ["0 ≤ len(codes) ≤ 10⁴", "Each code has 1 to 10 letters or digits", "Upper and lower case are different characters", "Identical scans can appear more than once"],
  myWords:
    "Scrambled versions of the same code all become the same string once you sort their characters. Use that sorted string as a dictionary key and append each scan to its key's list. The dictionary's values are the groups.",
  time: "O(n · k log k)",
  space: "O(n · k)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[str], return the codes sorted alphabetically",
        "Take list[str], return a list[list[str]] where each inner list holds codes made of the same characters",
        "Take list[str], return True if any two codes are scrambles of each other",
        "Take list[str], return the number of distinct products",
      ],
      answer: 1,
      explain:
        "Input is list[str] and output is list[list[str]]. Every scan ends up in exactly one group, including scans that have no partner, which form a group of one.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Compare every code with every other code",
        "Sort the whole list of codes",
        "Two pointers over each pair of codes",
        "Hash map keyed by each code's sorted characters",
      ],
      answer: 3,
      explain:
        "You need a signature that is identical for all scrambles of one code. Sorting the characters gives one, and a hash map collects everything that shares a signature.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n · k log k) time, O(n · k) space", "O(n² · k) time, O(1) space", "O(n log n) time, O(n) space", "O(n · k) time, O(1) space"],
      answer: 0,
      explain:
        "For n codes of length up to k, sorting each code costs k log k, so O(n · k log k) in total. The map stores every code once: O(n · k) space. With k at most 10 this is effectively linear in n.",
    },
  ],
  method: "groupCodes",
  params: [{ name: "codes" }],
  compare: "groups",
  solution: `def groupCodes(self, codes):
    groups = defaultdict(list)
    for c in codes: groups["".join(sorted(c))].append(c)
    return list(groups.values())`,
  captions: [
    { label: "INIT", text: "A map from signature → list of scans. defaultdict creates the empty list on first use." },
    { label: "BUCKET", text: "Sort each code's characters to get its signature, and append the code to that signature's list." },
    { label: "RETURN", text: "The groups are the map's values. The keys were only needed for matching." },
  ],
  visual: [
    { line: 0, note: "groups starts empty", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"] }], map: { name: "groups", entries: [] } },
    { line: 1, note: "\"ab12\" sorted is \"12ab\": new group", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"], pointers: { c: 0 } }], map: { name: "groups", entries: [["12ab", "[ab12]"]] }, vars: { key: "12ab" } },
    { line: 1, note: "\"b1a2\" sorted is also \"12ab\": same group", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"], pointers: { c: 1 } }], map: { name: "groups", entries: [["12ab", "[ab12, b1a2]"]] }, vars: { key: "12ab" } },
    { line: 1, note: "\"zz9\" sorted is \"9zz\": new group", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"], pointers: { c: 2 } }], map: { name: "groups", entries: [["12ab", "[ab12, b1a2]"], ["9zz", "[zz9]"]] }, vars: { key: "9zz" } },
    { line: 1, note: "\"9zz\" is already sorted: joins \"zz9\"", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"], pointers: { c: 3 } }], map: { name: "groups", entries: [["12ab", "[ab12, b1a2]"], ["9zz", "[zz9, 9zz]"]] }, vars: { key: "9zz" } },
    { line: 1, note: "\"q7\" sorted is \"7q\": a group of one", arrays: [{ name: "codes", values: ["ab12", "b1a2", "zz9", "9zz", "q7"], pointers: { c: 4 } }], map: { name: "groups", entries: [["12ab", "[ab12, b1a2]"], ["9zz", "[zz9, 9zz]"], ["7q", "[q7]"]] }, vars: { key: "7q" } },
    { line: 2, note: "return the three lists", map: { name: "groups", entries: [["12ab", "[ab12, b1a2]"], ["9zz", "[zz9, 9zz]"], ["7q", "[q7]"]] }, vars: { return: "[[ab12, b1a2], [zz9, 9zz], [q7]]" } },
  ],
  tests: {
    visible: [
      { args: [["ab12", "b1a2", "zz9", "9zz", "q7"]], expected: [["ab12", "b1a2"], ["zz9", "9zz"], ["q7"]] },
      { args: [["x1"]], expected: [["x1"]], label: "single scan" },
      { args: [["abc", "bca", "cab", "cba"]], expected: [["abc", "bca", "cab", "cba"]], label: "everything is one product" },
    ],
    hidden: [
      { args: [[]], expected: [], label: "no scans" },
      { args: [["a", "b", "c"]], expected: [["a"], ["b"], ["c"]], label: "nothing matches" },
      { args: [["aab", "aba", "abb"]], expected: [["aab", "aba"], ["abb"]], label: "same characters, different counts" },
      { args: [["Ab", "bA", "ab"]], expected: [["Ab", "bA"], ["ab"]], label: "case matters" },
      { args: [["k9", "k9", "9k"]], expected: [["k9", "k9", "9k"]], label: "identical scans stay in the group" },
      { args: [["abc", "abd", "dba", "cab", "x"]], expected: [["abc", "cab"], ["abd", "dba"], ["x"]], label: "groups interleaved in the input" },
    ],
  },
  hints: [
    "How can you tell quickly that two codes are the same characters in a different order? Think of something you can compute from one code alone.",
    "Sorting a code's characters gives the same result for every scramble of it. That result can be a dictionary key.",
    "Use a dict of key → list. Append each code to the list for its key and return the lists at the end.",
  ],
  followUps: [
    {
      q: "Can you avoid sorting each code?",
      a: "Yes. Count the characters and use the counts as the key, for example a tuple of 26 counts for lower-case letters. That is O(n · k) instead of O(n · k log k).",
    },
    {
      q: "What's the brute force?",
      a: "Compare every code against every other one, or against one representative per group: O(n² · k). The signature turns matching into one hash lookup per code.",
    },
    {
      q: "Why join the sorted characters into a string?",
      a: "sorted() returns a list, and lists can't be dictionary keys because they are mutable. A string or tuple(sorted(c)) is hashable.",
    },
  ],
  edgeCases: [
    { input: 'codes = ["aab", "abb"]', breaks: true, why: "Using set(code) as the signature ignores how many times each character appears and wrongly groups these." },
    { input: 'codes = ["k9", "k9", "9k"]', breaks: true, why: "Collecting groups in sets drops the second \"k9\". Every scan must appear in the output." },
    { input: 'codes = ["q7"]', breaks: false, why: "A code with no partner simply gets its own key and its own list." },
    { input: 'codes = ["Ab", "ab"]', breaks: true, why: "Lowercasing before sorting merges two codes that are different products." },
  ],
  reveal:
    "This is Group Anagrams with product codes: build a signature by sorting the characters and bucket by it in a hash map.",
  remixOf: "group-anagrams",
  links: {},
});
