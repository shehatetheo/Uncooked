/**
 * Technical interview: the ten questions most likely to come up, covering
 * every pattern the super day needs (sorting, strings, hash maps, counting,
 * stacks, two pointers, SQL joins and aggregation) plus Big-O on each.
 *
 * Each rubric adds up to 100. A point's `detect` patterns are what the
 * browser listens for while you talk (all must match, case-insensitive); the
 * AI grader, when available, judges the same points with more nuance.
 */
export interface RubricPoint {
  id: string;
  label: string;
  max: number;
  /** Regex sources; every one must match the answer for the point to count. */
  detect: string[];
  /** Pop-up recommendation when this point is still missing. */
  tip: string;
}

export interface TechQuestion {
  id: string;
  title: string;
  kind: "code" | "sql";
  /** Problem id (coding) or SQL problem id; the ghost text and example code come from it. */
  ref: string;
  /** Why this one is likely. */
  why: string;
  /** What the interviewer says, out loud. */
  ask: string;
  rubric: RubricPoint[];
  /** A strong spoken answer, in your voice. */
  say: string;
  followUp: { q: string; a: string };
}

const LINEAR = "\\blinear\\b|o\\s*\\(\\s*n\\s*\\)|\\bo of n\\b(?!\\s*(log|squared))|\\bbig o of n\\b(?!\\s*(log|squared))|\\bo n\\b(?!\\s*log)";
const NLOGN = "n\\s*log\\s*n|n login|nlogn|n log of n";
const SPACE = "\\bspace\\b|\\bmemory\\b";
const BRUTE = "brute|nested loops?|every pair|each pair|n squared|n\\s*\\^\\s*2|quadratic|o\\s*\\(\\s*n\\s*\\^?\\s*2\\s*\\)";

