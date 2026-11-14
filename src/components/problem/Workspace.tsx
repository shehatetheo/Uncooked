"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ART, CLIPS } from "@content/gen/media";
import { PATTERNS, type Problem } from "@/lib/content/types";
import { useIsDesktop } from "@/lib/hooks";
import { TOTAL_REPS } from "@/lib/ghost";
import { quoteFor } from "@/lib/quotes";
import type { RunReport } from "@/lib/runner/types";
import { actions, progressOf, useStore } from "@/lib/store";
import { cx, Panel, QuoteLine, StatusTag } from "@/components/ui";
import { ExplainPhase } from "./ExplainPhase";
import { GhostPhase } from "./GhostPhase";
import { ProblemText } from "./ProblemText";
import { ChoiceQuestion } from "./Understand";

// the code editor is the heaviest part of the page; load it when the cold solve opens
const ColdSolve = dynamic(() => import("./ColdSolve").then((m) => m.ColdSolve), { ssr: false, loading: () => <p className="label p-4">loading editor…</p> });

const PHASES = [
  { id: "understand", label: "Understand", short: "Learn" },
  { id: "ghost", label: "Ghost type", short: "Ghost" },
  { id: "cold", label: "Cold solve", short: "Cold" },
  { id: "explain", label: "Explain it", short: "Explain" },
] as const;
type PhaseId = (typeof PHASES)[number]["id"];

