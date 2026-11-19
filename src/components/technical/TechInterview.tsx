"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TechQuestion } from "@content/technical";
import { AsciiBar, cx, Panel } from "@/components/ui";
import { readPass } from "@/lib/interview/passcode";
import { canListen, canSpeak, Listener, NO_SOUND_HELP, Speaker } from "@/lib/interview/speech";
import { blip } from "@/lib/sound";
import { actions, useStore } from "@/lib/store";
import { liveCheck, localGrade, type GradeResult } from "@/lib/technical";
import { ghostTarget } from "./TechGhost";

type Phase = "ready" | "asking" | "answering" | "grading" | "graded";
interface Toast { id: number; tone: "hit" | "tip"; text: string }

/** One graded voice question with live recommendations while you talk. */
export function TechInterview({ q, hints, voice, onNext, nextLabel }: { q: TechQuestion; hints: boolean; voice: boolean; onNext?: () => void; nextLabel?: string }) {
  const { tech } = useStore();
  const best = tech[q.id]?.best ?? 0;
  const [phase, setPhase] = useState<Phase>("ready");
  const [answer, setAnswer] = useState("");
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFollow, setShowFollow] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [noSound, setNoSound] = useState(false);

  const speaker = useRef<Speaker | null>(null);
  const listener = useRef<Listener | null>(null);
  const answerRef = useRef("");
  answerRef.current = answer;
  const toastId = useRef(0);
  const tipped = useRef(new Set<string>());
  const lastLen = useRef(0);
  const supported = useMemo(() => ({ listen: typeof window !== "undefined" && canListen(), speak: typeof window !== "undefined" && canSpeak() }), []);

  const pushToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    speaker.current = new Speaker();
    listener.current = new Listener(
      (text) => setHeard(text),
      (text) => {
        setHeard("");
        setListening(false);
        if (text.trim()) setAnswer((a) => `${a}${a && !a.endsWith(" ") ? " " : ""}${text.trim()}`);
      },
      (msg) => {
        setListening(false);
        setMicError(msg);
      },
    );
    return () => {
      speaker.current?.cancel();
      listener.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (speaker.current) speaker.current.enabled = voice;
  }, [voice]);

  // fresh state per question
  useEffect(() => {
    setPhase("ready");
    setAnswer("");
    setHeard("");
    setCode("");
    setResult(null);
    setNote(null);
    setShowFollow(false);
    tipped.current = new Set();
    lastLen.current = 0;
    speaker.current?.cancel();
    listener.current?.abort();
    setListening(false);
  }, [q.id]);

  const live = liveCheck(q, `${answer} ${heard}`, code);
  const liveScore = live.reduce((a, p) => a + (p.hit ? p.max : 0), 0);
  const hitKey = live.filter((p) => p.hit).map((p) => p.id).join(",");
  const prevHits = useRef<Set<string>>(new Set());

  // pop-up when a point lands
  useEffect(() => {
    const now = new Set(hitKey ? hitKey.split(",") : []);
    if (phase === "answering" && hints) {
      for (const id of now) if (!prevHits.current.has(id)) {
        const p = q.rubric.find((r) => r.id === id)!;
        pushToast("hit", `+${p.max} · ${p.label}`);
        blip.tick();
      }
    }
    prevHits.current = now;
  }, [hitKey, phase, hints, q.rubric, pushToast]);

  // pop-up nudges: every few seconds of talking, suggest the most valuable missing point
  useEffect(() => {
    if (phase !== "answering" || !hints) return;
    const id = setInterval(() => {
      const len = `${answerRef.current} ${heard}`.length;
      if (len - lastLen.current < 25) return;
      lastLen.current = len;
      const missing = liveCheck(q, `${answerRef.current} ${heard}`, code).filter((p) => !p.hit && !tipped.current.has(p.id)).sort((a, b) => b.max - a.max)[0];
      if (missing) {
        tipped.current.add(missing.id);
        pushToast("tip", missing.tip);
      }
    }, 9000);
    return () => clearInterval(id);
  }, [phase, hints, heard, code, q, pushToast]);

  const listen = () => {
    speaker.current?.cancel();
    setMicError(null);
    setHeard("");
    setListening(true);
    listener.current?.start();
  };

  const ask = () => {
    const sp = speaker.current!;
    setNoSound(false);
    setPhase("asking");
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      setPhase("answering");
      if (supported.listen) listen();
    };
    sp.onIdle = open;
    if (!(voice && supported.speak)) return open();
    // speak inside the tap: iOS only plays speech started by a user gesture
    sp.sayAll(q.ask);
    // If nothing is audible, say so and move on instead of waiting forever.
    setTimeout(() => {
      if (!sp.audible && !opened) {
        setNoSound(true);
        sp.cancel();
        open();
      }
    }, 1800);
    // Safety net: some browsers never report the end of speech.
    setTimeout(open, Math.max(6000, q.ask.split(/\s+/).length * 450 + 2500));
  };

  const testVoice = () => {
    const sp = speaker.current!;
    setNoSound(false);
    sp.onIdle = null;
    sp.sayAll("Testing, one, two, three. If you can hear me, the interviewer works.");
    setTimeout(() => {
      if (!sp.audible) setNoSound(true);
    }, 1500);
  };

  const submit = async () => {
    listener.current?.stop();
    const text = `${answerRef.current} ${heard}`.trim();
    setPhase("grading");
    const local = localGrade(q, text, code, ghostTarget(q));
    let graded = local;
    const pass = readPass();
    if (!pass) setNote("Graded in your browser by keyword. Add the passcode on the overview (and API credits) for Claude's grading.");
    else {
      try {
        const res = await fetch("/api/grade", { method: "POST", headers: { "content-type": "application/json", "x-interview-passcode": pass }, body: JSON.stringify({ questionId: q.id, answer: text, code }) });
        if (res.ok) {
          graded = (await res.json()) as GradeResult;
          setNote(null);
        } else {
          const err = (await res.json().catch(() => ({}))) as { message?: string };
          setNote(`${err.message ?? "Claude's grading isn't available."} Graded in your browser by keyword instead.`);
        }
      } catch {
        setNote("No connection to the grader. Graded in your browser by keyword instead.");
      }
    }
    setResult(graded);
    setPhase("graded");
    actions.techGraded(q.id, graded.score);
    if (graded.score === 100) blip.pass();
    if (voice && supported.speak) {
      const sp = speaker.current!;
      sp.onIdle = null;
      const top = graded.points.filter((p) => p.earned < p.max).sort((a, b) => b.max - b.earned - (a.max - a.earned))[0];
      sp.sayAll(`You scored ${graded.score} out of 100.${top ? ` Biggest gain: ${top.label}.` : " Perfect."}`);
    }
  };

  const retry = () => {
    speaker.current?.cancel();
    setResult(null);
    setAnswer("");
    setHeard("");
    setNote(null);
    setShowFollow(false);
    tipped.current = new Set();
    lastLen.current = 0;
    setPhase("ready");
  };

  const say = (text: string) => {
    const sp = speaker.current!;
    sp.onIdle = null;
    sp.sayAll(text);
  };

  /* ───── graded ───── */
  if (phase === "graded" && result)
    return (
      <div className="flex flex-col gap-3" data-testid="tech-result">
        <Panel accent={result.score === 100} title={result.score === 100 ? "100 · nailed it" : `Score ${result.score} · retry until 100`} right={<span className="chip">{result.source === "ai" ? "graded by Claude" : "graded in browser"}</span>}>
          <div className="p-4">
            <p className="font-pixel text-2xl tabular-nums" data-testid="tech-score">
              <span className={result.score === 100 ? "text-accent" : result.score >= 70 ? "text-text" : "text-second"}>{result.score}</span>
              <span className="text-base text-dim">/100</span>
              <span className="pl-3 text-xs text-dim">best {Math.max(best, result.score)}</span>
            </p>
            <AsciiBar value={result.score / 100} width={20} className="mt-2 block" />
            <p className="mt-3 text-sm">{result.summary}</p>
            {note && <p className="mt-2 text-xs text-second">{note}</p>}
            <div className="mt-4 flex flex-wrap gap-1">
              <button type="button" className={cx("btn", result.score < 100 && "btn-primary")} onClick={retry} autoFocus={result.score < 100}>Retry</button>
              {onNext && <button type="button" className={cx("btn", result.score === 100 && "btn-primary")} onClick={onNext}>{nextLabel ?? "Next question"}</button>}
            </div>
          </div>
        </Panel>

        <Panel title="Points">
          <ul>
            {result.points.map((p) => (
              <li key={p.id} className="grid grid-cols-[28px_1fr_auto] gap-x-2 border-b border-line px-3 py-2 text-sm last:border-0">
                <span className={p.earned === p.max ? "text-accent" : p.earned > 0 ? "text-second" : "text-error"}>{p.earned === p.max ? "■" : p.earned > 0 ? "▒" : "□"}</span>
                <span>
                  <span className="block">{p.label}</span>
                  <span className="block text-xs text-dim">{p.feedback}</span>
                </span>
                <span className="tabular-nums text-dim">{p.earned}/{p.max}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="If this question pops up, say this" right={supported.speak ? <button type="button" className="btn btn-sm" onClick={() => say(result.whatToSay)}>Read it to me</button> : undefined}>
          <p className="whitespace-pre-wrap p-4 text-sm leading-relaxed" data-testid="what-to-say">{result.whatToSay}</p>
        </Panel>

        <Panel title={q.kind === "sql" ? "Example query" : "Example solution"}>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-accent">{result.example}</pre>
        </Panel>

        <Panel title="They might follow up with">
          <div className="p-4 text-sm">
            <p>{result.followUp}</p>
            {result.followUp !== q.followUp.q && <p className="mt-2 text-dim">Or: {q.followUp.q}</p>}
            {showFollow ? <p className="mt-2 text-dim">{q.followUp.a}</p> : <button type="button" className="btn btn-sm mt-2" onClick={() => setShowFollow(true)}>Show a good answer</button>}
          </div>
        </Panel>
      </div>
    );

  /* ───── asking / answering ───── */
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-3">
        <Panel title="Interviewer" accent={phase === "asking"} right={<span className="text-xs text-dim">best <span className={best === 100 ? "text-accent" : "text-text"}>{best}</span>/100</span>}>
          <div className="p-4">
            {noSound && <p className="mb-3 text-sm text-second" role="status" data-testid="no-sound">{NO_SOUND_HELP}</p>}
            {phase === "ready" ? (
              <div>
                <p className="text-sm text-dim">The interviewer asks out loud, then the mic opens. Answer like it's real: restate, brute force, better approach, complexity, edge case.</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <button type="button" className="btn btn-primary" onClick={ask} data-testid="ask">{voice && supported.speak ? "Ask me the question" : "Show the question"}</button>
                  {voice && supported.speak && <button type="button" className="btn" onClick={testVoice}>Test voice</button>}
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg leading-snug" data-testid="tech-ask">{q.ask}</p>
                {voice && supported.speak && <button type="button" className="btn btn-sm mt-3" onClick={() => say(q.ask)}>Repeat</button>}
              </>
            )}
          </div>
        </Panel>

        {phase !== "ready" && (
          <Panel title="Your answer">
            <div className="flex flex-col gap-3 p-4">
              {supported.listen && (
                <div className="flex flex-wrap items-center gap-2">
                  {listening ? (
                    <button type="button" className="btn btn-primary h-14 px-6" onClick={() => listener.current?.stop()} data-testid="mic"><span className="text-bg">■</span> Pause mic</button>
                  ) : (
                    <button type="button" className="btn h-14 px-6" onClick={listen} disabled={phase === "grading"} data-testid="mic"><span className="text-accent">●</span> {answer ? "Keep talking" : "Start talking"}</button>
                  )}
                  {listening && <span className="text-xs text-accent">listening… talk it through</span>}
                </div>
              )}
              {micError && <p className="text-xs text-error">{micError}</p>}
              {heard && <p className="text-sm text-accent" data-testid="heard">{heard}</p>}
              <textarea className="field min-h-[120px]" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={supported.listen ? "What you say appears here. You can also type or fix it." : "Type your answer, or use the keyboard's dictation key."} aria-label="Your answer" />
              <details>
                <summary className="label cursor-pointer">{q.kind === "sql" ? "Query pad" : "Code pad"} (optional, graded too)</summary>
                <textarea className="field mt-2 min-h-[140px] font-mono text-sm" value={code} onChange={(e) => setCode(e.target.value)} placeholder={q.kind === "sql" ? "SELECT …" : "def solve(…):"} aria-label="Code pad" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
              </details>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={phase === "grading" || !(answer.trim() || heard.trim() || code.trim())} data-testid="submit-answer">
                  {phase === "grading" ? "Grading…" : "Done, grade me"}
                </button>
                <span className="text-xs text-dim">Retries are unlimited. Go until 100.</span>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {phase !== "ready" && (
        <Panel title={hints ? `Live checklist · ${liveScore}/100` : "Test mode"} className="lg:sticky lg:top-16">
          {hints ? (
            <ul data-testid="live-checklist">
              {live.map((p) => (
                <li key={p.id} className={cx("grid grid-cols-[22px_1fr_auto] gap-x-2 border-b border-line px-3 py-2 text-xs last:border-0", p.hit ? "text-text" : "text-dim")}>
                  <span className={p.hit ? "text-accent" : "text-ghost"}>{p.hit ? "■" : "□"}</span>
                  <span>{p.label}</span>
                  <span className="tabular-nums">{p.max}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-xs text-dim">Hints are off, like the real thing. You'll see every point after grading.</p>
          )}
        </Panel>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+64px)] z-40 flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end" aria-live="polite" data-testid="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={cx("panel fade-in max-w-[420px] px-3 py-2 text-sm", t.tone === "hit" ? "panel-accent text-accent" : "text-second")}>
            {t.tone === "hit" ? "■ " : "▸ Try: "}{t.text.replace(/^Try:\s*/, "")}
          </div>
        ))}
      </div>
    </div>
  );
}
