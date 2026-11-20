"use client";
import { useEffect, useRef, useState } from "react";
import { VOICE } from "@content/gen/media";
import { techById, type TechQuestion } from "@content/technical";
import { CallWorkspace, starterFor } from "@/components/technical/CallWorkspace";
import { TechInterview } from "@/components/technical/TechInterview";
import { AsciiBar, cx, PageHeader, Panel, QuoteLine } from "@/components/ui";
import { readPass, writePass } from "@/lib/interview/passcode";
import { quoteFor } from "@/lib/quotes";
import { attributes, clock, fillerCount, GAUNTLET, verdict } from "@/lib/simulator";
import { actions, useStore, type GauntletRun } from "@/lib/store";
import type { GradeResult } from "@/lib/technical";

type Round = { id: string; score: number; seconds: number; limit: number; result: GradeResult; said: string };
/** practice: coached. dry: exactly the real interview, just doesn't count. real: counts. */
type Mode = "practice" | "dry" | "real";
type View = { kind: "lobby" } | { kind: "call"; mode: Mode; index: number; startedAt: number } | { kind: "report"; mode: Mode };
const MODE_NAME: Record<Mode, string> = { practice: "practice", dry: "dry run", real: "the real thing" };

const ROUNDS = GAUNTLET.map((r) => ({ ...r, q: techById.get(r.id)! as TechQuestion }));
const TOTAL = GAUNTLET.reduce((a, r) => a + r.seconds, 0);

