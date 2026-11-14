import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "reverse-words-in-a-string",
  title: "Reverse Words in a String",
  difficulty: "medium",
  pattern: "string",
  tags: ["sap", "string"],
  statement: `You get a sentence as one string. Words are separated by spaces, but the spacing is messy: there may be spaces at the start, at the end, or several in a row.

Return the same words in the opposite order, joined by exactly one space, with no spaces at either end. The letters inside each word stay as they are.`,
  examples: [
    { input: 's = "the sky is blue"', output: '"blue is sky the"' },
    { input: 's = "  hello world  "', output: '"world hello"', note: "outer spaces are dropped" },
    { input: 's = "a good   example"', output: '"example good a"', note: "three spaces become one" },
  ],
  constraints: ["0 ≤ len(s) ≤ 10⁴", "s contains letters, digits, punctuation and spaces", "A word is any run of non-space characters"],
  myWords:
    "split() with no argument breaks on any run of whitespace and throws away the empties, so the messy spacing disappears for free. Reverse the list of words and join with single spaces.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a str, return the str with every character in reverse order",
        "Take a str, return a list[str] of its words",
        "Take a str, return the str with each word's letters reversed but the words in place",
        "Take a str, return a str with the word order reversed and the spacing cleaned up",
      ],
      answer: 3,
      explain:
        "Input is a str and output is a str. The words swap places, the letters inside each word do not move, and extra spaces are removed.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Stack of characters, popped one at a time",
        "Split into words, reverse the list, join with one space",
        "Sort the words alphabetically in reverse",
        "Hash map of word → position",
      ],
      answer: 1,
      explain:
        "Splitting on whitespace isolates the words and handles the messy spacing in one step. After that it is a list reversal and a join.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n log n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 0,
      explain:
        "Split, reverse and join each read the characters once: O(n). Python strings can't be changed in place, so the word list and the result take O(n) space.",
    },
  ],
  method: "reverseWords",
  params: [{ name: "s" }],
  solution: `def reverseWords(self, s):
    words = s.split()
    words.reverse()
    return " ".join(words)`,
  captions: [
    { label: "SPLIT", text: "split() with no argument cuts on any run of spaces and drops empty pieces, so only real words remain." },
    { label: "REVERSE", text: "Flip the order of the words in place. Each word's letters are untouched." },
    { label: "JOIN", text: "Glue the words back together with exactly one space between them." },
  ],
  visual: [
    { line: 0, note: "the sentence as given", arrays: [{ name: "s", values: ["the", " ", "sky", " ", "is", " ", "blue"] }] },
    { line: 0, note: "split() keeps only the words", arrays: [{ name: "words", values: ["the", "sky", "is", "blue"] }] },
    { line: 1, note: "reverse the list in place", arrays: [{ name: "words", values: ["blue", "is", "sky", "the"], hi: [0, 3] }] },
    { line: 2, note: "join with single spaces", arrays: [{ name: "words", values: ["blue", "is", "sky", "the"] }], vars: { return: "\"blue is sky the\"" } },
  ],
  tests: {
    visible: [
      { args: ["the sky is blue"], expected: "blue is sky the" },
      { args: ["  hello world  "], expected: "world hello", label: "leading and trailing spaces" },
      { args: ["a good   example"], expected: "example good a", label: "several spaces in a row" },
    ],
    hidden: [
      { args: ["single"], expected: "single", label: "one word" },
      { args: [""], expected: "", label: "empty string" },
      { args: ["     "], expected: "", label: "only spaces" },
      { args: ["SAP builds  software "], expected: "software builds SAP", label: "case is preserved" },
      { args: ["one, two; three."], expected: "three. two; one,", label: "punctuation stays attached to its word" },
      { args: ["a b c d e"], expected: "e d c b a", label: "single-letter words" },
    ],
  },
  hints: [
    "Forget characters for a moment. If you had a clean list of the words, what would the answer be?",
    "s.split(\" \") leaves empty strings wherever there are double spaces. s.split() with no argument does not.",
    "Reverse the list of words, then join it with a single space.",
  ],
  followUps: [
    {
      q: "Can you do it in O(1) extra space?",
      a: "Not in Python, because strings are immutable. With a mutable character array: reverse the whole array, then reverse each word back, and compact the spaces with a write index.",
    },
    {
      q: "What if you weren't allowed to use split?",
      a: "Walk from the end with two pointers: skip spaces, mark the end of a word, walk back to its start, and append that slice to the result list. Still O(n).",
    },
    {
      q: "What's the difference between split() and split(\" \")?",
      a: "split(\" \") cuts at every single space, so \"a  b\" gives [\"a\", \"\", \"b\"]. split() treats any run of whitespace as one separator and ignores leading and trailing whitespace.",
    },
  ],
  edgeCases: [
    { input: 's = "a good   example"', breaks: true, why: "split(\" \") keeps empty strings between the extra spaces, and joining them puts the extra spaces back." },
    { input: 's = "  hello world  "', breaks: true, why: "Reversing with s[::-1] or splitting on a single space leaves spaces at the ends." },
    { input: 's = "single"', breaks: false, why: "One word reversed is the same word." },
    { input: 's = "     "', breaks: false, why: "split() returns an empty list and joining an empty list gives \"\"." },
  ],
  links: { leetcode: "https://leetcode.com/problems/reverse-words-in-a-string/" },
});
