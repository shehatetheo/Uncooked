import { python } from "@/lib/types";

export default python({
  id: "valid-palindrome",
  title: "Valid Palindrome",
  difficulty: "Easy",
  tags: ["string", "two pointers"],
  statement: `You get a string. Decide whether it reads the same forwards and backwards once you ignore everything except letters and digits.

Upper and lower case count as the same letter. Spaces, commas and all other punctuation are skipped completely.

Return True if what is left is a palindrome and False if it is not. A string with no letters or digits at all counts as a palindrome.`,
  examples: [
    { input: 's = "A man, a plan, a canal: Panama"', output: "True", note: "Cleaned up it is amanaplanacanalpanama, which reads the same both ways." },
    { input: 's = "race a car"', output: "False", note: "Cleaned up it is raceacar, and backwards that is racaecar." },
    { input: 's = " "', output: "True", note: "Nothing is left after skipping the space, and an empty string is a palindrome." },
  ],
  constraints: ["1 ≤ len(s) ≤ 2 · 10⁵", "s contains only printable ASCII characters"],
  signature: "def isPalindrome(self, s: str) -> bool:",
  method: "isPalindrome",
  params: [{ name: "s" }],
  solution: [
    "i, j = 0, len(s) - 1",
    "while i < j:",
    "    while i < j and not s[i].isalnum():",
    "        i += 1",
    "    while i < j and not s[j].isalnum():",
    "        j -= 1",
    "    if s[i].lower() != s[j].lower():",
    "        return False",
    "    i, j = i + 1, j - 1",
    "return True",
  ],
  captions: [
    "One pointer starts at the left end and one at the right end.",
    "Keep going until the two pointers meet in the middle.",
    "On the left, skip anything that is not a letter or digit.",
    "Step right past it without comparing anything.",
    "Do the same on the right side.",
    "Step left past it.",
    "Both pointers now sit on real characters, so compare them with case removed.",
    "A mismatch means it cannot be a palindrome.",
    "They match, so move both pointers one step toward the middle.",
    "Every pair matched, so it is a palindrome.",
  ],
  tests: {
    visible: [
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["race a car"], expected: false },
      { args: [" "], expected: true },
    ],
    hidden: [
      { args: ["a"], expected: true },
      { args: [".,!"], expected: true },
      { args: ["0P"], expected: false },
      { args: ["ab_a"], expected: true },
      { args: ["No 'x' in Nixon"], expected: true },
      { args: ["Abca"], expected: false },
    ],
  },
  hints: [
    "A palindrome has matching characters at mirrored positions. Which two positions would you compare first?",
    "Put one pointer at each end and walk them toward each other. What should a pointer do when it lands on punctuation?",
    "Use two pointers from both ends, skip anything that is not a letter or digit, and compare the lowercased characters until the pointers meet.",
  ],
  followUps: [
    "Building a cleaned copy and comparing it to its reverse also works. What is the extra space cost, and how does your version avoid it?",
    "What if you were allowed to delete at most one character to make it a palindrome?",
  ],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/valid-palindrome/",
});
