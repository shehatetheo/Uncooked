/**
 * The four-day run-up to the super day (Fri Nov 20, 2026), about two hours a
 * day. Each task links to the screen that does it and, where it can, checks
 * itself off from real progress. Re-solving earlier problems cold on a later
 * day is deliberate: a hint-free pass on a second day is what earns Mastered.
 */
export type PlanCheck =
  /** Coding problems passed in a cold solve (Submit). */
  | { kind: "solve"; ids: string[] }
  /** Coding problems passed cold with zero hints, today. */
  | { kind: "clean-today"; ids: string[] }
  /** SQL problems accepted. */
  | { kind: "sql"; ids: string[] }
  /** Cards answered and graded, by id prefix and/or group. */
  | { kind: "cards"; prefix?: string; groups?: string[]; count: number }
  /** Quiz questions answered in these topics (topic labels). */
  | { kind: "quiz"; topics: string[]; count: number }
  /** Coding problems with a given phase done (e.g. the Understand questions). */
  | { kind: "phase"; phase: "understand" | "ghost" | "cold" | "explain"; ids: string[] }
  /** Coding problems that reached Mastered (hint-free cold passes on two days). */
  | { kind: "mastered"; ids: string[] }
  /** Ticked by hand. */
  | { kind: "manual" };

export interface PlanTask {
  id: string;
  title: string;
  detail: string;
  href: string;
  minutes: number;
  check: PlanCheck;
}

export interface PlanDay {
  date: string; // local YYYY-MM-DD
  label: string;
  title: string;
  why: string;
  tasks: PlanTask[];
}

