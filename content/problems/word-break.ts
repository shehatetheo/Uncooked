import { python } from "@/lib/types";

export default python({
  id: "word-break",
  title: "Word Break",
  difficulty: "Medium",
  tags: ["dp", "string", "hash set"],
  statement: `You get a string with no spaces and a list of dictionary words. Decide whether the string can be cut into pieces so that every piece is a word from the list.

You may use the same word as many times as you like, and you don't have to use every word. Every letter of the string must end up inside some piece.

Return true if such a cut exists, and false if it doesn't.`,
  examples: [
    { input: 's = "leetcode", wordDict = ["leet", "code"]', output: "true", note: "Cut it as leet + code." },
    { input: 's = "applepenapple", wordDict = ["apple", "pen"]', output: "true", note: "apple + pen + apple. Reusing a word is allowed." },
    { input: 's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]', output: "false", note: "Every way of cutting leaves letters that aren't a word." },
  ],
  constraints: ["1 ≤ len(s) ≤ 300", "1 ≤ len(wordDict) ≤ 1000", "Each word has 1 to 20 lowercase letters", "All words in the list are different"],
  signature: "def wordBreak(self, s: str, wordDict: List[str]) -> bool:",
  method: "wordBreak",
  params: [{ name: "s" }, { name: "wordDict" }],
  solution: [
    "words = set(wordDict)",
    "dp = [True] + [False] * len(s)",
    "for i in range(1, len(s) + 1):",
    "    for j in range(i):",
    "        if dp[j] and s[j:i] in words:",
    "            dp[i] = True",
    "            break",
    "return dp[len(s)]",
  ],
  captions: [
    "A set lets us ask \"is this piece a word?\" quickly.",
    "dp[i] says whether the first i letters can be cut into words. Zero letters always can.",
    "Work out the answer for every prefix, shortest first.",
    "Try every place j where the last word of this prefix could start.",
    "It works if the part before j can be cut and the piece from j to i is a word.",
    "Found one way, so this prefix is breakable.",
    "One way is enough. Stop looking at other cut points.",
    "The last entry covers the whole string.",
  ],
  tests: {
    visible: [
      { args: ["leetcode", ["leet", "code"]], expected: true },
      { args: ["applepenapple", ["apple", "pen"]], expected: true },
      { args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expected: false },
    ],
    hidden: [
      { args: ["a", ["a"]], expected: true },
      { args: ["a", ["b"]], expected: false },
      { args: ["aaaaaaa", ["aaaa", "aaa"]], expected: true },
      { args: ["aaaaaaa", ["aa"]], expected: false },
      { args: ["abcd", ["a", "abc", "b", "cd"]], expected: true },
      { args: ["catsanddog", ["cats", "dog", "sand", "and", "cat"]], expected: true },
    ],
  },
  hints: [
    "Taking the longest matching word first can paint you into a corner. Try \"abcd\" with the words a, abc, b, cd.",
    "Think about prefixes. If you know which shorter prefixes can be cut into words, how do you decide for a longer one?",
    "Keep a true/false table over prefix lengths: a prefix works if some earlier working prefix is followed by a dictionary word that ends exactly here.",
  ],
  followUps: [
    "How would you return every possible sentence instead of just true or false?",
    "The words are at most 20 letters long. How can you use that to do less work per position?",
  ],
  time: "O(n³)",
  space: "O(n)",
  link: "https://leetcode.com/problems/word-break/",
});
