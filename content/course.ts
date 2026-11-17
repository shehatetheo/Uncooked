import type { PlanTask } from "./plan";

/**
 * The crash course: everything in one ordered path, about eight hours from
 * Wednesday to Friday morning. It reuses the app's problems, cards and drills;
 * it only picks the smallest set that still covers every part of the day.
 * Thursday re-solves Wednesday's key problems cold, which is what turns them
 * into Mastered (a hint-free pass on a second day).
 */
export interface Lesson extends PlanTask {
  /** Short notes shown inline, for lessons that are reading, not doing. */
  read?: string[];
}

export interface Module {
  id: string;
  day: "Wed" | "Thu" | "Fri";
  title: string;
  why: string;
  lessons: Lesson[];
}

export const COURSE_START = "2026-11-17";
export const COURSE_END = "2026-11-20";

export const COURSE: Module[] = [
  {
    id: "m1",
    day: "Wed",
    title: "Game plan",
    why: "Ten minutes to know exactly what Friday looks like, so every hour after this goes to the right place.",
    lessons: [
      {
        id: "c-gameplan",
        title: "Read: how the day works",
        detail: "What they ask and how you'll answer it.",
        href: "/course",
        minutes: 5,
        check: { kind: "manual" },
        read: [
          "Friday, 12:00-4:30 pm at 3999 West Chester Pike, Newtown Square. Bring a government photo ID or you can't get in.",
          "Coding: easy to medium, usually sorting or strings, and the interviewer may make the problem up. They grade how you think out loud.",
          "SQL is its own interview. Inner vs. outer join has been asked before.",
          "Resume: line by line. What you did yourself, the numbers, and why you chose each tool.",
          "Also: a group case, one-on-one behavioral questions, maybe a short presentation.",
          "Your host co-leads the STAR program (Student Training and Rotation, multi-year) and led SAP's Copilot AI rollout.",
        ],
      },
      {
        id: "c-method",
        title: "Read: how to answer any coding problem out loud",
        detail: "Use these six steps every time. Interviewers grade your process as much as your code.",
        href: "/course",
        minutes: 5,
        check: { kind: "manual" },
        read: [
          "1. Restate it in your own words, with the input and output types.",
          "2. Ask one or two questions: empty input? duplicates? sorted?",
          "3. Say the brute force and its cost (often O(n²)).",
          "4. Name the better pattern: hash map, sort then scan, two pointers, stack, counter.",
          "5. Code it while narrating, then trace one small example by hand.",
          "6. State time and space complexity, then an edge case you'd test.",
          "For every \"why\" question: \"I chose X because Y. I considered Z, but…\"",
        ],
      },
    ],
  },
  {
    id: "m2",
    day: "Wed",
    title: "Hash maps and counting",
    why: "The single most useful pattern for easy problems. Learn these four properly and many made-up problems become one of them.",
    lessons: [
      { id: "c-two-sum", title: "Two Sum: all four phases", detail: "Understand, ghost type 3 + 3, solve cold, explain. Take your time on this one; it's the template.", href: "/p/two-sum", minutes: 25, check: { kind: "solve", ids: ["two-sum"] } },
      { id: "c-dup-anagram", title: "Contains Duplicate and Valid Anagram", detail: "Short solutions. One shadow rep each is enough if it clicks, then solve cold and explain.", href: "/p/contains-duplicate", minutes: 20, check: { kind: "solve", ids: ["contains-duplicate", "valid-anagram"] } },
      { id: "c-group", title: "Group Anagrams", detail: "Say why the sorted word works as a dictionary key.", href: "/p/group-anagrams", minutes: 20, check: { kind: "solve", ids: ["group-anagrams"] } },
      {
        id: "c-patterns-read",
        title: "Read: the five patterns, one line each",
        detail: "Keep this picture in your head when a problem is made up.",
        href: "/sheets",
        minutes: 5,
        check: { kind: "manual" },
        read: [
          "Hash map / set: \"have I seen this before?\" in O(1). Two Sum, duplicates.",
          "Counter: count things, compare counts, or most_common(k). Anagrams, top words.",
          "Sort then scan: sort with a key, then one pass comparing neighbours. Intervals, schedules, ranking.",
          "Two pointers: one at each end moving inward. Palindromes, sorted pairs.",
          "Stack: last opened, first closed. Brackets, undo.",
        ],
      },
    ],
  },
  {
    id: "m3",
    day: "Wed",
    title: "Strings and sorting",
    why: "This is what the STAR student was actually asked. The last three are problems an interviewer made up.",
    lessons: [
      { id: "c-palindrome", title: "Valid Palindrome", detail: "Clean and compare, then know the two-pointer O(1)-space follow-up.", href: "/p/valid-palindrome", minutes: 15, check: { kind: "solve", ids: ["valid-palindrome"] } },
      { id: "c-parens", title: "Valid Parentheses", detail: "The stack problem.", href: "/p/valid-parentheses", minutes: 15, check: { kind: "solve", ids: ["valid-parentheses"] } },
      { id: "c-intervals", title: "Merge Intervals", detail: "Sort by start, then merge neighbours.", href: "/p/merge-intervals", minutes: 20, check: { kind: "solve", ids: ["merge-intervals"] } },
      { id: "c-freq", title: "Sort Characters by Frequency", detail: "Counter plus sorting by count.", href: "/p/sort-characters-by-frequency", minutes: 15, check: { kind: "solve", ids: ["sort-characters-by-frequency"] } },
      { id: "c-madeup", title: "Made-up: Sort Students, Compress String, Most Frequent Word", detail: "Solve cold first, then read which known pattern each one really is.", href: "/p/sort-students", minutes: 30, check: { kind: "solve", ids: ["sort-students", "compress-string", "most-frequent-word"] } },
    ],
  },
  {
    id: "m4",
    day: "Wed",
    title: "The other patterns, quickly",
    why: "Less likely on Friday, but you should recognise each one and say the idea. Do the Understand questions only (about four minutes each).",
    lessons: [
      {
        id: "c-quick",
        title: "Understand phase: six problems",
        detail: "Reverse Linked List, Binary Search, Best Time to Buy/Sell, Climbing Stairs, Max Depth, Number of Islands. Answer the three questions, read the one-line idea, move on.",
        href: "/p/reverse-linked-list",
        minutes: 25,
        check: { kind: "phase", phase: "understand", ids: ["reverse-linked-list", "binary-search", "best-time-to-buy-sell-stock", "climbing-stairs", "max-depth-binary-tree", "number-of-islands"] },
        read: [
          "Reverse Linked List: flip each arrow back; move prev and current forward.",
          "Binary Search: check the middle and throw away the half that can't hold the target. Input must be sorted.",
          "Best Time to Buy/Sell: track the cheapest price so far and the best \"sell today\" profit.",
          "Climbing Stairs: ways(n) = ways(n-1) + ways(n-2). Keep two numbers.",
          "Max Depth: empty is 0; otherwise 1 + the deeper side.",
          "Number of Islands: on land, sink the whole island with DFS and count 1.",
        ],
      },
    ],
  },
  {
    id: "m5",
    day: "Wed",
    title: "SQL",
    why: "A separate interview. Joins first, because it's been asked before.",
    lessons: [
      { id: "c-joins", title: "Joins lab", detail: "Switch between inner, left, right and full outer and watch the rows change. Then answer the row-count drill.", href: "/sql?tab=joins", minutes: 10, check: { kind: "manual" } },
      { id: "c-sql-joins", title: "Combine Two Tables and Customers Who Never Order", detail: "LEFT JOIN, then LEFT JOIN + IS NULL.", href: "/sql/combine-two-tables", minutes: 15, check: { kind: "sql", ids: ["combine-two-tables", "customers-who-never-order"] } },
      { id: "c-sql-group", title: "Duplicate Emails and Second Highest Salary", detail: "GROUP BY + HAVING, and returning NULL when there's no answer.", href: "/sql/duplicate-emails", minutes: 15, check: { kind: "sql", ids: ["duplicate-emails", "second-highest-salary"] } },
      { id: "c-sql-cards", title: "Say it out loud: joins and WHERE vs HAVING", detail: "Four concept cards. Answer, then check the key points.", href: "/sql?tab=concepts", minutes: 10, check: { kind: "cards", groups: ["Inner vs outer joins", "WHERE vs HAVING"], count: 4 } },
    ],
  },
  {
    id: "m6",
    day: "Thu",
    title: "Lock in Wednesday",
    why: "Re-solving yesterday's problems cold, with no hints, is how they stick, and it's what makes them Mastered.",
    lessons: [
      { id: "c-recall", title: "Cold, no hints: Two Sum, Group Anagrams, Valid Parentheses, Merge Intervals", detail: "Blank editor, Submit, explain each in one sentence. If you need a hint, that's fine: note it and move on.", href: "/p/two-sum", minutes: 25, check: { kind: "mastered", ids: ["two-sum", "group-anagrams", "valid-parentheses", "merge-intervals"] } },
    ],
  },
  {
    id: "m7",
    day: "Thu",
    title: "Resume defense",
    why: "They will go line by line. Every number and every tool needs an answer.",
    lessons: [
      { id: "c-res-projects", title: "Tide and ReMindMap", detail: "Your two strongest projects get the most questions. 8 cards, out loud, with the formula.", href: "/resume", minutes: 25, check: { kind: "cards", groups: ["Tide – Marine Species Identifier", "ReMindMap – AI Mind Mapping"], count: 8 } },
      { id: "c-res-rest", title: "BeReal, ClearBill, Develop for Good", detail: "8 cards across the three.", href: "/resume", minutes: 20, check: { kind: "cards", groups: ["BeReal – Product Management Extern", "ClearBill – Hospital Bill Analyzer", "Develop for Good – Student Design Manager"], count: 8 } },
      { id: "c-res-consistency", title: "Consistency cards", detail: "So the resume SAP has and your current one never contradict each other.", href: "/resume?tab=consistency", minutes: 5, check: { kind: "cards", prefix: "cons-", count: 3 } },
      { id: "c-skills", title: "Skills quick-fire: 8", detail: "Every skill listed is fair game.", href: "/resume?tab=skills", minutes: 10, check: { kind: "cards", prefix: "skill-", count: 8 } },
    ],
  },
  {
    id: "m8",
    day: "Thu",
    title: "Behavioral, your host and SAP",
    why: "The one-on-ones, the person hosting your day, and enough SAP to sound informed.",
    lessons: [
      { id: "c-intro", title: "Write and record your 60-second intro", detail: "About 150 words. Record it once and listen back.", href: "/behavioral?tab=intro", minutes: 10, check: { kind: "manual" } },
      { id: "c-stories", title: "Four STAR stories", detail: "Challenge, pressure, teamwork, failure. One card each.", href: "/behavioral", minutes: 15, check: { kind: "cards", groups: ["Challenge", "Pressure", "Teamwork", "Failure"], count: 4 } },
      { id: "c-host", title: "Your host: why STAR, bridges, questions for her", detail: "At least 4 of the Your host cards, including Why STAR and the bridges from your experience.", href: "/behavioral", minutes: 10, check: { kind: "cards", groups: ["Your host"], count: 4 } },
      { id: "c-asking", title: "Quiz: questions to ask, 10", detail: "Who you'll meet and the best question for each.", href: "/quiz?topic=asking", minutes: 5, check: { kind: "quiz", topics: ["Questions to ask"], count: 10 } },
      { id: "c-sap", title: "SAP 101: 5 cards", detail: "ERP, S/4HANA, BTP, Joule. Check anything that may have changed on sap.com.", href: "/behavioral?tab=sap", minutes: 10, check: { kind: "cards", prefix: "sap-", count: 5 } },
      { id: "c-present", title: "Presentation drill: project walkthrough", detail: "Tide, 4 minutes, timer on, out loud once.", href: "/behavioral?tab=present", minutes: 10, check: { kind: "manual" } },
    ],
  },
  {
    id: "m9",
    day: "Thu",
    title: "Dress rehearsal",
    why: "Run it once under pressure, then stop early. Sleep beats one more rep.",
    lessons: [
      { id: "c-mock", title: "Voice mock interview: Full mix, 20 min", detail: "Treat it like the real thing and read the feedback. No API credits? Use Practice offline.", href: "/interview", minutes: 25, check: { kind: "manual" } },
      { id: "c-sprint", title: "Sprint: 10 minutes", detail: "As many easy problems as you can, cold.", href: "/timed", minutes: 10, check: { kind: "manual" } },
      { id: "c-night", title: "Night-before mode, 15 minutes", detail: "Everything still marked Shaky. When the clock hits zero, close the laptop.", href: "/review?mode=night", minutes: 15, check: { kind: "manual" } },
      { id: "c-bag", title: "Pack: photo ID, 3 printed resumes, outfit, route", detail: "Plan to reach reception by 11:45. Phone charged.", href: "/plan", minutes: 10, check: { kind: "manual" } },
    ],
  },
  {
    id: "m10",
    day: "Fri",
    title: "Friday morning",
    why: "Twenty minutes to warm up. Nothing new. Eat lunch before you leave.",
    lessons: [
      { id: "c-fri-intro", title: "Say your intro out loud once", detail: "Read the script, then say it without looking.", href: "/behavioral?tab=intro", minutes: 5, check: { kind: "manual" } },
      { id: "c-fri-ghost", title: "One ghost rep of Two Sum", detail: "Just to get your fingers moving.", href: "/p/two-sum", minutes: 5, check: { kind: "manual" } },
      { id: "c-fri-sheet", title: "Glance at the cheat sheets", detail: "Big-O table and Python tricks.", href: "/sheets", minutes: 5, check: { kind: "manual" } },
      { id: "c-fri-go", title: "Before you leave", detail: "Photo ID, printed resumes, phone, water. Reception by 11:45. \"I chose X because Y. I considered Z, but…\"", href: "/course", minutes: 5, check: { kind: "manual" } },
    ],
  },
];
