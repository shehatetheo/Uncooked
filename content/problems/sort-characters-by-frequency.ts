import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "sort-characters-by-frequency",
  title: "Sort Characters By Frequency",
  difficulty: "medium",
  pattern: "counting",
  tags: ["sap", "sorting", "string"],
  statement: `You get a string. Rearrange its characters so the character that appears most often comes first, then the next most common, and so on.

All copies of the same character must sit together. Upper and lower case are different characters. In this version no two different characters appear the same number of times, so there is exactly one right answer.`,
  examples: [
    { input: 's = "banana"', output: '"aaannb"', note: "a appears 3 times, n twice, b once" },
    { input: 's = "aAAbbb"', output: '"bbbAAa"', note: '"A" and "a" are counted separately' },
  ],
  constraints: ["0 ≤ len(s) ≤ 10⁵", "s can contain letters, digits and spaces", "No two different characters have the same count"],
  brief: {
    what: "You're given a string. Return its characters rearranged so the character that appears most often comes first, then the next most common, and so on, with all copies of each character grouped together.",
    example: "In \"banana\", a appears 3 times, n twice and b once, so the answer is \"aaannb\".",
    watch: "Upper and lower case are different characters, spaces and digits count as characters too, and no two different characters ever appear the same number of times.",
  },
  myWords:
    "Count the characters. A count is at most len(s), so use one bucket per possible count and put each character in its bucket. Walk the buckets from the highest count down and write each character repeated count times.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a str, return a str with the same characters grouped and ordered from most to least frequent",
        "Take a str, return the single most frequent character",
        "Take a str, return its characters in alphabetical order",
        "Take a str, return a dict of character → count",
      ],
      answer: 0,
      explain:
        "Input is a str and output is a str of the same length. Every character is kept; only the order changes, driven by how often each one appears.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Two pointers swapping characters in place",
        "Sort the string alphabetically, then reverse it",
        "Count with a hash map, then bucket the characters by count and read high to low",
        "Stack that pops repeated characters",
      ],
      answer: 2,
      explain:
        "You need frequencies first, so count. Then ordering by frequency is a bucket sort, because the frequencies are small whole numbers bounded by len(s).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n log n) time, O(1) space", "O(n²) time, O(n) space", "O(n log n) time, O(n) space", "O(n) time, O(n) space"],
      answer: 3,
      explain:
        "Counting, bucketing and building the result are each one pass: O(n). The buckets and the output string take O(n) space.",
    },
  ],
  method: "frequencySort",
  params: [{ name: "s" }],
  solution: `def frequencySort(self, s):
    count = Counter(s)
    buckets = [[] for _ in range(len(s) + 1)]
    for ch, c in count.items(): buckets[c].append(ch)
    out = []
    for c in range(len(s), 0, -1):
        for ch in buckets[c]: out.append(ch * c)
    return "".join(out)`,
  captions: [
    { label: "COUNT", text: "Tally each character: character → how many times it appears." },
    { label: "BUCKETS", text: "One empty bucket per possible count, 0 through len(s)." },
    { label: "FILL", text: "Put each character in the bucket whose index equals its count." },
    { label: "PIECES", text: "A list of string pieces. Appending to a list is cheaper than growing a string." },
    { label: "HIGH TO LOW", text: "Visit the buckets from the largest count down to 1." },
    { label: "REPEAT", text: "Write each character in this bucket c times in a row." },
    { label: "JOIN", text: "Glue the pieces into the final string." },
  ],
  visual: [
    { line: 0, note: "count every character", arrays: [{ name: "s", values: ["b", "a", "n", "a", "n", "a"] }], map: { name: "count", entries: [["b", "1"], ["a", "3"], ["n", "2"]] } },
    { line: 1, note: "7 empty buckets, index = count", arrays: [{ name: "buckets", values: ["[]", "[]", "[]", "[]", "[]", "[]", "[]"] }], map: { name: "count", entries: [["b", "1"], ["a", "3"], ["n", "2"]] } },
    { line: 2, note: "b → bucket 1, a → bucket 3, n → bucket 2", arrays: [{ name: "buckets", values: ["[]", "[b]", "[n]", "[a]", "[]", "[]", "[]"], hi: [1, 2, 3] }], map: { name: "count", entries: [["b", "1"], ["a", "3"], ["n", "2"]] } },
    { line: 5, note: "c = 3: write \"a\" three times", arrays: [{ name: "buckets", values: ["[]", "[b]", "[n]", "[a]", "[]", "[]", "[]"], pointers: { c: 3 }, dim: [4, 5, 6] }, { name: "out", values: ["aaa"] }] },
    { line: 5, note: "c = 2: write \"n\" twice", arrays: [{ name: "buckets", values: ["[]", "[b]", "[n]", "[a]", "[]", "[]", "[]"], pointers: { c: 2 }, dim: [3, 4, 5, 6] }, { name: "out", values: ["aaa", "nn"] }] },
    { line: 5, note: "c = 1: write \"b\" once", arrays: [{ name: "buckets", values: ["[]", "[b]", "[n]", "[a]", "[]", "[]", "[]"], pointers: { c: 1 }, dim: [2, 3, 4, 5, 6] }, { name: "out", values: ["aaa", "nn", "b"] }] },
    { line: 6, note: "join the pieces", arrays: [{ name: "out", values: ["aaa", "nn", "b"] }], vars: { return: "\"aaannb\"" } },
  ],
  tests: {
    visible: [
      { args: ["banana"], expected: "aaannb" },
      { args: ["aAAbbb"], expected: "bbbAAa", label: "upper and lower case are different" },
      { args: ["eeeee"], expected: "eeeee", label: "one distinct character" },
    ],
    hidden: [
      { args: [""], expected: "", label: "empty string" },
      { args: ["z"], expected: "z", label: "single character" },
      { args: ["abbccc"], expected: "cccbba", label: "input is in the opposite order" },
      { args: ["112333"], expected: "333112", label: "digits" },
      { args: ["a a a"], expected: "aaa  ", label: "spaces are characters too" },
      { args: ["xwywzwyzwz"], expected: "wwwwzzzyyx", label: "characters interleaved" },
    ],
  },
  hints: [
    "You can't order by frequency until you know the frequencies. Count first.",
    "A character can appear at most len(s) times. What can you do with a list that has one slot per possible count?",
    "Read the buckets from the highest count down, and for each character append it repeated that many times.",
  ],
  followUps: [
    {
      q: "What's the shorter version with a sort?",
      a: "Sort the distinct characters by count, descending, and join ch * count. With an alphabet of size k that is O(n + k log k), which is fine in practice. Bucketing avoids the sort entirely.",
    },
    {
      q: "What if two characters had the same count?",
      a: "Then several answers are valid. If the interviewer wants one, agree on a tie-break, for example alphabetical, and sort each bucket before writing it out.",
    },
    {
      q: "Why build a list and join at the end?",
      a: "Strings are immutable, so s += piece can copy the whole string each time. Appending to a list and joining once keeps it O(n).",
    },
  ],
  edgeCases: [
    { input: 's = "aAAbbb"', breaks: true, why: "Lowercasing before counting merges \"a\" and \"A\" into one character with count 3." },
    { input: 's = "eeeee"', breaks: true, why: "The count equals len(s). With only len(s) buckets, buckets[5] is out of range." },
    { input: 's = ""', breaks: false, why: "No characters, one empty bucket, and joining nothing gives \"\"." },
    { input: 's = "abbccc"', breaks: true, why: "Reading the buckets from low to high returns the least frequent character first." },
  ],
  links: { leetcode: "https://leetcode.com/problems/sort-characters-by-frequency/" },
});
