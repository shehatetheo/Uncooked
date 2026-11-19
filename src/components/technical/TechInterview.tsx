"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VOICE } from "@content/gen/media";
import type { Probe, TechQuestion } from "@content/technical";
import { AsciiBar, cx, Panel } from "@/components/ui";
import { readPass } from "@/lib/interview/passcode";
import { canListen, canSpeak, Listener, NO_SOUND_HELP, Speaker } from "@/lib/interview/speech";
import { followLine, INTRO_LINE, NEXT_LINE, nextStep, PROBE_LINES, WRAP_LINE } from "@/lib/simulator";
import { blip } from "@/lib/sound";
import { actions, useStore } from "@/lib/store";
import { liveCheck, localGrade, type GradeResult } from "@/lib/technical";
import { ghostTarget } from "./TechGhost";

type Phase = "ready" | "them" | "you" | "grading" | "graded";
interface Turn { who: "them" | "you"; text: string }
interface Toast { id: number; tone: "hit" | "tip"; text: string }

/** How long a pause ends your turn when the mic is on. */
const TURN_SILENCE_MS = 3200;
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/**
 * The interview simulator: the interviewer asks, listens, and reacts to what
 * you said, probing for what's missing, asking a follow-up, then wrapping up.
 * Then it scores you by points against the rubric.
 */
