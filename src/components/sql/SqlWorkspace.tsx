"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "@/components/problem/CodeEditor";
import { RATINGS } from "@/components/problem/ExplainPhase";
import { ChoiceQuestion } from "@/components/problem/Understand";
import { cx, Panel, QuoteLine, StatusTag } from "@/components/ui";
import type { SqlProblem } from "@/lib/content/types";
import { useIsDesktop } from "@/lib/hooks";
import { quoteFor } from "@/lib/quotes";
import { checkSql, execQuery, type Grid, type SqlCheck } from "@/lib/runner/sql";
import { loadSql } from "@/lib/runner/sqljs";
import { blip } from "@/lib/sound";
import { actions, progressOf, useStore } from "@/lib/store";

export function GridView({ grid, tone }: { grid?: Grid; tone?: "ok" }) {
  if (!grid) return <p className="text-sm text-ghost">no result yet</p>;
  if (!grid.columns.length) return <p className="text-sm text-ghost">(no rows)</p>;
  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>{grid.columns.map((c, i) => <th key={i} className="px-2 py-1 text-left font-normal text-dim shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{c}</th>)}</tr>
        </thead>
        <tbody>
          {grid.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, k) => <td key={k} className={cx("px-2 py-1 shadow-[inset_0_0_0_1px_var(--color-line)]", tone === "ok" && "text-accent")}>{c === null ? <span className="text-ghost">NULL</span> : String(c)}</td>)}
            </tr>
          ))}
          {!grid.rows.length && <tr><td colSpan={grid.columns.length} className="px-2 py-1 text-ghost shadow-[inset_0_0_0_1px_var(--color-line)]">(0 rows)</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

type Tab = "problem" | "code" | "tests";
const BLANK = "SELECT ";

/** One SQL problem: seeded tables, an editor, a result grid, Run and Submit. */
export function SqlWorkspace({ problem: p }: { problem: SqlProblem }) {
  const store = useStore();
  const desktop = useIsDesktop();
  const prog = progressOf(store, p.id, "sql");
  const [tab, setTab] = useState<Tab>("problem");
  const [query, setQuery] = useState(BLANK);
  const [tables, setTables] = useState<{ name: string; grid: Grid }[]>([]);
  const [check, setCheck] = useState<SqlCheck | null>(null);
  const [mode, setMode] = useState<"run" | "submit">("run");
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState(0);
  const [qi, setQi] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const startedAt = useRef(Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    if (store.ready && !loaded.current) {
      loaded.current = true;
      setQuery(store.drafts[p.id] ?? BLANK);
    }
  }, [store.ready, store.drafts, p.id]);
  useEffect(() => {
    const id = setTimeout(() => actions.saveDraft(p.id, query), 400);
    return () => clearTimeout(id);
  }, [query, p.id]);

  // show the seeded tables so the schema is never a guess
  useEffect(() => {
    void loadSql()
      .then((SQL) => {
        const names = execQuery(SQL, p.setup, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid").rows.map((r) => String(r[0]));
        setTables(names.map((name) => ({ name, grid: execQuery(SQL, p.setup, `SELECT * FROM "${name}"`) })));
      })
      .catch(() => {});
  }, [p.setup]);

  const execute = useCallback(
    async (m: "run" | "submit") => {
      setMode(m);
      setBusy(true);
      setTab("tests");
      try {
        const SQL = await loadSql();
        const r = checkSql(SQL, p, query, m === "submit");
        setCheck(r);
        if (r.status === "pass") blip.pass();
        else blip.fail();
        // looking at the reference query counts as a hint, so it can't earn a clean solve
        if (m === "submit") actions.coldSubmit(p.id, "sql", { pass: r.status === "pass", hints: hints + (showSolution ? 1 : 0), ms: Date.now() - startedAt.current, note: r.status === "pass" ? undefined : r.error ?? `${r.passed}/${r.total} datasets matched` });
      } catch (e) {
        setCheck({ status: "error", error: e instanceof Error ? e.message : String(e), passed: 0, total: 1, ms: 0 });
      }
      setBusy(false);
    },
    [p, query, hints, showSolution],
  );

  const accepted = check?.status === "pass" && mode === "submit";

  const problemPane = (
    <Panel title="Problem" className="min-w-0">
      <div className="p-4">
        <div className="prose max-w-[68ch] text-sm leading-relaxed">{p.statement.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</div>
        <p className="mt-3 text-xs text-dim">{p.orderMatters ? "Row order matters for this one." : "Row order doesn't matter."} Column names are ignored; column order is not.</p>
        <div className="mt-4 flex flex-wrap gap-5">
          {tables.map((t) => (
            <div key={t.name} className="min-w-0">
              <p className="label mb-1">{t.name}</p>
              <GridView grid={t.grid} />
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line p-4">
        {qi < p.understand.length ? (
          <ChoiceQuestion q={p.understand[qi]!} index={qi} total={p.understand.length} onNext={() => setQi(qi + 1)} />
        ) : (
          <p className="text-sm text-dim">Warm-up done. Write the query.</p>
        )}
      </div>
      <div className="border-t border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="label">Hints used {hints}/{p.hints.length}</p>
          <button type="button" className="btn btn-sm" disabled={hints >= p.hints.length} onClick={() => setHints(hints + 1)}>{hints ? "Next hint" : "Show a hint"}</button>
        </div>
        <ol className="mt-2 flex flex-col gap-2 text-sm">{p.hints.slice(0, hints).map((h, i) => <li key={i} className="text-second"><span className="text-dim">{i + 1}. </span>{h}</li>)}</ol>
        {p.links.leetcode && <a className="mt-3 inline-block text-xs text-dim underline underline-offset-4 hover:text-text" href={p.links.leetcode} target="_blank" rel="noreferrer">LeetCode ↗</a>}
      </div>
    </Panel>
  );

  const codePane = (
    <Panel title="query.sql" inset className="min-w-0" right={<button type="button" className="btn btn-sm" onClick={() => setQuery(BLANK)}>Reset</button>}>
      <CodeEditor value={query} onChange={setQuery} language="sql" onRun={() => void execute("run")} onSubmit={() => void execute("submit")} label="SQL query" minHeight={200} />
      <div className="flex items-center justify-end gap-1 border-t border-line p-2">
        <span className="mr-auto hidden text-xs text-ghost md:inline">Ctrl+Enter run · Ctrl+Shift+Enter submit</span>
        <button type="button" className="btn" disabled={busy} onClick={() => void execute("run")}>Run</button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void execute("submit")}>Submit</button>
      </div>
    </Panel>
  );

  const resultPane = (
    <Panel title="Result" inset className="min-w-0">
      <div className="p-3" data-testid="sql-result" aria-live="polite">
        {!check && <p className="text-sm text-ghost">Run compares your rows with the expected rows on the tables shown. Submit also checks hidden data.</p>}
        {check?.error && <pre className="whitespace-pre-wrap text-sm text-error">SQL error: {check.error}</pre>}
        {check && !check.error && (
          <>
            <p className={cx("mb-3 font-pixel text-xs uppercase", check.status === "pass" ? "text-accent" : "text-error")}>
              {check.status === "pass" ? (mode === "submit" ? `Accepted · ${check.total}/${check.total} datasets` : "Matches the expected rows") : mode === "submit" ? `${check.passed}/${check.total} datasets matched` : "Rows don't match"}
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="min-w-0"><p className="label mb-1">Your rows</p><GridView grid={check.actual} tone={check.status === "pass" ? "ok" : undefined} /></div>
              {check.status !== "pass" && <div className="min-w-0"><p className="label mb-1">Expected</p><GridView grid={check.expected} /></div>}
            </div>
            {check.status === "fail" && mode === "submit" && check.passed > 0 && <p className="mt-3 text-xs text-dim">Some data matches but a hidden dataset doesn't. Think NULLs, ties, duplicates, empty tables.</p>}
          </>
        )}
      </div>
    </Panel>
  );

  const after = accepted && (
    <Panel accent title="Accepted" className="fade-in">
      <div className="p-4">
        <p className="label mb-1">In my words</p>
        <p className="text-sm">{p.myWords}</p>
        {p.followUps.length > 0 && (
          <>
            <p className="label mb-1 mt-4">What the interviewer asks next</p>
            <ul className="flex flex-col gap-1 text-sm">{p.followUps.map((f) => <li key={f.q}><details><summary className="cursor-pointer">{f.q}</summary><p className="mt-1 pl-4 text-dim">{f.a}</p></details></li>)}</ul>
          </>
        )}
        <p className="label mb-2 mt-4">Say the query out loud, then rate it</p>
        <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
          {RATINGS.map((r) => <button key={r.id} type="button" className={cx("btn", prog.rating === r.id && "text-accent")} onClick={() => actions.rate(p.id, "sql", r.id)}>{r.label}</button>)}
        </div>
        <QuoteLine quote={quoteFor(p.id.length * 3)} className="mt-4" />
      </div>
    </Panel>
  );

  const solution = (
    <div>
      <button type="button" className="btn btn-sm" aria-pressed={showSolution} onClick={() => setShowSolution(!showSolution)}>{showSolution ? "Hide reference query" : "Stuck? Show reference query"}</button>
      {showSolution && <pre className="mt-2 overflow-x-auto bg-inset p-3 text-xs text-dim shadow-[inset_0_0_0_1px_var(--color-line)]">{p.solution}</pre>}
    </div>
  );

  return (
    <div>
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/sql" className="label hover:text-text">← SQL</Link>
          <span className="chip">{p.difficulty}</span>
          <span className="chip">{p.concept}</span>
          {store.ready && <StatusTag status={prog.status} />}
        </div>
        <h1 className="h1 mt-2">{p.title}</h1>
      </header>
      {desktop ? (
        <div className="grid grid-cols-2 items-start gap-3">
          {problemPane}
          <div className="flex min-w-0 flex-col gap-3">{codePane}{after}{resultPane}{solution}</div>
        </div>
      ) : (
        <div>
          <div className="mb-2 grid grid-cols-3" role="tablist">
            {(["problem", "code", "tests"] as Tab[]).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={cx("h-10 border-b-2 font-pixel text-xs uppercase tracking-wider", tab === t ? "border-accent text-accent" : "border-line text-dim")} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className={tab === "problem" ? "" : "hidden"}>{problemPane}</div>
          <div className={tab === "code" ? "flex flex-col gap-3" : "hidden"}>{codePane}{solution}</div>
          <div className={tab === "tests" ? "flex flex-col gap-3" : "hidden"}>{after}{resultPane}</div>
        </div>
      )}
    </div>
  );
}
