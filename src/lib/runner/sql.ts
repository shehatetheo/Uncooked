import type { Database, SqlJsStatic } from "sql.js";
import type { SqlProblem } from "@/lib/types";
import type { Cell, Grid, RunReport } from "./grade";

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

/** The tables in a seed, for showing the schema next to the problem. */
export function seedTables(SQL: SqlJsStatic, setup: string): { name: string; grid: Grid }[] {
  const names = execQuery(SQL, setup, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid").rows.map((r) => String(r[0]));
  return names.map((name) => ({ name, grid: execQuery(SQL, setup, `SELECT * FROM "${name}"`) }));
}

/** Each seed is one test: the query's rows must equal the reference query's rows. */
export function checkSql(SQL: SqlJsStatic, p: SqlProblem, query: string, mode: "run" | "submit"): RunReport {
  const seeds = mode === "submit" ? [p.setup, ...p.hiddenSetups] : [p.setup];
  const start = Date.now();
  const reference = p.solution.join("\n");
  const report: RunReport = { mode, status: "pass", results: [], passed: 0, total: seeds.length, ms: 0, grid: {} };
  if (!query.trim() || /^select\s*$/i.test(query.trim())) return { ...report, status: "error", fatal: "Write a query first." };
  for (const [i, seed] of seeds.entries()) {
    const expected = execQuery(SQL, seed, reference);
    try {
      const actual = execQuery(SQL, seed, query);
      if (i === 0) report.grid = { actual, expected };
      const pass = gridsMatch(actual, expected, p.orderMatters);
      report.results.push({ index: i, hidden: i > 0, pass, args: [], expected: expected.rows, output: actual.rows, stdout: "", ms: 0 });
    } catch (e) {
      return { ...report, status: "error", fatal: `SQL error: ${e instanceof Error ? e.message : String(e)}`, ms: Date.now() - start };
    }
  }
  report.passed = report.results.filter((r) => r.pass).length;
  report.status = report.passed === seeds.length ? "pass" : "fail";
  report.ms = Date.now() - start;
  return report;
}
