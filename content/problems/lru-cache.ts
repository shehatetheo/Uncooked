import { python } from "@/lib/types";

export default python({
  id: "lru-cache",
  title: "LRU Cache",
  difficulty: "Medium",
  tags: ["design", "hash map", "linked list"],
  statement: `Build a cache that holds at most capacity key-value pairs. When it's full and a new key arrives, it throws out the pair that was used least recently.

LRUCache(capacity) creates the cache.

get(key) returns the value for the key, or -1 if the key isn't there. Reading a key counts as using it.

put(key, value) adds the pair, or updates the value if the key already exists. Writing a key counts as using it. If adding a new key pushes the cache over capacity, remove the least recently used key.

Both get and put should run in O(1) time on average.

The tests use an operation list: the first line is the method names in order, the second is the arguments for each call, and the expected output is what each call returns (null for the constructor and for put).`,
  examples: [
    {
      input: `["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]`,
      output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
      note: "Capacity 2. Reading key 1 makes key 2 the oldest, so adding key 3 removes key 2. Adding key 4 then removes key 1.",
    },
  ],
  constraints: ["1 ≤ capacity ≤ 3000", "0 ≤ key ≤ 10⁴", "Up to 2·10⁵ calls"],
  signature: "class LRUCache:",
  method: "LRUCache",
  params: [{ name: "operations" }, { name: "arguments" }],
  design: {
    className: "LRUCache",
    starter: `class LRUCache:
    def __init__(self, capacity: int):
        

    def get(self, key: int) -> int:
        

    def put(self, key: int, value: int) -> None:
        
`,
  },
  solution: [
    "class LRUCache:",
    "    def __init__(self, capacity: int):",
    "        self.cap = capacity",
    "        self.data = OrderedDict()",
    "",
    "    def get(self, key: int) -> int:",
    "        if key not in self.data:",
    "            return -1",
    "        self.data.move_to_end(key)",
    "        return self.data[key]",
    "",
    "    def put(self, key: int, value: int) -> None:",
    "        self.data[key] = value",
    "        self.data.move_to_end(key)",
    "        if len(self.data) > self.cap:",
    "            self.data.popitem(last=False)",
  ],
  captions: [
    "The class the tests will create and call.",
    "The constructor gets the capacity.",
    "Remember how many pairs we're allowed to hold.",
    "An OrderedDict is a dictionary that also remembers order. We keep the oldest key first and the newest last.",
    "",
    "get: read a key.",
    "A missing key",
    "returns -1, as the problem says.",
    "Reading counts as using, so move this key to the newest end.",
    "Then hand back its value.",
    "",
    "put: add or update a key.",
    "Store the value. This also covers updating an existing key.",
    "Writing counts as using, so move it to the newest end.",
    "If that put us over capacity,",
    "drop the first item, which is the least recently used one.",
  ],
  tests: {
    visible: [
      {
        args: [
          ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"],
          [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        ],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      { args: [["LRUCache", "get", "put", "get"], [[1], [5], [5, 50], [5]]], expected: [null, -1, null, 50] },
    ],
    hidden: [
      { args: [["LRUCache", "put", "put", "get", "get"], [[1], [2, 1], [3, 2], [2], [3]]], expected: [null, null, null, -1, 2] },
      { args: [["LRUCache", "put", "put", "put", "get", "get"], [[2], [1, 1], [2, 2], [1, 10], [1], [2]]], expected: [null, null, null, null, 10, 2] },
      { args: [["LRUCache", "put", "put", "put", "put", "get", "get"], [[2], [2, 1], [1, 1], [2, 3], [4, 1], [1], [2]]], expected: [null, null, null, null, null, -1, 3] },
      { args: [["LRUCache", "put", "get", "put", "get", "get"], [[2], [1, 0], [1], [2, 0], [1], [2]]], expected: [null, null, 0, null, 0, 0] },
      {
        args: [
          ["LRUCache", "put", "put", "put", "get", "put", "get", "get", "get", "get"],
          [[3], [1, 1], [2, 2], [3, 3], [1], [4, 4], [2], [1], [3], [4]],
        ],
        expected: [null, null, null, null, 1, null, -1, 1, 3, 4],
      },
    ],
  },
  hints: [
    "You need two things at once: fast lookup by key, and a way to know which key was used longest ago.",
    "A dictionary gives O(1) lookup. What structure lets you move an item to the 'most recent' end and remove from the 'oldest' end in O(1)?",
    "Python's OrderedDict does both: move_to_end(key) marks a key as newest, and popitem(last=False) removes the oldest.",
  ],
  followUps: ["How would you build this without OrderedDict? Which two data structures would you combine, and why a doubly linked list?", "What changes if several threads use the cache at the same time?"],
  time: "O(1) per call",
  space: "O(capacity)",
  link: "https://leetcode.com/problems/lru-cache/",
});
