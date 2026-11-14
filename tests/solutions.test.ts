import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import { problems } from "@/lib/content";
import { HARNESS } from "@/lib/runner/harness";
import { buildPayload, grade, starterCode, wrapSolution, type RawRun } from "@/lib/runner/types";
import type { Problem } from "@/lib/content/types";

let py: PyodideInterface;
const run = (p: Problem, code: string) => {
  const tests = [...p.tests.visible, ...p.tests.hidden];
  const raw = JSON.parse(py.globals.get("run_tests")(JSON.stringify(buildPayload(p, code, tests)))) as RawRun;
  return grade(p, tests, p.tests.visible.length, raw);
};

beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(HARNESS);
});

describe("reference solutions", () => {
  it("has problems to check", () => expect(problems.length).toBeGreaterThan(0));

  for (const p of problems) {
    it(`${p.id}: reference passes every visible and hidden test`, () => {
      const report = run(p, wrapSolution(p.solution));
      const failures = report.results.filter((r) => !r.pass).map((r) => ({ args: r.args, expected: r.expected, got: r.output, error: r.error }));
      expect(report.fatal, report.fatal).toBeUndefined();
      expect(failures).toEqual([]);
    });

    it(`${p.id}: empty starter does not pass (tests are not vacuous)`, () => {
      const report = run(p, starterCode(p) + "pass\n");
      expect(report.status).not.toBe("pass");
    });
  }
});
