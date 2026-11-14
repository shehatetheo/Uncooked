import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "cx-big-o-meaning",
    topic: "complexity",
    prompt: "What does Big-O notation describe?",
    choices: [
      "The exact number of seconds an algorithm takes",
      "How running time or memory grows as the input grows",
      "The number of lines of code in a function",
      "The best-case speed of an algorithm on small inputs",
    ],
    answer: 1,
    explain:
      "Big-O gives an upper bound on growth rate, ignoring constants and lower-order terms, so 3n + 10 is O(n). In an interview, state time and space for your solution and say what n is.",
  },
  {
    id: "cx-list-append",
    topic: "complexity",
    prompt: "What is the time complexity of nums.append(x) on a Python list?",
    choices: ["O(n) every time", "O(log n)", "O(n log n)", "O(1) amortized"],
    answer: 3,
    explain:
      "A list is a dynamic array with spare capacity, so most appends just write into the next slot. Occasionally it must grow and copy everything, but averaged over many appends the cost per append is constant.",
  },
  {
    id: "cx-list-insert-front",
    topic: "complexity",
    prompt: "Why are nums.insert(0, x) and nums.pop(0) O(n) on a Python list?",
    choices: [
      "Every other element has to shift over",
      "The list has to be re-sorted afterward",
      "Python searches the list for the value first",
      "The list is rehashed whenever the front changes",
    ],
    answer: 0,
    explain:
      "A list is a contiguous array, so changing the front means moving all n elements. For fast operations at both ends use collections.deque, which is O(1) there.",
  },
  {
    id: "cx-list-membership",
    topic: "complexity",
    prompt: "What is the time complexity of x in nums when nums is an unsorted list of n items?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    answer: 2,
    explain:
      "Python has to compare x with the elements one by one, so the worst case scans the whole list. Convert to a set first if you need many membership checks.",
  },
  {
    id: "cx-dict-worst-case",
    topic: "complexity",
    prompt: "Dict and set lookups are O(1) on average. What is the worst case, and when does it happen?",
    choices: [
      "O(log n), when the dict grows very large",
      "O(n), when many keys collide in the hash table",
      "O(1) always; there is no worse case",
      "O(n^2), when the keys are long strings",
    ],
    answer: 1,
    explain:
      "If many keys land in the same slot, a lookup degrades toward checking them all. Good hash functions and resizing make that rare, so we quote O(1) average for get, insert and delete.",
  },
  {
    id: "cx-merge-sort",
    topic: "complexity",
    prompt: "What are the time and extra-space complexity of merge sort?",
    choices: [
      "O(n^2) time, O(1) space",
      "O(n log n) time, O(1) space",
      "O(n) time, O(n) space",
      "O(n log n) time, O(n) space",
    ],
    answer: 3,
    explain:
      "It halves the array about log n times and does O(n) merging work per level, in the best, average and worst case alike. The merge step needs a temporary array, hence O(n) extra space.",
  },
  {
    id: "cx-quicksort-worst",
    topic: "complexity",
    prompt: "What is quicksort's worst-case time complexity, and what triggers it?",
    choices: [
      "O(n^2), when pivots split very unevenly",
      "O(n log n), because it has no bad case",
      "O(n^2), whenever the array has an odd length",
      "O(2^n), when the array is in reverse order",
    ],
    answer: 0,
    explain:
      "Quicksort is O(n log n) on average, but if each pivot is the smallest or largest element (a first-element pivot on sorted input, for example) the recursion is n levels deep with O(n) work each. Random pivots make that unlikely.",
  },
  {
    id: "cx-timsort",
    topic: "complexity",
    prompt: "Which algorithm do Python's sorted() and list.sort() use?",
    choices: ["Quicksort", "Heapsort", "Timsort", "Bubble sort"],
    answer: 2,
    explain:
      "Timsort is a hybrid of merge sort and insertion sort that exploits runs that are already sorted. It is O(n log n) in the worst case, O(n) on already-sorted input, stable, and uses up to O(n) extra space.",
  },
  {
    id: "cx-stable-meaning",
    topic: "complexity",
    prompt: "What does it mean for a sorting algorithm to be stable?",
    choices: [
      "It never crashes on empty input",
      "Equal elements keep their original order",
      "It always takes the same time for the same n",
      "It sorts in place without extra memory",
    ],
    answer: 1,
    explain:
      "Stability matters when sorting by one field after another: sort by name, then stable-sort by department, and names stay alphabetical within each department. Python's sort is stable.",
  },
  {
    id: "cx-stable-which",
    topic: "complexity",
    prompt: "Which of these sorts is NOT stable in its usual implementation?",
    choices: ["Merge sort", "Insertion sort", "Timsort", "Quicksort"],
    answer: 3,
    explain:
      "Quicksort's partition step swaps elements across long distances, which can reorder equal keys. Merge sort, insertion sort and Timsort all preserve the order of equal elements.",
  },
  {
    id: "cx-binary-search-precondition",
    topic: "complexity",
    prompt: "What must be true of an array before you can binary search it?",
    choices: [
      "It must be sorted",
      "It must contain no duplicates",
      "Its length must be a power of two",
      "It must contain only integers",
    ],
    answer: 0,
    explain:
      "Binary search throws away half the range after comparing the target with the middle element, which only works if the data is ordered. On unsorted input you either pay O(n log n) to sort first or use a hash set.",
  },
  {
    id: "cx-binary-search-steps",
    topic: "complexity",
    prompt: "About how many comparisons does binary search need, at worst, on a sorted list of 1,000,000 items?",
    choices: ["1,000,000", "1,000", "20", "500,000"],
    answer: 2,
    explain:
      "Each comparison halves the remaining range, so the cost is O(log n), and log base 2 of a million is about 20. A linear scan would be O(n), up to a million comparisons.",
  },
  {
    id: "cx-comparison-sort-lower-bound",
    topic: "complexity",
    prompt: "Can a comparison-based sort beat O(n log n) in the worst case?",
    choices: [
      "Yes, quicksort is O(n) with a good pivot",
      "No, n log n comparisons is a proven lower bound",
      "Yes, any sort becomes O(n) when written in C",
      "No, because the proven lower bound is n^2",
    ],
    answer: 1,
    explain:
      "A sort that only compares elements must tell apart n factorial possible orderings, which takes on the order of n log n comparisons. Counting sort and radix sort can be linear only because they use the key values instead of comparisons.",
  },
  {
    id: "cx-recursion-space",
    topic: "complexity",
    prompt:
      "def total(n):\n    if n == 0:\n        return 0\n    return n + total(n - 1)\nWhat is the space complexity of total(n)?",
    choices: [
      "O(1), because it creates no lists",
      "O(log n), because n shrinks each call",
      "O(n), because n calls are stacked up",
      "O(n^2), because each call copies n",
    ],
    answer: 2,
    explain:
      "Each call waits for the next one, so n frames sit on the call stack at once: recursion depth is space. The same reasoning gives O(height) space for DFS on a tree, and very deep recursion in Python hits the recursion limit.",
  },
]);
