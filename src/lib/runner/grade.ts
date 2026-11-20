import type { CompareMode, PythonProblem, TestCase } from "@/lib/types";

export interface RunPayload {
  code: string;
  method: string;
  kinds: string[];
  returns: string;
  design: string | null;
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

/** One Run or Submit, for Python or SQL. This is also what the interviewer is told. */
export interface RunReport {
  mode: "run" | "submit";
  status: "pass" | "fail" | "error" | "timeout";
  /** The code didn't load at all (syntax error, timeout, missing class). */
  fatal?: string;
  results: TestResult[];
  passed: number;
  total: number;
  ms: number;
  /** SQL only: the result grid on the example tables, and what it should be. */
  grid?: { actual?: Grid; expected?: Grid };
}

export type Cell = string | number | null;
export interface Grid {
  columns: string[];
  rows: Cell[][];
}

const canon = (v: unknown): string => JSON.stringify(v);
const sortCanon = (v: unknown[]): string[] => v.map(canon).sort();

export function outputsMatch(actual: unknown, expected: unknown, mode: CompareMode): boolean {
  if (mode === "exact") return canon(actual) === canon(expected);
  if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
  if (mode === "unordered") return canon(sortCanon(actual)) === canon(sortCanon(expected));
  const norm = (groups: unknown[]) => groups.map((g) => (Array.isArray(g) ? canon(sortCanon(g)) : canon(g))).sort();
  return canon(norm(actual)) === canon(norm(expected));
}

export function buildPayload(p: PythonProblem, code: string, tests: TestCase[]): RunPayload {
  return { code, method: p.method, kinds: p.params.map((x) => x.kind ?? "json"), returns: p.returns ?? "json", design: p.design?.className ?? null, tests: tests.map((t) => t.args) };
}

export function grade(p: PythonProblem, tests: TestCase[], hiddenFrom: number, raw: RawRun, mode: "run" | "submit"): RunReport {
  if ("fatal" in raw) return { mode, status: "error", fatal: raw.fatal, results: [], passed: 0, total: tests.length, ms: 0 };
  const results = raw.results.map((r, i): TestResult => {
    const t = tests[i]!;
    return { index: i, hidden: i >= hiddenFrom, pass: r.ok && outputsMatch(r.output, t.expected, p.compare ?? "exact"), args: t.args, expected: t.expected, output: r.output, error: r.error, stdout: r.stdout, ms: r.ms ?? 0 };
  });
  const passed = results.filter((r) => r.pass).length;
  return { mode, status: passed === tests.length ? "pass" : results.some((r) => r.error) ? "error" : "fail", results, passed, total: tests.length, ms: results.reduce((a, r) => a + r.ms, 0) };
}
