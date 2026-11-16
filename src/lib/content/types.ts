import { z } from "zod";

/** How an argument or return value crosses the JSON <-> Python boundary. */
export const ArgKind = z.enum(["json", "list", "tree"]);
export type ArgKind = z.infer<typeof ArgKind>;

/** How actual output is compared with expected output. */
export const CompareMode = z.enum(["exact", "unordered", "groups"]);
export type CompareMode = z.infer<typeof CompareMode>;

export const PATTERNS = {
  "hash-map": "Hash map / set",
  counting: "Counting",
  "two-pointers": "Two pointers",
  stack: "Stack",
  "linked-list": "Linked list",
  "tree-dfs": "Tree DFS",
  "grid-dfs": "Grid DFS",
  "binary-search": "Binary search",
  greedy: "Greedy scan",
  dp: "Dynamic programming",
  sorting: "Sort then scan",
  string: "String building",
} as const;
export type PatternId = keyof typeof PATTERNS;
const PatternId = z.enum(Object.keys(PATTERNS) as [PatternId, ...PatternId[]]);

export const Choice = z.object({
  prompt: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(5),
  answer: z.number().int().nonnegative(),
  explain: z.string().min(1),
});
export type Choice = z.infer<typeof Choice>;

const TestCase = z.object({
  args: z.array(z.unknown()),
  expected: z.unknown(),
  label: z.string().optional(),
});
export type TestCase = z.infer<typeof TestCase>;

/** One snapshot of the visual scene. Any combination of parts may be present. */
const Frame = z.object({
  line: z.number().int().nonnegative(),
  note: z.string().optional(),
  arrays: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.union([z.string(), z.number()])),
        pointers: z.record(z.string(), z.number()).optional(),
        hi: z.array(z.number()).optional(),
        dim: z.array(z.number()).optional(),
        link: z.enum(["none", "next", "prev"]).optional(),
      }),
    )
    .optional(),
  map: z.object({ name: z.string(), entries: z.array(z.tuple([z.string(), z.string()])) }).optional(),
  stack: z.object({ name: z.string(), items: z.array(z.string()) }).optional(),
  grid: z.object({ cells: z.array(z.array(z.string())), at: z.tuple([z.number(), z.number()]).optional() }).optional(),
  tree: z.object({ nodes: z.array(z.union([z.number(), z.null()])), hi: z.array(z.number()).optional() }).optional(),
  vars: z.record(z.string(), z.string()).optional(),
});
export type Frame = z.infer<typeof Frame>;

export const Problem = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    difficulty: z.enum(["easy", "medium"]),
    pattern: PatternId,
    tags: z.array(z.enum(["core", "sap", "made-up", "sorting", "string"])).min(1),
    /** Problem statement in our own words. Blank lines separate paragraphs. */
    statement: z.string().min(20),
    examples: z.array(z.object({ input: z.string(), output: z.string(), note: z.string().optional() })).min(1),
    constraints: z.array(z.string()).default([]),
    myWords: z.string().min(10),
    time: z.string(),
    space: z.string(),
    understand: z.tuple([Choice, Choice, Choice]),
    method: z.string(),
    params: z.array(z.object({ name: z.string(), kind: ArgKind.default("json") })),
    returns: ArgKind.default("json"),
    compare: CompareMode.default("exact"),
    /** Reference solution: the `def` line plus body, at column 0. */
    solution: z.string(),
    /** One caption per body line (the line after `def` is index 0). */
    captions: z.array(z.object({ label: z.string(), text: z.string() })),
    visual: z.array(Frame).optional(),
    tests: z.object({ visible: z.array(TestCase).min(2), hidden: z.array(TestCase).min(3) }),
    hints: z.array(z.string()).min(2),
    followUps: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
    /** Inputs for the edge-case drill: which of these break a naive solution? */
    edgeCases: z.array(z.object({ input: z.string(), breaks: z.boolean(), why: z.string() })).default([]),
    /** Made-up problems: the known pattern/problem this really is. */
    reveal: z.string().optional(),
    /** Made-up problems: id of the core problem this is a disguise of. */
    remixOf: z.string().optional(),
    links: z.object({ leetcode: z.string().url().optional(), neetcode: z.string().url().optional() }).default({}),
    mediaUrl: z.string().url().optional(),
  })
  .superRefine((p, ctx) => {
    const lines = p.solution.split("\n");
    const body = lines.length - 1;
    if (!lines[0]?.startsWith("def ")) ctx.addIssue({ code: "custom", message: "solution must start with `def`" });
    if (body < 1 || body > 10) ctx.addIssue({ code: "custom", message: `solution body is ${body} lines; must be 1-10` });
    if (p.captions.length !== body)
      ctx.addIssue({ code: "custom", message: `captions (${p.captions.length}) must match body lines (${body})` });
    for (const q of p.understand)
      if (q.answer >= q.choices.length) ctx.addIssue({ code: "custom", message: `answer out of range: ${q.prompt}` });
    for (const t of [...p.tests.visible, ...p.tests.hidden])
      if (t.args.length !== p.params.length)
        ctx.addIssue({ code: "custom", message: `test has ${t.args.length} args, expected ${p.params.length}` });
  });
