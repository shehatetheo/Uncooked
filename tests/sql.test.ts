import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { sqlProblems } from "@/lib/content";
import { checkSql, execQuery, gridsMatch } from "@/lib/runner/sql";

let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});

describe("grid comparison", () => {
  const g = (rows: (string | number | null)[][]) => ({ columns: rows[0]?.map((_, i) => `c${i}`) ?? [], rows });
  it("ignores row order unless told otherwise", () => {
    expect(gridsMatch(g([[1, "a"], [2, "b"]]), g([[2, "b"], [1, "a"]]), false)).toBe(true);
    expect(gridsMatch(g([[1, "a"], [2, "b"]]), g([[2, "b"], [1, "a"]]), true)).toBe(false);
  });
  it("treats NULL as a value and 2 == 2.0", () => {
    expect(gridsMatch(g([[null]]), g([[null]]), false)).toBe(true);
    expect(gridsMatch(g([[2]]), g([[2.0]]), false)).toBe(true);
    expect(gridsMatch(g([[null]]), g([]), false)).toBe(false);
  });
});

describe("sql reference solutions", () => {
  for (const p of sqlProblems) {
    it(`${p.id}: reference query runs on every seed and returns rows on the visible one`, () => {
      const r = checkSql(SQL, p, p.solution, true);
      expect(r.error).toBeUndefined();
      expect(r.status).toBe("pass");
      expect(r.expected!.columns.length).toBeGreaterThan(0);
    });
    it(`${p.id}: a trivial query does not pass`, () => {
      expect(checkSql(SQL, p, "SELECT 1 WHERE 0", true).status).not.toBe("pass");
    });
    it(`${p.id}: hidden seeds give a different answer than the visible seed`, () => {
      const base = execQuery(SQL, p.setup, p.solution);
      for (const h of p.hiddenSetups) expect(gridsMatch(base, execQuery(SQL, h, p.solution), true)).toBe(false);
    });
  }
});
