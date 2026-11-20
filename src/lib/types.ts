/**
 * The shape of a problem. One file per problem in content/problems.
 * Plain data on purpose: easy to move into a database later.
 */

/** How a test argument is turned into a Python value. */
export type ArgKind =
  | "json" // passed as-is
  | "list" // [1,2,3] becomes a ListNode chain
  | "tree" // [3,9,20,null,null,15,7] becomes a TreeNode (level order, like LeetCode)
  | "cycle"; // [[3,2,0,-4], 1] becomes a ListNode chain whose tail points at index 1 (-1 = no cycle)

/** How the return value is turned back into JSON for comparing. */
export type ReturnKind =
  | "json"
  | "list" // ListNode chain -> array
  | "tree" // TreeNode -> level-order array
  | "arg0" // in-place problems: compare the first argument after the call
  | "prefix"; // returns k: compare the first k items of the first argument

export type CompareMode =
  | "exact"
  | "unordered" // a list where order doesn't matter
  | "groups"; // a list of lists where neither order matters

export interface TestCase {
  args: unknown[];
  expected: unknown;
}

interface ProblemBase {
  /** Same as the LeetCode slug. */
  id: string;
  title: string;
  difficulty: "Easy" | "Medium";
  tags: string[];
  /** In our own words. Blank lines separate paragraphs. */
  statement: string;
  examples: { input: string; output: string; note?: string }[];
  constraints: string[];
  /** Reference solution, one string per line. See `solution` notes on each kind. */
  solution: string[];
  /** One short caption per solution line, same length as `solution`. */
  captions: string[];
  /** Smallest nudge first, biggest last. Never the full answer. */
  hints: string[];
  /** What a real interviewer asks after you pass. */
  followUps: string[];
  /** Complexity of the reference solution, e.g. "O(n)". */
  time: string;
  space: string;
  /** LeetCode page. */
  link: string;
}

export interface PythonProblem extends ProblemBase {
  kind: "python";
  /** The method's def line, e.g. "def twoSum(self, nums: List[int], target: int) -> List[int]:" */
  signature: string;
  method: string;
  params: { name: string; kind?: ArgKind }[];
  returns?: ReturnKind;
  compare?: CompareMode;
  /**
   * Design problems (LRU Cache): tests use LeetCode's operation-list format,
   * args = [["LRUCache","put","get"], [[2],[1,1],[1]]], expected = [null,null,1].
   * `starter` is the whole class skeleton and `solution` is the whole class.
   */
  design?: { className: string; starter: string };
  /** For normal problems: the function body only, at column 0. 1-10 lines. */
  tests: { visible: TestCase[]; hidden: TestCase[] };
}

export interface SqlProblem extends ProblemBase {
  kind: "sql";
  /** CREATE TABLE + INSERT statements for the visible example. */
  setup: string;
  /** More seeds the query must also pass (the hidden tests). */
  hiddenSetups: string[];
  orderMatters: boolean;
}

export type Problem = PythonProblem | SqlProblem;

export type Phase = "talk" | "ghost" | "blind" | "feedback";
export const PHASES: Phase[] = ["talk", "ghost", "blind", "feedback"];
export const PHASE_LABEL: Record<Phase, string> = { talk: "Talk", ghost: "Ghost", blind: "Blind", feedback: "Feedback" };

/** Typed helpers so content files get checked as they're written. */
export const python = (p: Omit<PythonProblem, "kind">): PythonProblem => ({ kind: "python", ...p });
export const sql = (p: Omit<SqlProblem, "kind">): SqlProblem => ({ kind: "sql", ...p });