export type Problem = z.infer<typeof Problem>;
export type ProblemInput = z.input<typeof Problem>;

/** Identity helper so content files get type-checking and editor completion. */
export const defineProblem = (p: ProblemInput): ProblemInput => p;

/* ───────────────────────── SQL ───────────────────────── */

export const SqlProblem = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  difficulty: z.enum(["easy", "medium"]),
  concept: z.string(),
  tags: z.array(z.enum(["seed", "original", "sap"])).min(1),
  statement: z.string().min(20),
  /** CREATE TABLE + INSERT statements that seed the database. */
  setup: z.string(),
  /** Extra seeds the query must also pass (hidden tests). */
  hiddenSetups: z.array(z.string()).default([]),
  solution: z.string(),
  orderMatters: z.boolean().default(false),
  myWords: z.string(),
  understand: z.array(Choice).min(1).max(3),
  hints: z.array(z.string()).min(1),
  followUps: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  links: z.object({ leetcode: z.string().url().optional() }).default({}),
});
export type SqlProblem = z.infer<typeof SqlProblem>;
export const defineSql = (p: z.input<typeof SqlProblem>) => p;

/* ───────────────────── Cards and quizzes ───────────────────── */

export const QUIZ_TOPICS = {
  "sql-theory": "SQL theory",
  python: "Python",
  "oop-java": "OOP and Java",
  "js-ts": "JavaScript / TypeScript",
  react: "React / Next.js",
  web: "Web / REST",
  devops: "Docker / Git / Linux / Bash",
  security: "Networking / security",
  complexity: "Complexity and sorting",
  projects: "My projects' tech",
  hci: "HCI research",
  asking: "Questions to ask",
} as const;
export type QuizTopic = keyof typeof QUIZ_TOPICS;

export const QuizQuestion = Choice.extend({
  id: z.string().regex(/^[a-z0-9-]+$/),
  topic: z.enum(Object.keys(QUIZ_TOPICS) as [QuizTopic, ...QuizTopic[]]),
});
export type QuizQuestion = z.infer<typeof QuizQuestion>;

/** A card answered by typing or speaking, then self-graded against key points. */
export const OpenCard = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  track: z.enum(["resume", "skill", "consistency", "behavioral", "sap", "sql-concept"]),
  /** Section heading the card belongs to (resume line, story slot, concept). */
  group: z.string(),
  /** The resume line or source text being defended, if any. */
  source: z.string().optional(),
  kind: z.enum(["individual", "number", "why", "basic", "story", "concept", "consistency"]),
  question: z.string(),
  keyPoints: z.array(z.string()).min(1),
  /** Which resume version(s) the card applies to. `old` is what SAP has. */
  versions: z.array(z.enum(["old", "new"])).default(["old", "new"]),
  /** Product facts that may have changed since this was written. */
  verify: z.boolean().default(false),
});
export type OpenCard = z.infer<typeof OpenCard>;
export const defineCards = (c: z.input<typeof OpenCard>[]) => c;
export const defineQuiz = (q: z.input<typeof QuizQuestion>[]) => q;
