import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "py-list-vs-tuple",
    topic: "python",
    prompt: "What is the key difference between a Python list and a tuple?",
    choices: [
      "A tuple can only hold values of one type",
      "A list is ordered and a tuple is not",
      "A list is mutable and a tuple is immutable",
      "A tuple allows duplicates and a list does not",
    ],
    answer: 2,
    explain:
      "Both are ordered sequences, but a tuple cannot be changed after it is created. That immutability makes a tuple hashable (when its contents are), so it can be a dict key or a set member.",
  },
  {
    id: "py-tuple-as-dict-key",
    topic: "python",
    prompt: "Why can (1, 2) be a dictionary key when [1, 2] cannot?",
    choices: [
      "Keys must be hashable, and a mutable list is not",
      "Lists take too much memory to be stored as keys",
      "Dictionary keys are limited to strings and tuples",
      "Tuples are compared with is, lists with ==",
    ],
    answer: 0,
    explain:
      "A dict finds a key through its hash, which must never change. A list could be modified after insertion, so Python makes lists unhashable and raises TypeError if you try.",
  },
  {
    id: "py-dict-lookup",
    topic: "python",
    prompt: "What is the average time complexity of looking up a key in a dict, and why?",
    choices: [
      "O(log n), because keys are kept in sorted order",
      "O(1), because the key is hashed to find its slot",
      "O(n), because it checks each key in turn",
      "O(1), because dicts have a fixed maximum size",
    ],
    answer: 1,
    explain:
      "A dict is a hash table: hash(key) points almost directly at the right slot, so lookup, insert and delete are O(1) on average. The worst case is O(n) with heavy collisions, which is rare.",
  },
  {
    id: "py-set-membership",
    topic: "python",
    prompt: "You must check membership a million times against 100,000 ids. Why store the ids in a set rather than a list?",
    choices: [
      "A set uses less memory than a list",
      "A set keeps the ids sorted for binary search",
      "A set preserves the order the ids were added",
      "Membership is O(1) on average, not O(n)",
    ],
    answer: 3,
    explain:
      "A set is a hash table, so membership is one hash lookup; a list has to be scanned element by element. Turning a list into a set before repeated lookups is one of the most common interview optimizations.",
  },
  {
    id: "py-is-vs-eq",
    topic: "python",
    prompt: "a = [1, 2]\nb = [1, 2]\nWhat are a == b and a is b?",
    choices: ["True and True", "False and False", "True and False", "False and True"],
    answer: 2,
    explain:
      "== compares values, while is checks whether both names refer to the same object in memory. Two separately built lists are equal but not identical. Reserve is for None checks, as in x is None.",
  },
  {
    id: "py-slice-basic",
    topic: "python",
    prompt: "nums = [10, 20, 30, 40, 50]\nWhat is nums[1:3]?",
    choices: ["[20, 30]", "[20, 30, 40]", "[10, 20, 30]", "[10, 20]"],
    answer: 0,
    explain:
      "A slice starts at the first index and stops before the second, so indices 1 and 2 are taken. It returns a new list and never raises IndexError for out-of-range bounds.",
  },
  {
    id: "py-slice-reverse",
    topic: "python",
    prompt: "What does s[::-1] do for a string s?",
    choices: [
      "Removes the last character",
      "Returns only the last character",
      "Raises an error because the step is negative",
      "Returns a reversed copy of s",
    ],
    answer: 3,
    explain:
      "A slice is start:stop:step, and a step of -1 walks backward through the whole sequence, building a reversed copy in O(n). The original string is unchanged.",
  },
  {
    id: "py-sorted-vs-sort",
    topic: "python",
    prompt: "What is the difference between sorted(nums) and nums.sort()?",
    choices: [
      "sorted() only accepts lists, while .sort() accepts any iterable",
      "sorted() returns a new list, while .sort() works in place",
      "sorted() runs in O(n log n), while .sort() runs in O(n^2)",
      "There is no difference; one is an alias of the other",
    ],
    answer: 1,
    explain:
      "sorted() takes any iterable and leaves the original alone; list.sort() mutates the list. A classic bug is nums = nums.sort(), which sets nums to None.",
  },
  {
    id: "py-counter",
    topic: "python",
    prompt: 'from collections import Counter\nc = Counter("banana")\nWhat is c["a"]?',
    choices: ["1", "2", "3", "KeyError"],
    answer: 2,
    explain:
      "Counter is a dict subclass that counts hashable items in one O(n) pass: here a is 3, n is 2 and b is 1. A missing key returns 0 instead of raising KeyError.",
  },
  {
    id: "py-string-immutable",
    topic: "python",
    prompt: 's = "cat"\ns[0] = "b"\nWhat happens?',
    choices: [
      "TypeError, because strings are immutable",
      's becomes "bat"',
      's becomes "bcat"',
      "IndexError, because strings cannot be indexed",
    ],
    answer: 0,
    explain:
      'Strings cannot be changed in place; anything that looks like a change builds a new string. To get "bat" you write "b" + s[1:].',
  },
  {
    id: "py-join-vs-concat",
    topic: "python",
    prompt: 'Why is "".join(parts) preferred over result += part inside a loop?',
    choices: [
      "+= is not defined for strings",
      "join sorts the pieces as it combines them",
      "join edits the first string in place, with no copying",
      "+= can copy the whole string each time, so O(n^2)",
    ],
    answer: 3,
    explain:
      "Strings are immutable, so each += may build a brand-new string and copy everything accumulated so far. join works out the final size once and copies each piece once, which is O(n) in the total length.",
  },
  {
    id: "py-enumerate",
    topic: "python",
    prompt: 'What does for i, ch in enumerate("abc") give you on each iteration?',
    choices: [
      "The character and its ASCII code",
      "The index and the character at that index",
      "Two adjacent characters",
      "The character and the remaining length",
    ],
    answer: 1,
    explain:
      "enumerate yields (index, item) pairs starting from 0, so here (0, a), (1, b), (2, c). It replaces the clumsier for i in range(len(s)).",
  },
  {
    id: "py-zip",
    topic: "python",
    prompt: 'What is list(zip([1, 2, 3], "ab"))?',
    choices: [
      '[(1, "a"), (2, "b"), (3, None)]',
      "An error, because the lengths differ",
      '[(1, "a"), (2, "b")]',
      '[1, "a", 2, "b", 3]',
    ],
    answer: 2,
    explain:
      "zip pairs items by position and stops at the shortest input, so the 3 is silently dropped. It is the idiomatic way to walk two sequences in parallel.",
  },
  {
    id: "py-defaultdict",
    topic: "python",
    prompt:
      'from collections import defaultdict\ngroups = defaultdict(list)\ngroups["x"].append(1)\nWhy does this not raise KeyError?',
    choices: [
      "A missing key is created with list() as its value",
      "append is skipped when the key is missing",
      "defaultdict pre-fills every possible key",
      "The KeyError is raised but then caught and silenced internally",
    ],
    answer: 0,
    explain:
      "defaultdict calls its factory (here list) the first time a missing key is accessed and stores the result. It removes the if key not in d boilerplate when grouping or counting.",
  },
  {
    id: "py-mutable-default-arg",
    topic: "python",
    prompt:
      "def add(x, items=[]):\n    items.append(x)\n    return items\n\nadd(1)\nprint(add(2))\nWhat is printed?",
    choices: ["[2]", "[1]", "A TypeError", "[1, 2]"],
    answer: 3,
    explain:
      "Default values are evaluated once, when the function is defined, so every call shares the same list. The fix is items=None and creating a new list inside the function.",
  },
  {
    id: "py-list-comprehension",
    topic: "python",
    prompt: "What is [x * x for x in range(5) if x % 2 == 0]?",
    choices: ["[0, 1, 4, 9, 16]", "[0, 4, 16]", "[4, 16]", "[0, 2, 4]"],
    answer: 1,
    explain:
      "range(5) gives 0 to 4, the if keeps the even values 0, 2 and 4, and each is squared. Read a comprehension as: expression, for each item, if condition.",
  },
  {
    id: "py-truthiness",
    topic: "python",
    prompt: "Which of these values is truthy in Python?",
    choices: ['""', "0.0", "[0]", "{}"],
    answer: 2,
    explain:
      "Falsy values are None, False, zero of any numeric type, and empty strings or containers. [0] is a list with one element, so it is non-empty and truthy. That is why if not nums: is the idiomatic empty check.",
  },
  {
    id: "py-dict-get",
    topic: "python",
    prompt: 'd = {"a": 1}\nWhat is the difference between d["b"] and d.get("b", 0)?',
    choices: [
      'd["b"] raises KeyError, d.get("b", 0) returns 0',
      "Both return None",
      'd["b"] returns None, d.get("b", 0) raises KeyError',
      'd.get adds "b" to the dict, d["b"] does not',
    ],
    answer: 0,
    explain:
      "Square brackets raise KeyError for a missing key; get returns the default (None if you give none) and does not modify the dict. counts[ch] = counts.get(ch, 0) + 1 is a common counting idiom.",
  },
]);
