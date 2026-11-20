import { python } from "@/lib/types";

export default python({
  id: "reverse-linked-list",
  title: "Reverse Linked List",
  difficulty: "Easy",
  tags: ["linked list"],
  statement: `You get the head of a singly linked list. Reverse the list and return the new head.

Each node has a value and a pointer to the next node. After reversing, the last node becomes the first, and every pointer faces the other way.`,
  examples: [
    { input: "head = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" },
    { input: "head = []", output: "[]", note: "An empty list stays empty." },
  ],
  constraints: ["0 ≤ number of nodes ≤ 5000", "-5000 ≤ node value ≤ 5000"],
  signature: "def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:",
  method: "reverseList",
  params: [{ name: "head", kind: "list" }],
  returns: "list",
  solution: [
    "prev = None",
    "while head:",
    "    nxt = head.next",
    "    head.next = prev",
    "    prev = head",
    "    head = nxt",
    "return prev",
  ],
  captions: [
    "prev is the already-reversed part. It starts empty.",
    "Walk the list until we fall off the end.",
    "Save the next node first, because we're about to overwrite the pointer.",
    "Flip this node's pointer to face backwards.",
    "The reversed part now ends at this node.",
    "Step forward using the node we saved.",
    "head is None now; prev is the old last node, which is the new head.",
  ],
  tests: {
    visible: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
    ],
    hidden: [
      { args: [[7]], expected: [7] },
      { args: [[1, 1, 2, 2]], expected: [2, 2, 1, 1] },
      { args: [[-3, 0, 3]], expected: [3, 0, -3] },
      { args: [[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    ],
  },
  hints: [
    "If you change a node's next pointer, how do you still get to the rest of the list?",
    "Keep three things as you walk: the previous node, the current node, and the next node.",
    "Save next, point current back at previous, then move previous and current one step forward.",
  ],
  followUps: ["Can you do it recursively? What's the space cost of that version?", "How would you reverse only the part between positions left and right?"],
  time: "O(n)",
  space: "O(1)",
  link: "https://leetcode.com/problems/reverse-linked-list/",
});
