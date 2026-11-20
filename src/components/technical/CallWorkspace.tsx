"use client";
import { useEffect, useMemo, useState } from "react";
import type { TechQuestion } from "@content/technical";
import { CodeEditor } from "@/components/problem/CodeEditor";
import { ProblemText } from "@/components/problem/ProblemText";
import { TestsPanel } from "@/components/problem/TestsPanel";
import { GridView } from "@/components/sql/SqlWorkspace";
import { cx, Panel } from "@/components/ui";
import { problemById } from "@/lib/content/problems";
import { sqlById } from "@/lib/content/sql";
import { runPython } from "@/lib/runner/python";
import { checkSql, execQuery, type Grid, type SqlCheck } from "@/lib/runner/sql";
import { loadSql } from "@/lib/runner/sqljs";
import { starterCode, wrapSolution, type RunReport } from "@/lib/runner/types";

type Side = "question" | "hints" | "solution";
type Console = "output" | "tests";

/** The starter code for a question: the signature (Python) or SELECT (SQL). */
export function starterFor(q: TechQuestion): string {
  if (q.kind === "sql") return "SELECT ";
  const p = problemById.get(q.ref);
  return p ? starterCode(p) : "";
}

/**
 * The coding screen of a live interview: question, hints and solution on the
 * left, an editor with Run and a console on the right. The interviewer sees
 * the code too.
 */
