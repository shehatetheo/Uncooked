import type { ArgKind, CompareMode, Problem, TestCase } from "@/lib/content/types";

export interface RunPayload {
  code: string;
  method: string;
  kinds: ArgKind[];
  returns: ArgKind;
  tests: unknown[][];
}

export interface RawResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  ms?: number;
  stdout: string;
}

export type RawRun = { fatal: string } | { results: RawResult[] };

export interface TestResult {
  index: number;
  hidden: boolean;
  pass: boolean;
  args: unknown[];
  expected: unknown;
  output?: unknown;
  error?: string;
  stdout: string;
  ms: number;
}

export interface RunReport {
  status: "pass" | "fail" | "error" | "timeout";
  fatal?: string;
  results: TestResult[];
  passed: number;
  total: number;
  ms: number;
}

const canon = (v: unknown): string => JSON.stringify(v);
const sortCanon = (v: unknown[]): string[] => v.map(canon).sort();

/** Compare actual output with expected under the problem's comparison mode. */
export function outputsMatch(actual: unknown, expected: unknown, mode: CompareMode): boolean {
  if (mode === "exact") return canon(actual) === canon(expected);
  if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
  if (mode === "unordered") return canon(sortCanon(actual)) === canon(sortCanon(expected));
  // groups: a list of lists where neither group order nor order within a group matters
  const norm = (groups: unknown[]) => groups.map((g) => (Array.isArray(g) ? canon(sortCanon(g)) : canon(g))).sort();
  return canon(norm(actual)) === canon(norm(expected));
}

export function buildPayload(p: Problem, code: string, tests: TestCase[]): RunPayload {
  return { code, method: p.method, kinds: p.params.map((x) => x.kind), returns: p.returns, tests: tests.map((t) => t.args) };
}

export function grade(p: Problem, tests: TestCase[], hiddenFrom: number, raw: RawRun): RunReport {
  if ("fatal" in raw) return { status: "error", fatal: raw.fatal, results: [], passed: 0, total: tests.length, ms: 0 };
  const results = raw.results.map((r, i): TestResult => {
    const t = tests[i]!;
    return {
      index: i,
      hidden: i >= hiddenFrom,
      pass: r.ok && outputsMatch(r.output, t.expected, p.compare),
      args: t.args,
      expected: t.expected,
      output: r.output,
      error: r.error,
      stdout: r.stdout,
      ms: r.ms ?? 0,
    };
  });
  const passed = results.filter((r) => r.pass).length;
  return {
    status: passed === tests.length ? "pass" : results.some((r) => r.error) ? "error" : "fail",
    results,
    passed,
    total: tests.length,
    ms: results.reduce((a, r) => a + r.ms, 0),
  };
}

/** Wrap a reference solution (def at column 0) in `class Solution`. */
export const wrapSolution = (solution: string): string =>
  "class Solution:\n" + solution.split("\n").map((l) => (l ? "    " + l : l)).join("\n") + "\n";

/** Starter code for the cold solve: just the signature. */
export const starterCode = (p: Problem): string => `class Solution:\n    ${p.solution.split("\n")[0]}\n        `;
