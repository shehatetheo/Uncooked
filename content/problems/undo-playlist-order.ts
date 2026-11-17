import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "undo-playlist-order",
  title: "Undo the Playlist Flip",
  difficulty: "easy",
  pattern: "linked-list",
  tags: ["made-up"],
  statement: `Imagine a music app that stores a playlist as a singly linked list: each node holds a track id and a pointer to the next track. A user hit "flip order" by accident and now the playlist plays back to front.

You get the head of the flipped playlist. Put the tracks back in their original order by re-pointing the links, and return the new head.`,
  examples: [
    { input: "head = 5 → 4 → 3 → 2 → 1", output: "1 → 2 → 3 → 4 → 5" },
    { input: "head = 42 → 7", output: "7 → 42" },
  ],
  constraints: ["0 ≤ number of tracks ≤ 5000", "Each node has .val (the track id) and .next", "An empty playlist is head = None"],
  brief: {
    what: "You're given the first track of a playlist stored as a chain of nodes, where each node holds a track id and points to the next track. The playlist currently plays back to front; re-link the nodes so the tracks play in their original order, and return the new first track.",
    example: "The playlist 5 → 4 → 3 → 2 → 1 should come back as 1 → 2 → 3 → 4 → 5, with track 1 now first.",
    watch: "An empty playlist (head is None) should come back as None, and the same track id can appear more than once.",
  },
  myWords:
    "Undoing a flip is just flipping again, so this is reversing a linked list. Walk the list once and turn each arrow around: save the next node, point the current node back at the previous one, then step forward. When you run off the end, prev is the new head.",
  time: "O(n)",
  space: "O(1)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take the head ListNode, return the track ids as a Python list in reverse",
        "Take the head ListNode, return the head ListNode of the same list with every link reversed",
        "Take the head ListNode, return the last track id",
        "Take the head ListNode, return the list sorted by track id",
      ],
      answer: 1,
      explain:
        "Input is a ListNode (or None) and output is a ListNode: the head of the reversed chain. The ids happen to look sorted in the example, but you are reversing the order, not sorting.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Copy the values into an array, reverse it, build a new list",
        "Push every node on a stack, then pop them off",
        "Recursion that prints the nodes on the way back",
        "Three pointers (prev, current, next), flipping one link per step",
      ],
      answer: 3,
      explain:
        "Reversing each .next pointer as you walk needs only the previous node, the current node and a saved next node. The array and stack versions work but use O(n) extra memory.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space", "O(n log n) time, O(1) space"],
      answer: 2,
      explain: "Each node is visited once and gets one pointer changed: O(n). Only three references are kept no matter how long the playlist is: O(1).",
    },
  ],
  method: "restoreOrder",
  params: [{ name: "head", kind: "list" }],
  returns: "list",
  solution: `def restoreOrder(self, head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev`,
  captions: [
    { label: "INIT", text: "prev is the already-reversed part. Nothing is reversed yet, so it starts as None." },
    { label: "WALK", text: "Keep going while there is a current node." },
    { label: "SAVE", text: "Remember the rest of the list before the link to it is overwritten." },
    { label: "FLIP", text: "Point the current node backwards, at the reversed part." },
    { label: "STEP", text: "The current node is now the front of the reversed part; move on to the saved node." },
    { label: "NEW HEAD", text: "head ran off the end, and prev is the last node visited: the new first track." },
  ],
  visual: [
    { line: 0, note: "nothing reversed yet", arrays: [{ name: "head →", values: [5, 4, 3, 2, 1], link: "next", pointers: { head: 0 } }, { name: "prev →", values: [], link: "next" }], vars: { prev: "None" } },
    { line: 2, note: "save the rest: nxt is node 4", arrays: [{ name: "head →", values: [5, 4, 3, 2, 1], link: "next", pointers: { head: 0, nxt: 1 } }, { name: "prev →", values: [], link: "next" }], vars: { prev: "None" } },
    { line: 3, note: "point 5 back at prev (None): 5 is cut off from 4", arrays: [{ name: "head →", values: [5], link: "next", pointers: { head: 0 } }, { name: "nxt →", values: [4, 3, 2, 1], link: "next" }], vars: { prev: "None" } },
    { line: 4, note: "step: prev is 5, head is 4", arrays: [{ name: "head →", values: [4, 3, 2, 1], link: "next", pointers: { head: 0 } }, { name: "prev →", values: [5], link: "next" }] },
    { line: 4, note: "after the second pass: 4 now points at 5", arrays: [{ name: "head →", values: [3, 2, 1], link: "next", pointers: { head: 0 } }, { name: "prev →", values: [4, 5], link: "next" }] },
    { line: 4, note: "after the third pass", arrays: [{ name: "head →", values: [2, 1], link: "next", pointers: { head: 0 } }, { name: "prev →", values: [3, 4, 5], link: "next" }] },
    { line: 4, note: "after the fifth pass head is None", arrays: [{ name: "head →", values: [], link: "next" }, { name: "prev →", values: [1, 2, 3, 4, 5], link: "next" }], vars: { head: "None" } },
    { line: 5, note: "return prev, the new head", arrays: [{ name: "prev →", values: [1, 2, 3, 4, 5], link: "next", hi: [0] }], vars: { return: "1 → 2 → 3 → 4 → 5" } },
  ],
  tests: {
    visible: [
      { args: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { args: [[42, 7]], expected: [7, 42], label: "two tracks" },
      { args: [[9]], expected: [9], label: "single track" },
    ],
    hidden: [
      { args: [[]], expected: [], label: "empty playlist" },
      { args: [[6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6], label: "even number of tracks" },
      { args: [[-1, 0, 1]], expected: [1, 0, -1], label: "negative and zero ids" },
      { args: [[8, 8, 3]], expected: [3, 8, 8], label: "the same track twice" },
      { args: [[10, 300, 20, 100]], expected: [100, 20, 300, 10], label: "ids in no particular order" },
    ],
  },
  hints: [
    "Ignore the story: what operation turns a back-to-front list into a front-to-back one?",
    "You can only move forward through the list, so reverse the arrows instead of the values. Each node should end up pointing at the node that used to come before it.",
    "The moment you change a node's .next you lose the rest of the list, unless you saved it in a variable first.",
  ],
  followUps: [
    {
      q: "Can you do it recursively, and what does that cost?",
      a: "Yes: reverse the rest of the list, then make head.next.next = head and head.next = None. It's O(n) time but O(n) space for the call stack, and long lists can hit the recursion limit.",
    },
    {
      q: "What's the simplest wrong-but-working approach?",
      a: "Copy the values into a Python list, reverse it and rebuild the nodes. O(n) time and O(n) extra space, and it creates new nodes instead of re-linking the existing ones.",
    },
    {
      q: "What if only the tracks between positions a and b were flipped?",
      a: "Walk to the node before position a, reverse the next b − a + 1 links with the same loop, then reconnect the two ends. Still one pass and O(1) space.",
    },
  ],
  edgeCases: [
    { input: "head = None", breaks: true, why: "Reading head.next before checking for an empty list raises AttributeError." },
    { input: "head = 9", breaks: false, why: "One node: its next becomes None, which it already was, and it is returned." },
    { input: "head = 5 → 4 → 3", breaks: true, why: "Setting head.next = prev before saving head.next loses the rest of the list, and only [5] comes back." },
    { input: "head = 42 → 7", breaks: true, why: "Returning head instead of prev returns None, because head has run off the end." },
  ],
  reveal:
    "This is Reverse Linked List. Undoing a flip is the same operation as flipping: walk once with prev, current and next, turning each pointer around.",
  remixOf: "reverse-linked-list",
  links: {},
});
