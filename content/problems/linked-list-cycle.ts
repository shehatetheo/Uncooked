import { python } from "@/lib/types";

export default python({
  id: "linked-list-cycle",
  title: "Linked List Cycle",
  difficulty: "Easy",
  tags: ["linked list", "two pointers"],
  statement: `You get the head of a linked list. Return True if the list has a cycle, and False if it doesn't.

A list has a cycle when following next pointers eventually brings you back to a node you already visited, so you'd walk forever.

In the tests, pos is the index of the node that the last node points back to. pos = -1 means there is no cycle. Your function only receives head, not pos.`,
  examples: [
    { input: "head = [3, 2, 0, -4], pos = 1", output: "True", note: "The last node points back to the node at index 1." },
    { input: "head = [1], pos = -1", output: "False", note: "One node pointing nowhere." },
  ],
  constraints: ["0 ≤ number of nodes ≤ 10⁴", "pos is -1 or a valid index"],
  signature: "def hasCycle(self, head: Optional[ListNode]) -> bool:",
  method: "hasCycle",
  params: [{ name: "head", kind: "cycle" }],
  solution: [
    "slow = fast = head",
    "while fast and fast.next:",
    "    slow = slow.next",
    "    fast = fast.next.next",
    "    if slow is fast:",
    "        return True",
    "return False",
  ],
  captions: [
    "Two pointers start at the head.",
    "Keep going while the fast one can still take two steps.",
    "Slow moves one node.",
    "Fast moves two nodes.",
    "If they land on the same node, fast has lapped slow.",
    "That can only happen inside a cycle.",
    "Fast reached the end, so the list stops: no cycle.",
  ],
  tests: {
    visible: [
      { args: [[[3, 2, 0, -4], 1]], expected: true },
      { args: [[[1, 2], 0]], expected: true },
      { args: [[[1], -1]], expected: false },
    ],
    hidden: [
      { args: [[[], -1]], expected: false },
      { args: [[[1], 0]], expected: true },
      { args: [[[1, 2, 3, 4, 5], -1]], expected: false },
      { args: [[[1, 1, 1, 1], -1]], expected: false },
      { args: [[[1, 2, 3, 4, 5, 6], 5]], expected: true },
    ],
  },
  hints: [
    "The simple version remembers every node you've visited. What does that cost in memory?",
    "Think of two runners on a track, one faster than the other. What happens if the track is a loop?",
    "Move one pointer one step and another two steps. If they ever meet, there's a cycle. If the fast one hits the end, there isn't.",
  ],
  followUps: ["Why compare the nodes themselves and not their values?", "How would you find the node where the cycle begins?"],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/linked-list-cycle/",
});
