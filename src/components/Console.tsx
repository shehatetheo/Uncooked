"use client";
import { show, showArgs } from "@/lib/code";
import type { RunReport } from "@/lib/runner/grade";
import type { Problem } from "@/lib/types";
import { GridView } from "./ProblemPanel";

export type ConsoleTab = "output" | "tests";
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

interface Props {
  p: Problem;
  report: RunReport | null;
  running: boolean;
  loading: boolean;
  tab: ConsoleTab;
  onTab: (t: ConsoleTab) => void;
  onHide?: () => void;
}

/** Output and Test Results, like LeetCode: pass or fail per test, expected against actual, readable tracebacks. */
export function Console({ p, report, running, loading, tab, onTab, onHide }: Props) {
  const stdout = report?.results.map((r) => r.stdout).filter(Boolean).join("") ?? "";
  const summary = report && !report.fatal ? `${report.passed}/${report.total} passed` : null;
  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="console">
      <div className="flex shrink-0 items-center gap-1 border-b border-line px-2" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "output"} className="tab" onClick={() => onTab("output")}>Output</button>
        <button type="button" role="tab" aria-selected={tab === "tests"} className="tab" onClick={() => onTab("tests")}>
          Test Results{summary && <span className={cx("ml-2 text-xs", report!.status === "pass" ? "text-ok" : "text-bad")}>{summary}</span>}
        </button>
        {onHide && <button type="button" className="btn btn-quiet ml-auto h-8 px-2 text-xs" onClick={onHide}>Hide console</button>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm" aria-live="polite">
        {loading && <p className="text-dim" data-testid="loading-python">Loading Python (first run only, a few seconds)…</p>}
        {running && !loading && <p className="text-dim">Running…</p>}
        {!running && !loading && !report && <p className="text-faint">Run code checks the example tests. Submit also runs the hidden edge cases.</p>}

        {!running && !loading && report && tab === "output" && (
          <div data-testid="output">
            {report.fatal ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-bad">{report.fatal}</pre>
            ) : (
              <>
                <p className={cx("font-semibold", report.status === "pass" ? "text-ok" : "text-bad")} data-testid="verdict">
                  {report.status === "pass" ? (report.mode === "submit" ? `Accepted: all ${report.total} tests passed, including the hidden ones.` : `All ${report.total} example tests passed. Submit to run the hidden ones.`) : `${report.passed} of ${report.total} tests passed.`}
                </p>
                {p.kind === "sql" && (
                  <div className="mt-3 flex flex-wrap gap-6">
                    <div><p className="label mb-1">Your rows</p><GridView grid={report.grid?.actual} /></div>
                    {report.status !== "pass" && <div><p className="label mb-1">Expected rows</p><GridView grid={report.grid?.expected} /></div>}
                  </div>
                )}
                {stdout ? <pre className="codeblock mt-3 whitespace-pre-wrap p-3 text-xs">{stdout}</pre> : p.kind === "python" && <p className="mt-2 text-xs text-faint">Nothing printed. Use print() to debug; it shows up here.</p>}
              </>
            )}
          </div>
        )}

        {!running && !loading && report && tab === "tests" && (
          <div data-testid="test-results">
            {report.fatal && <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-bad">{report.fatal}</pre>}
            <ul className="space-y-2">
              {report.results.map((r) => (
                <li key={r.index} className="rounded-lg border border-line bg-inset">
                  <details open={!r.pass}>
                    <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
                      <span className={cx("font-mono text-xs font-semibold", r.pass ? "text-ok" : "text-bad")}>{r.pass ? "PASS" : "FAIL"}</span>
                      <span>{r.hidden ? "Hidden test" : "Test"} {r.index + 1}</span>
                      {p.kind === "python" && <span className="ml-auto text-xs text-faint">{r.ms < 1 ? "<1" : Math.round(r.ms)} ms</span>}
                    </summary>
                    <div className="space-y-2 border-t border-line px-3 py-2 font-mono text-xs">
                      {p.kind === "python" ? (
                        <>
                          <Row label="Input" value={showArgs(p, r.args)} />
                          <Row label="Expected" value={show(r.expected)} />
                          {r.error ? <Row label="Error" value={r.error} bad /> : <Row label="Your output" value={show(r.output)} bad={!r.pass} />}
                          {r.stdout && <Row label="Printed" value={r.stdout} />}
                        </>
                      ) : (
                        <>
                          <Row label="Data" value={r.hidden ? `Hidden data set ${r.index}` : "The example tables"} />
                          <Row label="Expected rows" value={show(r.expected)} />
                          <Row label="Your rows" value={show(r.output)} bad={!r.pass} />
                        </>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div>
      <p className="label font-sans">{label}</p>
      <pre className={cx("whitespace-pre-wrap break-words leading-relaxed", bad && "text-bad")}>{value}</pre>
    </div>
  );
}
