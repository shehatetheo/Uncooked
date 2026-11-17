import { defineProblem } from "@/lib/content/types";

export default defineProblem({
  id: "container-log-check",
  title: "Container Log Check",
  difficulty: "easy",
  pattern: "stack",
  tags: ["made-up"],
  statement: `Let's say a warehouse robot packs containers inside containers, and writes a log line each time it opens or closes one. You get the log as a list of [action, name] pairs, where action is "open" or "close".

The log is valid if every close matches the most recently opened container that is still open, and nothing is left open at the end. Return True if the log is valid, False otherwise.`,
  examples: [
    { input: 'events = [["open", "crate"], ["open", "box"], ["close", "box"], ["close", "crate"]]', output: "True", note: "the box is closed before the crate around it" },
    { input: 'events = [["open", "crate"], ["open", "box"], ["close", "crate"], ["close", "box"]]', output: "False", note: "the crate is closed while the box inside is still open" },
    { input: 'events = [["open", "crate"]]', output: "False", note: "never closed" },
  ],
  constraints: ["0 ≤ len(events) ≤ 10⁴", 'action is always "open" or "close"', "The same container name can be opened more than once"],
  brief: {
    what: "A robot packs containers inside other containers and logs each \"open\" or \"close\" along with the container's name. Return True if every close names the container that was opened most recently and is still open, and nothing is left open at the end; otherwise return False.",
    example: "In the first log, the crate is opened, then the box inside it; the box is closed first and then the crate, so every close matches and the answer is True.",
    watch: "An empty log is valid, a close when nothing is open makes the log invalid, and the same name can be opened more than once, even inside itself.",
  },
  myWords:
    "The container that must be closed next is always the one opened last, so keep the open ones on a stack. Push on open. On close, the top of the stack has to be that same name; if the stack is empty or the name differs, the log is invalid. At the end the stack must be empty.",
  time: "O(n)",
  space: "O(n)",
  understand: [
    {
      prompt: "What is it actually asking?",
      choices: [
        "Take a list of [str, str] pairs, return the names of containers left open",
        "Take a list of [str, str] pairs, return True if the number of opens equals the number of closes",
        "Take a list of [str, str] pairs, return True if every close matches the latest unclosed open and nothing stays open",
        "Take a list of [str, str] pairs, return the deepest nesting level",
      ],
      answer: 2,
      explain:
        "Input is a list of [action, name] pairs of str, output is a bool. Equal counts are not enough: the closes have to come in the reverse order of the opens.",
    },
    {
      prompt: "Which pattern and approach?",
      choices: [
        "Hash map counting opens and closes per name",
        "Stack of open containers: push on open, pop and compare on close",
        "Two pointers from both ends of the log",
        "Sort the events by name",
      ],
      answer: 1,
      explain:
        "Last opened, first closed is exactly what a stack models. Counting per name can't detect a crate being closed while a box inside it is still open.",
    },
    {
      prompt: "What's the optimal time and space complexity?",
      choices: ["O(n) time, O(n) space", "O(n) time, O(1) space", "O(n²) time, O(n) space", "O(n log n) time, O(n) space"],
      answer: 0,
      explain:
        "Each event is handled once with an O(1) push or pop: O(n). If the log is all opens, the stack holds n names: O(n) space.",
    },
  ],
  method: "validLog",
  params: [{ name: "events" }],
  solution: `def validLog(self, events):
    stack = []
    for action, name in events:
        if action == "open": stack.append(name)
        elif not stack or stack.pop() != name: return False
    return not stack`,
  captions: [
    { label: "INIT", text: "The stack holds containers that are currently open, most recent on top." },
    { label: "SCAN", text: "Read the log one event at a time, unpacking the action and the name." },
    { label: "OPEN", text: "An opened container goes on top of the stack." },
    { label: "CLOSE", text: "A close needs something open, and the top of the stack must be this container. Otherwise the log is invalid." },
    { label: "LEFTOVERS", text: "Valid only if nothing is still open at the end." },
  ],
  visual: [
    { line: 0, note: "nothing is open yet", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"] }], stack: { name: "stack", items: [] } },
    { line: 2, note: "open crate → push", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"], pointers: { event: 0 } }], stack: { name: "stack", items: ["crate"] } },
    { line: 2, note: "open box → push on top of crate", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"], pointers: { event: 1 } }], stack: { name: "stack", items: ["crate", "box"] } },
    { line: 3, note: "close box: the top is box, pop it", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"], pointers: { event: 2 } }], stack: { name: "stack", items: ["crate"] } },
    { line: 3, note: "close crate: the top is crate, pop it", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"], pointers: { event: 3 } }], stack: { name: "stack", items: [] } },
    { line: 4, note: "the stack is empty → True", arrays: [{ name: "events", values: ["open crate", "open box", "close box", "close crate"] }], stack: { name: "stack", items: [] }, vars: { return: "True" } },
  ],
  tests: {
    visible: [
      { args: [[["open", "crate"], ["open", "box"], ["close", "box"], ["close", "crate"]]], expected: true },
      { args: [[["open", "crate"], ["open", "box"], ["close", "crate"], ["close", "box"]]], expected: false, label: "closed in the wrong order" },
      { args: [[["open", "crate"]]], expected: false, label: "never closed" },
    ],
    hidden: [
      { args: [[]], expected: true, label: "empty log" },
      { args: [[["close", "box"]]], expected: false, label: "close with nothing open" },
      { args: [[["open", "a"], ["close", "a"], ["open", "b"], ["close", "b"]]], expected: true, label: "one after another, no nesting" },
      { args: [[["open", "a"], ["open", "a"], ["close", "a"], ["close", "a"]]], expected: true, label: "same name nested in itself" },
      { args: [[["open", "a"], ["close", "a"], ["close", "a"]]], expected: false, label: "one close too many" },
      { args: [[["open", "a"], ["open", "b"], ["close", "b"]]], expected: false, label: "outer container left open" },
      { args: [[["open", "a"], ["open", "b"], ["open", "c"], ["close", "c"], ["close", "b"], ["close", "a"]]], expected: true, label: "three levels deep" },
    ],
  },
  hints: [
    "When a close arrives, which container is the only one it is allowed to name?",
    "You need quick access to the most recently opened container that isn't closed yet. Which structure gives you the latest item first?",
    "There are three ways to fail: a close with nothing open, a close naming the wrong container, and containers still open when the log ends.",
  ],
  followUps: [
    {
      q: "Why isn't counting opens and closes per container enough?",
      a: "open crate, open box, close crate, close box has matching counts for both names but the order is wrong. Only a stack tracks which container must close next.",
    },
    {
      q: "Can you do it in O(1) space?",
      a: "Only if there is a single container type; then a depth counter that never goes negative is enough. With different names you have to remember the order of the open ones, so a stack is needed.",
    },
    {
      q: "How would you report where the log goes wrong?",
      a: "Enumerate the events and return the index of the first bad close, or store (name, index) on the stack so you can also report which open was never closed.",
    },
  ],
  edgeCases: [
    { input: 'events = [["close", "box"]]', breaks: true, why: "Popping from an empty stack raises IndexError. Check that the stack isn't empty first." },
    { input: 'events = [["open", "crate"]]', breaks: true, why: "Returning True after the loop ignores the crate still on the stack." },
    { input: 'events = [["open", "a"], ["open", "b"], ["close", "a"], ["close", "b"]]', breaks: true, why: "Counting opens and closes per name says valid. The order is wrong." },
    { input: "events = []", breaks: false, why: "Nothing opened, nothing left open: an empty stack means valid." },
  ],
  reveal:
    "This is Valid Parentheses with named containers instead of brackets: push on open, pop and compare on close, and the stack must be empty at the end.",
  remixOf: "valid-parentheses",
  links: {},
});
