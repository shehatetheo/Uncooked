import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "sort-students",
  title: "Rank the Students",
  difficulty: "easy",
  pattern: "sorting",
  tags: ["made-up", "sorting"],
  statement: `So, imagine we have a training portal and after a course we want to print a ranking. You get a list of [name, grade] pairs, one per student.

Return just the names, best grade first. When two students have the same grade, the one whose name comes first alphabetically goes first.`,
  examples: [
    { input: 'students = [["Mia", 90], ["Leo", 85], ["Ava", 90]]', output: '["Ava", "Mia", "Leo"]', note: "Ava and Mia tie on 90, so A comes before M" },
    { input: 'students = [["Ben", 60], ["Cara", 95]]', output: '["Cara", "Ben"]' },
  ],
  constraints: ["0 ≤ len(students) ≤ 10⁴", "Grades are whole numbers from 0 to 100", "Names are unique and start with a capital letter"],
  brief: {
    what: "You're given a list of students, each as a [name, grade] pair. Return just the names, ranked from best grade to worst.",
    example: "Mia and Ava both have 90 and Leo has 85; Ava comes before Mia alphabetically, so the answer is [\"Ava\", \"Mia\", \"Leo\"].",
    watch: "When two students have the same grade, the name that comes first alphabetically goes first, and an empty list gives back an empty list.",
  },
  myWords:
    "One sort with a two-part key. Python compares tuples left to right, so (-grade, name) sorts by grade descending first and falls back to name ascending on ties. Then pull out the names.",
  time: "O(n log n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a list of [str, int] pairs, return the name of the best student",
        "Take a list of [str, int] pairs, return the pairs sorted by name",
        "Take a list of [str, int] pairs, return a list[str] of names ordered by grade high to low, ties by name A to Z",
        "Take a list of [str, int] pairs, return the average grade",
      ],
      answer: 2,
      explain:
        "Input is a list of [name, grade] pairs, a str and an int each. Output is list[str]: only the names, in ranking order with two sort criteria.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Sort once with a tuple key: (-grade, name)",
        "Hash map of grade → names, then loop over grades 100 down to 0",
        "Sort with reverse=True on the whole pair",
        "Repeatedly find the best remaining student and remove them",
      ],
      answer: 0,
      explain:
        "A tuple key expresses both criteria in one sort. Negating the grade flips only that part to descending, while the name part stays ascending. reverse=True would flip the names too.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(1) space", "O(n²) time, O(n) space", "O(n log n) time, O(n) space", "O(n log n) time, O(1) space"],
      answer: 2,
      explain:
        "A comparison sort is O(n log n). sorted() builds a new list and the answer is another list of n names, so O(n) space.",
    },
  ],
  method: "sortStudents",
  params: [{ name: "students" }],
  solution: `def sortStudents(self, students):
    ranked = sorted(students, key=lambda s: (-s[1], s[0]))
    return [name for name, grade in ranked]`,
  captions: [
    { label: "SORT", text: "Sort by a pair: negative grade first (so higher grades come earlier), then name to break ties A to Z." },
    { label: "NAMES", text: "Keep only the name from each sorted pair." },
  ],
  visual: [
    { line: 0, note: "the students as given", arrays: [{ name: "students", values: ["Mia 90", "Leo 85", "Ava 90"] }] },
    { line: 0, note: "each student's sort key is (-grade, name)", arrays: [{ name: "students", values: ["Mia 90", "Leo 85", "Ava 90"] }, { name: "key", values: ["(-90, Mia)", "(-85, Leo)", "(-90, Ava)"] }] },
    { line: 0, note: "-90 sorts before -85; the two -90s are split by name", arrays: [{ name: "ranked", values: ["Ava 90", "Mia 90", "Leo 85"], hi: [0, 1] }, { name: "key", values: ["(-90, Ava)", "(-90, Mia)", "(-85, Leo)"] }] },
    { line: 1, note: "keep only the names", arrays: [{ name: "ranked", values: ["Ava 90", "Mia 90", "Leo 85"] }], vars: { return: "[\"Ava\", \"Mia\", \"Leo\"]" } },
  ],
  tests: {
    visible: [
      { args: [[["Mia", 90], ["Leo", 85], ["Ava", 90]]], expected: ["Ava", "Mia", "Leo"] },
      { args: [[["Ben", 60], ["Cara", 95]]], expected: ["Cara", "Ben"] },
      { args: [[["Zoe", 70], ["Adam", 70], ["Kim", 70]]], expected: ["Adam", "Kim", "Zoe"], label: "everyone ties" },
    ],
    hidden: [
      { args: [[]], expected: [], label: "no students" },
      { args: [[["Solo", 100]]], expected: ["Solo"], label: "single student" },
      { args: [[["Ann", 99], ["Bob", 80], ["Cy", 50]]], expected: ["Ann", "Bob", "Cy"], label: "already in ranking order" },
      { args: [[["Cy", 50], ["Bob", 80], ["Ann", 99]]], expected: ["Ann", "Bob", "Cy"], label: "exactly reversed" },
      { args: [[["Lu", 0], ["Al", 100], ["Bo", 0]]], expected: ["Al", "Bo", "Lu"], label: "grades 0 and 100" },
      { args: [[["Anna", 88], ["Ann", 88], ["Anne", 88]]], expected: ["Ann", "Anna", "Anne"], label: "names that share a prefix" },
      { args: [[["Dee", 75], ["Bea", 90], ["Abe", 75], ["Cal", 90], ["Eli", 60]]], expected: ["Bea", "Cal", "Abe", "Dee", "Eli"], label: "two separate ties" },
    ],
  },
  hints: [
    "You have two criteria with different directions: grade goes down, name goes up. Can one sort handle both?",
    "sorted() accepts a key function. A key can be a tuple, and tuples compare element by element.",
    "To make a number sort descending inside an ascending sort, negate it.",
  ],
  followUps: [
    {
      q: "Why not sorted(students, key=..., reverse=True)?",
      a: "reverse flips the entire ordering, so ties would come out Z to A. Negating the grade reverses only the numeric part.",
    },
    {
      q: "What if you couldn't negate the key, say both fields were strings?",
      a: "Sort twice, relying on stability: first by the secondary key (name ascending), then by the primary key (grade, reverse=True). Python's sort keeps equal items in their existing order.",
    },
    {
      q: "Grades only go from 0 to 100. Can you beat O(n log n)?",
      a: "Yes, with 101 buckets indexed by grade: O(n) to distribute. You still have to sort the names inside each bucket, so ties are what keep the worst case at O(n log n).",
    },
  ],
  edgeCases: [
    { input: 'students = [["Mia", 90], ["Ava", 90]]', breaks: true, why: "Sorting by grade with reverse=True and no name key leaves ties in input order, or flips them to Z to A." },
    { input: 'students = [["Ben", 60], ["Cara", 95]]', breaks: false, why: "No ties, so any descending sort by grade gets it right." },
    { input: "students = []", breaks: false, why: "Sorting an empty list gives an empty list." },
    { input: 'students = [["Bo", 9], ["Al", 10]]', breaks: true, why: "If the grades were read as strings, \"9\" sorts after \"10\". Compare them as numbers." },
  ],
  reveal:
    "This is a multi-key sort: one sorted() call with a tuple key, negating the number to flip its direction. The closest known problems are Sort the People and any custom-comparator sorting question.",
  links: {},
});