export const TECH: TechQuestion[] = [
  {
    id: "t-sort-students",
    title: "Rank students by grade, then name",
    kind: "code",
    ref: "sort-students",
    why: "Sorting was exactly what the STAR student got, and interviewers love a tie-break rule.",
    ask: "Here's one I made up. You get a list of students, each one a name and a grade. Return just the names, ranked by grade from highest to lowest, and if two students have the same grade, put them in alphabetical order. How would you do it?",
    rubric: [
      { id: "restate", label: "Restates the task: names out, highest grade first", max: 10, detect: ["\\bnames?\\b", "\\b(highest|descending|biggest|largest|best|high to low|top)\\b"], tip: "Restate it first: \"I return just the names, highest grade first.\"" },
      { id: "tie", label: "Handles ties alphabetically", max: 15, detect: ["\\b(tie|ties|tied|same grade|equal)\\b", "\\b(alphabetical|alphabetically|by name|a to z)\\b"], tip: "Say the tie rule out loud: same grade, then alphabetical by name." },
      { id: "key", label: "Uses sorted() with a key", max: 25, detect: ["\\b(sort|sorted|sorting)\\b", "\\b(key|lambda|tuple)\\b"], tip: "Name the tool: sorted with a key function." },
      { id: "negate", label: "Negates the grade so one ascending sort does both", max: 20, detect: ["\\b(negative|negate|negating|minus)\\b"], tip: "Explain the trick: key = (minus grade, name), so highest grade comes first and names stay A to Z." },
      { id: "complexity", label: "O(n log n) time", max: 20, detect: [NLOGN], tip: "Give the complexity: O(n log n) because of the sort." },
      { id: "edge", label: "Mentions an edge case (empty list, stability)", max: 10, detect: ["\\b(empty|stable|stability|one student|single|no students)\\b"], tip: "Mention an edge case, like an empty list." },
    ],
    say: "So I return just the names, highest grade first, and on a tie I go alphabetical. I'd use Python's sorted with a key. The key is a tuple: minus the grade, then the name. Sorting ascending on minus grade puts the highest grades first, and when grades tie, the name breaks the tie A to Z, all in one sort. Then I pull out the names with a list comprehension. That's O(n log n) time for the sort and O(n) space for the new list. An empty list just returns an empty list.",
    followUp: { q: "Can you do it without the negative-number trick?", a: "Sort twice, using stability: first sort by name, then sort by grade with reverse=True. Python's sort is stable, so names stay alphabetical within each grade." },
  },
  {
    id: "t-compress",
    title: "Compress a string: aaabcc → a3b1c2",
    kind: "code",
    ref: "compress-string",
    why: "Classic made-up string manipulation: loops, counting and building a string.",
    ask: "Write a function that compresses a string by counting runs of the same character. So a, a, a, b, c, c becomes a3, b1, c2. Talk me through how you'd do it.",
    rubric: [
      { id: "runs", label: "Understands runs of the same character in a row", max: 10, detect: ["\\b(run|runs|consecutive|in a row|repeat|repeated|streak)\\b"], tip: "Define it: a run is the same character repeated in a row." },
      { id: "separate", label: "Counts repeated runs separately (aabbaa → a2b2a2)", max: 10, detect: ["\\b(separate|separately|again|resets?|new run|each run|start over)\\b"], tip: "Say that a letter can come back later as a new run, counted separately." },
      { id: "scan", label: "Scans with an index and counts each run", max: 25, detect: ["\\b(loop|scan|walk|iterate|pointer|index|go through|while)\\b", "\\b(count|counter|counting|length|how many)\\b"], tip: "Describe the scan: walk the string, count how long each run is." },
      { id: "join", label: "Builds a list of pieces, then joins", max: 20, detect: ["\\b(join|append|list of)\\b"], tip: "Say how you build the output: append each piece to a list, then join at the end." },
      { id: "immutable", label: "Explains why not += on a string", max: 10, detect: ["\\b(immutable|plus equals|concatenat\\w*|quadratic)\\b|\\+="], tip: "Bonus point: strings are immutable, so += in a loop can be quadratic; join is linear." },
      { id: "complexity", label: "O(n) time", max: 15, detect: [LINEAR], tip: "Give the complexity: O(n) time, one pass." },
      { id: "edge", label: "Edge cases (empty, no repeats makes it longer)", max: 10, detect: ["\\b(empty|single character|one character|longer|no repeats)\\b"], tip: "Mention an edge case: empty string, or no repeats making it longer." },
    ],
    say: "I'll walk the string with an index i. At each position I start a second index j at i and move it forward while the character stays the same, so j minus i is the length of that run. I append the character plus that count to a list, then jump i to j and repeat. At the end I join the list into one string. I use a list and join because strings are immutable, so adding with plus-equals in a loop can be quadratic. It's one pass, so O(n) time and O(n) space. Runs are counted separately, so a-a-b-b-a-a gives a2 b2 a2, and an empty string returns empty.",
    followUp: { q: "What if they only want the compressed version when it's actually shorter?", a: "Build it the same way, then compare lengths at the end and return the original if the compressed one isn't shorter." },
  },
  {
    id: "t-two-sum",
    title: "Two Sum",
    kind: "code",
    ref: "two-sum",
    why: "The most common warm-up in the world, and the cleanest way to show you know hash maps.",
    ask: "Given a list of numbers and a target, return the positions of the two numbers that add up to the target. You can assume there's exactly one answer.",
    rubric: [
      { id: "clarify", label: "Asks a clarifying question or states an assumption", max: 10, detect: ["\\b(empty|edge case|what if|assume|clarif\\w*|duplicates?|negative|sorted)\\b"], tip: "Ask one quick question first: can numbers repeat, can they be negative?" },
      { id: "brute", label: "States the brute force and its cost", max: 15, detect: [BRUTE], tip: "Say the brute force first: check every pair, O(n squared)." },
      { id: "hash", label: "Uses a hash map of value → index", max: 25, detect: ["\\b(hash ?map|dictionary|dict|hash ?table|map)\\b"], tip: "Name the data structure: a dictionary from number to its index." },
      { id: "complement", label: "Looks up the complement (target − n)", max: 15, detect: ["\\b(complement|target minus|difference|partner|need)\\b"], tip: "Explain the lookup: for each number, check if target minus it is already in the map." },
      { id: "order", label: "Checks before storing, so a number can't pair with itself", max: 10, detect: ["\\b(before (storing|adding|inserting|i store|i add|putting)|itself|same (index|element|position) twice)\\b"], tip: "Say you check the map before storing, so a number never pairs with itself." },
      { id: "complexity", label: "O(n) time and O(n) space", max: 15, detect: [LINEAR, SPACE], tip: "Give both: O(n) time and O(n) space." },
      { id: "edge", label: "Edge case: duplicates like [3, 3]", max: 10, detect: ["\\b(duplicates?|three three|same value|repeat\\w*)\\b"], tip: "Mention duplicates: [3, 3] with target 6 should work." },
    ],
    say: "Can numbers repeat? I'll assume yes. The brute force is checking every pair, which is O(n squared). Better: I walk the list once and keep a dictionary from each number to its index. For each number, I check if target minus that number is already in the dictionary. If it is, I return that stored index and the current one. If not, I store the current number. I check before storing so a number can't pair with itself, and that also handles duplicates like 3 and 3 with target 6. That's O(n) time and O(n) space for the dictionary.",
    followUp: { q: "What if the list were already sorted?", a: "Use two pointers from both ends: if the sum is too small move the left one right, if too big move the right one left. O(n) time and O(1) extra space." },
  },
  {
    id: "t-sql-joins",
    title: "Inner vs. outer join + customers who never ordered",
    kind: "sql",
    ref: "customers-who-never-order",
    why: "Inner vs. outer join is the SQL question they've asked before. Expect it.",
    ask: "SQL time. First, what's the difference between an inner join and an outer join? Then, with a Customers table that has id and name, and an Orders table that has id and customerId, write a query that returns the names of customers who have never placed an order.",
    rubric: [
      { id: "inner", label: "Inner join keeps only matching rows", max: 20, detect: ["\\binner\\b", "\\b(match|matches|matching|both)\\b"], tip: "Define inner join: only rows that match in both tables." },
      { id: "outer", label: "Outer/left join keeps unmatched rows too (with NULLs)", max: 20, detect: ["\\b(left|outer)\\b", "\\b(all|every|keeps?|unmatched|even if)\\b"], tip: "Define left join: every row from the left table, matched or not; missing side is NULL." },
      { id: "leftjoin", label: "Uses LEFT JOIN Customers → Orders", max: 20, detect: ["left join|left outer join"], tip: "Say the query: Customers LEFT JOIN Orders on the customer id." },
      { id: "isnull", label: "Filters WHERE order is NULL", max: 20, detect: ["\\bnull\\b"], tip: "Finish it: WHERE the order id IS NULL, meaning no match." },
      { id: "example", label: "Gives a concrete example", max: 10, detect: ["\\b(example|for instance|like if|say (a|we have)|imagine)\\b"], tip: "Add a tiny example: a customer with no orders vanishes in an inner join." },
      { id: "alt", label: "Mentions an alternative (NOT EXISTS / NOT IN)", max: 10, detect: ["\\b(not exists|not in|subquery)\\b"], tip: "Mention an alternative: NOT EXISTS with a subquery." },
    ],
    say: "An inner join keeps only rows that match in both tables. An outer join also keeps the rows that don't match: a left join keeps every row from the left table, and where there's no match, the right side's columns are NULL. For example, a customer with no orders disappears in an inner join but shows up in a left join with NULLs. So for customers who never ordered: SELECT name FROM Customers, LEFT JOIN Orders ON the order's customerId equals the customer's id, WHERE the order id IS NULL. The NULL means no matching order. NOT EXISTS with a subquery would work too.",
    followUp: { q: "What would a RIGHT JOIN or FULL OUTER JOIN return here?", a: "A right join keeps every order, even ones whose customer doesn't exist. A full outer join keeps everything from both sides, with NULLs wherever there's no match." },
  },
  {
    id: "t-palindrome",
    title: "Valid Palindrome",
    kind: "code",
    ref: "valid-palindrome",
    why: "String cleaning plus a classic follow-up about O(1) space.",
    ask: "Given a string, tell me whether it reads the same forwards and backwards, ignoring uppercase versus lowercase and ignoring anything that isn't a letter or a digit. For example, \"A man, a plan, a canal: Panama\" should be true.",
    rubric: [
      { id: "rules", label: "Restates the rules: ignore case and non-alphanumerics", max: 15, detect: ["\\b(ignore|ignoring|skip|lower ?case|case|alphanumeric|letters? (and|or) (digits|numbers)|punctuation|spaces?)\\b"], tip: "Restate the rules: ignore case, skip anything that isn't a letter or digit." },
      { id: "reverse", label: "Clean, then compare with the reverse", max: 25, detect: ["\\b(reverse|reversed|backwards|slice)\\b"], tip: "Give the simple version: clean it, lowercase it, compare to its reverse." },
      { id: "pointers", label: "Two pointers from both ends", max: 25, detect: ["\\b(two pointers?|left and right|both ends|each end|left pointer|start and end|from the outside)\\b"], tip: "Give the better version: one pointer at each end, moving inward." },
      { id: "complexity", label: "O(n) time", max: 15, detect: [LINEAR], tip: "Give the time: O(n)." },
      { id: "space", label: "Two pointers use O(1) extra space", max: 10, detect: ["constant (space|memory)|o\\s*\\(\\s*1\\s*\\)|\\bo of (1|one)\\b|no extra (space|memory)"], tip: "Point out the win: two pointers need only O(1) extra space." },
      { id: "edge", label: "Edge cases (empty, only punctuation)", max: 10, detect: ["\\b(empty|only punctuation|no letters|single character|one character)\\b"], tip: "Mention an edge case: an empty or all-punctuation string is a palindrome." },
    ],
    say: "I ignore case and skip anything that isn't a letter or digit. The simple version: build a cleaned, lowercased list of characters and compare it to its reverse. That's O(n) time and O(n) space. To do better on space, I use two pointers, one at each end. I move each pointer inward past anything that isn't alphanumeric, compare the lowercased characters, and return false on the first mismatch. That's still O(n) time but O(1) extra space. An empty string, or one that's only punctuation, counts as a palindrome.",
    followUp: { q: "What if you're allowed to delete at most one character?", a: "Use two pointers; on the first mismatch, try skipping the left character or the right one and check whether either remaining middle section is a palindrome. Still O(n)." },
  },
  {
    id: "t-frequent-word",
    title: "Most frequent word, ignoring case and punctuation",
    kind: "code",
    ref: "most-frequent-word",
    why: "A made-up string + counting problem that real interviewers invent all the time.",
    ask: "Here's another one I made up. Given a paragraph of text, return the most common word. Ignore capitalization and punctuation. How would you approach it?",
    rubric: [
      { id: "clarify", label: "Asks about ties or what counts as a word", max: 10, detect: ["\\b(tie|ties|tied|both appear|first one|apostrophe|what counts)\\b"], tip: "Ask about ties: if two words tie, which one wins?" },
      { id: "normalize", label: "Lowercases and strips punctuation", max: 20, detect: ["\\b(lower|lowercase|lower case|case)\\b", "\\b(punctuation|non.?letters?|isalpha|alphabetic|replace|strip)\\b"], tip: "Normalize first: lowercase everything, turn punctuation into spaces." },
      { id: "split", label: "Splits into words", max: 10, detect: ["\\b(split|words?|tokens?)\\b"], tip: "Then split the cleaned text into words." },
      { id: "count", label: "Counts with a Counter / dictionary", max: 25, detect: ["\\b(counter|count|counts|dictionary|dict|hash ?map|frequenc\\w*)\\b"], tip: "Count them: a Counter, or a dictionary of word to count." },
      { id: "max", label: "Picks the word with the highest count", max: 15, detect: ["\\b(max|maximum|most common|most_common|highest|biggest)\\b"], tip: "Pick the winner: max by count, or most_common(1)." },
      { id: "complexity", label: "O(n) time", max: 20, detect: [LINEAR], tip: "Give the complexity: O(n) over the length of the text." },
    ],
    say: "First, if two words tie, I'll return the one that appears first. I lowercase the text and turn every non-letter into a space, so punctuation doesn't stick to words. Then I split on whitespace to get the words and count them with a Counter, which is a dictionary from word to count. Finally I take the max by count; Counter's most_common(1) does that too. Everything is one pass over the text, so O(n) time, and O(n) space for the counts in the worst case.",
    followUp: { q: "Now return the top k words instead of just one.", a: "Counter.most_common(k) does it in O(n log k)-ish time; or bucket the words by count for O(n). Mention how you'd break ties." },
  },
  {
    id: "t-group-anagrams",
    title: "Group Anagrams",
    kind: "code",
    ref: "group-anagrams",
    why: "Combines sorting and hash maps in one problem, a favourite medium.",
    ask: "Given a list of words, group together the words that are anagrams of each other. For example eat, tea and ate go in one group, and tan and nat in another.",
    rubric: [
      { id: "restate", label: "Anagrams = same letters rearranged", max: 10, detect: ["\\b(same letters|rearrang\\w*|anagrams?)\\b"], tip: "Define it: anagrams have exactly the same letters, rearranged." },
      { id: "key", label: "Sorted letters as the group key", max: 25, detect: ["\\b(sort|sorted|sorting)\\b", "\\b(key|keys)\\b"], tip: "Say the key idea: sort each word's letters, so eat becomes a-e-t, and use that as the key." },
      { id: "dict", label: "Dictionary from key to list of words", max: 25, detect: ["\\b(dictionary|dict|hash ?map|map|defaultdict)\\b", "\\b(list|lists|group|groups|append)\\b"], tip: "Store groups: a dictionary from the key to a list of words." },
      { id: "complexity", label: "O(n · k log k)", max: 20, detect: ["k\\s*log\\s*k|klogk|k login"], tip: "Give the complexity: n words times k log k to sort each word." },
      { id: "count", label: "Mentions the letter-count key for O(n · k)", max: 10, detect: ["\\b(26|letter counts?|character counts?|count of each letter|counts of letters)\\b"], tip: "Bonus: a tuple of 26 letter counts as the key gives O(n times k)." },
      { id: "edge", label: "Edge cases (empty strings, single word)", max: 10, detect: ["\\b(empty|single|one word|duplicates?)\\b"], tip: "Mention an edge case, like an empty string or a single word." },
    ],
    say: "Anagrams have exactly the same letters, just rearranged. So if I sort each word's letters, all anagrams end up with the same sorted string: eat, tea and ate all become a-e-t. I use that as a key in a dictionary, a defaultdict of lists, and append each word to its key's list. At the end I return the dictionary's values. With n words of length up to k, sorting each word is k log k, so O(n times k log k) time and O(n times k) space. A faster key is a tuple of 26 letter counts, which gets it to O(n times k). An empty string is its own group.",
    followUp: { q: "Why can't you use the list of letters itself as the dictionary key?", a: "Lists are mutable, so they aren't hashable. Convert to a string with join, or to a tuple." },
  },
  {
    id: "t-merge-intervals",
    title: "Merge Intervals",
    kind: "code",
    ref: "merge-intervals",
    why: "The go-to sort-then-scan problem, and it looks like a scheduling question an interviewer would invent.",
    ask: "You get a list of time ranges, like 1 to 3, 2 to 6, 8 to 10, and 15 to 18. Merge any ranges that overlap and return the result.",
    rubric: [
      { id: "clarify", label: "Clarifies: unsorted input? do touching ranges merge?", max: 10, detect: ["\\b(touch|touching|share an? (end|endpoint)|sorted|unsorted|empty|in order)\\b"], tip: "Ask: is it sorted already, and do ranges that just touch, like 1-4 and 4-5, merge?" },
      { id: "sort", label: "Sorts by start time", max: 25, detect: ["\\b(sort|sorted|sorting)\\b", "\\b(start|starting|first)\\b"], tip: "Key step: sort the ranges by their start." },
      { id: "scan", label: "Compares each range with the last merged one", max: 25, detect: ["\\b(last|previous|end)\\b", "\\b(overlap|overlaps|overlapping|merge|extend)\\b"], tip: "Then scan: if a range starts before the last merged one ends, they overlap." },
      { id: "max", label: "Extends with the max of the two ends", max: 10, detect: ["\\b(max|maximum|bigger|larger|further|later)\\b"], tip: "Say how you merge: the end becomes the max of both ends." },
      { id: "complexity", label: "O(n log n) time", max: 20, detect: [NLOGN], tip: "Give the complexity: O(n log n) for the sort; the scan is O(n)." },
      { id: "edge", label: "Edge cases (empty, one range inside another)", max: 10, detect: ["\\b(empty|one interval|single|contained|inside|within)\\b"], tip: "Mention an edge case: one range completely inside another." },
    ],
    say: "I'll ask whether the input is sorted; I'll assume not, and that ranges that touch, like 1-4 and 4-5, should merge. First I sort the ranges by start time. Then I walk through them keeping a result list. If the current range starts at or before the end of the last range in the result, they overlap, so I extend that last range's end to the max of the two ends. Otherwise I append the current range. The max matters when one range sits completely inside another. Sorting is O(n log n), the scan is O(n), so O(n log n) overall, and O(n) space for the output.",
    followUp: { q: "Given two people's schedules, how would you find whether they have any conflict?", a: "Combine both lists, sort by start, and check whether any range starts before the previous one ends. Same sort-then-scan idea." },
  },
  {
    id: "t-sql-duplicates",
    title: "Duplicate emails (GROUP BY + HAVING)",
    kind: "sql",
    ref: "duplicate-emails",
    why: "The most common aggregation question, and it leads straight into WHERE vs. HAVING.",
    ask: "There's a Person table with an id and an email column. Write a query that returns every email address that appears more than once. And tell me why you used the clauses you did.",
    rubric: [
      { id: "group", label: "GROUP BY email", max: 30, detect: ["group by|grouping by|group them by"], tip: "Start with GROUP BY email, so each email becomes one group." },
      { id: "having", label: "HAVING COUNT(*) > 1", max: 30, detect: ["\\bhaving\\b", "\\bcount\\b"], tip: "Filter the groups: HAVING COUNT(*) greater than 1." },
      { id: "wherehaving", label: "Explains WHERE vs HAVING", max: 20, detect: ["\\bwhere\\b", "\\b(before|after|aggregat\\w*|groups?|individual rows?|each row)\\b"], tip: "Explain why HAVING: WHERE filters rows before grouping; HAVING filters groups after." },
      { id: "once", label: "Each duplicate email appears once in the result", max: 10, detect: ["\\b(once|one row|each email|distinct|no repeats)\\b"], tip: "Note that each duplicated email shows up only once in the result." },
      { id: "alt", label: "Mentions an alternative (self join / subquery)", max: 10, detect: ["\\b(self.?join|itself|subquery|window function)\\b"], tip: "Mention an alternative: a self join, with DISTINCT." },
    ],
    say: "SELECT email FROM Person GROUP BY email HAVING COUNT(*) greater than 1. GROUP BY email puts all the rows with the same email into one group, so each email appears once in the result. Then HAVING keeps only the groups whose count is more than one. I need HAVING, not WHERE, because WHERE filters individual rows before grouping and can't see aggregates like COUNT. HAVING filters the groups after aggregation. A self join of Person to itself on equal email and different id, with DISTINCT, would also work but is clunkier.",
    followUp: { q: "Now delete the duplicates, keeping the row with the smallest id for each email.", a: "DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email). Keeps one row per email, the smallest id." },
  },
  {
    id: "t-parentheses",
    title: "Valid Parentheses",
    kind: "code",
    ref: "valid-parentheses",
    why: "The stack problem every interviewer knows. Quick to state, easy to get subtly wrong.",
    ask: "Given a string made of brackets, round, square and curly, tell me whether it's balanced: every opening bracket closed by the same kind, in the right order.",
    rubric: [
      { id: "clarify", label: "Clarifies inputs (empty string, only brackets)", max: 10, detect: ["\\b(empty|only brackets|other characters|valid characters)\\b"], tip: "Ask: is an empty string valid, and is it only brackets?" },
      { id: "stack", label: "Uses a stack", max: 25, detect: ["\\bstack\\b"], tip: "Name it: a stack, because the last bracket opened must close first." },
      { id: "pushpop", label: "Push openers; on a closer, pop and compare", max: 25, detect: ["\\b(push|append|add)\\b", "\\b(pop|top|last)\\b"], tip: "Describe it: push openers; on a closer, pop the top and check it matches." },
      { id: "map", label: "Maps each closer to its opener", max: 10, detect: ["\\b(map|mapping|dictionary|dict|pairs?)\\b"], tip: "Mention the lookup: a small dictionary from each closer to its opener." },
      { id: "end", label: "Checks the stack is empty at the end", max: 15, detect: ["\\b(empty at the end|stack (is|must be|should be|has to be) empty|leftover|left over|anything left|still (has|have) items?|nothing left|never (closed|matched))\\b"], tip: "Don't forget: at the end the stack must be empty, or something never closed." },
      { id: "complexity", label: "O(n) time", max: 15, detect: [LINEAR], tip: "Give the complexity: O(n) time and O(n) space for the stack." },
    ],
    say: "I'll assume the string is only brackets and that empty counts as valid. I use a stack, because the most recently opened bracket has to close first. I keep a small dictionary mapping each closer to its opener. For each character: if it's an opener, I push it. If it's a closer, I check the stack isn't empty and pop the top; if that isn't the matching opener, I return false. At the end, the stack must be empty, otherwise something was never closed. That's O(n) time and O(n) space in the worst case.",
    followUp: { q: "What if there's only one kind of bracket?", a: "You don't need a stack: keep a counter, add one for open and subtract one for close. If it ever goes negative, or isn't zero at the end, it's invalid. O(1) space." },
  },
];

export const techById = new Map(TECH.map((q) => [q.id, q]));
