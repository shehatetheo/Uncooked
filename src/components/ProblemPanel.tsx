"use client";
import { useEffect, useState } from "react";
import { ghostLines, referenceCode } from "@/lib/code";
import type { Grid } from "@/lib/runner/grade";
import { seedTables } from "@/lib/runner/sql";
import { loadSql } from "@/lib/runner/sqljs";
import type { Phase, Problem } from "@/lib/types";

export type ProblemTab = "question" | "hints" | "solution";

export function GridView({ grid }: { grid?: Grid }) {
  if (!grid) return <p className="text-sm text-faint">No result yet.</p>;
  if (!grid.columns.length) return <p className="text-sm text-faint">(no rows)</p>;
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse font-mono text-xs">
        <thead>
          <tr>{grid.columns.map((c, i) => <th key={i} className="border border-line px-2 py-1 text-left font-medium text-dim">{c}</th>)}</tr>
        </thead>
        <tbody>
          {grid.rows.map((r, i) => (
            <tr key={i}>{r.map((c, k) => <td key={k} className="border border-line px-2 py-1">{c === null ? <span className="text-faint">NULL</span> : String(c)}</td>)}</tr>
          ))}
          {!grid.rows.length && <tr><td colSpan={grid.columns.length} className="border border-line px-2 py-1 text-faint">(0 rows)</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  p: Problem;
  phase: Phase;
  tab: ProblemTab;
  onTab: (t: ProblemTab) => void;
  hintsShown: number;
  onHint: () => void;
  /** The solution is hidden while it would spoil the interview. */
  solutionOpen: boolean;
}

/** Question / Hints / Solution, like the tabs in a real practice interview. */
export function ProblemPanel({ p, phase, tab, onTab, hintsShown, onHint, solutionOpen }: Props) {
  const [tables, setTables] = useState<{ name: string; grid: Grid }[]>([]);
  useEffect(() => {
    if (p.kind !== "sql") return;
    let live = true;
    void loadSql()
      .then((SQL) => live && setTables(seedTables(SQL, p.setup)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [p]);

  return (
    <section className="panel flex h-full min-h-0 flex-col" aria-label="Problem">
      <div className="flex shrink-0 gap-1 border-b border-line px-2" role="tablist">
        {(["question", "hints", "solution"] as ProblemTab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="tab capitalize" onClick={() => onTab(t)} data-testid={`tab-${t}`}>{t}</button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "question" && (
          <article data-testid="question">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{p.title}</h1>
              <span className="pill">{p.difficulty}</span>
            </div>
            <div className="prose-problem mt-4 max-w-[68ch] text-[0.95rem] leading-relaxed">
              {p.statement.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>

            <h2 className="mt-6 text-sm font-semibold">{p.examples.length > 1 ? "Examples:" : "Example:"}</h2>
            {p.examples.map((e, i) => (
              <div key={i} className="codeblock mt-3 p-4">
                <pre className="whitespace-pre-wrap"><span className="text-dim">input:  </span>{e.input}</pre>
                <pre className="mt-1 whitespace-pre-wrap"><span className="text-dim">output: </span>{e.output}</pre>
                {e.note && <p className="mt-2 font-sans text-xs text-dim">{e.note}</p>}
              </div>
            ))}

            {p.kind === "sql" && tables.length > 0 && (
              <>
                <h2 className="mt-6 text-sm font-semibold">Tables:</h2>
                <div className="mt-3 flex flex-wrap gap-5">
                  {tables.map((t) => (
                    <div key={t.name} className="min-w-0">
                      <p className="mb-1 font-mono text-xs text-dim">{t.name}</p>
                      <GridView grid={t.grid} />
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="mt-6 text-sm font-semibold">Constraints:</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-dim marker:text-faint">
              {p.constraints.map((c) => <li key={c}>{c}</li>)}
            </ul>

            <p className="mt-6 flex flex-wrap items-center gap-2">
              {p.tags.map((t) => <span key={t} className="pill">{t}</span>)}
              <a className="text-xs text-dim underline underline-offset-4 hover:text-text" href={p.link} target="_blank" rel="noreferrer">LeetCode ↗</a>
            </p>
          </article>
        )}

        {tab === "hints" && (
          <div data-testid="hints">
            <p className="text-sm text-dim">Hints go from a small nudge to the approach. Try asking the interviewer first: a real interviewer gives hints too, and how you use them counts.</p>
            <ol className="mt-4 space-y-3">
              {p.hints.slice(0, hintsShown).map((h, i) => (
                <li key={i} className="rounded-lg bg-inset p-3 text-sm">
                  <span className="label mr-2">Hint {i + 1}</span>
                  {h}
                </li>
              ))}
            </ol>
            {hintsShown < p.hints.length ? (
              <button type="button" className="btn mt-4" onClick={onHint}>{hintsShown ? `Show hint ${hintsShown + 1} of ${p.hints.length}` : "Show the first hint"}</button>
            ) : (
              <p className="mt-4 text-xs text-faint">That's every hint.</p>
            )}
          </div>
        )}

        {tab === "solution" && (
          <div data-testid="solution">
            {!solutionOpen ? (
              <p className="text-sm text-dim">
                {phase === "talk" ? "The solution opens in the Ghost phase, once you've talked through your approach." : "Hidden during the blind solve. It opens when you pass every test or end the interview."}
              </p>
            ) : (
              <>
                <p className="text-sm text-dim">Reference solution: {p.time} time, {p.space} space.</p>
                <pre className="codeblock mt-3 p-4 text-accent">{referenceCode(p)}</pre>
                <h2 className="mt-5 text-sm font-semibold">Line by line</h2>
                <ol className="mt-2 space-y-2">
                  {ghostLines(p).filter((l) => l.caption).map((l, i) => (
                    <li key={i} className="text-sm">
                      <code className="font-mono text-xs text-accent">{l.code.trim()}</code>
                      <span className="block text-dim">{l.caption}</span>
                    </li>
                  ))}
                </ol>
                <h2 className="mt-5 text-sm font-semibold">What an interviewer asks next</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-dim marker:text-faint">
                  {p.followUps.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
