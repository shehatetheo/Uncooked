import type { RunReport } from "@/lib/runner/types";
import { cx } from "@/components/ui";

const show = (v: unknown) => JSON.stringify(v)?.replace(/,/g, ", ") ?? "None";

/** Terminal-style test output: pass/fail per test, runtime, readable traceback. */
export function TestsPanel({ report, running, booting, mode, argNames }: { report: RunReport | null; running: boolean; booting: boolean; mode: "run" | "submit"; argNames: string[] }) {
  return (
    <div className="min-h-[160px] bg-inset p-3 text-sm" data-testid="tests-panel" aria-live="polite">
      <p className="text-dim">$ python solution.py{mode === "submit" ? " --submit" : ""}</p>
      {booting && <p className="text-second">loading python runtime (first run only)…</p>}
      {running && !booting && <p className="text-second">running…</p>}
      {!report && !running && !booting && <p className="text-ghost">Run checks the visible tests. Submit adds the hidden ones.</p>}
      {report && !running && (
        <>
          {report.fatal && <pre className="mt-2 whitespace-pre-wrap text-error">{report.fatal}</pre>}
          {report.results.map((r) => (
            <div key={r.index} className="mt-2">
              <p className={r.pass ? "text-accent" : "text-error"}>
                {r.pass ? "PASS" : "FAIL"} <span className="text-dim">test {r.index + 1}{r.hidden ? " (hidden)" : ""} · {r.ms.toFixed(1)} ms</span>
              </p>
              {!r.pass && !r.hidden && (
                <div className="pl-5 text-xs leading-relaxed">
                  <p><span className="text-dim">input&nbsp;&nbsp;&nbsp; </span>{r.args.map((a, i) => `${argNames[i] ?? `arg${i}`} = ${show(a)}`).join(", ")}</p>
                  <p><span className="text-dim">expected </span>{show(r.expected)}</p>
                  {!r.error && <p><span className="text-dim">got&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span><span className="text-error">{show(r.output)}</span></p>}
                </div>
              )}
              {!r.pass && r.hidden && !r.error && <p className="pl-5 text-xs text-dim">Hidden edge case. Think: empty input, one element, duplicates, negatives, ties.</p>}
              {r.error && <pre className="mt-1 whitespace-pre-wrap pl-5 text-xs text-error">{r.error}</pre>}
              {r.stdout && <pre className="mt-1 whitespace-pre-wrap pl-5 text-xs text-dim">stdout: {r.stdout}</pre>}
            </div>
          ))}
          <p className={cx("mt-3 font-pixel text-xs uppercase", report.status === "pass" ? "text-accent" : "text-error")}>
            {report.status === "pass" ? `All ${report.total} passed` : report.status === "timeout" ? "Time limit exceeded" : `${report.passed}/${report.total} passed`}
            <span className="text-dim"> · {report.ms.toFixed(1)} ms</span>
          </p>
        </>
      )}
    </div>
  );
}
