import { python } from "@/lib/types";

export default python({
  id: "group-anagrams",
  title: "Group Anagrams",
  difficulty: "Medium",
  tags: ["string", "hash map"],
  statement: `You get a list of words. Two words are anagrams if they use exactly the same letters the same number of times, just in a different order.

Put the words into groups so that each group holds words that are anagrams of each other. A word with no anagram partner gets a group of its own.

Return the list of groups. The groups can be in any order, and so can the words inside each group.`,
  examples: [
    {
      input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
      output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
      note: "eat, tea and ate all use one a, one e and one t.",
    },
    { input: 'strs = [""]', output: '[[""]]', note: "The empty word still forms a group." },
  ],
  constraints: ["1 ≤ len(strs) ≤ 10⁴", "0 ≤ len(strs[i]) ≤ 100", "Words contain only lowercase English letters"],
  signature: "def groupAnagrams(self, strs: List[str]) -> List[List[str]]:",
  method: "groupAnagrams",
  params: [{ name: "strs" }],
  compare: "groups",
  solution: [
    "groups = defaultdict(list)",
    "for word in strs:",
    "    count = [0] * 26",
    "    for c in word:",
    '        count[ord(c) - ord("a")] += 1',
    "    groups[tuple(count)].append(word)",
    "return list(groups.values())",
  ],
  captions: [
    "A dictionary from a letter fingerprint to the words that have it.",
    "Handle each word once.",
    "The fingerprint is 26 counters, one for each letter a to z.",
    "Look at every letter in the word.",
    "Add one to that letter's counter. Anagrams end up with identical counters.",
    "A list can't be a dictionary key, so turn the counters into a tuple and file the word under it.",
    "Each dictionary value is one finished group.",
  ],
  tests: {
    visible: [
      { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] },
      { args: [[""]], expected: [[""]] },
      { args: [["a"]], expected: [["a"]] },
    ],
    hidden: [
      { args: [["abc", "def", "ghi"]], expected: [["abc"], ["def"], ["ghi"]] },
      { args: [["ab", "ba", "ab"]], expected: [["ab", "ba", "ab"]] },
      { args: [["", ""]], expected: [["", ""]] },
      { args: [["aab", "aba", "baa", "abb", "bab"]], expected: [["aab", "aba", "baa"], ["abb", "bab"]] },
      { args: [["listen", "silent", "enlist", "google", "gogole", "cat"]], expected: [["listen", "silent", "enlist"], ["google", "gogole"], ["cat"]] },
    ],
  },
  hints: [
    "What is something you could compute from a word that comes out identical for every one of its anagrams?",
    "Sorted letters or letter counts both work as a fingerprint. Which data structure collects words that share a fingerprint?",
    "Count the 26 letters of each word, use that count as a dictionary key, and append the word to the list stored under its key.",
  ],
  followUps: [
    "Using the sorted word as the key is shorter to write. How does its running time compare with counting letters?",
    "What would you change if the words could contain any Unicode characters instead of only a to z?",
  ],
  time: "O(n · k)",
  space: "O(n · k)",
  link: "https://leetcode.com/problems/group-anagrams/",
});
