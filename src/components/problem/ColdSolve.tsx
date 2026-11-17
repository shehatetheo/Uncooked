"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Problem } from "@/lib/content/types";
import { useIsDesktop, useNow } from "@/lib/hooks";
import { bootPython, runPython } from "@/lib/runner/python";
import { starterCode, type RunReport } from "@/lib/runner/types";
import { blip } from "@/lib/sound";
import { actions, useStore } from "@/lib/store";
import { cx, fmtTime, Panel } from "@/components/ui";
import { CodeEditor } from "./CodeEditor";
import { PATTERNS } from "@/lib/content/types";
import { ProblemText } from "./ProblemText";
import { TestsPanel } from "./TestsPanel";

type Tab = "problem" | "code" | "tests";

interface Props {
  problem: Problem;
  /** Logged with the attempt, e.g. "sprint" or "mock". */
  context?: string;
  /** Hide hints (mock interview) or links. */
  allowHints?: boolean;
  onSubmitted?: (report: RunReport, info: { hints: number; ms: number }) => void;
  /** Extra panel under the problem text (interviewer follow-ups in mock mode). */
  aside?: React.ReactNode;
}

/** Blank editor, signature only. Run = visible tests, Submit = visible + hidden. */
export function ColdSolve({ problem: p, context, allowHints = true, onSubmitted, aside }: Props) {
  const { drafts, ready } = useStore();
  const desktop = useIsDesktop();
  const [tab, setTab] = useState<Tab>("code");
  const [code, setCode] = useState(() => starterCode(p));
  const [report, setReport] = useState<RunReport | null>(null);
  const [mode, setMode] = useState<"run" | "submit">("run");
  const [running, setRunning] = useState(false);
  const [booting, setBooting] = useState(false);
  const [hints, setHints] = useState(0);
  const [side, setSide] = useState<"description" | "solution">("description");
  const [codeShown, setCodeShown] = useState(false);
  const startedAt = useRef(0);
  const loaded = useRef<string | null>(null);
  const now = useNow(1000);

  // load the saved draft once per problem
  useEffect(() => {
    if (!ready || loaded.current === p.id) return;
    loaded.current = p.id;
    setCode(drafts[p.id] ?? starterCode(p));
    setReport(null);
    setHints(0);
    setSide("description");
    setCodeShown(false);
    startedAt.current = Date.now();
  }, [ready, p, drafts]);

  // warm the Python runtime as soon as the cold solve opens
  useEffect(() => {
    void bootPython().catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => actions.saveDraft(p.id, code), 400);
    return () => clearTimeout(id);
  }, [code, p.id]);

  const execute = useCallback(
    async (m: "run" | "submit") => {
      if (running) return;
      setMode(m);
      setRunning(true);
      setBooting(true);
      setTab("tests");
      try {
        await bootPython();
      } catch {
        /* runPython reports the failure */
      }
      setBooting(false);
      const tests = m === "submit" ? [...p.tests.visible, ...p.tests.hidden] : p.tests.visible;
      let r: RunReport;
      try {
        r = await runPython(p, code, tests, p.tests.visible.length);
      } catch (e) {
        r = { status: "error", fatal: `Could not start Python: ${e instanceof Error ? e.message : String(e)}`, results: [], passed: 0, total: tests.length, ms: 0 };
      }
      setReport(r);
      setRunning(false);
      if (r.status === "pass") blip.pass();
      else blip.fail();
      if (m === "submit") {
        const ms = Date.now() - startedAt.current;
        const firstFail = r.results.find((x) => !x.pass);
        const note = [context, r.status !== "pass" ? (r.fatal ?? firstFail?.error)?.split("\n").pop() ?? `${r.passed}/${r.total} passed` : null].filter(Boolean).join(" · ");
        actions.coldSubmit(p.id, "problem", { pass: r.status === "pass", hints, ms, note: note || undefined });
        onSubmitted?.(r, { hints, ms });
      }
    },
    [running, p, code, hints, context, onSubmitted],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "h" && allowHints) {
        e.preventDefault();
        setHints((h) => Math.min(p.hints.length, h + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allowHints, p.hints.length]);

  const reset = () => {
    setCode(starterCode(p));
    setReport(null);
    startedAt.current = Date.now();
  };

  const bodyLines = p.solution.split("\n").slice(1);
  // Reading the walkthrough is help, so it counts as a hint; the code counts as all of them.
  const openSolution = () => {
    setSide("solution");
    setHints((h) => Math.max(h, 1));
  };

  const solutionPanel = (
    <div className="p-4" data-testid="solution-panel">
      <p className="text-xs text-second">Opening this counts as a hint, so this attempt can't be a clean solve. Use it to get unstuck, then come back another day and do it cold.</p>

      <h3 className="label mb-1 mt-4 text-accent">Intuition</h3>
      <p className="text-sm leading-relaxed">{p.myWords}</p>
      <p className="mt-2 text-xs text-dim">Pattern: {PATTERNS[p.pattern]}{p.reveal ? ` · ${p.reveal}` : ""}</p>

      <h3 className="label mb-2 mt-5 text-accent">Approach, step by step</h3>
      <ol className="flex flex-col gap-3">
        {p.captions.map((c, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-x-2 text-sm">
            <span className="font-pixel text-2xs leading-6 text-ghost">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p><span className="font-pixel text-2xs uppercase tracking-wider text-second">{c.label}</span> <span>{c.text}</span></p>
              {codeShown && <pre className="mt-1 overflow-x-auto bg-inset px-2 py-1 text-xs text-accent shadow-[inset_0_0_0_1px_var(--color-line)]">{bodyLines[i]}</pre>}
            </div>
          </li>
        ))}
      </ol>
      {!codeShown && (
        <button type="button" className="btn btn-sm mt-4" onClick={() => { setCodeShown(true); setHints(p.hints.length); }}>Reveal the code</button>
      )}

      <h3 className="label mb-1 mt-5 text-accent">Complexity</h3>
      <p className="text-sm">Time <span className="text-second">{p.time}</span> · Space <span className="text-second">{p.space}</span></p>
      <p className="mt-1 text-xs text-dim">{p.understand[2].explain}</p>

      <h3 className="label mb-1 mt-5 text-accent">Why not the obvious way?</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {p.followUps.map((f) => (
          <li key={f.q}><p>{f.q}</p><p className="pl-4 text-dim">{f.a}</p></li>
        ))}
      </ul>
    </div>
  );

  const problemPane = (
    <Panel
      className="min-w-0"
      title={
        allowHints ? (
          <span className="flex gap-1" role="tablist">
            <button type="button" role="tab" aria-selected={side === "description"} className={cx("px-1", side === "description" ? "text-accent" : "hover:text-text")} onClick={() => setSide("description")}>Description</button>
            <span className="text-ghost">/</span>
            <button type="button" role="tab" aria-selected={side === "solution"} className={cx("px-1", side === "solution" ? "text-accent" : "hover:text-text")} onClick={openSolution}>Solution</button>
          </span>
        ) : (
          "Problem"
        )
      }
    >
      {side === "solution" && allowHints ? solutionPanel : <ProblemText p={p} showBrief={allowHints} />}
      {allowHints && (
        <div className="border-t border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="label">Hints used {hints}/{p.hints.length}</p>
            <button type="button" className="btn btn-sm" disabled={hints >= p.hints.length} onClick={() => setHints((h) => h + 1)}>
              {hints === 0 ? "Show a hint" : "Next hint"}
            </button>
          </div>
          {hints === 0 && <p className="mt-2 text-xs text-ghost">A hint-free pass on two different days is what earns Mastered.</p>}
          <ol className="mt-2 flex flex-col gap-2 text-sm">
            {p.hints.slice(0, hints).map((h, i) => (
              <li key={i} className="fade-in text-second"><span className="text-dim">{i + 1}. </span>{h}</li>
            ))}
          </ol>
        </div>
      )}
      {aside}
    </Panel>
  );

  const codePane = (
    <Panel
      title="solution.py"
      inset
      className="min-w-0"
      right={
        <>
          <span className="font-pixel text-xs tabular-nums text-second">{now && startedAt.current ? fmtTime(now - startedAt.current) : "0:00"}</span>
          <button type="button" className="btn btn-sm" onClick={reset}>Reset</button>
        </>
      }
    >
      <CodeEditor value={code} onChange={setCode} language="python" onRun={() => void execute("run")} onSubmit={() => void execute("submit")} label="Python solution" minHeight={desktop ? 300 : 260} />
      <div className="flex items-center justify-end gap-1 border-t border-line p-2">
        <span className="mr-auto hidden text-xs text-ghost md:inline">Ctrl+Enter run · Ctrl+Shift+Enter submit</span>
        <button type="button" className="btn" disabled={running} onClick={() => void execute("run")}>Run</button>
        <button type="button" className="btn btn-primary" disabled={running} onClick={() => void execute("submit")}>Submit</button>
      </div>
    </Panel>
  );

  const testsPane = (
    <Panel title="Tests" inset className="min-w-0">
      <TestsPanel report={report} running={running} booting={booting} mode={mode} argNames={p.params.map((x) => x.name)} />
    </Panel>
  );

  if (!desktop)
    return (
      <div>
        <div className="mb-2 grid grid-cols-3" role="tablist">
          {(["problem", "code", "tests"] as Tab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={cx("h-10 border-b-2 font-pixel text-xs uppercase tracking-wider", tab === t ? "border-accent text-accent" : "border-line text-dim")} onClick={() => setTab(t)}>
              {t}
              {t === "tests" && report && <span className={report.status === "pass" ? "text-accent" : "text-error"}> {report.passed}/{report.total}</span>}
            </button>
          ))}
        </div>
        <div className={tab === "problem" ? "" : "hidden"}>{problemPane}</div>
        <div className={tab === "code" ? "" : "hidden"}>{codePane}</div>
        <div className={tab === "tests" ? "" : "hidden"}>
          {testsPane}
          <div className="mt-2 flex justify-end gap-1">
            <button type="button" className="btn" onClick={() => setTab("code")}>Back to code</button>
            <button type="button" className="btn btn-primary" disabled={running} onClick={() => void execute("submit")}>Submit</button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-2 items-start gap-3">
      {problemPane}
      <div className="flex min-w-0 flex-col gap-3">
        {codePane}
        {testsPane}
      </div>
    </div>
  );
}
