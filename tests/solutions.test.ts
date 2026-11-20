/**
 * Runs every reference solution against every visible and hidden test, with
 * the same Python harness the browser uses. Also checks each problem file is
 * well-formed. Problem files are discovered automatically.
 *
 *   npm run check                      every problem
 *   ONLY=two-sum,lru-cache npm run check   just these
 */
import { createRequire } from "node:module";
import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import type { SqlJsStatic } from "sql.js";
import { referenceCode, starterCode } from "@/lib/code";
import { buildPayload, grade, type RawRun } from "@/lib/runner/grade";
import { HARNESS } from "@/lib/runner/harness";
import { checkSql } from "@/lib/runner/sql";
import type { Problem, PythonProblem } from "@/lib/types";

const files = import.meta.glob<{ default: Problem }>("../content/problems/*.ts", { eager: true });
const only = process.env.ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
const problems = Object.entries(files)
  .map(([path, mod]) => ({ file: path.split("/").pop()!.replace(/\.ts$/, ""), p: mod.default }))
  .filter(({ file }) => !only || only.includes(file));

let py: PyodideInterface;
let SQL: SqlJsStatic;
const runPy = (p: PythonProblem, code: string) => {
  const tests = [...p.tests.visible, ...p.tests.hidden];
  const raw = JSON.parse(py.globals.get("run_tests")(JSON.stringify(buildPayload(p, code, tests)))) as RawRun;
  return grade(p, tests, p.tests.visible.length, raw, "submit");
};

beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(HARNESS);
  const require = createRequire(import.meta.url);
  SQL = await (require("sql.js") as (c?: object) => Promise<SqlJsStatic>)();
});

describe("problem files", () => {
  it("found problems to check", () => expect(problems.length).toBeGreaterThan(0));

  for (const { file, p } of problems) {
    describe(file, () => {
      it("is well-formed", () => {
        expect(p.id, "id must match the file name").toBe(file);
        expect(p.link).toMatch(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/);
        expect(p.statement.length).toBeGreaterThan(60);
        expect(p.examples.length).toBeGreaterThanOrEqual(1);
        expect(p.hints.length, "at least 2 hint levels").toBeGreaterThanOrEqual(2);
        expect(p.followUps.length).toBeGreaterThanOrEqual(1);
        expect(p.captions.length, "one caption per solution line").toBe(p.solution.length);
        if (p.kind === "python") {
          if (!p.design) {
            expect(p.signature).toMatch(/^def \w+\(self/);
            expect(p.signature).toContain(`def ${p.method}(`);
            expect(p.solution.length, "function body must be 1-10 lines").toBeLessThanOrEqual(10);
            expect(p.captions.every((c) => c.trim().length > 0), "every line needs a caption").toBe(true);
          }
          expect(p.tests.visible.length).toBeGreaterThanOrEqual(2);
          expect(p.tests.hidden.length).toBeGreaterThanOrEqual(3);
          for (const t of [...p.tests.visible, ...p.tests.hidden]) expect(t.args.length, "args must match params").toBe(p.params.length);
        } else {
          expect(p.hiddenSetups.length).toBeGreaterThanOrEqual(3);
        }
      });

      it("reference solution passes every visible and hidden test", () => {
        if (p.kind === "sql") {
          const report = checkSql(SQL, p, referenceCode(p), "submit");
          expect(report.fatal, report.fatal).toBeUndefined();
          expect(report.passed).toBe(report.total);
          // every seed must produce rows, or the test proves nothing
          for (const r of report.results) expect((r.expected as unknown[]).length).toBeGreaterThan(0);
          return;
        }
        const report = runPy(p, referenceCode(p));
        const failures = report.results.filter((r) => !r.pass).map((r) => ({ args: r.args, expected: r.expected, got: r.output, error: r.error }));
        expect(report.fatal, report.fatal).toBeUndefined();
        expect(failures).toEqual([]);
      });

      it("the empty starter does not pass (the tests aren't vacuous)", () => {
        if (p.kind === "sql") {
          expect(checkSql(SQL, p, "SELECT 1", "submit").status).not.toBe("pass");
          return;
        }
        const code = p.design ? starterCode(p).replace(/\n {8}\n/g, "\n        pass\n") : starterCode(p) + "pass\n";
        expect(runPy(p, code).status).not.toBe("pass");
      });
    });
  }
});

describe("the index", () => {
  it("lists every problem file exactly once", async () => {
    if (only) return;
    const { problems: listed } = await import("@content/index");
    expect(listed.map((p) => p.id).sort()).toEqual(problems.map((x) => x.file).sort());
    expect(listed).toHaveLength(32);
  });
});
