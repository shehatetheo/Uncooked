import { defineProblem } from "@/lib/content/types";

const nodes300 = Array.from({ length: 300 }, (_, i) => i);

export default defineProblem({
  id: "reverse-linked-list",
  title: "Reverse Linked List",
  difficulty: "easy",
  pattern: "linked-list",
  tags: ["core"],
  statement: `You get the head of a singly linked list. Each node holds a value and a pointer to the next node, and the last node points to nothing.

Reverse the list so every pointer faces the other way, and return the new head (the node that used to be last). An empty list stays empty.`,
  examples: [
    { input: "head = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" },
    { input: "head = []", output: "[]", note: "no nodes, so head is None" },
  ],
  constraints: ["0 ≤ number of nodes ≤ 5000", "-5000 ≤ node.val ≤ 5000"],
  brief: {
    what: "You're given the first node (the head) of a chain of nodes, where each node holds a value and points to the next one, and the last node points to nothing. Turn the chain around so every link points the other way, and return the node that used to be last, which is now the new head.",
    example: "The chain 1 → 2 → 3 → 4 → 5 becomes 5 → 4 → 3 → 2 → 1: node 5 is now the head and node 1 points to nothing.",
    watch: "An empty chain (head is None) should come back as None, and a single node should come back unchanged.",
  },
  myWords:
    "Flip each arrow: point current back to prev, move prev and head forward. Python evaluates the right side first, so the one-line swap is safe.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a list[int], return a new list with the values in reverse order",
        "Take the head node of a linked list, return the head of the same list with every pointer reversed",
        "Take the head node of a linked list, return the value of its last node",
        "Take the head node of a linked list, return True if it reads the same in both directions",
      ],
      answer: 1,
      explain:
        "Input is a ListNode (or None for an empty list), not a Python list. Output is a ListNode too: the old tail, which becomes the head once every next pointer is flipped.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Walk the list once, pointing each node back at the one before it",
        "Copy the values into an array, reverse it, build a new list",
        "Hash map from each node to its predecessor",
        "Fast and slow pointers to find the middle, then swap the halves",
      ],
      answer: 0,
      explain:
        "Two references are enough: prev and the current node. One pass flips each next pointer in place. Copying into an array works, but it costs O(n) extra space for no benefit.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n²) time, O(1) space", "O(log n) time, O(1) space", "O(n) time, O(1) space"],
      answer: 3,
      explain:
        "Each node is visited once: O(n). The loop keeps two pointers however long the list is: O(1). The recursive version is O(n) space because of the call stack.",
    },
  ],
  method: "reverseList",
  params: [{ name: "head", kind: "list" }],
  returns: "list",
  solution: `def reverseList(self, head):
    prev = None
    while head: head.next, prev, head = prev, head, head.next
    return prev`,
  captions: [
    { label: "INIT", text: "prev is the part that's already reversed. It starts out empty." },
    { label: "FLIP", text: "While nodes remain: point this node back at prev, then step prev and head forward, all in one assignment." },
    { label: "RETURN", text: "head ran off the end, so prev is the old tail: the new head." },
  ],
  visual: [
    { line: 0, note: "Nothing reversed yet", arrays: [{ name: "remaining", values: [1, 2, 3, 4, 5], link: "next", pointers: { head: 0 } }], vars: { prev: "None" } },
    {
      line: 1,
      note: "1 now points at None. prev = 1, head = 2",
      arrays: [
        { name: "reversed", values: [1], link: "next", pointers: { prev: 0 } },
        { name: "remaining", values: [2, 3, 4, 5], link: "next", pointers: { head: 0 } },
      ],
    },
    {
      line: 1,
      note: "2 now points back at 1. prev = 2, head = 3",
      arrays: [
        { name: "reversed", values: [2, 1], link: "next", pointers: { prev: 0 } },
        { name: "remaining", values: [3, 4, 5], link: "next", pointers: { head: 0 } },
      ],
    },
    {
      line: 1,
      note: "3 now points back at 2. prev = 3, head = 4",
      arrays: [
        { name: "reversed", values: [3, 2, 1], link: "next", pointers: { prev: 0 } },
        { name: "remaining", values: [4, 5], link: "next", pointers: { head: 0 } },
      ],
    },
    {
      line: 1,
      note: "4 now points back at 3. prev = 4, head = 5",
      arrays: [
        { name: "reversed", values: [4, 3, 2, 1], link: "next", pointers: { prev: 0 } },
        { name: "remaining", values: [5], link: "next", pointers: { head: 0 } },
      ],
    },
    {
      line: 1,
      note: "5 now points back at 4. head.next was None, so head is None and the loop ends",
      arrays: [{ name: "reversed", values: [5, 4, 3, 2, 1], link: "next", pointers: { prev: 0 } }],
      vars: { head: "None" },
    },
    {
      line: 2,
      note: "prev is the new head",
      arrays: [{ name: "reversed", values: [5, 4, 3, 2, 1], link: "next", pointers: { prev: 0 }, hi: [0] }],
      vars: { return: "[5, 4, 3, 2, 1]" },
    },
  ],
  tests: {
    visible: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1], label: "two nodes" },
      { args: [[]], expected: [], label: "empty list" },
    ],
    hidden: [
      { args: [[7]], expected: [7], label: "single node" },
      { args: [[1, 1, 2, 2]], expected: [2, 2, 1, 1], label: "duplicate values" },
      { args: [[-3, 0, -1]], expected: [-1, 0, -3], label: "negatives and zero" },
      { args: [[1, 2, 3]], expected: [3, 2, 1], label: "odd length" },
      { args: [nodes300], expected: [...nodes300].reverse(), label: "300 nodes" },
    ],
  },
  hints: [
    "Each node's next pointer has to end up aimed at the node that used to come before it. What do you need to remember as you walk the list?",
    "Keep prev (starting as None) alongside the current node. Before you overwrite current.next, make sure you can still reach the rest of the list.",
    "Each step does four things: save the next node, point the current node back at prev, move prev onto the current node, move on to the saved node. When there's no current node left, prev is the answer.",
  ],
  followUps: [
    {
      q: "Can you do it recursively?",
      a: "Yes. Reverse everything after head, then set head.next.next = head and head.next = None, and pass the new head back up. O(n) time, but O(n) space for the call stack.",
    },
    {
      q: "Why is the one-line assignment safe?",
      a: "Python evaluates the whole right side first (prev, head, head.next) and only then assigns left to right. So the old head.next is read before it gets overwritten.",
    },
    {
      q: "What's the brute force and why is yours better?",
      a: "Copy the values into an array and build a new list backwards: O(n) time and O(n) extra space. Re-pointing in place needs O(1) space and creates no nodes.",
    },
  ],
  edgeCases: [
    { input: "head = []", breaks: true, why: "head is None. Touching head.next before checking head raises AttributeError." },
    { input: "head = [1, 2]", breaks: true, why: "Overwrite head.next before saving it and node 2 is unreachable. You return just [1]." },
    { input: "head = [1, 2, 3]", breaks: true, why: "If prev starts as anything but None, or the old head keeps its next, 1 and 2 point at each other and the list becomes a cycle." },
    { input: "head = [7]", breaks: false, why: "One pass: 7 points at None, as it already did, and is returned." },
  ],
  links: {
    leetcode: "https://leetcode.com/problems/reverse-linked-list/",
    neetcode: "https://www.youtube.com/watch?v=G0_I-ZF0S38",
  },
});
