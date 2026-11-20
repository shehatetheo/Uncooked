import { python } from "@/lib/types";

export default python({
  id: "binary-search-tree-to-greater-sum-tree",
  title: "Binary Search Tree to Greater Sum Tree",
  difficulty: "Medium",
  tags: ["tree", "bst", "dfs"],
  statement: `You get the root of a binary search tree whose values are all different. In a binary search tree, everything to the left of a node is smaller than the node and everything to the right is bigger.

Change every node so that its new value is its old value plus the sum of all old values in the tree that are bigger than it.

Return the root of the changed tree. The shape of the tree stays the same; only the values change.`,
  examples: [
    {
      input: "root = [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]",
      output: "[30, 36, 21, 36, 35, 26, 15, null, null, null, 33, null, null, null, 8]",
      note: "The root 4 becomes 4 + 5 + 6 + 7 + 8 = 30. The biggest value, 8, has nothing above it and stays 8.",
    },
    { input: "root = [0, null, 1]", output: "[1, null, 1]", note: "0 gains the 1 to its right. 1 is the biggest, so it stays." },
  ],
  constraints: ["1 ≤ number of nodes ≤ 100", "0 ≤ node value ≤ 100", "All values are different"],
  signature: "def bstToGst(self, root: Optional[TreeNode]) -> Optional[TreeNode]:",
  method: "bstToGst",
  params: [{ name: "root", kind: "tree" }],
  returns: "tree",
  solution: [
    "total = 0",
    "def visit(node):",
    "    nonlocal total",
    "    if node:",
    "        visit(node.right)",
    "        total += node.val",
    "        node.val = total",
    "        visit(node.left)",
    "visit(root)",
    "return root",
  ],
  captions: [
    "A running sum of every value visited so far.",
    "A helper that walks the tree from the biggest value down to the smallest.",
    "The helper changes total, so tell Python it belongs to the outer function.",
    "An empty spot has nothing to do. That ends the recursion.",
    "Go right first: everything there is bigger and must be counted before this node.",
    "Add this node's own value to the running sum.",
    "The sum is now this value plus all bigger ones, which is exactly the new value.",
    "Then go left, where every node is smaller and needs the sum we just built.",
    "Start the walk at the root.",
    "The nodes were changed in place, so the same root is the answer.",
  ],
  tests: {
    visible: [
      {
        args: [[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]],
        expected: [30, 36, 21, 36, 35, 26, 15, null, null, null, 33, null, null, null, 8],
      },
      { args: [[0, null, 1]], expected: [1, null, 1] },
      { args: [[1, 0, 2]], expected: [3, 3, 2] },
    ],
    hidden: [
      { args: [[5]], expected: [5] },
      { args: [[3, 2, 4, 1]], expected: [7, 9, 4, 10] },
      { args: [[1, null, 2, null, 3]], expected: [6, null, 5, null, 3] },
      { args: [[3, 2, null, 1]], expected: [3, 5, null, 6] },
      { args: [[10, 5, 15, null, 7, 12]], expected: [37, 49, 15, null, 44, 27] },
    ],
  },
  hints: [
    "In what order would you have to visit the nodes so that, when you reach one, you have already seen every bigger value?",
    "A normal in-order walk (left, node, right) visits a binary search tree from smallest to biggest. You want the opposite direction.",
    "Walk right, then the node, then left, while keeping a running sum; each node's new value is the running sum right after adding its own value.",
  ],
  followUps: [
    "The recursion uses stack space equal to the tree's height. How would you do the same walk with your own stack and a loop?",
    "What would you change if the tree could contain duplicate values?",
  ],
  time: "O(n)",
  space: "O(h)",
  link: "https://leetcode.com/problems/binary-search-tree-to-greater-sum-tree/",
});