export default function GauntletPage() {
  const { gauntlet, tech, ready } = useStore();
  const [view, setView] = useState<View>({ kind: "lobby" });
  const [voice, setVoice] = useState(true);
  const [results, setResults] = useState<Round[]>([]);
  const [pass, setPass] = useState("");
  const [passInput, setPassInput] = useState("");
  const [now, setNow] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const endAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPass(readPass());
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.kind, view.kind === "call" ? view.index : -1]);
  useEffect(() => {
    if (view.kind !== "call") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [view.kind]);

  const real = gauntlet.filter((r) => (r.mode ?? (r.dry ? "practice" : "real")) === "real");
  const bestReal = real.reduce((a, r) => Math.max(a, r.score), 0);

  const begin = (mode: Mode) => {
    setResults([]);
    setCodes({});
    setView({ kind: "call", mode, index: 0, startedAt: Date.now() });
  };

  const finish = (mode: Mode, rounds: Round[]) => {
    // the closing line starts inside the tap, so phones play it
    if (voice && VOICE["gauntlet-end"]) {
      endAudio.current ??= new Audio();
      endAudio.current.src = VOICE["gauntlet-end"];
      endAudio.current.play().catch(() => {});
    }
    const run: GauntletRun = { at: Date.now(), dry: mode !== "real", mode, score: Math.round(rounds.reduce((a, r) => a + r.score, 0) / ROUNDS.length), rounds: rounds.map(({ id, score, seconds, limit }) => ({ id, score, seconds, limit })) };
    actions.gauntletDone(run);
    setView({ kind: "report", mode });
  };

  /* ───── on the call ───── */
  if (view.kind === "call") {
    const round = ROUNDS[view.index]!;
    const last = view.index === ROUNDS.length - 1;
    const callSec = now ? Math.max(0, Math.floor((now - view.startedAt) / 1000)) : 0;
    const graded = results.find((r) => r.id === round.id);
    const next = () => {
      if (last) finish(view.mode, results);
      else setView({ ...view, index: view.index + 1 });
    };
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3">
        <div className="panel flex flex-wrap items-center justify-between gap-3 px-3 py-2" data-testid="call-bar">
          <div className="flex items-center gap-3">
            <span className={cx("font-pixel text-xs uppercase tracking-wider", view.mode === "practice" ? "text-second" : "text-error")}>
              <span className="pulse">●</span> {view.mode === "practice" ? "Practice call" : view.mode === "dry" ? "Live call · dry run" : "Live call"}
            </span>
            <span className="font-pixel text-xs tabular-nums text-dim">{clock(callSec)}</span>
          </div>
          <ol className="flex gap-1" aria-label="Rounds">
            {ROUNDS.map((r, i) => {
              const done = results.find((x) => x.id === r.id);
              return (
                <li key={r.id} className={cx("chip tabular-nums", i === view.index ? "text-accent" : done ? (done.score >= 80 ? "text-accent" : "text-second") : "text-ghost")} title={r.q.title}>
                  {done ? done.score : i + 1}
                </li>
              );
            })}
          </ol>
          <div className="flex items-center gap-1">
            <button type="button" className="btn btn-sm" aria-pressed={voice} onClick={() => setVoice(!voice)}>{voice ? "Voice on" : "Voice off"}</button>
            <button type="button" className="btn btn-sm text-error" onClick={() => { if (window.confirm("Hang up? This run won't be saved.")) setView({ kind: "lobby" }); }}>Hang up</button>
          </div>
        </div>

        <div>
          <p className="label text-second">Round {view.index + 1} of 5 · {round.label} · {clock(round.seconds)} on the clock</p>
          <h1 className="h1 mt-1">{round.q.title}</h1>
          {view.mode === "practice" && <p className="mt-1 text-sm text-dim">{round.q.why}</p>}
        </div>

        <CallWorkspace key={`w-${view.startedAt}-${round.id}`} q={round.q} code={codes[round.id] ?? starterFor(round.q)} onCode={(c) => setCodes((cs) => ({ ...cs, [round.id]: c }))} hints={view.mode === "practice"} solved={!!graded} />

        <TechInterview
          key={`${view.startedAt}-${round.id}`}
          codeValue={codes[round.id] ?? ""}
          q={round.q}
          hints={view.mode === "practice"}
          voice={voice}
          opening={view.index === 0 ? "gauntlet" : "gauntlet-next"}
          limitSec={round.seconds}
          strict={view.mode !== "practice"}
          brain={pass ? "claude" : "script"}
          compact={view.mode !== "practice"}
          counts={view.mode === "real"}
          startLabel={view.index === 0 ? "Join the call" : `Start round ${view.index + 1}`}
          onGraded={(result, seconds, said) => setResults((rs) => [...rs.filter((r) => r.id !== round.id), { id: round.id, score: result.score, seconds, limit: round.seconds, result, said }])}
          onNext={graded ? next : undefined}
          nextLabel={last ? "End the call · see your report" : `Round ${view.index + 2}: ${ROUNDS[view.index + 1]!.label}`}
        />
      </div>
    );
  }

  /* ───── the report ───── */
  if (view.kind === "report") {
    const score = Math.round(results.reduce((a, r) => a + r.score, 0) / ROUNDS.length);
    const v = verdict(score);
    const used = results.reduce((a, r) => a + r.seconds, 0);
    const onTime = results.filter((r) => r.seconds <= r.limit).length;
    const attrs = attributes(results.map((r) => ({ q: techById.get(r.id)!, points: r.result.points, seconds: r.seconds, limit: r.limit, said: r.said })));
    const fillers = results.reduce((a, r) => a + fillerCount(r.said), 0);
    const wordsSaid = results.reduce((a, r) => a + r.said.split(/\s+/).filter(Boolean).length, 0);
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-4" data-testid="gauntlet-report">
        <PageHeader kicker={`The Gauntlet · ${MODE_NAME[view.mode]}`} title={v.title} />
        <Panel accent={score >= 90}>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            <div>
              <p className="label">Score</p>
              <p className="font-pixel text-3xl tabular-nums" data-testid="gauntlet-score"><span className={score >= 90 ? "text-accent" : score >= 70 ? "text-text" : "text-second"}>{score}</span><span className="text-base text-dim">/100</span></p>
              <AsciiBar value={score / 100} width={14} className="mt-2 block" />
            </div>
            <div>
              <p className="label">Time</p>
              <p className="font-pixel text-xl tabular-nums">{clock(used)}<span className="text-sm text-dim"> / {clock(TOTAL)}</span></p>
              <p className="mt-1 text-xs text-dim">{onTime}/5 answered inside the clock</p>
            </div>
            <div>
              <p className="label">Verdict</p>
              <p className="mt-1 text-sm">{v.line}</p>
              {view.mode !== "real" && <p className="mt-1 text-xs text-second">{view.mode === "dry" ? "Dry run: same as the real thing, but it doesn't count." : "Practice: coached, so it doesn't count."}</p>}
            </div>
          </div>
        </Panel>

        <Panel title="Feedback rubric" right={<span className="text-xs text-dim">{wordsSaid} words · {fillers} fillers</span>}>
          <ul data-testid="feedback-rubric">
            {attrs.map((a) => (
              <li key={a.name} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-b border-line px-3 py-3 last:border-0 md:grid-cols-[160px_150px_1fr]">
                <span className="text-sm">{a.name}</span>
                <span className="flex items-center gap-2 md:order-none">
                  <span className={cx("font-pixel tabular-nums", a.score >= 4.5 ? "text-accent" : a.score >= 3 ? "text-text" : "text-second")}>{a.score.toFixed(1)}</span>
                  <span className="text-xs text-dim">/ 5</span>
                  <AsciiBar value={a.score / 5} width={6} />
                </span>
                <span className="col-span-2 text-xs text-dim md:col-span-1">{a.tip}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Round by round">
          <ul>
            {ROUNDS.map((r, i) => {
              const res = results.find((x) => x.id === r.id);
              return (
                <li key={r.id} className="border-b border-line last:border-0">
                  <details>
                    <summary className="grid cursor-pointer grid-cols-[24px_1fr_auto_auto] items-center gap-3 px-3 py-2 text-sm">
                      <span className="font-pixel text-2xs text-ghost">{i + 1}</span>
                      <span className="min-w-0 truncate">{r.q.title} <span className="text-xs text-dim">· {r.label}</span></span>
                      <span className={cx("text-xs tabular-nums", res && res.seconds > r.seconds ? "text-error" : "text-dim")}>{res ? `${clock(res.seconds)} / ${clock(r.seconds)}` : "skipped"}</span>
                      <span className={cx("w-8 text-right font-pixel tabular-nums", (res?.score ?? 0) >= 80 ? "text-accent" : "text-second")}>{res?.score ?? 0}</span>
                    </summary>
                    {res && (
                      <div className="flex flex-col gap-3 border-t border-line px-3 py-3 text-sm">
                        <p>{res.result.summary}</p>
                        <ul className="flex flex-col gap-1 text-xs">
                          {res.result.points.map((p) => (
                            <li key={p.id} className="grid grid-cols-[18px_1fr_auto] gap-2">
                              <span className={p.earned === p.max ? "text-accent" : p.earned > 0 ? "text-second" : "text-error"}>{p.earned === p.max ? "■" : p.earned > 0 ? "▒" : "□"}</span>
                              <span>{p.label}{p.earned < p.max && <span className="block text-dim">{p.feedback}</span>}</span>
                              <span className="tabular-nums text-dim">{p.earned}/{p.max}</span>
                            </li>
                          ))}
                        </ul>
                        <div>
                          <p className="label mb-1">Say this next time</p>
                          <p className="text-dim">{res.result.whatToSay}</p>
                        </div>
                        {res.said && (
                          <div>
                            <p className="label mb-1">What you said</p>
                            <p className="text-xs text-dim">{res.said}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="flex flex-wrap gap-1">
          <button type="button" className="btn btn-primary" onClick={() => begin(view.mode === "practice" ? "dry" : "real")}>{view.mode === "practice" ? "Now the dry run" : view.mode === "dry" ? "Now the real thing" : "Run it back"}</button>
          {view.mode !== "practice" && <button type="button" className="btn" onClick={() => begin("dry")}>Dry run again</button>}
          <button type="button" className="btn" onClick={() => begin("practice")}>Practice</button>
          <button type="button" className="btn" onClick={() => setView({ kind: "lobby" })}>Lobby</button>
        </div>
        <QuoteLine quote={quoteFor(score)} />
      </div>
    );
  }

  /* ───── the lobby ───── */
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4">
      <PageHeader kicker="Five questions · 25 minutes · one call" title="The Gauntlet">
        A full technical round, back to back, on a call with the interviewer. Every question has its own clock, from three minutes on the SQL one to seven on the boss round. Ask the interviewer questions, think out loud, and answer before time runs out. At the end you get one score and a verdict.
      </PageHeader>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel flex flex-col p-4">
          <p className="label text-second">1 · Practice</p>
          <ul className="mt-2 flex flex-1 flex-col gap-1 text-sm text-dim">
            <li>▸ Coached: live checklist, pop-up tips, suggested questions.</li>
            <li>▸ The clock never cuts you off. Overtime shows in red.</li>
            <li>▸ Full feedback after every round.</li>
          </ul>
          <button type="button" className="btn mt-4 w-full" onClick={() => begin("practice")} data-testid="practice-run">Practice</button>
        </div>
        <div className="panel flex flex-col p-4">
          <p className="label text-text">2 · Dry run</p>
          <ul className="mt-2 flex flex-1 flex-col gap-1 text-sm text-dim">
            <li>▸ Exactly the real interview: the clock cuts you off, no hints, no help.</li>
            <li>▸ Feedback waits until the call is over.</li>
            <li>▸ A dress rehearsal: it doesn&apos;t count.</li>
          </ul>
          <button type="button" className="btn mt-4 w-full" onClick={() => begin("dry")} data-testid="dry-run">Start the dry run</button>
        </div>
        <div className="panel panel-accent flex flex-col p-4">
          <p className="label text-accent">3 · The real thing</p>
          <ul className="mt-2 flex flex-1 flex-col gap-1 text-sm text-dim">
            <li>▸ Same as the dry run, but this one counts.</li>
            <li>▸ Ask your own questions out loud.</li>
            <li>▸ A clean 100 marks that question completed.</li>
          </ul>
          <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => begin("real")} data-testid="real-run">Start the gauntlet</button>
        </div>
      </section>

      <Panel title="The rounds" right={<span className="text-xs text-dim">{clock(TOTAL)} total</span>}>
        <ul>
          {ROUNDS.map((r, i) => (
            <li key={r.id} className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 border-b border-line px-3 py-2 text-sm last:border-0">
              <span className="font-pixel text-2xs text-ghost">{i + 1}</span>
              <span className="min-w-0 truncate">{r.q.title} <span className="text-xs text-dim">· {r.label} · {r.q.kind === "sql" ? "SQL" : "Python"}</span></span>
              <span className="font-pixel text-xs tabular-nums text-second">{clock(r.seconds)}</span>
              <span className="text-xs tabular-nums text-dim">clean <span className={(tech[r.id]?.cleanBest ?? 0) === 100 ? "text-accent" : "text-text"}>{ready ? tech[r.id]?.cleanBest ?? 0 : 0}</span></span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="The interviewer">
        <div className="flex flex-col gap-2 p-3 text-sm">
          {pass ? (
            <p className="text-dim">
              <span className="text-accent">Claude is on the call.</span> It hears what you say, answers your questions, pushes on what you skipped and keeps an eye on the clock. If the API is out of credits, the built-in interviewer takes over mid-call without dropping it.{" "}
              <button type="button" className="underline underline-offset-4 hover:text-text" onClick={() => { writePass(""); setPass(""); }}>Change passcode</button>
            </p>
          ) : (
            <>
              <p className="text-dim">Right now it's the built-in interviewer: recorded voice, reacts to what you say, answers the common questions. Add the passcode to put Claude on the call instead (needs API credits).</p>
              <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (passInput.trim()) { writePass(passInput.trim()); setPass(passInput.trim()); setPassInput(""); } }}>
                <input className="field max-w-[240px]" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="Interview passcode" aria-label="Interview passcode" autoCapitalize="off" autoCorrect="off" />
                <button type="submit" className="btn">Save</button>
              </form>
            </>
          )}
        </div>
      </Panel>

      {gauntlet.length > 0 && (
        <Panel title={`Past runs${bestReal ? ` · best real ${bestReal}` : ""}`}>
          <ul data-testid="gauntlet-history">
            {[...gauntlet].reverse().slice(0, 8).map((r) => (
              <li key={r.at} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-line px-3 py-2 text-sm last:border-0">
                <span className="text-dim">{new Date(r.at).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })} · {MODE_NAME[r.mode ?? (r.dry ? "practice" : "real")]}</span>
                <span className="text-second">{verdict(r.score).title}</span>
                <span className={cx("font-pixel tabular-nums", r.score >= 90 ? "text-accent" : "text-text")}>{r.score}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <QuoteLine quote={quoteFor(bestReal + gauntlet.length)} />
    </div>
  );
}
