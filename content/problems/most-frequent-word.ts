import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "most-frequent-word",
  title: "Most Frequent Word",
  difficulty: "easy",
  pattern: "counting",
  tags: ["made-up", "string"],
  statement: `Let's say we collect customer feedback as free text and want to know which word people use the most. You get one string of text.

Return the word that appears most often, in lower case. Upper and lower case count as the same word, and punctuation is not part of a word: a word is any run of letters, and everything else just separates words. If several words tie, return the one that shows up first in the text.`,
  examples: [
    { input: 'text = "The cat and the hat. THE END"', output: '"the"', note: '"The", "the" and "THE" are the same word' },
    { input: 'text = "Ship it, ship it now"', output: '"ship"', note: '"ship" and "it" both appear twice; "ship" comes first' },
  ],
  constraints: ["1 ≤ len(text) ≤ 10⁵", "text contains at least one letter", "Digits and symbols separate words, like spaces do"],
  brief: {
    what: "You're given a block of free text. Return the word that appears most often, in lower case. A word is any run of letters; digits, punctuation and spaces only separate words, and upper and lower case count as the same word.",
    example: "In \"The cat and the hat. THE END\", \"The\", \"the\" and \"THE\" are all the same word, so \"the\" appears three times, more than any other word, and the answer is \"the\".",
    watch: "If several words tie for most common, return the one that appears first in the text, and remember that \"hat.\" is just the word \"hat\".",
  },
  myWords:
    "Clean first, count second. Lowercase the text and turn every non-letter into a space, then split into words. Count them with a Counter and take the key with the biggest count. max() returns the first maximum it meets, and a Counter remembers insertion order, so ties go to the earliest word.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a str, return how many times the most common word appears",
        "Take a str, return the most common word as a lower-case str, ignoring case and punctuation",
        "Take a str, return the longest word",
        "Take a list[str] of words, return them sorted by frequency",
      ],
      answer: 1,
      explain:
        "Input is one str of raw text, output is a str: the word itself, lower-cased. You have to split the text into words yourself, and \"The\" and \"the.\" must count as the same word.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort the words and find the longest run of equal neighbours",
        "Two pointers from both ends of the text",
        "For each word, call text.count(word) and keep the best",
        "Normalise the text, then count words with a hash map and take the max",
      ],
      answer: 3,
      explain:
        "This is frequency counting. A hash map gives each word's count in one pass; the only extra work is normalising case and punctuation before you count.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n log n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space"],
      answer: 0,
      explain:
        "Cleaning, splitting, counting and taking the max each read the data once: O(n) in the length of the text. The cleaned text and the counter take O(n) space.",
    },
  ],
  method: "mostFrequentWord",
  params: [{ name: "text" }],
  solution: `def mostFrequentWord(self, text):
    clean = "".join(ch if ch.isalpha() else " " for ch in text.lower())
    count = Counter(clean.split())
    return max(count, key=count.get)`,
  captions: [
    { label: "CLEAN", text: "Lowercase everything and replace each non-letter with a space, so punctuation can't stick to a word." },
    { label: "COUNT", text: "Split on spaces to get the words and tally them: word → count." },
    { label: "MAX", text: "Pick the word with the highest count. On a tie, max keeps the first one, which is the earliest in the text." },
  ],
  visual: [
    { line: 0, note: "lowercase the text", vars: { text: "\"The cat and the hat. THE END\"", lower: "\"the cat and the hat. the end\"" } },
    { line: 0, note: "the full stop becomes a space", vars: { clean: "\"the cat and the hat  the end\"" } },
    { line: 1, note: "split into words", arrays: [{ name: "words", values: ["the", "cat", "and", "the", "hat", "the", "end"], hi: [0, 3, 5] }] },
    { line: 1, note: "tally them", arrays: [{ name: "words", values: ["the", "cat", "and", "the", "hat", "the", "end"] }], map: { name: "count", entries: [["the", "3"], ["cat", "1"], ["and", "1"], ["hat", "1"], ["end", "1"]] } },
    { line: 2, note: "the highest count is 3 → return \"the\"", map: { name: "count", entries: [["the", "3"], ["cat", "1"], ["and", "1"], ["hat", "1"], ["end", "1"]] }, vars: { return: "\"the\"" } },
  ],
  tests: {
    visible: [
      { args: ["The cat and the hat. THE END"], expected: "the" },
      { args: ["Ship it, ship it now"], expected: "ship", label: "tie goes to the earlier word" },
      { args: ["Hello, hello... world"], expected: "hello", label: "punctuation attached to words" },
    ],
    hidden: [
      { args: ["word"], expected: "word", label: "single word" },
      { args: ["Yes. No? yes; NO... maybe, no"], expected: "no", label: "mixed case and punctuation" },
      { args: ["one two three"], expected: "one", label: "everything ties, first word wins" },
      { args: ["a-b a_b a.b B"], expected: "b", label: "symbols between letters split words" },
      { args: ["   SAP   sap,Sap;;sAp  "], expected: "sap", label: "extra spaces and case" },
      { args: ["2 fast 2 furious, 2 FAST"], expected: "fast", label: "digits are not words" },
      { args: ["late beta alpha beta alpha"], expected: "beta", label: "tie that doesn't involve the first word" },
    ],
  },
  hints: [
    "Split the job in two: first get a clean list of lower-case words, then find the most common one.",
    "If you only lowercase and split on spaces, \"hat.\" and \"hat\" are different strings. Deal with the punctuation before splitting.",
    "Once you have the words, a Counter (or dict) gives word → count, and max over the keys with key=count.get picks the winner.",
  ],
  followUps: [
    {
      q: "How does your code handle ties?",
      a: "Counter keeps keys in the order they were first seen, and max returns the first maximum it finds. So ties go to the word that appears first in the text.",
    },
    {
      q: "What if the text is too big to hold in memory?",
      a: "Read it line by line or in chunks, clean and count each piece, and update the same counter. Memory is then proportional to the number of distinct words, not the text length.",
    },
    {
      q: "What if I wanted the top three words?",
      a: "count.most_common(3). For a general top k you can use a heap in O(n log k) or bucket by count in O(n), as in Top K Frequent Elements.",
    },
  ],
  edgeCases: [
    { input: 'text = "The the THE"', breaks: true, why: "Without lowercasing you count three different words with one occurrence each." },
    { input: 'text = "end. End, end"', breaks: true, why: "Splitting on spaces only leaves \"end.\" and \"end,\" as separate words." },
    { input: 'text = "red blue red"', breaks: false, why: "Clean lower-case text with single spaces works with a plain split and count." },
    { input: 'text = "a-b a-b b"', breaks: true, why: "Deleting punctuation instead of replacing it with a space glues \"a-b\" into \"ab\", so \"ab\" wins instead of \"b\"." },
  ],
  reveal:
    "This is frequency counting with a hash map, the same Counter move as Valid Anagram, with a normalising step in front. The closest known problem is Most Common Word.",
  remixOf: "valid-anagram",
  links: {},
});
