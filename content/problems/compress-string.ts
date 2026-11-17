import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "compress-string",
  title: "Compress a String",
  difficulty: "easy",
  pattern: "string",
  tags: ["made-up", "string"],
  statement: `Say we store sensor readings as long strings where the same character often repeats many times in a row, and we want to save space. You get one string.

Replace every run of the same character with that character followed by the length of the run. A character that appears once still gets a 1. Return the compressed string.`,
  examples: [
    { input: 's = "aaabcc"', output: '"a3b1c2"' },
    { input: 's = "abc"', output: '"a1b1c1"', note: "the result can be longer than the input" },
    { input: 's = "aabbaa"', output: '"a2b2a2"', note: "the two runs of a are counted separately" },
  ],
  constraints: ["0 ≤ len(s) ≤ 10⁵", "s contains letters and spaces, no digits", "Upper and lower case are different characters"],
  brief: {
    what: "You're given a string. Replace each stretch of the same character repeated back to back with that character followed by how many times it repeats, and return the result.",
    example: "\"aaabcc\" is three a's, then one b, then two c's in a row, so it becomes \"a3b1c2\".",
    watch: "A character that appears once still gets a 1, the same letter in two separate stretches is written twice (\"aabbaa\" becomes \"a2b2a2\"), and upper and lower case are different characters.",
  },
  myWords:
    "Walk the string run by run. i marks where a run starts; j moves right while the character stays the same. j − i is the run length. Write character plus length, then jump i to j. Each character is visited once.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a str, return a dict of character → total count",
        "Take a str, return the str with duplicate characters removed",
        "Take a str, return the length of the longest run",
        "Take a str, return a str where each run of equal neighbours becomes the character plus the run length",
      ],
      answer: 3,
      explain:
        "Input is a str and output is a str. Only consecutive repeats are grouped, so \"aabbaa\" becomes \"a2b2a2\" and not \"a4b2\". That is different from counting totals.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Counter over the whole string",
        "Sort the characters, then count",
        "Scan once with two indices marking the start and end of each run",
        "Stack that pops when the character changes",
      ],
      answer: 2,
      explain:
        "Runs are about neighbours, so order matters and a global count or a sort would destroy it. Two indices measure each run in a single left-to-right pass.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n²) time, O(n) space", "O(n log n) time, O(1) space", "O(n) time, O(1) space"],
      answer: 0,
      explain:
        "The inner loop only moves j forward, so across the whole run both indices travel n steps in total: O(n). The output can be up to twice the input length, so O(n) space.",
    },
  ],
  method: "compress",
  params: [{ name: "s" }],
  solution: `def compress(self, s):
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]: j += 1
        out.append(s[i] + str(j - i))
        i = j
    return "".join(out)`,
  captions: [
    { label: "INIT", text: "out collects the pieces; i is the start of the current run." },
    { label: "EACH RUN", text: "Keep going while there are characters left to group." },
    { label: "RUN START", text: "j starts at the beginning of the run." },
    { label: "RUN END", text: "Slide j right while it still sees the same character as position i." },
    { label: "WRITE", text: "The run is s[i] repeated j − i times: record the character and that length." },
    { label: "JUMP", text: "The next run starts where this one ended." },
    { label: "JOIN", text: "Glue the pieces into one string." },
  ],
  visual: [
    { line: 0, note: "out is empty, i = 0", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 0 } }, { name: "out", values: [] }] },
    { line: 3, note: "j slides over the a's and stops at b", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 0, j: 3 }, hi: [0, 1, 2] }, { name: "out", values: [] }] },
    { line: 4, note: "run length is 3 − 0 = 3, write \"a3\"", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 0, j: 3 }, hi: [0, 1, 2] }, { name: "out", values: ["a3"] }] },
    { line: 5, note: "jump i to 3", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 3 }, dim: [0, 1, 2] }, { name: "out", values: ["a3"] }] },
    { line: 3, note: "j moves one step and stops at c", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 3, j: 4 }, hi: [3], dim: [0, 1, 2] }, { name: "out", values: ["a3"] }] },
    { line: 4, note: "run length 1, write \"b1\"", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 3, j: 4 }, hi: [3], dim: [0, 1, 2] }, { name: "out", values: ["a3", "b1"] }] },
    { line: 4, note: "i = 4, j runs off the end at 6: write \"c2\"", arrays: [{ name: "s", values: ["a", "a", "a", "b", "c", "c"], pointers: { i: 4 }, hi: [4, 5], dim: [0, 1, 2, 3] }, { name: "out", values: ["a3", "b1", "c2"] }], vars: { j: "6" } },
    { line: 6, note: "i = 6 ends the loop, join the pieces", arrays: [{ name: "out", values: ["a3", "b1", "c2"] }], vars: { return: "\"a3b1c2\"" } },
  ],
  tests: {
    visible: [
      { args: ["aaabcc"], expected: "a3b1c2" },
      { args: ["abc"], expected: "a1b1c1", label: "no repeats" },
      { args: ["aabbaa"], expected: "a2b2a2", label: "same letter in two separate runs" },
    ],
    hidden: [
      { args: [""], expected: "", label: "empty string" },
      { args: ["x"], expected: "x1", label: "single character" },
      { args: ["zzzzzzzzzzzz"], expected: "z12", label: "run of 12 needs two digits" },
      { args: ["aAa"], expected: "a1A1a1", label: "case matters" },
      { args: ["a   b"], expected: "a1 3b1", label: "spaces form runs too" },
      { args: ["wwwwbbbw"], expected: "w4b3w1", label: "run of one at the very end" },
    ],
  },
  hints: [
    "This is about neighbours, not totals. \"aabbaa\" has three runs, not two letters.",
    "Mark where a run starts, then move a second index forward until the character changes. The distance between them is the run length.",
    "The easy bug is forgetting the final run. If you write a run each time you finish measuring it, the last one is handled like every other.",
  ],
  followUps: [
    {
      q: "The nested loop looks like O(n²). Is it?",
      a: "No. j never moves backwards and i jumps straight to j, so every character is looked at once. Two nested loops, but O(n) total work.",
    },
    {
      q: "What if you should only return the compressed form when it's actually shorter?",
      a: "Build it the same way, then compare lengths and return the original if the result isn't shorter. \"abc\" would stay \"abc\".",
    },
    {
      q: "Can you do it in O(1) extra space?",
      a: "With a mutable character array, yes: keep a write index behind the read index and overwrite in place, as in String Compression. That version usually skips the count for runs of one so the output never outgrows the input.",
    },
  ],
  edgeCases: [
    { input: 's = "aabbaa"', breaks: true, why: "Counting totals with a Counter gives a4b2. Runs must be measured separately." },
    { input: 's = "aaab"', breaks: true, why: "A loop that writes a run only when the character changes never writes the last run, b1." },
    { input: 's = ""', breaks: false, why: "The loop never starts and joining nothing gives \"\". A version that reads s[0] up front would crash." },
    { input: 's = "zzzzzzzzzzzz"', breaks: true, why: "Capping the count at one digit, or using chr arithmetic, breaks for a run of 12. Use str(length)." },
  ],
  reveal:
    "This is run-length encoding: a single scan where two indices mark the start and end of each run. The closest known problem is String Compression, with Count and Say as a relative.",
  links: {},
});