export const PLAN: PlanDay[] = [
  {
    date: "2026-11-16",
    label: "Mon · Day 1",
    title: "Hash maps, joins and your story",
    why: "The hash map is the pattern behind half of all easy problems, and inner vs. outer join is the SQL question they already asked once.",
    tasks: [
      { id: "d1-confirm", title: "Confirm your SAP visit", detail: "In the SAP visit email: tap Accept, read the Privacy Statement, and sign the Confidentiality Disclaimer. It's required before you can visit. Uploading your photo in advance is optional but speeds up check-in.", href: "/plan", minutes: 5, check: { kind: "manual" } },
      { id: "d1-core-a", title: "Learn Two Sum, Contains Duplicate, Valid Anagram", detail: "All four phases each: understand, ghost 3 + 3, solve cold, explain out loud.", href: "/p/two-sum", minutes: 45, check: { kind: "solve", ids: ["two-sum", "contains-duplicate", "valid-anagram"] } },
      { id: "d1-core-b", title: "Learn Group Anagrams", detail: "Same loop. Say why the sorted word works as a key.", href: "/p/group-anagrams", minutes: 15, check: { kind: "solve", ids: ["group-anagrams"] } },
      { id: "d1-sql", title: "Joins lab, then two join problems", detail: "Play with every join type in the lab first. Then Combine Two Tables and Customers Who Never Order.", href: "/sql?tab=joins", minutes: 20, check: { kind: "sql", ids: ["combine-two-tables", "customers-who-never-order"] } },
      { id: "d1-resume", title: "Defend Tide and ReMindMap", detail: "10 cards. Your two strongest projects get the most questions. Out loud, with the formula.", href: "/resume", minutes: 20, check: { kind: "cards", groups: ["Tide – Marine Species Identifier", "ReMindMap – AI Mind Mapping"], count: 10 } },
      { id: "d1-intro", title: "Write and record your 60-second intro", detail: "About 150 words. Record it once and listen back.", href: "/behavioral?tab=intro", minutes: 10, check: { kind: "manual" } },
      { id: "d1-voice", title: "Voice mock interview: SQL round, 5-10 min", detail: "First rep under pressure. Read the feedback, don't fix anything yet.", href: "/interview", minutes: 5, check: { kind: "manual" } },
    ],
  },
  {
    date: "2026-11-17",
    label: "Tue · Day 2",
    title: "Strings and sorting: what they actually ask",
    why: "The STAR student's coding questions were sorting and string manipulation, made up by the interviewer. Today is that, plus the rest of your resume.",
    tasks: [
      { id: "d2-recall", title: "Re-solve Day 1 cold, no hints", detail: "Two Sum, Contains Duplicate, Valid Anagram. A clean pass today is your second day: these become Mastered.", href: "/p/two-sum", minutes: 10, check: { kind: "clean-today", ids: ["two-sum", "contains-duplicate", "valid-anagram"] } },
      { id: "d2-strings", title: "Learn Valid Palindrome and Valid Parentheses", detail: "Two pointers and a stack. Know the O(1)-space follow-up for the palindrome.", href: "/p/valid-palindrome", minutes: 25, check: { kind: "solve", ids: ["valid-palindrome", "valid-parentheses"] } },
      { id: "d2-sorting", title: "Learn Merge Intervals, Sort Characters by Frequency, Longest Common Prefix", detail: "Sort-then-scan and counting. The bread and butter of made-up problems.", href: "/p/merge-intervals", minutes: 30, check: { kind: "solve", ids: ["merge-intervals", "sort-characters-by-frequency", "longest-common-prefix"] } },
      { id: "d2-madeup", title: "Two made-up problems: Sort Students, Compress String", detail: "Solve cold first, then read which known pattern each one really is.", href: "/p/sort-students", minutes: 20, check: { kind: "solve", ids: ["sort-students", "compress-string"] } },
      { id: "d2-sql", title: "SQL: Duplicate Emails and Second Highest Salary", detail: "GROUP BY + HAVING, and returning NULL when there's no answer.", href: "/sql/duplicate-emails", minutes: 15, check: { kind: "sql", ids: ["duplicate-emails", "second-highest-salary"] } },
      { id: "d2-resume", title: "Defend BeReal, ClearBill and Develop for Good", detail: "10 cards, then the consistency cards so your two resume versions never contradict each other.", href: "/resume", minutes: 20, check: { kind: "cards", groups: ["BeReal – Product Management Extern", "ClearBill – Hospital Bill Analyzer", "Develop for Good – Student Design Manager"], count: 10 } },
    ],
  },
  {
    date: "2026-11-18",
    label: "Wed · Day 3",
    title: "Fill the gaps, then talk it out",
    why: "Finish every pattern on the list once, lock in the Day 2 problems, and build the stories for the behavioral half of the day.",
    tasks: [
      { id: "d3-recall", title: "Re-solve Day 2 cold, no hints", detail: "Valid Palindrome, Valid Parentheses, Merge Intervals.", href: "/p/valid-palindrome", minutes: 10, check: { kind: "clean-today", ids: ["valid-palindrome", "valid-parentheses", "merge-intervals"] } },
      { id: "d3-core", title: "Ghost + cold: the other five core problems", detail: "Reverse Linked List, Max Depth, Binary Search, Best Time to Buy/Sell, Climbing Stairs. Lighter: one shadow rep is fine if it clicks.", href: "/p/reverse-linked-list", minutes: 40, check: { kind: "solve", ids: ["reverse-linked-list", "max-depth-binary-tree", "binary-search", "best-time-to-buy-sell-stock", "climbing-stairs"] } },
      { id: "d3-islands", title: "Number of Islands", detail: "The one grid problem. Say the DFS out loud.", href: "/p/number-of-islands", minutes: 10, check: { kind: "solve", ids: ["number-of-islands"] } },
      { id: "d3-madeup", title: "Made-up: Most Frequent Word, Schedules Overlap, Top K", detail: "Counter.most_common and sorting by start time.", href: "/p/most-frequent-word", minutes: 20, check: { kind: "solve", ids: ["most-frequent-word", "schedules-overlap", "top-k-frequent-elements"] } },
      { id: "d3-sql", title: "SQL: Department Highest Salary, Order Count per Customer", detail: "JOIN + GROUP BY, and COUNT(column) vs COUNT(*).", href: "/sql/department-highest-salary", minutes: 15, check: { kind: "sql", ids: ["department-highest-salary", "order-count-per-customer"] } },
      { id: "d3-stories", title: "Build four STAR stories", detail: "Challenge, pressure, teamwork, failure. One card each, out loud.", href: "/behavioral", minutes: 15, check: { kind: "cards", groups: ["Challenge", "Pressure", "Teamwork", "Failure"], count: 4 } },
      { id: "d3-asking", title: "Quiz: questions to ask, 10", detail: "Who you'll meet on Friday and the best question for each of them.", href: "/quiz?topic=asking", minutes: 5, check: { kind: "quiz", topics: ["Questions to ask"], count: 10 } },
      { id: "d3-skills", title: "Skills quick-fire: 10", detail: "Every skill on your resume is fair game.", href: "/resume?tab=skills", minutes: 10, check: { kind: "cards", prefix: "skill-", count: 10 } },
    ],
  },
  {
    date: "2026-11-19",
    label: "Thu · Day 4",
    title: "Dress rehearsal, then rest",
    why: "Run the whole thing once under pressure, lock in what's left, sort out logistics, and stop early. Sleep beats one more rep.",
    tasks: [
      { id: "d4-mock", title: "Voice mock interview: Full mix, 20 min", detail: "Treat it like the real thing. Read the feedback and fix the top item.", href: "/interview", minutes: 25, check: { kind: "manual" } },
      { id: "d4-recall", title: "Re-solve cold, no hints", detail: "Group Anagrams, Sort Students, Compress String, Reverse Linked List, Binary Search.", href: "/p/group-anagrams", minutes: 25, check: { kind: "clean-today", ids: ["group-anagrams", "sort-students", "compress-string", "reverse-linked-list", "binary-search"] } },
      { id: "d4-sprint", title: "Sprint: 10 minutes", detail: "As many easy problems as you can, cold. Just for speed.", href: "/timed", minutes: 10, check: { kind: "manual" } },
      { id: "d4-sap", title: "SAP 101: read and verify", detail: "Go through the SAP cards and check anything that may have changed on sap.com.", href: "/behavioral?tab=sap", minutes: 10, check: { kind: "cards", prefix: "sap-", count: 6 } },
      { id: "d4-host", title: "Your host: pick your questions", detail: "Look her up, then go through the Your host cards and choose the two questions you'll actually ask her.", href: "/behavioral", minutes: 5, check: { kind: "cards", groups: ["Your host"], count: 4 } },
      { id: "d4-why", title: "Final run: intro and why SAP", detail: "Your 60-second intro once more, and why SAP / why STAR.", href: "/behavioral", minutes: 10, check: { kind: "cards", groups: ["Intro", "Why SAP / why STAR"], count: 2 } },
      { id: "d4-present", title: "Presentation drill: project walkthrough", detail: "Tide, 4 minutes, timer on, out loud once.", href: "/behavioral?tab=present", minutes: 10, check: { kind: "manual" } },
      { id: "d4-night", title: "Night-before mode, 15 minutes", detail: "Everything still marked Shaky. When the clock hits zero, stop.", href: "/review?mode=night", minutes: 15, check: { kind: "manual" } },
      { id: "d4-logistics", title: "Logistics", detail: "Government photo ID (state ID, driver's license or passport): you can't get in without it. Print 3 copies of your current resume. Pick the outfit. Check the route to 3999 West Chester Pike, Newtown Square for a Friday late morning and plan to reach reception by 11:45. Charge your phone. Sleep.", href: "/plan", minutes: 10, check: { kind: "manual" } },
    ],
  },
  {
    date: "2026-11-20",
    label: "Fri · Super day",
    title: "Morning of: warm up, don't cram",
    why: "You're on site 12:00-4:30 pm. Fifteen minutes to get your head in gear in the morning, eat a real lunch before you leave, and nothing new today.",
    tasks: [
      { id: "d5-intro", title: "Say your intro out loud once", detail: "Read the script, then say it without looking.", href: "/behavioral?tab=intro", minutes: 3, check: { kind: "manual" } },
      { id: "d5-ghost", title: "One ghost rep of Two Sum", detail: "Just to get your fingers moving.", href: "/p/two-sum", minutes: 3, check: { kind: "manual" } },
      { id: "d5-sheet", title: "Glance at the cheat sheets", detail: "Big-O table and Python tricks.", href: "/sheets", minutes: 5, check: { kind: "manual" } },
      { id: "d5-bag", title: "Before you leave", detail: "Photo ID, printed resumes, phone, water. Eat first: it's a four-and-a-half-hour afternoon. Reach reception by 11:45.", href: "/plan", minutes: 2, check: { kind: "manual" } },
      { id: "d5-formula", title: "Remember the formula", detail: "\"I chose X because Y. I considered Z, but…\" Rationale over answer.", href: "/plan", minutes: 1, check: { kind: "manual" } },
    ],
  },
  {
    date: "2026-11-21",
    label: "Sat · After",
    title: "Follow up",
    why: "A short, specific thank-you is remembered. Send it within a day.",
    tasks: [
      { id: "d6-thanks", title: "Thank-you email to your host", detail: "Three or four sentences. Thank her for hosting, name one specific moment from the day (and from your earlier interview with her), and say you'd be excited to join STAR. No new asks.", href: "/plan", minutes: 10, check: { kind: "manual" } },
      { id: "d6-notes", title: "Write down what they asked", detail: "Every question you remember, while it's fresh. Useful whatever happens next.", href: "/plan", minutes: 10, check: { kind: "manual" } },
    ],
  },
];
