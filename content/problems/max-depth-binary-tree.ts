import { defineProblem } from "@/lib/content/types";

const tree = [3, 9, 20, null, null, 15, 7];
// A chain of 50 nodes where every node has only a right child: [1, null, 2, null, 3, ...].
const rightChain50 = Array.from({ length: 50 }, (_, i) => (i === 0 ? [1] : [null, i + 1])).flat();
// A full tree with 127 nodes (7 complete levels).
const full127 = Array.from({ length: 127 }, (_, i) => i);

export default defineProblem({
  id: "max-depth-binary-tree",
  title: "Maximum Depth of Binary Tree",
  difficulty: "easy",
  pattern: "tree-dfs",
  tags: ["core"],
  statement: `You get the root of a binary tree. Find its depth: the number of nodes on the longest path from the root straight down to a leaf.

A tree with only a root has depth 1. An empty tree has depth 0.`,
  examples: [
    { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3", note: "3 → 20 → 15 is three nodes long" },
    { input: "root = [1, null, 2]", output: "2", note: "1 has only a right child" },
  ],
  constraints: ["0 ≤ number of nodes ≤ 10⁴", "Trees are written level by level, with null for a missing child"],
  myWords: "Empty is 0; otherwise 1 + max(left depth, right depth).",
  time: "O(n)",
  space: "O(h)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take the root of a binary tree, return the total number of nodes",
        "Take the root of a binary tree, return the largest value in it",
        "Take the root of a binary tree, return the number of leaves",
        "Take the root of a binary tree, return the number of nodes on the longest root-to-leaf path",
      ],
      answer: 3,
      explain:
        "Input is a TreeNode (or None for an empty tree). Output is an int: the count of nodes along the deepest path, so a lone root gives 1 and None gives 0.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Binary search down one side of the tree",
        "Hash map of node → depth, filled by nested loops",
        "Recursive DFS: 1 + the deeper of the two subtrees",
        "Always follow the left child and count the steps",
      ],
      answer: 2,
      explain:
        "A tree's depth is defined by its subtrees: one for this node plus whichever child goes deeper. That is a depth-first recursion with the empty tree as the base case. Following only one side misses deeper branches on the other.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: [
        "O(n) time, O(h) space where h is the tree's height",
        "O(log n) time, O(1) space",
        "O(n²) time, O(n) space",
        "O(n log n) time, O(log n) space",
      ],
      answer: 0,
      explain:
        "Every node is visited once: O(n). The call stack holds one frame per level of the current path, so O(h). That is O(log n) for a balanced tree and O(n) for a tree shaped like a linked list.",
    },
  ],
  method: "maxDepth",
  params: [{ name: "root", kind: "tree" }],
  solution: `def maxDepth(self, root):
    return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right)) if root else 0`,
  captions: [
    { label: "RECURSE", text: "An empty tree is 0 deep. Otherwise count this node plus the deeper of its left and right subtrees." },
  ],
  visual: [
    { line: 0, note: "Start at the root. Its depth is 1 + max(left, right), so ask both children first", tree: { nodes: tree, hi: [0] } },
    { line: 0, note: "9 has no children. Both sides are empty (0), so 1 + max(0, 0) = 1", tree: { nodes: tree, hi: [1] }, vars: { "depth(9)": "1" } },
    { line: 0, note: "20 has to wait for its own children", tree: { nodes: tree, hi: [2] }, vars: { "depth(9)": "1" } },
    { line: 0, note: "15 is a leaf: 1", tree: { nodes: tree, hi: [5] }, vars: { "depth(9)": "1", "depth(15)": "1" } },
    { line: 0, note: "7 is a leaf: 1", tree: { nodes: tree, hi: [6] }, vars: { "depth(9)": "1", "depth(15)": "1", "depth(7)": "1" } },
    { line: 0, note: "Back at 20: 1 + max(1, 1) = 2", tree: { nodes: tree, hi: [2, 5, 6] }, vars: { "depth(9)": "1", "depth(20)": "2" } },
    { line: 0, note: "Back at the root: 1 + max(1, 2) = 3", tree: { nodes: tree, hi: [0, 2, 5] }, vars: { "depth(9)": "1", "depth(20)": "2", return: "3" } },
  ],
  tests: {
    visible: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2, label: "right child only" },
      { args: [[]], expected: 0, label: "empty tree" },
    ],
    hidden: [
      { args: [[1]], expected: 1, label: "single node" },
      { args: [[1, 2, null, 3, null, 4, null, 5]], expected: 5, label: "left-only chain" },
      { args: [[1, 2, 3, 4, null, null, null, 5]], expected: 4, label: "one long branch on the left" },
      { args: [[-1, -1, -1, null, -1]], expected: 3, label: "negative and repeated values" },
      { args: [rightChain50], expected: 50, label: "right-only chain of 50" },
      { args: [full127], expected: 7, label: "full tree, 127 nodes" },
    ],
  },
  hints: [
    "Suppose someone hands you the depth of the left subtree and the depth of the right subtree. How do you get the depth of the whole tree?",
    "Take the larger of the two and add 1 for the node you're standing on.",
    "The recursion needs somewhere to stop. What is the depth of a tree with no nodes at all?",
  ],
  followUps: [
    {
      q: "Can you do it without recursion?",
      a: "BFS with a queue: process the tree one level at a time and count the levels. Or DFS with an explicit stack of (node, depth) pairs, tracking the largest depth seen. Both are O(n) time.",
    },
    {
      q: "When does the recursive version get into trouble?",
      a: "On a very deep, lopsided tree. Every level is a stack frame, and Python's default recursion limit is about 1000. The iterative versions don't have that ceiling.",
    },
    {
      q: "Can you do it in O(1) space?",
      a: "Not with the usual tools: recursion and stack DFS use O(h), BFS uses O(width). Morris traversal reaches O(1) by temporarily rewiring pointers, but it's rarely expected in an interview.",
    },
  ],
  edgeCases: [
    { input: "root = []", breaks: true, why: "root is None. Reading root.left without checking first raises AttributeError." },
    { input: "root = [1, null, 2]", breaks: true, why: "Code that only walks left, or stops when the left child is missing, reports 1 instead of 2." },
    { input: "root = [1, 2, 3, 4, null, null, null, 5]", breaks: true, why: "Estimating depth from the node count as if the tree were balanced gives 3. The real depth is 4." },
    { input: "root = [1]", breaks: false, why: "Both children are empty: 1 + max(0, 0) = 1." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    neetcode: "https://www.youtube.com/watch?v=hTM3phVI6YQ",
  },
});
