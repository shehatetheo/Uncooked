import type { Database, SqlJsStatic } from "sql.js";
import type { SqlProblem } from "@/lib/content/types";

export type Cell = string | number | null;
export interface Grid {
  columns: string[];
  rows: Cell[][];
}
export interface SqlCheck {
  status: "pass" | "fail" | "error";
  error?: string;
  /** Result against the visible seed, shown in the grid. */
  actual?: Grid;
  expected?: Grid;
  /** Number of seeds (visible + hidden) the query matched. */
  passed: number;
  total: number;
  ms: number;
}

const cell = (v: unknown): Cell => (v === null || typeof v === "string" || typeof v === "number" ? v : String(v));
// SQLite returns 2 and 2.0 for the same value depending on the expression.
const key = (row: Cell[]) => JSON.stringify(row.map((c) => (typeof c === "number" ? Number(c.toFixed(6)) : c)));

/** Run setup then the query in a fresh database; return the last result set. */
export function execQuery(SQL: SqlJsStatic, setup: string, query: string): Grid {
  const db: Database = new SQL.Database();
  try {
    db.run(setup);
    // Step statements by hand so a query with zero rows still reports its columns.
    let grid: Grid = { columns: [], rows: [] };
    for (const stmt of db.iterateStatements(query)) {
      const columns = stmt.getColumnNames();
      const rows: Cell[][] = [];
      while (stmt.step()) rows.push(stmt.get().map(cell));
      if (columns.length) grid = { columns, rows };
    }
    return grid;
  } finally {
    db.close();
  }
}

/** Column names are ignored (aliases vary); values and column count must match. */
export function gridsMatch(a: Grid, b: Grid, orderMatters: boolean): boolean {
  if (a.rows.length !== b.rows.length || a.columns.length !== b.columns.length) return false;
  const ka = a.rows.map(key);
  const kb = b.rows.map(key);
  if (!orderMatters) {
    ka.sort();
    kb.sort();
  }
  return ka.every((k, i) => k === kb[i]);
}

export function checkSql(SQL: SqlJsStatic, p: SqlProblem, query: string, includeHidden: boolean): SqlCheck {
  const seeds = includeHidden ? [p.setup, ...p.hiddenSetups] : [p.setup];
  const start = performance.now();
  let passed = 0;
  let actual: Grid | undefined;
  let expected: Grid | undefined;
  try {
    if (!query.trim()) throw new Error("Write a query first.");
    seeds.forEach((seed, i) => {
      const want = execQuery(SQL, seed, p.solution);
      const got = execQuery(SQL, seed, query);
      if (i === 0) {
        actual = got;
        expected = want;
      }
      if (gridsMatch(got, want, p.orderMatters)) passed++;
    });
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : String(e), actual, expected, passed, total: seeds.length, ms: performance.now() - start };
  }
  return { status: passed === seeds.length ? "pass" : "fail", actual, expected, passed, total: seeds.length, ms: performance.now() - start };
}