export function TechInterview({ q, hints, voice, opening = "intro", onNext, nextLabel }: { q: TechQuestion; hints: boolean; voice: boolean; opening?: "intro" | "next"; onNext?: () => void; nextLabel?: string }) {
  const { tech } = useStore();
  const best = tech[q.id]?.best ?? 0;
  const [phase, setPhase] = useState<Phase>("ready");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [heard, setHeard] = useState("");
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFollow, setShowFollow] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [noSound, setNoSound] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  const speaker = useRef<Speaker | null>(null);
  const listener = useRef<Listener | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;
  const draftRef = useRef("");
  draftRef.current = draft;
  /** Ends the interviewer's current line early. */
  const skipRef = useRef<(() => void) | null>(null);
  const asked = useRef<(Probe | "more")[]>([]);
  const followed = useRef(false);
  const finishing = useRef(false);
  const lastHeardAt = useRef(0);
  const toastId = useRef(0);
  const tipped = useRef(new Set<string>());
  const supported = useMemo(() => ({ listen: typeof window !== "undefined" && canListen(), speak: typeof window !== "undefined" && canSpeak() }), []);

  const candidateText = useCallback(() => turnsRef.current.filter((t) => t.who === "you").map((t) => t.text).join(" "), []);

  const pushToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  /* ───── audio ───── */
  const stopAudio = useCallback(() => {
    audio.current?.pause();
    speaker.current?.cancel();
    setPlaying(null);
  }, []);

  /** Say one interviewer line: recorded clip, else the browser voice, else just text. Then call next. */
  const sayLine = useCallback(
    (key: string, text: string, next: () => void) => {
      setTurns((t) => [...t, { who: "them", text }]);
      setPhase("them");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        skipRef.current = null;
        setPlaying(null);
        next();
      };
      skipRef.current = () => {
        audio.current?.pause();
        speaker.current?.cancel();
        finish();
      };
      if (!voice) return void setTimeout(finish, 350);
      const src = VOICE[key];
      const el = audio.current;
      if (src && el) {
        speaker.current?.cancel();
        el.pause();
        el.src = src;
        el.onended = finish;
        el.onerror = finish;
        setPlaying(key);
        el.play().catch(() => {
          setNoSound(true);
          finish();
        });
        return;
      }
      const sp = speaker.current;
      if (sp && supported.speak) {
        sp.onIdle = finish;
        sp.sayAll(text);
        setTimeout(() => {
          if (!sp.audible) {
            setNoSound(true);
            finish();
          }
        }, 1800);
        setTimeout(finish, Math.max(5000, words(text) * 450 + 2500));
        return;
      }
      setTimeout(finish, 350);
    },
    [voice, supported.speak],
  );

  /* ───── your turn ───── */
  const listen = useCallback(() => {
    stopAudio();
    setMicError(null);
    setHeard("");
    lastHeardAt.current = Date.now();
    setListening(true);
    listener.current?.start();
  }, [stopAudio]);

  const yourTurn = useCallback(() => {
    setPhase("you");
    setDraft("");
    if (supported.listen) listen();
  }, [supported.listen, listen]);

  // grade defined below; referenced through a ref so the interviewer can call it
  const gradeRef = useRef<() => void>(() => {});

  /** The interviewer reacts to what you just said. */
  const react = useCallback(
    (said: string) => {
      const text = said.trim();
      if (!text) return yourTurn();
      setTurns((t) => [...t, { who: "you", text }]);
      turnsRef.current = [...turnsRef.current, { who: "you", text }];
      const all = candidateText();
      const missing = liveCheck(q, all, code).filter((p) => !p.hit);
      const step = nextStep(missing, asked.current, words(all), followed.current);
      if (step.kind === "probe") {
        asked.current = [...asked.current, step.probe];
        sayLine(`probe-${step.probe}`, PROBE_LINES[step.probe], yourTurn);
      } else if (step.kind === "follow") {
        followed.current = true;
        sayLine(`${q.id}-follow`, followLine(q), yourTurn);
      } else {
        sayLine("sim-wrap", WRAP_LINE, () => gradeRef.current());
      }
    },
    [q, code, candidateText, sayLine, yourTurn],
  );
  const reactRef = useRef(react);
  reactRef.current = react;

  /** End your turn: stop the mic and hand what you said to the interviewer. */
  const endTurn = useCallback(() => {
    if (listening && listener.current) {
      finishing.current = true;
      listener.current.stop(); // onStop delivers the text
    } else {
      const text = draft;
      setDraft("");
      reactRef.current(text);
    }
  }, [listening, draft]);

  useEffect(() => {
    speaker.current = new Speaker();
    audio.current = new Audio();
    audio.current.preload = "auto";
    listener.current = new Listener(
      (text) => {
        setHeard(text);
        lastHeardAt.current = Date.now();
      },
      (text) => {
        setHeard("");
        setListening(false);
        if (finishing.current) {
          finishing.current = false;
          const typed = draftRef.current;
          setDraft("");
          reactRef.current(`${text} ${typed}`.trim());
        } else if (text.trim()) setDraft((d) => `${d}${d ? " " : ""}${text.trim()}`);
      },
      (msg) => {
        setListening(false);
        setMicError(msg);
      },
    );
    return () => {
      speaker.current?.cancel();
      listener.current?.abort();
      audio.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (speaker.current) speaker.current.enabled = voice;
  }, [voice]);

  // a pause ends your turn, like in a real conversation
  useEffect(() => {
    if (phase !== "you" || !listening) return;
    const id = setInterval(() => {
      if (words(heard) >= 4 && Date.now() - lastHeardAt.current > TURN_SILENCE_MS) endTurn();
    }, 400);
    return () => clearInterval(id);
  }, [phase, listening, heard, endTurn]);

  /* ───── live checklist and pop-ups ───── */
  const liveText = `${candidateText()} ${heard} ${draft}`;
  const live = liveCheck(q, liveText, code);
  const liveScore = live.reduce((a, p) => a + (p.hit ? p.max : 0), 0);
  const hitKey = live.filter((p) => p.hit).map((p) => p.id).join(",");
  const prevHits = useRef<Set<string>>(new Set());
  useEffect(() => {
    const now = new Set(hitKey ? hitKey.split(",") : []);
    if (phase === "you" && hints)
      for (const id of now)
        if (!prevHits.current.has(id)) {
          const p = q.rubric.find((r) => r.id === id)!;
          pushToast("hit", `+${p.max} · ${p.label}`);
          blip.tick();
        }
    prevHits.current = now;
  }, [hitKey, phase, hints, q.rubric, pushToast]);
  useEffect(() => {
    if (phase !== "you" || !hints) return;
    const id = setInterval(() => {
      const missing = liveCheck(q, `${candidateText()} ${heard} ${draft}`, code).filter((p) => !p.hit && !tipped.current.has(p.id)).sort((a, b) => b.max - a.max)[0];
      if (missing && words(heard + draft) > 8) {
        tipped.current.add(missing.id);
        pushToast("tip", missing.tip);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [phase, hints, heard, draft, code, q, candidateText, pushToast]);

  /* ───── start, grade, retry ───── */
  const reset = () => {
    stopAudio();
    listener.current?.abort();
    setListening(false);
    setTurns([]);
    turnsRef.current = [];
    setHeard("");
    setDraft("");
    setResult(null);
    setNote(null);
    setShowFollow(false);
    setNoSound(false);
    asked.current = [];
    followed.current = false;
    tipped.current = new Set();
    prevHits.current = new Set();
  };

  const start = () => {
    reset();
    // the first line must start inside the tap: iOS only plays audio a user gesture started
    sayLine(opening === "intro" ? "sim-intro" : "sim-next", opening === "intro" ? INTRO_LINE : NEXT_LINE, () => sayLine(q.id, q.ask, yourTurn));
  };

  const grade = async () => {
    stopAudio();
    listener.current?.abort();
    setListening(false);
    const pendingText = `${heard} ${draft}`.trim();
    if (pendingText) turnsRef.current = [...turnsRef.current, { who: "you", text: pendingText }];
    setTurns(turnsRef.current);
    setPhase("grading");
    const said = candidateText();
    const dialogue = turnsRef.current.map((t) => `${t.who === "them" ? "Interviewer" : "Candidate"}: ${t.text}`).join("\n");
    let graded = localGrade(q, said, code, ghostTarget(q));
    const pass = readPass();
    if (!pass) setNote("Graded in your browser by keyword. Add the passcode on the overview (and API credits) for Claude's grading.");
    else {
      try {
        const res = await fetch("/api/grade", { method: "POST", headers: { "content-type": "application/json", "x-interview-passcode": pass }, body: JSON.stringify({ questionId: q.id, answer: dialogue, code }) });
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
  };
  gradeRef.current = () => void grade();

  const playClip = (key: string) => {
    const el = audio.current;
    const src = VOICE[key];
    if (!src || !el) return false;
    speaker.current?.cancel();
    el.pause();
    el.src = src;
    el.onended = () => setPlaying(null);
    setPlaying(key);
    el.play().catch(() => {
      setPlaying(null);
      setNoSound(true);
    });
    return true;
  };

  const testVoice = () => {
    setNoSound(false);
    if (playClip("test")) return;
    const sp = speaker.current!;
    sp.onIdle = null;
    sp.sayAll("Testing, one, two, three. If you can hear me, the interviewer works.");
    setTimeout(() => {
      if (!sp.audible) setNoSound(true);
    }, 1500);
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
              <button type="button" className={cx("btn", result.score < 100 && "btn-primary")} onClick={() => { reset(); setPhase("ready"); }} autoFocus={result.score < 100}>Retry</button>
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

        <Panel
          title="If this question pops up, say this"
          right={
            result.whatToSay === q.say && VOICE[`${q.id}-say`] ? (
              <button type="button" className="btn btn-sm" onClick={() => (playing === `${q.id}-say` ? stopAudio() : playClip(`${q.id}-say`))}>{playing === `${q.id}-say` ? "Stop" : "Hear it"}</button>
            ) : undefined
          }
        >
          <p className="whitespace-pre-wrap p-4 text-sm leading-relaxed" data-testid="what-to-say">{result.whatToSay}</p>
        </Panel>

        <Panel title={q.kind === "sql" ? "Example query" : "Example solution"}>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-accent">{result.example}</pre>
        </Panel>

        <Panel title="The follow-up, answered">
          <div className="p-4 text-sm">
            <p>{q.followUp.q}</p>
            {result.followUp !== q.followUp.q && <p className="mt-2 text-dim">They might also ask: {result.followUp}</p>}
            {showFollow ? <p className="mt-2 text-dim">{q.followUp.a}</p> : <button type="button" className="btn btn-sm mt-2" onClick={() => setShowFollow(true)}>Show a good answer</button>}
          </div>
        </Panel>

        <Panel title={`The conversation · ${turns.length} turns`}>
          <Conversation turns={turns} />
        </Panel>
      </div>
    );

  /* ───── the interview ───── */
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-3">
        <Panel title="Interview" accent={phase === "them"} right={<span className="text-xs text-dim">best <span className={best === 100 ? "text-accent" : "text-text"}>{best}</span>/100</span>}>
          <div className="p-4">
            {noSound && <p className="mb-3 text-sm text-second" role="status" data-testid="no-sound">{NO_SOUND_HELP}</p>}
            {phase === "ready" ? (
              <div>
                <p className="text-sm text-dim">
                  A simulated interview: the interviewer asks, you answer out loud, and it reacts to what you said. Skip the brute force or the complexity and it will ask for it, then a follow-up, then it wraps up and scores you. Pause for a few seconds and it takes that as the end of your answer.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <button type="button" className="btn btn-primary" onClick={start} data-testid="ask">Start the interview</button>
                  {voice && <button type="button" className="btn" onClick={testVoice}>Test voice</button>}
                </div>
              </div>
            ) : (
              <>
                <Conversation turns={turns} live={phase === "you" ? `${heard}${heard && draft ? " " : ""}${draft}` : ""} speaking={phase === "them"} />
                {phase === "them" && (
                  <button type="button" className="btn btn-sm mt-3" onClick={() => skipRef.current?.()} data-testid="skip">Skip ▸</button>
                )}
              </>
            )}
          </div>
        </Panel>

        {phase === "you" && (
          <Panel title="Your turn">
            <div className="flex flex-col gap-3 p-4">
              {supported.listen && (
                <div className="flex flex-wrap items-center gap-2">
                  {listening ? (
                    <>
                      <button type="button" className="btn btn-primary h-14 px-6" onClick={endTurn} data-testid="mic"><span className="text-bg">■</span> Done talking</button>
                      <span className="text-xs text-accent">listening… pause to hand it back</span>
                    </>
                  ) : (
                    <button type="button" className="btn h-14 px-6" onClick={listen} data-testid="mic"><span className="text-accent">●</span> Talk</button>
                  )}
                </div>
              )}
              {micError && <p className="text-xs text-error">{micError}</p>}
              <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); endTurn(); }}>
                <textarea className="field min-h-[80px]" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={supported.listen ? "Or type your reply here." : "Type your reply, or use the keyboard's dictation key."} aria-label="Your answer" />
                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn" disabled={!draft.trim() && !heard.trim()}>Send reply</button>
                  <button type="button" className="btn" onClick={() => void grade()} data-testid="submit-answer">End and grade me</button>
                </div>
              </form>
              <details>
                <summary className="label cursor-pointer">{q.kind === "sql" ? "Query pad" : "Code pad"} (optional, graded too)</summary>
                <textarea className="field mt-2 min-h-[140px] font-mono text-sm" value={code} onChange={(e) => setCode(e.target.value)} placeholder={q.kind === "sql" ? "SELECT …" : "def solve(…):"} aria-label="Code pad" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
              </details>
            </div>
          </Panel>
        )}
        {phase === "grading" && <p className="label text-second">grading…</p>}
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

      {/* phones: one pop-up at the top, clear of the mic button; desktop: a stack in the corner */}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+56px)] z-40 flex flex-col items-center gap-2 px-4 md:bottom-6 md:top-auto md:items-end [&>*:not(:last-child)]:hidden md:[&>*:not(:last-child)]:block" aria-live="polite" data-testid="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={cx("panel fade-in max-w-[420px] px-3 py-2 text-sm", t.tone === "hit" ? "panel-accent text-accent" : "text-second")}>
            {t.tone === "hit" ? "■ " : "▸ Try: "}{t.text.replace(/^Try:\s*/, "")}
          </div>
        ))}
      </div>
    </div>
  );
}

function Conversation({ turns, live, speaking }: { turns: Turn[]; live?: string; speaking?: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [turns.length, live]);
  return (
    <ol className="flex max-h-[420px] flex-col gap-3 overflow-y-auto text-sm" data-testid="conversation">
      {turns.map((t, i) => (
        <li key={i} className={cx("max-w-[90%]", t.who === "you" && "self-end text-right")}>
          <span className={cx("label", t.who === "them" ? "text-second" : "text-accent")}>{t.who === "them" ? "Interviewer" : "You"}</span>
          <p className={cx("mt-1 whitespace-pre-wrap leading-relaxed", t.who === "them" ? "text-base" : "text-dim")} data-testid={t.who === "them" ? "interviewer-line" : undefined}>
            {t.text}
            {speaking && t.who === "them" && i === turns.length - 1 && <span className="text-second"> ◂ speaking</span>}
          </p>
        </li>
      ))}
      {live && (
        <li className="max-w-[90%] self-end text-right">
          <span className="label text-accent">You</span>
          <p className="mt-1 whitespace-pre-wrap text-accent" data-testid="heard">{live}</p>
        </li>
      )}
      <div ref={end} />
    </ol>
  );
}
