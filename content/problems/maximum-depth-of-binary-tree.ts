import { python } from "@/lib/types";

export default python({
  id: "maximum-depth-of-binary-tree",
  title: "Maximum Depth of Binary Tree",
  difficulty: "Easy",
  tags: ["tree", "dfs", "recursion"],
  statement: `You get the root of a binary tree. Each node has a value, a left child and a right child, and either child can be missing.

Return the depth of the tree: the number of nodes on the longest path from the root straight down to a leaf. A leaf is a node with no children.

An empty tree has depth 0, and a tree with only a root has depth 1.`,
  examples: [
    { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3", note: "The longest path is 3, then 20, then 15 (or 7): three nodes." },
    { input: "root = [1, null, 2]", output: "2", note: "The root has only a right child." },
    { input: "root = []", output: "0", note: "No nodes at all." },
  ],
  constraints: ["0 ≤ number of nodes ≤ 10⁴", "-100 ≤ node value ≤ 100"],
  signature: "def maxDepth(self, root: Optional[TreeNode]) -> int:",
  method: "maxDepth",
  params: [{ name: "root", kind: "tree" }],
  solution: [
    "if not root:",
    "    return 0",
    "return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))",
  ],
  captions: [
    "Base case: we walked off the tree, past a leaf or into an empty tree.",
    "An empty spot adds no depth.",
    "This node counts as one level, plus whichever side below it goes deeper.",
  ],
  tests: {
    visible: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2 },
      { args: [[]], expected: 0 },
    ],
    hidden: [
      { args: [[1]], expected: 1 },
      { args: [[1, 2, null, 3, null, 4, null, 5]], expected: 5 },
      { args: [[1, 2, 3, 4, null, null, null, 5]], expected: 4 },
      { args: [[-1, -1, -1, null, -1]], expected: 3 },
      { args: [[0, 0, 0, 0, 0, 0, 0]], expected: 3 },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]], expected: 4 },
    ],
  },
  hints: [
    "If you already knew the depth of the left subtree and the depth of the right subtree, what would the depth of the whole tree be?",
    "That question has the same shape at every node, so recursion fits. What should the function return when the node is missing?",
    "Return 0 for a missing node, otherwise 1 plus the larger of the depths of the left and right subtrees.",
  ],
  followUps: [
    "Can you do it without recursion? Which data structure would you use, and what is the space cost?",
    "How would you find the minimum depth instead, the shortest path from the root down to a leaf?",
  ],
  time: "O(n)",
  space: "O(h)",
  link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
});
