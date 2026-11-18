"use client";
import { useEffect, useState } from "react";
import { TECH, type TechQuestion } from "@content/technical";
import { TechGhost } from "@/components/technical/TechGhost";
import { TechInterview } from "@/components/technical/TechInterview";
import { AsciiBar, cx, PageHeader, Panel, QuoteLine } from "@/components/ui";
import { readPass, writePass } from "@/lib/interview/passcode";
import { quoteFor } from "@/lib/quotes";
import { useStore } from "@/lib/store";

type Stage = "ghost" | "interview";
type View = { kind: "overview" } | { kind: "question"; index: number; stage: Stage; run: boolean } | { kind: "summary"; stage: Stage };

const pad = (n: number) => String(n).padStart(2, "0");

export default function TechnicalPage() {
  const { tech, ready } = useStore();
  const [view, setView] = useState<View>({ kind: "overview" });
  const [hints, setHints] = useState(true);
  const [voice, setVoice] = useState(true);
  const [pass, setPass] = useState("");
  const [passInput, setPassInput] = useState("");

  useEffect(() => {
    setPass(readPass());
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const ghostDone = TECH.filter((q) => (tech[q.id]?.ghostBest ?? 0) === 100).length;
  const interviewDone = TECH.filter((q) => (tech[q.id]?.best ?? 0) === 100).length;
  const avg = Math.round(TECH.reduce((a, q) => a + (tech[q.id]?.best ?? 0), 0) / TECH.length);

  const open = (index: number, stage: Stage, run = false) => setView({ kind: "question", index, stage, run });
  const startRun = (stage: Stage) => {
    // a run starts at the first question not yet at 100 for that stage
    const first = TECH.findIndex((q) => (stage === "ghost" ? tech[q.id]?.ghostBest ?? 0 : tech[q.id]?.best ?? 0) < 100);
    open(first === -1 ? 0 : first, stage, true);
  };

  /* ───── one question ───── */
  if (view.kind === "question") {
    const q: TechQuestion = TECH[view.index]!;
    const last = view.index === TECH.length - 1;
    const next = view.run ? () => (last ? setView({ kind: "summary", stage: view.stage }) : open(view.index + 1, view.stage, true)) : undefined;
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="label hover:text-text" onClick={() => setView({ kind: "overview" })}>← Top 10</button>
            <span className="chip">{pad(view.index + 1)}/10</span>
            <span className="chip">{q.kind === "sql" ? "SQL" : "Python"}</span>
            {view.run && <span className="chip text-second">{view.stage === "ghost" ? "ghost run" : "interview run"}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" className="btn btn-sm" aria-pressed={view.stage === "ghost"} onClick={() => setView({ ...view, stage: "ghost" })}>Ghost type</button>
            <button type="button" className="btn btn-sm" aria-pressed={view.stage === "interview"} onClick={() => setView({ ...view, stage: "interview" })}>Interview</button>
            {view.stage === "interview" && (
              <>
                <button type="button" className="btn btn-sm" aria-pressed={hints} onClick={() => setHints(!hints)}>{hints ? "Hints on" : "Hints off"}</button>
                <button type="button" className="btn btn-sm" aria-pressed={voice} onClick={() => setVoice(!voice)}>{voice ? "Voice on" : "Voice off"}</button>
              </>
            )}
          </div>
        </header>
        <div>
          <h1 className="h1">{q.title}</h1>
          <p className="mt-1 text-sm text-dim">{q.why}</p>
        </div>
        {view.stage === "ghost" ? (
          <TechGhost key={`g-${q.id}`} q={q} onNext={next ?? (() => setView({ ...view, stage: "interview" }))} nextLabel={next ? (last ? "Finish ghost run" : "Next question") : "Now the interview"} />
        ) : (
          <TechInterview key={`i-${q.id}`} q={q} hints={hints} voice={voice} onNext={next} nextLabel={last ? "Finish interview" : "Next question"} />
        )}
      </div>
    );
  }

  /* ───── run summary ───── */
  if (view.kind === "summary") {
    const isGhost = view.stage === "ghost";
    return (
      <div className="mx-auto flex max-w-[860px] flex-col gap-4">
        <PageHeader kicker="Technical interview" title={isGhost ? "Ghost run done" : "Interview run done"} />
        <Panel accent title={isGhost ? `${ghostDone}/10 at 100%` : `Average best ${avg}/100 · ${interviewDone}/10 at 100`}>
          <ul>
            {TECH.map((q, i) => {
              const v = isGhost ? tech[q.id]?.ghostBest ?? 0 : tech[q.id]?.best ?? 0;
              return (
                <li key={q.id} className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 border-b border-line px-3 py-2 text-sm last:border-0">
                  <span className="font-pixel text-2xs text-ghost">{pad(i + 1)}</span>
                  <span className="truncate">{q.title}</span>
                  <span className={cx("tabular-nums", v === 100 ? "text-accent" : "text-second")}>{v}</span>
                  {v < 100 ? <button type="button" className="btn btn-sm" onClick={() => open(i, view.stage)}>Retry</button> : <span className="text-accent">■</span>}
                </li>
              );
            })}
          </ul>
        </Panel>
        <div className="flex flex-wrap gap-1">
          {isGhost && <button type="button" className="btn btn-primary" onClick={() => startRun("interview")}>Start the interview run</button>}
          <button type="button" className={cx("btn", !isGhost && "btn-primary")} onClick={() => startRun(view.stage)}>Run again (what's left)</button>
          <button type="button" className="btn" onClick={() => setView({ kind: "overview" })}>Overview</button>
        </div>
        <QuoteLine quote={quoteFor(avg + ghostDone)} />
      </div>
    );
  }

  /* ───── overview ───── */
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4">
      <PageHeader kicker="Technical interview · top 10" title="The ten most likely questions">
        These ten cover everything the technical rounds can throw at you: sorting, strings, hash maps, counting, a stack, two pointers, SQL joins and GROUP BY, with Big-O on every one. First type every solution over the ghost until you score 100. Then the interviewer asks each one out loud and you answer by voice. Pop-ups tell you what you're missing while you talk, and you get scored by points, with what you should have said. Retry as often as you want.
      </PageHeader>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel p-4">
          <p className="label">Step 1 · ghost type</p>
          <p className="mt-1 font-pixel text-xl"><span className={ghostDone === 10 ? "text-accent" : "text-text"}>{ready ? ghostDone : 0}</span><span className="text-sm text-dim">/10 at 100%</span></p>
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => startRun("ghost")}>{ghostDone ? "Continue ghost run" : "Start ghost run"}</button>
        </div>
        <div className="panel p-4">
          <p className="label">Step 2 · voice interview</p>
          <p className="mt-1 font-pixel text-xl"><span className={interviewDone === 10 ? "text-accent" : "text-text"}>{ready ? interviewDone : 0}</span><span className="text-sm text-dim">/10 at 100</span></p>
          <button type="button" className={cx("btn mt-3 w-full", ghostDone === 10 && "btn-primary")} onClick={() => startRun("interview")}>{interviewDone ? "Continue interview run" : "Start interview run"}</button>
        </div>
        <div className="panel p-4">
          <p className="label">Your score</p>
          <p className="mt-1 font-pixel text-xl"><span className={avg === 100 ? "text-accent" : "text-text"}>{ready ? avg : 0}</span><span className="text-sm text-dim">/100 average best</span></p>
          <AsciiBar value={avg / 100} width={14} className="mt-4 block" />
        </div>
      </section>

      <Panel title="The ten">
        <ul>
          {TECH.map((q, i) => {
            const t = tech[q.id];
            const g = t?.ghostBest ?? 0;
            const b = t?.best ?? 0;
            return (
              <li key={q.id} className="grid grid-cols-[28px_1fr] items-center gap-x-3 gap-y-2 border-b border-line px-3 py-3 last:border-0 md:grid-cols-[28px_1fr_90px_110px_auto]">
                <span className="font-pixel text-2xs text-ghost">{pad(i + 1)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{q.title}</span>
                  <span className="block text-xs text-dim">{q.kind === "sql" ? "SQL" : "Python"} · {q.why}</span>
                </span>
                <span className="col-start-2 text-xs tabular-nums md:col-start-auto">ghost <span className={g === 100 ? "text-accent" : "text-text"}>{ready ? g : 0}%</span></span>
                <span className="col-start-2 text-xs tabular-nums md:col-start-auto">interview <span className={b === 100 ? "text-accent" : "text-text"}>{ready ? b : 0}</span>/100</span>
                <span className="col-start-2 flex gap-1 md:col-start-auto">
                  <button type="button" className="btn btn-sm" onClick={() => open(i, "ghost")}>Ghost</button>
                  <button type="button" className="btn btn-sm" onClick={() => open(i, "interview")}>Interview</button>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Grading">
        <div className="flex flex-col gap-2 p-3 text-sm">
          <p className="text-dim">
            Every answer is scored out of 100 against a rubric: restating, brute force, the right pattern, complexity, edge cases. In your browser it's scored by listening for each point. With the passcode and API credits, Claude grades it instead, with feedback in your own words and a tailored model answer.
          </p>
          {pass ? (
            <p className="text-xs">Passcode saved. <button type="button" className="underline underline-offset-4 hover:text-text" onClick={() => { writePass(""); setPass(""); }}>Change</button></p>
          ) : (
            <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (passInput.trim()) { writePass(passInput.trim()); setPass(passInput.trim()); setPassInput(""); } }}>
              <input className="field max-w-[240px]" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="Interview passcode" aria-label="Interview passcode" autoCapitalize="off" autoCorrect="off" />
              <button type="submit" className="btn">Save</button>
            </form>
          )}
        </div>
      </Panel>
      <QuoteLine quote={quoteFor(ghostDone * 3 + interviewDone)} />
    </div>
  );
}
