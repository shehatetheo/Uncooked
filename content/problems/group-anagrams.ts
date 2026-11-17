import { defineProblem } from "@/lib/content/types";

// 100 pairs: "ab"/"ba", "aab"/"baa", "aaab"/"baaa", ... Each pair is its own group.
const pairs = Array.from({ length: 100 }, (_, k) => ["a".repeat(k + 1) + "b", "b" + "a".repeat(k + 1)]);

export default defineProblem({
  id: "group-anagrams",
  title: "Group Anagrams",
  difficulty: "medium",
  pattern: "hash-map",
  tags: ["core", "string", "sorting"],
  statement: `You get a list of words. Sort them into groups so that every word in a group is an anagram of the others: same letters, same counts, different order.

Return the groups as a list of lists. A word with no anagram partner gets a group of its own, and repeated words all stay in the output.

The order of the groups, and of the words inside a group, doesn't matter.`,
  examples: [
    {
      input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
      output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
      note: '"bat" has no partner, so it stands alone',
    },
    { input: 'strs = [""]', output: '[[""]]', note: "the empty string is a word too" },
  ],
  constraints: ["0 ≤ len(strs) ≤ 10⁴", "0 ≤ len(strs[i]) ≤ 100", "Lowercase English letters only"],
  brief: {
    what: "You're given a list of words. Put them into groups where every word in a group uses exactly the same letters the same number of times, just in a different order, and return the groups as a list of lists.",
    example: "From [\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"], eat, tea and ate share the same letters, tan and nat share theirs, and bat matches nothing, so the result is [[\"eat\", \"tea\", \"ate\"], [\"tan\", \"nat\"], [\"bat\"]].",
    watch: "A word with no partner still gets its own group, repeated words all stay in the output, the empty string counts as a word, and the order of groups and of words inside them doesn't matter.",
  },
  myWords: 'Sort each word\'s letters ("eat" → "aet") and use that as a hash map key. Same key, same group.',
  time: "O(n·k log k)",
  space: "O(n·k)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take list[str], return True if all the words are anagrams of each other",
        "Take list[str], return the largest group of anagrams",
        "Take list[str], return each word with its letters sorted",
        "Take list[str], return the words split into groups of anagrams",
      ],
      answer: 3,
      explain:
        "Input is list[str]. Output is list[list[str]]: every input word lands in exactly one group, and neither the group order nor the order inside a group matters.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Hash map keyed by each word's sorted letters",
        "Sort the whole list alphabetically, then scan neighbours",
        "Compare every pair of words with an anagram check",
        "Two pointers moving in from both ends of the list",
      ],
      answer: 0,
      explain:
        "Anagrams turn into the same string once their letters are sorted, so that string works as a dict key. Sorting the list itself doesn't put anagrams next to each other, and pairwise checks are O(n²·k).",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: [
        "O(n·k) time, O(1) space",
        "O(n²·k) time, O(n) space",
        "O(n·k log k) time, O(n·k) space",
        "O(n log n) time, O(n) space",
      ],
      answer: 2,
      explain:
        "For n words of length up to k, sorting each word costs O(k log k), so O(n·k log k) overall. The map stores every word once: O(n·k) space. A letter-count key trims the time to O(n·k), but the space stays the same.",
    },
  ],
  method: "groupAnagrams",
  params: [{ name: "strs" }],
  compare: "groups",
  solution: `def groupAnagrams(self, strs):
    g = defaultdict(list)
    for w in strs: g["".join(sorted(w))].append(w)
    return list(g.values())`,
  captions: [
    { label: "INIT", text: "Hash map of sorted letters → words. A missing key starts out as an empty list." },
    { label: "GROUP", text: "For each word, sort its letters into a key and append the word to that key's list." },
    { label: "RETURN", text: "The map's values are the finished groups." },
  ],
  visual: [
    { line: 0, note: "g starts empty", arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"] }], map: { name: "g", entries: [] } },
    {
      line: 1,
      note: 'w = "eat" sorts to "aet": new key',
      arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"], pointers: { w: 0 } }],
      map: { name: "g", entries: [["aet", "eat"]] },
      vars: { key: "aet" },
    },
    {
      line: 1,
      note: 'w = "tea" also sorts to "aet": same group',
      arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"], pointers: { w: 1 } }],
      map: { name: "g", entries: [["aet", "eat, tea"]] },
      vars: { key: "aet" },
    },
    {
      line: 1,
      note: 'w = "tan" sorts to "ant": new key',
      arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"], pointers: { w: 2 } }],
      map: { name: "g", entries: [["aet", "eat, tea"], ["ant", "tan"]] },
      vars: { key: "ant" },
    },
    {
      line: 1,
      note: '"ate" joins "aet", then "nat" joins "ant"',
      arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"], pointers: { w: 4 } }],
      map: { name: "g", entries: [["aet", "eat, tea, ate"], ["ant", "tan, nat"]] },
      vars: { key: "ant" },
    },
    {
      line: 1,
      note: 'w = "bat" sorts to "abt": a group of one',
      arrays: [{ name: "strs", values: ["eat", "tea", "tan", "ate", "nat", "bat"], pointers: { w: 5 } }],
      map: { name: "g", entries: [["aet", "eat, tea, ate"], ["ant", "tan, nat"], ["abt", "bat"]] },
      vars: { key: "abt" },
    },
    {
      line: 2,
      note: "Drop the keys, keep the lists",
      map: { name: "g", entries: [["aet", "eat, tea, ate"], ["ant", "tan, nat"], ["abt", "bat"]] },
      vars: { return: "[[eat, tea, ate], [tan, nat], [bat]]" },
    },
  ],
  tests: {
    visible: [
      { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] },
      { args: [[""]], expected: [[""]], label: "one empty string" },
      { args: [["a"]], expected: [["a"]], label: "single word" },
    ],
    hidden: [
      { args: [[]], expected: [], label: "empty list" },
      { args: [["ab", "ba", "ab"]], expected: [["ab", "ba", "ab"]], label: "duplicate words stay" },
      { args: [["abc", "def", "ghi"]], expected: [["abc"], ["def"], ["ghi"]], label: "no anagrams at all" },
      { args: [["aab", "aba", "baa", "abb", "bab", "bba"]], expected: [["aab", "aba", "baa"], ["abb", "bab", "bba"]], label: "same letters, different counts" },
      { args: [["ab", "a", "", "ba", "b", ""]], expected: [["ab", "ba"], ["a"], ["", ""], ["b"]], label: "mixed lengths and empties" },
      { args: [pairs.flat()], expected: pairs, label: "200 words, 100 groups" },
    ],
  },
  hints: [
    "Two words are anagrams when something about them is identical. What could you compute from a word that comes out the same for every one of its anagrams?",
    'Sorting the letters of "eat", "tea" and "ate" gives "aet" each time. That can be a dictionary key.',
    "A defaultdict(list) lets you append without checking whether the key exists yet. The answer is the dict's values.",
  ],
  followUps: [
    {
      q: "What's the brute force and why is yours better?",
      a: "Compare each word against every existing group with an anagram check: O(n²·k). The sorted key finds the right group with one hash lookup.",
    },
    {
      q: "Can you avoid sorting each word?",
      a: "Yes. Count the letters into a list of 26 ints and use tuple(counts) as the key. That is O(n·k) time instead of O(n·k log k).",
    },
    {
      q: "Why join the sorted letters instead of using them directly as the key?",
      a: "sorted() returns a list, and lists aren't hashable. Joining into a string, or wrapping in tuple(), gives you a key a dict accepts.",
    },
  ],
  edgeCases: [
    { input: 'strs = [""]', breaks: true, why: "The empty string sorts to an empty key and still needs a group. Code that skips falsy words or reads word[0] drops it or crashes." },
    { input: 'strs = ["ab", "ba", "ab"]', breaks: true, why: 'Collecting groups in sets loses the second "ab". Every input word has to appear in the output.' },
    { input: 'strs = ["aab", "abb"]', breaks: true, why: "Keying on set(word) puts them together. They share letters but not counts." },
    { input: 'strs = ["abc", "def"]', breaks: false, why: "No anagrams, so each word gets its own key and its own group." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/group-anagrams/",
    neetcode: "https://www.youtube.com/watch?v=vzdNOK2oB2E",
  },
});