export function CallWorkspace({ q, code, onCode, hints, solved }: { q: TechQuestion; code: string; onCode: (c: string) => void; hints: boolean; solved: boolean }) {
  const p = q.kind === "code" ? problemById.get(q.ref) : undefined;
  const sp = q.kind === "sql" ? sqlById.get(q.ref) : undefined;
  const [side, setSide] = useState<Side>("question");
  const [con, setCon] = useState<Console>("output");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);
  const [sql, setSql] = useState<SqlCheck | null>(null);
  const [tables, setTables] = useState<{ name: string; grid: Grid }[]>([]);
  const [hintsOpen, setHintsOpen] = useState(0);

  useEffect(() => {
    if (!sp) return;
    void loadSql()
      .then((SQL) => {
        const names = execQuery(SQL, sp.setup, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid").rows.map((r) => String(r[0]));
        setTables(names.map((name) => ({ name, grid: execQuery(SQL, sp.setup, `SELECT * FROM "${name}"`) })));
      })
      .catch(() => {});
  }, [sp]);

  const run = async () => {
    setRunning(true);
    try {
      if (p) {
        const r = await runPython(p, code, p.tests.visible, p.tests.visible.length);
        setReport(r);
        setCon(r.fatal || r.results.some((x) => x.stdout) ? "output" : "tests");
      } else if (sp) {
        const SQL = await loadSql();
        setSql(checkSql(SQL, sp, code, false));
        setCon("output");
      }
    } catch (e) {
      setReport({ status: "error", fatal: e instanceof Error ? e.message : String(e), results: [], passed: 0, total: 0, ms: 0 });
    }
    setRunning(false);
  };

  const stdout = useMemo(() => report?.results.map((r) => r.stdout).filter(Boolean).join("\n") ?? "", [report]);
  const allHints = p?.hints ?? sp?.hints ?? [];
  const solution = p ? wrapSolution(p.solution) : sp?.solution ?? "";

  const tab = (id: string, label: string, on: boolean, set: () => void, lock?: boolean) => (
    <button key={id} type="button" role="tab" aria-selected={on} className={cx("h-10 border-b-2 px-3 font-pixel text-xs uppercase tracking-wider", on ? "border-accent text-accent" : "border-transparent text-dim hover:text-text")} onClick={set} data-testid={`tab-${id}`}>
      {label}{lock ? " ⌧" : ""}
    </button>
  );

  return (
    <div className="grid items-stretch gap-3 lg:grid-cols-2" data-testid="call-workspace">
      <Panel className="flex min-w-0 flex-col">
        <div className="flex border-b border-line" role="tablist">
          {tab("question", "Question", side === "question", () => setSide("question"))}
          {tab("hints", "Hints", side === "hints", () => setSide("hints"), !hints)}
          {tab("solution", "Solution", side === "solution", () => setSide("solution"), !solved)}
        </div>
        <div className="max-h-[520px] min-h-[260px] overflow-y-auto">
          {side === "question" && (p ? <ProblemText p={p} showLinks={false} /> : sp ? (
            <div className="p-4">
              <div className="prose max-w-[68ch] text-sm leading-relaxed">{sp.statement.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</div>
              <div className="mt-4 flex flex-wrap gap-5">{tables.map((t) => <div key={t.name} className="min-w-0"><p className="label mb-1">{t.name}</p><GridView grid={t.grid} /></div>)}</div>
            </div>
          ) : null)}
          {side === "hints" && (
            <div className="flex flex-col gap-3 p-4 text-sm" data-testid="hints-pane">
              {!hints ? (
                <p className="text-dim">No hints on this call, just like the real interview. Ask the interviewer a question instead.</p>
              ) : (
                <>
                  <div>
                    <p className="label mb-1">How you get full marks</p>
                    <ul className="flex flex-col gap-1">
                      {q.rubric.map((r) => <li key={r.id} className="grid grid-cols-[1fr_auto] gap-2"><span>▸ {r.label}</span><span className="tabular-nums text-dim">{r.max}</span></li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="label mb-1">Hints {hintsOpen}/{allHints.length}</p>
                    <ol className="flex flex-col gap-2">{allHints.slice(0, hintsOpen).map((h, i) => <li key={i} className="text-second"><span className="text-dim">{i + 1}. </span>{h}</li>)}</ol>
                    {hintsOpen < allHints.length && <button type="button" className="btn btn-sm mt-2" onClick={() => setHintsOpen(hintsOpen + 1)}>{hintsOpen ? "Next hint" : "Show a hint"}</button>}
                  </div>
                </>
              )}
            </div>
          )}
          {side === "solution" && (
            <div className="flex flex-col gap-3 p-4 text-sm" data-testid="solution-pane">
              {!solved ? (
                <p className="text-dim">Unlocks when this round is over. No peeking mid-interview.</p>
              ) : (
                <>
                  <p>{p?.myWords ?? sp?.myWords}</p>
                  <pre className="overflow-x-auto bg-inset p-3 text-xs leading-relaxed text-accent shadow-[inset_0_0_0_1px_var(--color-line)]">{solution}</pre>
                  <div>
                    <p className="label mb-1">How to say it</p>
                    <p className="text-dim">{q.say}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Panel>

      <Panel inset className="flex min-w-0 flex-col" title={q.kind === "sql" ? "query.sql" : "solution.py"} right={<button type="button" className="btn btn-sm" onClick={() => onCode(starterFor(q))}>Reset</button>}>
        <CodeEditor value={code} onChange={onCode} language={q.kind === "sql" ? "sql" : "python"} onRun={() => void run()} onSubmit={() => void run()} label="Interview code" minHeight={220} />
        <div className="flex items-center gap-1 border-t border-line p-2">
          {tab("output", "Output", con === "output", () => setCon("output"))}
          {tab("tests", "Test results", con === "tests", () => setCon("tests"))}
          <button type="button" className="btn btn-primary ml-auto" disabled={running} onClick={() => void run()} data-testid="run-code">{running ? "Running…" : "Run code"}</button>
        </div>
        <div className="min-h-[140px] border-t border-line" data-testid="console">
          {con === "output" ? (
            <div className="bg-inset p-3 text-sm">
              {running && <p className="text-second">running…</p>}
              {!running && !report && !sql && <p className="text-ghost">Run code to see output. Talk while you type: the interviewer can see your code.</p>}
              {report?.fatal && <pre className="whitespace-pre-wrap text-error">{report.fatal}</pre>}
              {report && !report.fatal && (
                <>
                  {stdout && <pre className="whitespace-pre-wrap text-text">{stdout}</pre>}
                  <p className={cx("mt-1", report.status === "pass" ? "text-accent" : "text-second")}>{report.passed}/{report.total} example tests pass{report.status === "pass" ? "" : ". See Test results."}</p>
                </>
              )}
              {sql?.error && <pre className="whitespace-pre-wrap text-error">SQL error: {sql.error}</pre>}
              {sql && !sql.error && (
                <div>
                  <p className={cx("mb-2", sql.status === "pass" ? "text-accent" : "text-second")}>{sql.status === "pass" ? "Matches the expected rows" : "Rows don't match yet"}</p>
                  <GridView grid={sql.actual} tone={sql.status === "pass" ? "ok" : undefined} />
                </div>
              )}
            </div>
          ) : p ? (
            <TestsPanel report={report} running={running} booting={false} mode="run" argNames={p.params.map((x) => x.name)} />
          ) : (
            <div className="bg-inset p-3 text-sm">
              {sql && !sql.error ? (
                <div className="flex flex-wrap gap-6">
                  <div><p className="label mb-1">Yours</p><GridView grid={sql.actual} /></div>
                  <div><p className="label mb-1">Expected</p><GridView grid={sql.expected} /></div>
                </div>
              ) : (
                <p className="text-ghost">Run the query to compare with the expected rows.</p>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
