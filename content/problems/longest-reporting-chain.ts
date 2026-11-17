import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "longest-reporting-chain",
  title: "Longest Reporting Chain",
  difficulty: "easy",
  pattern: "tree-dfs",
  tags: ["made-up"],
  statement: `Suppose HR wants to know how deep our org chart goes. The chart is a binary tree: the root is the CEO, each node is an employee id, and each employee has at most two direct reports (left and right).

Return the number of people on the longest chain that starts at the CEO and follows "manages" links down to someone with no reports. Count everyone on the chain, including the CEO. An empty company has a chain of 0.`,
  examples: [
    { input: "root = [1, 2, 3, 4, null, null, 5]", output: "3", note: "1 → 2 → 4 and 1 → 3 → 5 both have three people" },
    { input: "root = [1, 2, null, 3, null, 4]", output: "4", note: "a single chain 1 → 2 → 3 → 4" },
  ],
  constraints: ["0 ≤ number of employees ≤ 10⁴", "Each node has .val, .left and .right", "The tree is given level by level, with null for a missing report"],
  brief: {
    what: "You're given a company's org chart, starting at the CEO, where each person has at most two direct reports. Return how many people are on the longest chain from the CEO down to someone who manages nobody, counting everyone on the chain, including the CEO.",
    example: "Reading [1, 2, 3, 4, null, null, 5] level by level (null means a missing report): 1 manages 2 and 3, 2 manages 4, and 3 manages 5, so the longest chains, 1 → 2 → 4 and 1 → 3 → 5, have three people and the answer is 3.",
    watch: "Count people, not the links between them: a CEO with no reports has a chain of 1, and an empty company has a chain of 0.",
  },
  myWords:
    "The longest chain from a manager is that manager plus the longer of the two chains below them. That's a recursive definition: an empty spot has length 0, and every person returns 1 + max(left, right). The answer at the root is the depth of the tree.",
  time: "O(n)",
  space: "O(h)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take the root TreeNode, return the total number of employees",
        "Take the root TreeNode, return the employee ids on the longest chain",
        "Take the root TreeNode, return the largest number of direct reports any manager has",
        "Take the root TreeNode, return an int: how many people are on the longest path from the root down to a leaf",
      ],
      answer: 3,
      explain:
        "Input is a TreeNode (or None) and output is an int. You count the levels on the deepest root-to-leaf path, not the people in the whole tree and not the path itself.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Binary search on the employee ids",
        "Hash map of employee → manager",
        "Depth-first recursion: 1 + the deeper of the two subtrees",
        "Sort the ids and count them",
      ],
      answer: 2,
      explain:
        "A tree's depth is defined in terms of its subtrees' depths, so recursion fits directly. Each call solves the same problem for a smaller org chart.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(h) space where h is the tree height", "O(log n) time, O(1) space", "O(n log n) time, O(n) space", "O(n²) time, O(h) space"],
      answer: 0,
      explain:
        "Every employee is visited exactly once: O(n). The recursion stack is as deep as the tree, O(h), which is O(n) for a single long chain and O(log n) for a balanced chart.",
    },
  ],
  method: "longestChain",
  params: [{ name: "root", kind: "tree" }],
  solution: `def longestChain(self, root):
    if not root: return 0
    return 1 + max(self.longestChain(root.left), self.longestChain(root.right))`,
  captions: [
    { label: "BASE CASE", text: "No employee here, so the chain has length 0." },
    { label: "RECURSE", text: "Count this person, plus the longer of the chains under their two reports." },
  ],
  visual: [
    { line: 1, note: "start at the CEO: ask both reports for their longest chain", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [0] } },
    { line: 1, note: "employee 2 asks its reports", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [1] } },
    { line: 0, note: "below employee 4 there is nobody: each empty spot returns 0", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [3] }, vars: { left: "0", right: "0" } },
    { line: 1, note: "employee 4 returns 1 + max(0, 0) = 1", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [3] }, vars: { return: "1" } },
    { line: 1, note: "employee 2 returns 1 + max(1, 0) = 2", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [1, 3] }, vars: { left: "1", right: "0", return: "2" } },
    { line: 1, note: "on the right, 5 returns 1 and 3 returns 1 + max(0, 1) = 2", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [2, 6] }, vars: { left: "0", right: "1", return: "2" } },
    { line: 1, note: "the CEO returns 1 + max(2, 2) = 3", tree: { nodes: [1, 2, 3, 4, null, null, 5], hi: [0, 1, 3] }, vars: { left: "2", right: "2", return: "3" } },
  ],
  tests: {
    visible: [
      { args: [[1, 2, 3, 4, null, null, 5]], expected: 3 },
      { args: [[1, 2, null, 3, null, 4]], expected: 4, label: "one long chain on the left" },
      { args: [[7]], expected: 1, label: "the CEO works alone" },
    ],
    hidden: [
      { args: [[]], expected: 0, label: "empty company" },
      { args: [[1, 2, 3]], expected: 2, label: "CEO with two reports" },
      { args: [[1, null, 2, null, 3]], expected: 3, label: "chain leaning right" },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: 3, label: "completely full chart" },
      { args: [[1, 2, 3, null, null, null, 4, null, 5]], expected: 4, label: "deepest chain is on the right" },
      { args: [[10, 20, 30, 40, null, null, null, 50, 60]], expected: 4, label: "one branch much deeper than the other" },
    ],
  },
  hints: [
    "Forget the job titles. It's a binary tree and you want the number of nodes on the longest root-to-leaf path. What is that usually called?",
    "If you already knew the longest chain under the left report and under the right report, how would you get the answer for their manager?",
    "The base case is an empty spot (None), which contributes 0. Everyone else contributes 1 plus the larger of their two sides.",
  ],
  followUps: [
    {
      q: "Can you do it without recursion?",
      a: "Yes, breadth-first with a queue: process the chart one level at a time and count the levels. Same O(n) time; the queue holds at most one level, which can be about n/2 nodes.",
    },
    {
      q: "What happens with a chart that is one chain of 100,000 people?",
      a: "The recursion goes 100,000 calls deep and hits Python's recursion limit. The iterative level-by-level version, or an explicit stack of (node, depth), avoids that.",
    },
    {
      q: "What if a manager could have any number of reports?",
      a: "Store the reports in a list and return 1 + max of the chain lengths over all of them, with default=0 for someone who has none.",
    },
  ],
  edgeCases: [
    { input: "root = []", breaks: true, why: "Without the None check, reading root.left on an empty tree raises AttributeError." },
    { input: "root = [1, 2, null, 3, null, 4]", breaks: true, why: "Counting nodes and taking log₂ assumes a balanced chart. A lopsided one is much deeper." },
    { input: "root = [7]", breaks: true, why: "Counting links instead of people gives 0. The CEO alone is a chain of 1." },
    { input: "root = [1, 2, 3]", breaks: false, why: "A small balanced chart works with any correct traversal." },
  ],
  reveal:
    "This is Maximum Depth of Binary Tree with an org chart on top: depth-first recursion returning 1 + max(left, right), with 0 for an empty node.",
  remixOf: "max-depth-binary-tree",
  links: {},
});
