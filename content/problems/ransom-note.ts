import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "ransom-note",
  title: "Ransom Note",
  difficulty: "easy",
  pattern: "counting",
  tags: ["sap", "string"],
  statement: `You want to write a note by cutting individual letters out of a magazine. You get two strings: the note you want to write and the text of the magazine.

Return True if the magazine contains enough of every letter to build the note, and False otherwise. Each letter in the magazine can be used only once, and upper and lower case are different letters.`,
  examples: [
    { input: 'ransomNote = "aab", magazine = "baba"', output: "True", note: "the magazine has two a's and two b's" },
    { input: 'ransomNote = "aa", magazine = "ab"', output: "False", note: "only one a is available" },
  ],
  constraints: ["0 ≤ len(ransomNote), len(magazine) ≤ 10⁵", "Letters can be used in any order"],
  brief: {
    what: "You're given two strings: a note you want to write and the text of a magazine you can cut letters out of. Return True if the magazine has enough of every letter to spell the note, and False otherwise.",
    example: "The note \"aab\" needs two a's and one b, and the magazine \"baba\" has two a's and two b's, so there are enough letters and the answer is True.",
    watch: "Each magazine letter can be used only once, upper and lower case are different letters (\"Aa\" can't be made from \"aa\"), and an empty note can always be written.",
  },
  myWords:
    "Count the letters in the magazine. Then spend them: for each letter of the note, if the stock for that letter is zero the answer is False, otherwise use one up. If the whole note gets written, True.",
  time: "O(m + n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take two strings, return True if the note appears inside the magazine as a substring",
        "Take two strings, return True if the magazine has at least as many of each letter as the note needs",
        "Take two strings, return True if they are anagrams of each other",
        "Take two strings, return the letters that are missing from the magazine",
      ],
      answer: 1,
      explain:
        "Input is two str values and output is a bool. Order doesn't matter and the magazine may have letters left over, so it is neither a substring check nor an anagram check.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort both strings and compare them",
        "For each note letter, search the magazine and delete the match",
        "Two pointers walking both strings together",
        "Count the magazine's letters, then subtract as you read the note",
      ],
      answer: 3,
      explain:
        "A count per letter answers \"is there one left?\" in O(1). Searching and deleting from the magazine string for every letter is O(m · n).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(m · n) time, O(1) space", "O((m + n) log(m + n)) time, O(1) space", "O(m + n) time, O(1) space", "O(m + n) time, O(m · n) space"],
      answer: 2,
      explain:
        "One pass over the magazine to count and one pass over the note to spend: O(m + n). The counter holds at most one entry per distinct letter, a fixed alphabet, so the extra space is O(1).",
    },
  ],
  method: "canConstruct",
  params: [{ name: "ransomNote" }, { name: "magazine" }],
  solution: `def canConstruct(self, ransomNote, magazine):
    have = Counter(magazine)
    for ch in ransomNote:
        if have[ch] == 0: return False
        have[ch] -= 1
    return True`,
  captions: [
    { label: "STOCK", text: "Count the letters available in the magazine: letter → how many." },
    { label: "SPEND", text: "Go through the note one letter at a time." },
    { label: "OUT OF STOCK", text: "If none of this letter is left, the note can't be written. A Counter gives 0 for letters it never saw." },
    { label: "USE ONE", text: "Otherwise cut that letter out: one fewer in stock." },
    { label: "DONE", text: "Every letter of the note was covered." },
  ],
  visual: [
    { line: 0, note: "count the magazine", arrays: [{ name: "magazine", values: ["b", "a", "b", "a"] }, { name: "ransomNote", values: ["a", "a", "b"] }], map: { name: "have", entries: [["b", "2"], ["a", "2"]] } },
    { line: 1, note: "first note letter: a", arrays: [{ name: "ransomNote", values: ["a", "a", "b"], pointers: { ch: 0 } }], map: { name: "have", entries: [["b", "2"], ["a", "2"]] } },
    { line: 3, note: "a is in stock, use one", arrays: [{ name: "ransomNote", values: ["a", "a", "b"], pointers: { ch: 0 } }], map: { name: "have", entries: [["b", "2"], ["a", "1"]] } },
    { line: 3, note: "second a: still one left, use it", arrays: [{ name: "ransomNote", values: ["a", "a", "b"], pointers: { ch: 1 } }], map: { name: "have", entries: [["b", "2"], ["a", "0"]] } },
    { line: 3, note: "b: two in stock, use one", arrays: [{ name: "ransomNote", values: ["a", "a", "b"], pointers: { ch: 2 } }], map: { name: "have", entries: [["b", "1"], ["a", "0"]] } },
    { line: 4, note: "the note is finished → True", arrays: [{ name: "ransomNote", values: ["a", "a", "b"], hi: [0, 1, 2] }], map: { name: "have", entries: [["b", "1"], ["a", "0"]] }, vars: { return: "True" } },
  ],
  tests: {
    visible: [
      { args: ["aab", "baba"], expected: true },
      { args: ["aa", "ab"], expected: false, label: "not enough copies of a letter" },
      { args: ["a", "b"], expected: false, label: "letter missing entirely" },
    ],
    hidden: [
      { args: ["", "abc"], expected: true, label: "empty note" },
      { args: ["abc", ""], expected: false, label: "empty magazine" },
      { args: ["", ""], expected: true, label: "both empty" },
      { args: ["hello", "ollhe"], expected: true, label: "same letters, different order" },
      { args: ["Aa", "aa"], expected: false, label: "case matters" },
      { args: ["zzz", "zz"], expected: false, label: "one copy short" },
      { args: ["bid", "a big bold idea"], expected: true, label: "magazine has plenty left over" },
    ],
  },
  hints: [
    "Order doesn't matter here, only how many of each letter you have and how many you need.",
    "Count the magazine's letters once. Then each note letter is a withdrawal from that stock.",
    "Return False the moment a letter's stock is at zero. If you get through the whole note, return True.",
  ],
  followUps: [
    {
      q: "Can you write it in one line?",
      a: "not (Counter(ransomNote) - Counter(magazine)). Counter subtraction drops zero and negative counts, so an empty result means nothing is missing. Same O(m + n).",
    },
    {
      q: "What's the brute force?",
      a: "For each note letter, find it in the magazine and remove it. Each find and remove is O(m), so the total is O(m · n).",
    },
    {
      q: "What if the magazine is a huge stream and the note is short?",
      a: "Count the note instead, and read the magazine until every needed count has been covered. You can stop early and you never store the magazine.",
    },
  ],
  edgeCases: [
    { input: 'ransomNote = "aa", magazine = "ab"', breaks: true, why: "Checking only that each note letter exists in the magazine (set membership) ignores how many copies you need." },
    { input: 'ransomNote = "", magazine = "abc"', breaks: false, why: "An empty note needs nothing, so the loop never runs and the answer is True." },
    { input: 'ransomNote = "ab", magazine = "ba"', breaks: true, why: "Checking magazine.find(ransomNote) treats it as a substring problem and returns False." },
    { input: 'ransomNote = "x", magazine = "abc"', breaks: true, why: "A plain dict raises KeyError for a letter the magazine never had. Counter or .get(ch, 0) returns 0." },
  ],
  links: { leetcode: "https://leetcode.com/problems/ransom-note/" },
});
