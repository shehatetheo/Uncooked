"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CORE, problems, REST } from "@content/index";
import type { ApiError, RunSummary, Scorecard, ScorecardRequest } from "@/lib/ai/protocol";
import { show, showArgs, starterCode } from "@/lib/code";
import { completePhase, statusOf, updateProgress, useProgress } from "@/lib/progress";
import type { RunReport } from "@/lib/runner/grade";
import { bootPython, pythonLoaded, runPython } from "@/lib/runner/python";
import { checkSql } from "@/lib/runner/sql";
import { loadSql } from "@/lib/runner/sqljs";
import { PHASE_LABEL, PHASES, type Phase, type Problem } from "@/lib/types";
import { useInterviewer } from "@/lib/useInterviewer";
import { Console, type ConsoleTab } from "./Console";
import { Editor } from "./Editor";
import { GhostGuide } from "./GhostGuide";
import { InterviewerPanel, MicButton } from "./InterviewerPanel";
import { ProblemPanel, type ProblemTab } from "./ProblemPanel";
import { ScorecardView } from "./ScorecardView";

/** Minutes on the clock for each question. */
export const MINUTES = 25;
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const mmss = (s: number) => `${s < 0 ? "-" : ""}${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s)) % 60).padStart(2, "0")}`;
type MobileTab = "interviewer" | "problem" | "code" | "tests";

/** What the interviewer is told about a test run. */
function summarize(p: Problem, r: RunReport | null): RunSummary | null {
  if (!r) return null;
  return {
    mode: r.mode,
    passed: r.passed,
    total: r.total,
    fatal: r.fatal,
    failures: r.results
      .filter((t) => !t.pass)
      .slice(0, 3)
      .map((t) => ({ input: p.kind === "python" ? showArgs(p, t.args) : t.hidden ? "a hidden data set" : "the example tables", expected: show(t.expected), got: t.error ? undefined : show(t.output), error: t.error, hidden: t.hidden })),
  };
}

/**
 * Is the on-screen keyboard up, and how much screen is left above it?
 * Touch devices only. iPhone doesn't resize the page for the keyboard, so the
 * app sizes itself to the visible area while you type.
 */
function useKeyboard() {
  const [state, setState] = useState({ open: false, height: 0 });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !window.matchMedia("(pointer: coarse)").matches) return;
    const measure = () => {
      const open = vv.height < window.innerHeight - 120 && vv.scale <= 1.05;
      setState({ open, height: Math.round(vv.height) });
      if (open) window.scrollTo(0, 0);
    };
    measure();
    vv.addEventListener("resize", measure);
    return () => vv.removeEventListener("resize", measure);
  }, []);
  return state;
}

type CardState = { status: "idle" | "loading" } | { status: "done"; card: Scorecard } | { status: "error"; message: string };