function UnderstandPhase({ p, onDone }: { p: Problem; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [edge, setEdge] = useState<Record<number, boolean>>({});
  const finished = i >= 3;
  const desktop = useIsDesktop();
  const { settings } = useStore();
  // pictures follow the same rule as the other visuals: desktop only, and off when Visual is off
  const showMedia = desktop && (settings.visuals[p.id] ?? settings.visualsDefault);
  const clip = settings.media[p.id] ?? p.mediaUrl ?? CLIPS[p.id];
  const art = ART[p.id];

  return (
    <div className="grid items-start gap-3 md:grid-cols-2">
      <Panel title="Problem" className="min-w-0">
        {showMedia && (clip || art) && (
          <div className="border-b border-line bg-inset" data-testid="problem-media">
            {clip ? (
              <video src={clip} poster={art} controls loop muted playsInline preload="none" className="w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art} alt={`Pixel-art picture of the idea behind ${p.title}`} className="w-full" style={{ imageRendering: "pixelated" }} />
            )}
          </div>
        )}
        <ProblemText p={p} />
      </Panel>
      <Panel title="Before any code" className="min-w-0">
        <div className="p-4">
          {!finished ? (
            <ChoiceQuestion q={p.understand[i]!} index={i} total={3} onAnswer={(ok) => ok && setScore((s) => s + 1)} onNext={() => { if (i === 2) actions.completePhase(p.id, "understand", score === 3); setI(i + 1); }} nextLabel={i === 2 ? "Done" : "Next question"} />
          ) : (
            <div className="fade-in">
              <p className="font-pixel text-lg">{score}/3 <span className="text-dim">first try</span></p>
              <p className="mt-2 text-sm text-dim">{score === 3 ? "You know what it's asking and how to attack it. Now build the muscle memory." : "Read the explanations once more in your head, then type the solution until it sticks."}</p>
              {p.edgeCases.length > 0 && (
                <div className="mt-5">
                  <p className="label mb-2">Bonus · which inputs break a naive solution?</p>
                  <div className="flex flex-col gap-2">
                    {p.edgeCases.map((e, k) => (
                      <div key={k} className="bg-inset p-3 text-sm shadow-[inset_0_0_0_1px_var(--color-line)]">
                        <p>{e.input}</p>
                        {edge[k] === undefined ? (
                          <div className="mt-2 flex gap-1">
                            <button type="button" className="btn btn-sm" onClick={() => setEdge({ ...edge, [k]: true })}>Breaks it</button>
                            <button type="button" className="btn btn-sm" onClick={() => setEdge({ ...edge, [k]: false })}>Fine</button>
                          </div>
                        ) : (
                          <p className={cx("mt-2 text-xs", edge[k] === e.breaks ? "text-accent" : "text-error")}>
                            {edge[k] === e.breaks ? "Right" : "No"}: {e.breaks ? "breaks a naive solution" : "safe"}. <span className="text-dim">{e.why}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" className="btn btn-primary mt-5" onClick={onDone} autoFocus>Type the ghost</button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

/** The four-phase flow for one problem. */
export function Workspace({ problem: p, remixes }: { problem: Problem; remixes: { id: string; title: string }[] }) {
  const store = useStore();
  const prog = progressOf(store, p.id, "problem");
  const [phase, setPhase] = useState<PhaseId>("understand");
  const [picked, setPicked] = useState(false);
  const [passed, setPassed] = useState<{ report: RunReport; hints: number } | null>(null);
  const [rated, setRated] = useState(false);

  // open on the first phase that isn't done yet
  useEffect(() => {
    if (!store.ready || picked) return;
    setPicked(true);
    const first = PHASES.find((ph) => !prog.phases[ph.id]);
    setPhase(first?.id ?? "cold");
  }, [store.ready, picked, prog.phases]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        setPhase(PHASES[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmitted = useCallback((report: RunReport, info: { hints: number }) => setPassed(report.status === "pass" ? { report, hints: info.hints } : null), []);
  const remix = remixes[0];
  const visualOn = store.settings.visuals[p.id] ?? store.settings.visualsDefault;

  return (
    <div>
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href="/problems" className="label hover:text-text">← Problems</Link>
          <span className="chip">{p.difficulty}</span>
          <span className="chip">{PATTERNS[p.pattern]}</span>
          {p.tags.includes("made-up") && <span className="chip text-second">made-up</span>}
          {store.ready && <StatusTag status={prog.status} />}
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="h1">{p.title}</h1>
          <div className="flex items-center gap-1">
            {remix && <Link href={`/p/${remix.id}`} className="btn btn-sm" title="A disguised variant of the same pattern">Remix</Link>}
            <button type="button" className="btn btn-sm hidden md:inline-flex" aria-pressed={visualOn} onClick={() => actions.setSettings({ visuals: { ...store.settings.visuals, [p.id]: !visualOn } })}>Visual</button>
          </div>
        </div>
        <nav className="mt-4 grid grid-cols-4 gap-1" aria-label="Phases">
          {PHASES.map((ph, i) => {
            const done = prog.phases[ph.id];
            const sub = ph.id === "ghost" && !done && prog.ghostReps > 0 ? ` ${prog.ghostReps}/${TOTAL_REPS}` : "";
            return (
              <button key={ph.id} type="button" aria-current={phase === ph.id ? "step" : undefined} aria-label={ph.label} onClick={() => setPhase(ph.id)} className={cx("flex h-10 items-center justify-center gap-2 border-b-2 px-1 font-pixel text-2xs uppercase tracking-wider md:text-xs", phase === ph.id ? "border-accent bg-raised text-text" : "border-line text-dim hover:text-text")}>
                <span className={done ? "text-accent" : "text-ghost"}>{done ? "■" : `0${i + 1}`}</span>
                <span className="truncate"><span className="md:hidden">{ph.short}</span><span className="hidden md:inline">{ph.label}</span>{sub}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {phase === "understand" && <UnderstandPhase p={p} onDone={() => setPhase("ghost")} />}
      {phase === "ghost" && <GhostPhase problem={p} onFinished={() => setPhase("cold")} />}
      {phase === "cold" && (
        <div className="flex flex-col gap-3">
          {passed && (
            <Panel accent title="Accepted" className="fade-in">
              <div className="p-4" data-testid="accepted">
                <p className="text-sm">
                  All {passed.report.total} tests passed{passed.hints === 0 ? " with no hints" : ` using ${passed.hints} hint${passed.hints === 1 ? "" : "s"}`}.
                  {passed.hints === 0 ? ` Clean solves on different days: ${Math.min(2, new Set(prog.cleanColdDays).size)}/2.` : " Hint-free solves are the ones that count toward Mastered."}
                </p>
                {p.reveal && <p className="mt-2 text-sm"><span className="label text-second">Which pattern was this really? </span>{p.reveal}</p>}
                <p className="label mb-1 mt-4">What the interviewer asks next</p>
                <ul className="flex flex-col gap-1 text-sm">
                  {p.followUps.map((f) => (
                    <li key={f.q}><details><summary className="cursor-pointer">{f.q}</summary><p className="mt-1 pl-4 text-dim">{f.a}</p></details></li>
                  ))}
                </ul>
                <QuoteLine quote={quoteFor(passed.report.total + p.title.length)} className="mt-4" />
                <div className="mt-4 flex flex-wrap gap-1">
                  <button type="button" className="btn btn-primary" onClick={() => setPhase("explain")}>Explain it</button>
                  {remix && <Link href={`/p/${remix.id}`} className="btn">Remix: {remix.title}</Link>}
                </div>
              </div>
            </Panel>
          )}
          <ColdSolve problem={p} onSubmitted={onSubmitted} />
        </div>
      )}
      {phase === "explain" &&
        (rated ? (
          <Panel accent title="Logged">
            <div className="p-4">
              <p className="text-sm">Rated and scheduled. It comes back in your daily review when it's due.</p>
              <QuoteLine quote={quoteFor(p.id.length * 7)} className="mt-3" />
              <div className="mt-4 flex flex-wrap gap-1">
                <Link href="/problems" className="btn btn-primary">Next problem</Link>
                {remix && <Link href={`/p/${remix.id}`} className="btn">Remix: {remix.title}</Link>}
                <button type="button" className="btn" onClick={() => setRated(false)}>Back</button>
              </div>
            </div>
          </Panel>
        ) : (
          <ExplainPhase problem={p} onRated={() => setRated(true)} />
        ))}
    </div>
  );
}