export function Workspace({ problemId }: { problemId: string }) {
  const p = problems.find((x) => x.id === problemId)!;
  const router = useRouter();
  const progress = useProgress();

  const [phase, setPhase] = useState<Phase>("talk");
  const [started, setStarted] = useState(false);
  const [skipGhost, setSkipGhost] = useState(false);
  const [code, setCode] = useState(() => starterCode(p));
  const [report, setReport] = useState<RunReport | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ghostPassed, setGhostPassed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [problemTab, setProblemTab] = useState<ProblemTab>("question");
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("tests");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("interviewer");
  const [cursorLine, setCursorLine] = useState(1);
  const [startedAt, setStartedAt] = useState(0);
  const [endedAt, setEndedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [card, setCard] = useState<CardState>({ status: "idle" });
  const [submits, setSubmits] = useState(0);
  const [editorFocused, setEditorFocused] = useState(false);
  const keyboard = useKeyboard();
  // phone with the keyboard up: give the whole visible screen to the ghost line and the editor
  const typing = editorFocused && keyboard.open;

  // the interviewer reads these at the moment a message is sent
  const live = useRef({ phase, code, report, hintsShown, startedAt });
  live.current = { phase, code, report, hintsShown, startedAt };
  const minutesLeft = () => (live.current.startedAt ? MINUTES - (Date.now() - live.current.startedAt) / 60_000 : MINUTES);
  const iv = useInterviewer(p.id, () => ({ phase: live.current.phase, code: live.current.code, run: summarize(p, live.current.report), minutesLeft: minutesLeft(), hintsShown: live.current.hintsShown }));

  const go = (next: Phase) => {
    live.current.phase = next; // an event sent right after must see the new phase
    setPhase(next);
  };

  // once the ghost is done, default to skipping it
  const known = statusOf(progress[p.id]) !== "Not started";
  useEffect(() => {
    if (known && !started) setSkipGhost(true);
    // only when progress first loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [known]);

  useEffect(() => {
    if (!started || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started, endedAt]);
  const elapsed = startedAt ? ((endedAt || now || startedAt) - startedAt) / 1000 : 0;
  const left = MINUTES * 60 - elapsed;

  /* ───── the flow ───── */
  const start = () => {
    iv.unlock(); // inside the tap, so iPhone allows the voice
    const t = Date.now();
    live.current.startedAt = t;
    setStartedAt(t);
    setNow(t);
    setStarted(true);
    if (skipGhost) go("blind");
    if (p.kind === "python") void bootPython().catch(() => {}); // warm up while you talk
    iv.event("start", true);
  };

  const startCoding = () => {
    completePhase(p.id, "talk");
    go("ghost");
    setProblemTab("question");
    setMobileTab("code");
    iv.event("ghost");
  };

  const startBlind = () => {
    completePhase(p.id, "talk");
    go("blind");
    const fresh = starterCode(p);
    live.current.code = fresh;
    live.current.report = null;
    setCode(fresh);
    setReport(null);
    setProblemTab("question");
    setMobileTab("code");
    iv.event("blind");
  };

  const requestScorecard = useCallback(async () => {
    setCard({ status: "loading" });
    const body: ScorecardRequest = {
      problemId: p.id,
      messages: iv.getHistory(),
      code: live.current.code,
      run: summarize(p, live.current.report),
      solved: solvedRef.current,
      minutesUsed: live.current.startedAt ? (Date.now() - live.current.startedAt) / 60_000 : 0,
      hintsShown: live.current.hintsShown,
      skippedGhost: skipRef.current,
    };
    try {
      const res = await fetch("/api/scorecard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(err?.message ?? "The scorecard couldn't be written right now.");
      }
      const scorecard = (await res.json()) as Scorecard;
      setCard({ status: "done", card: scorecard });
      updateProgress(p.id, (q) => ({ scorecard, phases: { ...q.phases, feedback: true } }));
    } catch (e) {
      setCard({ status: "error", message: e instanceof Error && !/failed to fetch|load failed/i.test(e.message) ? e.message : "Couldn't reach the AI for your scorecard. Check your connection and try again." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);
  const solvedRef = useRef(solved);
  solvedRef.current = solved;
  const skipRef = useRef(skipGhost);
  skipRef.current = skipGhost;

  const end = () => {
    go("feedback");
    setEndedAt(Date.now());
    setMobileTab("code");
    iv.event("wrap");
    void requestScorecard();
  };

  /* ───── running code ───── */
  const run = async (mode: "run" | "submit") => {
    if (running || phase === "talk" || phase === "feedback") return;
    setRunning(true);
    setConsoleOpen(true);
    setMobileTab("tests");
    let r: RunReport;
    try {
      if (p.kind === "sql") r = checkSql(await loadSql(), p, code, mode);
      else {
        if (!pythonLoaded()) {
          setLoading(true);
          await bootPython().catch(() => {});
          setLoading(false);
        }
        r = await runPython(p, code, mode);
      }
    } catch (e) {
      setLoading(false);
      r = { mode, status: "error", fatal: e instanceof Error ? e.message : String(e), results: [], passed: 0, total: 0, ms: 0 };
    }
    live.current.report = r;
    setReport(r);
    setConsoleTab(r.fatal || p.kind === "sql" || r.results.some((t) => t.stdout) ? "output" : "tests");
    setRunning(false);
    if (mode !== "submit") return;

    setSubmits((n) => n + 1);
    const pass = r.status === "pass";
    if (phase === "ghost") {
      updateProgress(p.id, (q) => ({ attempts: q.attempts + 1, phases: pass ? { ...q.phases, ghost: true } : q.phases }));
      if (pass && !ghostPassed) {
        setGhostPassed(true);
        iv.event("ghost-passed");
      } else if (!pass) iv.event("ran");
    } else {
      const seconds = Math.round((Date.now() - live.current.startedAt) / 1000);
      updateProgress(p.id, (q) => ({ attempts: q.attempts + 1, passed: pass, phases: pass ? { ...q.phases, blind: true } : q.phases, seconds: pass ? seconds : q.seconds }));
      if (pass && !solved) {
        setSolved(true);
        solvedRef.current = true;
        iv.event("passed");
      } else if (!pass) iv.event("ran");
    }
  };

  /* ───── hold Space to talk (desktop) ───── */
  const ivRef = useRef(iv);
  ivRef.current = iv;
  const canTalk = started && phase !== "feedback";
  useEffect(() => {
    if (!canTalk) return;
    const inField = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('input, textarea, select, button, a, summary, [contenteditable="true"], .cm-editor');
    let held = false;
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || inField(e.target)) return;
      e.preventDefault();
      held = true;
      ivRef.current.startListening();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !held) return;
      held = false;
      ivRef.current.stopListening();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [canTalk]);

  const index = problems.indexOf(p);
  const next = problems[(index + 1) % problems.length]!;
  const editorLocked = !started || phase === "talk";
  const canRun = started && (phase === "ghost" || phase === "blind") && !running;
  const solutionOpen = phase === "ghost" || phase === "feedback" || (phase === "blind" && solved);
  const phaseIndex = PHASES.indexOf(phase);

  const intro = (
    <div className="flex h-full flex-col justify-center gap-4 py-4" data-testid="intro">
      <div>
        <p className="text-base font-semibold">Mock interview: {p.title}</p>
        <p className="mt-1 text-sm text-dim">
          Sam, your interviewer, gives you the problem out loud. You talk through it, type the solution with a ghost guide, then solve it again blind while Sam interviews you. {MINUTES} minutes on the clock. At the end you get a scorecard.
        </p>
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-(--color-accent)" checked={skipGhost} onChange={(e) => setSkipGhost(e.target.checked)} data-testid="skip-ghost" />
        <span>
          Skip straight to the blind solve
          <span className="block text-xs text-faint">For problems you already know. No talk-through, no ghost guide.</span>
        </span>
      </label>
      <button type="button" className="btn btn-primary h-11" onClick={start} data-testid="start">Start interview</button>
      <p className="text-xs text-faint">
        {iv.support.listen ? "Uses your microphone when you hold the talk button. " : "This browser can't do speech-to-text, so you'll type your answers. "}
        You can always type instead, and everything Sam says is written out here.
      </p>
    </div>
  );

  const phaseAction =
    !started || phase === "feedback" ? null : phase === "talk" ? (
      <button type="button" className="btn btn-primary" onClick={startCoding} data-testid="next-phase">Start coding</button>
    ) : phase === "ghost" ? (
      <button type="button" className={cx("btn", ghostPassed && "btn-primary")} onClick={startBlind} data-testid="next-phase">{ghostPassed ? "Blind solve" : "Skip to blind"}</button>
    ) : solved ? (
      <button type="button" className="btn btn-primary" onClick={end} data-testid="next-phase">Finish: scorecard</button>
    ) : null;

  return (
    <div className="flex h-dvh flex-col" style={typing ? { height: keyboard.height } : undefined}>
      {/* ───── top bar ───── */}
      <header className={cx("shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2", typing ? "hidden" : "flex")}>
        <Link href="/" className="hidden font-mono text-sm font-bold tracking-tight text-accent sm:block">uncooked</Link>
        <select className="field h-9 w-auto min-w-0 flex-1 py-0 text-sm sm:max-w-[280px] sm:flex-none" aria-label="Question" value={p.id} onChange={(e) => router.push(`/q/${e.target.value}`)} data-testid="picker">
          <optgroup label="Core set">{CORE.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}</optgroup>
          <optgroup label="More SAP questions">{REST.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}</optgroup>
        </select>
        <ol className="order-last flex w-full items-center gap-1 text-xs lg:order-none lg:ml-2 lg:w-auto" aria-label="Phase" data-testid="phases">
          {PHASES.map((ph, i) => (
            <li key={ph} className="flex items-center gap-1">
              {i > 0 && <span className="text-faint" aria-hidden="true">→</span>}
              <span className={cx("rounded-md px-2 py-1 font-medium", i === phaseIndex ? "bg-accent-soft text-accent" : i < phaseIndex ? "text-dim" : "text-faint")} aria-current={i === phaseIndex ? "step" : undefined}>{PHASE_LABEL[ph]}</span>
            </li>
          ))}
        </ol>
        <span className={cx("font-mono text-sm tabular-nums sm:ml-auto", left <= 0 ? "text-bad" : left <= 180 ? "text-accent" : "text-dim")} aria-label="Time left" data-testid="timer">{mmss(left)}</span>
        {started && phase !== "feedback" && <button type="button" className="btn h-9 px-3" onClick={end} data-testid="end">End<span className="hidden sm:inline">&nbsp;interview</span></button>}
      </header>

      {/* ───── phone tabs ───── */}
      <nav className={cx("shrink-0 border-b border-line lg:hidden", typing ? "hidden" : "flex")} role="tablist" aria-label="Sections">
        {(phase === "feedback" ? (["interviewer", "problem", "code"] as MobileTab[]) : (["interviewer", "problem", "code", "tests"] as MobileTab[])).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={mobileTab === t} className="tab flex-1 px-1 capitalize" onClick={() => setMobileTab(t)} data-testid={`m-${t}`}>
            {phase === "feedback" && t === "code" ? "Feedback" : t}
          </button>
        ))}
      </nav>

      {/* ───── the three areas ───── */}
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-3 p-2 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)_minmax(0,1.2fr)] lg:p-3">
        <div className={cx("min-h-0", mobileTab === "interviewer" ? "block" : "hidden", "lg:block")}>
          <InterviewerPanel iv={iv} started={started} intro={intro} />
        </div>
        <div className={cx("min-h-0", mobileTab === "problem" ? "block" : "hidden", "lg:block")}>
          <ProblemPanel p={p} phase={phase} tab={problemTab} onTab={setProblemTab} hintsShown={hintsShown} onHint={() => setHintsShown((n) => n + 1)} solutionOpen={solutionOpen} />
        </div>

        <div className={cx("min-h-0", mobileTab === "code" || mobileTab === "tests" ? "block" : "hidden", "lg:block")}>
          {phase === "feedback" ? (
            <section className="panel h-full overflow-y-auto p-5" aria-label="Feedback" data-testid="feedback">
              <h2 className="text-xl font-bold tracking-tight">Feedback</h2>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div><dt className="label">Result</dt><dd className={solved ? "text-ok" : "text-dim"}>{solved ? "Solved blind" : "Not solved blind"}</dd></div>
                <div><dt className="label">Time</dt><dd className="font-mono">{mmss(elapsed)} of {MINUTES}:00</dd></div>
                <div><dt className="label">Submits</dt><dd className="font-mono">{submits}</dd></div>
                <div><dt className="label">Hints opened</dt><dd className="font-mono">{hintsShown} of {p.hints.length}</dd></div>
              </dl>
              <div className="mt-5">
                {card.status === "loading" && <p className="text-sm text-dim" data-testid="card-loading">Sam is writing your scorecard…</p>}
                {card.status === "done" && <ScorecardView card={card.card} />}
                {card.status === "error" && (
                  <div className="rounded-lg border border-line bg-inset p-4" data-testid="card-error">
                    <p className="text-sm text-bad">{card.message}</p>
                    <p className="mt-1 text-xs text-dim">Your result above is saved either way.</p>
                    <button type="button" className="btn mt-3" onClick={() => void requestScorecard()}>Try the scorecard again</button>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/q/${next.id}`} className="btn btn-primary" data-testid="next-question">Next question: {next.title}</Link>
                <button type="button" className="btn" onClick={() => window.location.reload()}>Try this one again</button>
                <Link href="/" className="btn">Dashboard</Link>
              </div>
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-dim">Your final code</summary>
                <pre className="codeblock mt-2 p-3">{code}</pre>
              </details>
            </section>
          ) : (
            <section className="panel flex h-full min-h-0 flex-col overflow-hidden" aria-label="Code">
              <div className={cx("min-h-0 flex-1 flex-col", mobileTab === "code" ? "flex" : "hidden", "lg:flex")}>
                <div className={cx("shrink-0 items-center gap-2 border-b border-line px-3 py-2", typing ? "hidden" : "flex")}>
                  <span className="pill h-7 font-medium text-text">{p.kind === "sql" ? "SQL" : "Python"}</span>
                  {phase === "blind" && <span className="text-xs text-faint">Blind solve: the reference is hidden</span>}
                  <button type="button" className="btn btn-quiet ml-auto h-7 px-2 text-xs text-accent" onClick={() => setCode(starterCode(p))} disabled={editorLocked}>Reset</button>
                </div>
                {phase === "ghost" && <GhostGuide p={p} cursorLine={cursorLine} />}
                <div className={cx("relative min-h-0 flex-1", typing && "pb-11")}>
                  <Editor value={code} onChange={setCode} language={p.kind === "sql" ? "sql" : "python"} readOnly={editorLocked} onRun={() => void run("run")} onSubmit={() => void run("submit")} onCursorLine={setCursorLine} onFocus={setEditorFocused} />
                  {editorLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inset/85 p-6 text-center" data-testid="editor-lock">
                      <div className="max-w-[36ch]">
                        <p className="font-semibold">{started ? "Talk it through first" : "Start the interview to begin"}</p>
                        <p className="mt-1 text-sm text-dim">{started ? "No code yet. Restate the problem and explain your approach out loud. When you and Sam agree on a plan, start coding." : "Sam gives you the problem, then you talk through your approach before any code."}</p>
                        {started && <button type="button" className="btn btn-primary mt-4" onClick={startCoding}>Start coding</button>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={cx("min-h-0 flex-col border-line lg:shrink-0 lg:border-t", phase === "ghost" ? "lg:h-[32%]" : "lg:h-[40%]", mobileTab === "tests" ? "flex flex-1" : "hidden", consoleOpen ? "lg:flex lg:flex-none" : "lg:hidden")}>
                <Console p={p} report={report} running={running} loading={loading} tab={consoleTab} onTab={setConsoleTab} onHide={() => setConsoleOpen(false)} />
              </div>
              {!consoleOpen && <button type="button" className="hidden shrink-0 border-t border-line px-3 py-2 text-left text-xs text-accent lg:block" onClick={() => setConsoleOpen(true)}>Show console</button>}
            </section>
          )}
        </div>
      </main>

      {/* ───── bottom bar ───── */}
      <footer className={cx("shrink-0 items-center gap-2 border-t border-line px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]", typing ? "hidden" : "flex")}>
        <Link href="/" className="btn hidden sm:inline-flex">← Dashboard</Link>
        {canTalk && <span className="lg:hidden"><MicButton iv={iv} size="sm" /></span>}
        {iv.listening && <span className="min-w-0 flex-1 truncate text-xs text-dim lg:hidden">{iv.heard || "Listening…"}</span>}
        <span className="ml-auto flex items-center gap-2">
          {phaseAction}
          {phase !== "feedback" && (
            <>
              <button type="button" className="btn" disabled={!canRun} onClick={() => void run("run")} data-testid="run">Run code</button>
              <button type="button" className="btn btn-primary" disabled={!canRun} onClick={() => void run("submit")} data-testid="submit">Submit</button>
            </>
          )}
        </span>
      </footer>
    </div>
  );
}
