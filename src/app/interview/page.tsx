"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RATINGS } from "@/components/problem/ExplainPhase";
import { cx, fmtTime, PageHeader, Panel, QuoteLine } from "@/components/ui";
import { useNow } from "@/lib/hooks";
import type { OfflineQuestion } from "@/lib/interview/offline";
import { ROUNDS, type Round, type Turn } from "@/lib/interview/rounds";
import { canListen, canSpeak, Listener, Speaker } from "@/lib/interview/speech";
import { quoteFor } from "@/lib/quotes";
import { blip } from "@/lib/sound";
import { actions, useStore } from "@/lib/store";

type Phase = "setup" | "live" | "feedback" | "offline" | "offline-done";
type MicState = "idle" | "listening" | "thinking" | "speaking";

const PASS_KEY = "uncooked:interview-passcode";
const readPass = () => {
  try {
    return localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    return "";
  }
};
const writePass = (v: string) => {
  try {
    if (v) localStorage.setItem(PASS_KEY, v);
    else localStorage.removeItem(PASS_KEY);
  } catch {
    /* storage blocked: the passcode just isn't remembered */
  }
};

interface ApiError {
  status: number;
  error: string;
  message: string;
}

/** POST one interview request and stream the reply text into onText. */
async function callInterviewer(body: object, passcode: string, onText: (chunk: string) => void, signal: AbortSignal): Promise<ApiError | null> {
  let res: Response;
  try {
    res = await fetch("/api/interview", { method: "POST", headers: { "content-type": "application/json", "x-interview-passcode": passcode }, body: JSON.stringify(body), signal });
  } catch (e) {
    if (signal.aborted) return null;
    return { status: 0, error: "offline", message: navigator.onLine ? "Couldn't reach the server." : "You're offline. The AI interviewer needs a connection." };
  }
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    return { status: res.status, error: data.error ?? "error", message: data.message ?? `Request failed (${res.status}).` };
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onText(decoder.decode(value, { stream: true }));
  }
  return null;
}

function MicButton({ state, supported, onStart, onStop, onInterrupt }: { state: MicState; supported: boolean; onStart: () => void; onStop: () => void; onInterrupt: () => void }) {
  if (!supported) return null;
  const label = state === "listening" ? "Done talking" : state === "speaking" ? "Interrupt and answer" : state === "thinking" ? "Interviewer is thinking…" : "Tap to answer";
  return (
    <button
      type="button"
      data-testid="mic"
      disabled={state === "thinking"}
      onClick={state === "listening" ? onStop : state === "speaking" ? onInterrupt : onStart}
      className={cx("btn h-16 w-full text-sm md:w-auto md:px-8", state === "listening" ? "btn-primary" : "")}
    >
      <span className={cx("font-mono text-base", state === "listening" ? "text-bg" : state === "speaking" ? "text-second" : "text-accent")}>{state === "listening" ? "■" : "●"}</span>
      {label}
    </button>
  );
}

export default function InterviewPage() {
  const store = useStore();
  const now = useNow(1000);
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<Round>("full");
  const [minutes, setMinutes] = useState(15);
  const [voice, setVoice] = useState(true);
  const [handsFree, setHandsFree] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [passInput, setPassInput] = useState("");
  const [askPass, setAskPass] = useState(false);
  const [support, setSupport] = useState({ listen: false, speak: false });

  const [turns, setTurns] = useState<Turn[]>([]);
  const [live, setLive] = useState(""); // interviewer text while it streams
  const [heard, setHeard] = useState(""); // speech recognized so far
  const [draft, setDraft] = useState("");
  const [code, setCode] = useState("");
  const [mic, setMic] = useState<MicState>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [startedAt, setStartedAt] = useState(0);

  const [queue, setQueue] = useState<OfflineQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [offlineAnswers, setOfflineAnswers] = useState<string[]>([]);

  const speaker = useRef<Speaker | null>(null);
  const listener = useRef<Listener | null>(null);
  const abort = useRef<AbortController | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const phaseRef = useRef<Phase>("setup");
  const handsFreeRef = useRef(handsFree);
  const sendRef = useRef<(text: string) => void>(() => {});
  turnsRef.current = turns;
  phaseRef.current = phase;
  handsFreeRef.current = handsFree;

  useEffect(() => {
    setSupport({ listen: canListen(), speak: canSpeak() });
    setPasscode(readPass());
    speaker.current = new Speaker();
    listener.current = new Listener(
      (text) => setHeard(text),
      (text) => {
        setHeard("");
        if (text.trim()) sendRef.current(text);
        else setMic("idle");
      },
      (message) => {
        setMic("idle");
        setError({ status: 0, error: "mic", message });
      },
    );
    return () => {
      speaker.current?.cancel();
      listener.current?.abort();
      abort.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (speaker.current) speaker.current.enabled = voice;
    if (!voice) speaker.current?.cancel();
  }, [voice]);

  const listen = useCallback(() => {
    speaker.current?.cancel();
    setError((e) => (e?.error === "mic" ? null : e));
    setHeard("");
    setMic("listening");
    blip.tick();
    listener.current?.start();
  }, []);

  // after the interviewer finishes speaking, hand the floor back
  const afterSpeaking = useCallback(() => {
    setMic("idle");
    if (handsFreeRef.current && canListen() && (phaseRef.current === "live" || phaseRef.current === "offline")) listen();
  }, [listen]);

  const elapsed = startedAt && now ? now - startedAt : 0;
  const minutesLeft = minutes - elapsed / 60_000;

  /** Ask the interviewer for its next turn, given the conversation so far. */
  const ask = useCallback(
    async (history: Turn[]) => {
      const sp = speaker.current!;
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setMic("thinking");
      setLive("");
      setError(null);
      sp.onIdle = afterSpeaking;
      sp.begin();
      let text = "";
      const err = await callInterviewer({ round, mode: "turn", messages: history, minutesLeft: startedAt ? minutes - (Date.now() - startedAt) / 60_000 : minutes }, passcode, (chunk) => {
        if (!text) setMic("speaking");
        text += chunk;
        setLive(text);
        sp.feed(chunk);
      }, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (err) {
        sp.cancel();
        setMic("idle");
        setLive("");
        if (err.status === 401) {
          writePass("");
          setPasscode("");
          setAskPass(true);
        }
        setError(err);
        return;
      }
      setTurns([...history, { role: "assistant", content: text.trim() }]);
      setLive("");
      if (!voice || !canSpeak()) {
        sp.cancel();
        afterSpeaking();
      } else sp.end();
    },
    [round, minutes, startedAt, passcode, voice, afterSpeaking],
  );

  /** Send the candidate's answer (spoken or typed). */
  const send = useCallback(
    (text: string) => {
      const answer = text.trim();
      if (!answer) return;
      if (phaseRef.current === "offline") {
        setOfflineAnswers((a) => {
          const next = [...a];
          next[qi] = answer;
          return next;
        });
        setRevealed(true);
        setMic("idle");
        return;
      }
      const content = code.trim() ? `${answer}\n\n[My code]\n${code.trim()}` : answer;
      const history = [...turnsRef.current, { role: "user" as const, content }];
      setTurns(history);
      setDraft("");
      void ask(history);
    },
    [ask, code, qi],
  );
  sendRef.current = send;

  const start = () => {
    if (!passcode) {
      setAskPass(true);
      return;
    }
    speaker.current?.unlock();
    setTurns([]);
    setFeedback("");
    setFeedbackDone(false);
    setCode("");
    setStartedAt(Date.now());
    setPhase("live");
    void ask([]);
  };

  const savePass = () => {
    const v = passInput.trim();
    if (!v) return;
    writePass(v);
    setPasscode(v);
    setPassInput("");
    setAskPass(false);
    setError(null);
  };

  const stopAll = () => {
    abort.current?.abort();
    listener.current?.abort();
    speaker.current?.cancel();
    setMic("idle");
    setHeard("");
  };

  const end = async () => {
    stopAll();
    setPhase("feedback");
    const transcript = turnsRef.current;
    if (transcript.filter((t) => t.role === "user").length === 0) {
      setFeedback("You ended before answering anything, so there's nothing to score yet.");
      setFeedbackDone(true);
      return;
    }
    const ctrl = new AbortController();
    abort.current = ctrl;
    let text = "";
    const err = await callInterviewer({ round, mode: "feedback", messages: transcript }, passcode, (chunk) => {
      text += chunk;
      setFeedback(text);
    }, ctrl.signal);
    if (err) setError(err);
    if (text.trim()) {
      const stamp = new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      actions.saveAnswer("mock-interview", `${ROUNDS[round].label} round · ${stamp}\n\n${text.trim()}`);
    }
    setFeedbackDone(true);
  };

  const startOffline = async () => {
    stopAll();
    speaker.current?.unlock();
    const { buildOfflineQueue } = await import("@/lib/interview/offline");
    const q = buildOfflineQueue(round, store.settings.resumeVersion);
    setQueue(q);
    setQi(0);
    setRevealed(false);
    setOfflineAnswers([]);
    setError(null);
    setStartedAt(Date.now());
    setPhase("offline");
    askOffline(q[0]);
  };

  const askOffline = (q: OfflineQuestion | undefined) => {
    if (!q) return;
    const sp = speaker.current!;
    sp.onIdle = afterSpeaking;
    if (voice && canSpeak()) {
      setMic("speaking");
      sp.sayAll(q.question);
    } else afterSpeaking();
  };

  const nextOffline = (rating?: (typeof RATINGS)[number]["id"]) => {
    const q = queue[qi];
    const answer = offlineAnswers[qi];
    if (q?.cardId) {
      if (answer) actions.saveAnswer(q.cardId, answer);
      if (rating) actions.gradeCard(q.cardId, rating);
    }
    setRevealed(false);
    setDraft("");
    if (qi + 1 >= queue.length) {
      stopAll();
      setPhase("offline-done");
      return;
    }
    setQi(qi + 1);
    askOffline(queue[qi + 1]);
  };

  const unavailable = error && ["no_credits", "not_configured", "bad_key", "offline", "api_error"].includes(error.error);

  /* ───────────── setup ───────────── */
  if (phase === "setup")
    return (
      <div className="mx-auto max-w-[860px]">
        <PageHeader kicker="Voice mock interview" title="Talk it through, out loud">
          An AI interviewer runs a practice SAP STAR round and talks to you. You answer by voice (or typing). At the end you get scored feedback.
        </PageHeader>

        <Panel title="Round" className="mb-4">
          <div className="grid gap-1 p-3 md:grid-cols-5">
            {(Object.keys(ROUNDS) as Round[]).map((r) => (
              <button key={r} type="button" className="btn h-auto flex-col items-start gap-1 whitespace-normal py-2 text-left" aria-pressed={round === r} onClick={() => setRound(r)}>
                {ROUNDS[r].label}
                <span className="font-mono text-2xs normal-case leading-snug tracking-normal text-dim">{ROUNDS[r].note}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Setup" className="mb-4">
          <div className="flex flex-col gap-3 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-1">
              <span className="w-28 text-dim">Length</span>
              {[10, 15, 20, 30].map((m) => (
                <button key={m} type="button" className="btn btn-sm" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>{m} min</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="w-28 text-dim">Voice</span>
              <button type="button" className="btn btn-sm" aria-pressed={voice} onClick={() => setVoice(!voice)}>{voice ? "[■] interviewer speaks" : "[ ] text only"}</button>
              <button type="button" className="btn btn-sm" aria-pressed={handsFree} disabled={!support.listen} onClick={() => setHandsFree(!handsFree)}>{handsFree ? "[■] hands-free" : "[ ] tap to answer"}</button>
            </div>
            {!support.listen && <p className="text-xs text-second">This browser can't do speech recognition here. Answer with the keyboard's dictation key or by typing; the interviewer still speaks.</p>}
            {support.listen && <p className="text-xs text-dim">Hands-free starts listening when the interviewer stops. Tap Done talking when you finish an answer.</p>}
          </div>
        </Panel>

        {(askPass || !passcode) && (
          <Panel title="Passcode" className="mb-4">
            <form className="flex flex-wrap items-center gap-2 p-3" onSubmit={(e) => { e.preventDefault(); savePass(); }}>
              <input className="field max-w-[260px]" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="Interview passcode" aria-label="Interview passcode" autoCapitalize="off" autoCorrect="off" autoComplete="off" />
              <button type="submit" className="btn">Save</button>
              <span className="w-full text-xs text-dim">Keeps strangers from spending your API credits. Saved on this device after the first time.</span>
            </form>
          </Panel>
        )}
        {error && <p className="mb-3 text-sm text-error" role="alert">{error.message}</p>}

        <div className="flex flex-wrap gap-1">
          <button type="button" className="btn btn-primary" onClick={start} disabled={!passcode}>Start interview</button>
          <button type="button" className="btn" onClick={() => void startOffline()}>Practice offline</button>
        </div>
        <p className="mt-2 text-xs text-ghost">Offline practice asks questions from your own cards and reads them aloud. No AI, no cost, no connection needed.</p>
        <QuoteLine quote={quoteFor(minutes + round.length)} className="mt-6" />
      </div>
    );

  /* ───────────── feedback ───────────── */
  if (phase === "feedback")
    return (
      <div className="mx-auto flex max-w-[860px] flex-col gap-4">
        <PageHeader kicker={`Voice mock interview · ${ROUNDS[round].label}`} title="Feedback" />
        <Panel accent title={feedbackDone ? "Coach's notes · saved to Stats" : "Writing feedback…"}>
          <div className="p-4">
            {error && <p className="mb-3 text-sm text-error" role="alert">{error.message}</p>}
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed" data-testid="feedback">{feedback || (feedbackDone ? "" : "…")}</pre>
          </div>
        </Panel>
        <Panel title={`Transcript · ${turns.length} turns`}>
          <ol className="flex flex-col gap-3 p-4 text-sm">
            {turns.map((t, i) => (
              <li key={i}>
                <span className={cx("label", t.role === "assistant" ? "text-second" : "text-accent")}>{t.role === "assistant" ? "Interviewer" : "You"}</span>
                <p className="mt-1 whitespace-pre-wrap">{t.content}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <div className="flex flex-wrap gap-1">
          <button type="button" className="btn btn-primary" onClick={() => setPhase("setup")}>Another round</button>
          <Link href="/stats" className="btn">See it in Stats</Link>
        </div>
      </div>
    );

  /* ───────────── offline done ───────────── */
  if (phase === "offline-done")
    return (
      <div className="mx-auto flex max-w-[860px] flex-col gap-4">
        <PageHeader kicker="Offline practice" title="Round done" />
        <Panel accent title={`${queue.length} questions · answers saved to your cards`}>
          <ol className="flex flex-col gap-4 p-4 text-sm">
            {queue.map((q, i) => (
              <li key={i}>
                <p className="label text-second">{q.label}</p>
                <p className="mt-1">{q.question}</p>
                <p className="mt-1 whitespace-pre-wrap text-dim">{offlineAnswers[i] ? `You: ${offlineAnswers[i]}` : "(skipped)"}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <div className="flex flex-wrap gap-1">
          <button type="button" className="btn btn-primary" onClick={() => void startOffline()}>Another round</button>
          <button type="button" className="btn" onClick={() => setPhase("setup")}>Back</button>
        </div>
      </div>
    );

  /* ───────────── live (AI) and offline question ───────────── */
  const offline = phase === "offline";
  const q = queue[qi];
  const lastInterviewer = live || [...turns].reverse().find((t) => t.role === "assistant")?.content || "";
  const prompt = offline ? q?.question ?? "" : lastInterviewer;

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label">{offline ? "Offline practice" : "Voice mock interview"}</span>
          <span className="chip">{ROUNDS[round].label}</span>
          {offline && <span className="chip">{qi + 1}/{queue.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!offline && <span className={cx("font-pixel text-base tabular-nums", minutesLeft <= 0 ? "text-error" : minutesLeft < 2 ? "text-second" : "text-text")} data-testid="interview-clock">{fmtTime(Math.max(0, minutesLeft) * 60_000)}</span>}
          <button type="button" className="btn btn-sm" aria-pressed={voice} onClick={() => setVoice(!voice)}>{voice ? "Voice on" : "Voice off"}</button>
          {offline ? <button type="button" className="btn btn-sm" onClick={() => { stopAll(); setPhase("offline-done"); }}>Finish</button> : <button type="button" className="btn btn-sm" onClick={() => void end()}>End + feedback</button>}
        </div>
      </header>

      <Panel title={offline ? q?.label ?? "Question" : "Interviewer"} accent={mic === "speaking"}>
        <div className="min-h-[96px] p-4" data-testid="interviewer">
          {mic === "thinking" && !live ? <p className="text-dim">…</p> : <p className="whitespace-pre-wrap text-lg leading-snug">{prompt}</p>}
          {voice && prompt && mic !== "thinking" && (
            <button type="button" className="btn btn-sm mt-3" onClick={() => { const sp = speaker.current!; sp.onIdle = () => setMic("idle"); setMic("speaking"); sp.sayAll(prompt); }}>Repeat</button>
          )}
        </div>
      </Panel>

      {error && (
        <div className="panel p-3 text-sm" role="alert">
          <p className="text-error">{error.message}</p>
          {unavailable && !offline && (
            <div className="mt-2 flex flex-wrap gap-1">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => void startOffline()}>Practice offline instead</button>
              <button type="button" className="btn btn-sm" onClick={() => void ask(turnsRef.current)}>Try again</button>
            </div>
          )}
          {error.status === 401 && (
            <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); savePass(); void ask(turnsRef.current); }}>
              <input className="field max-w-[240px]" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="Interview passcode" aria-label="Interview passcode" autoCapitalize="off" autoCorrect="off" />
              <button type="submit" className="btn btn-sm">Save and retry</button>
            </form>
          )}
        </div>
      )}

      {offline && revealed && q ? (
        <Panel title="A strong answer hits" className="fade-in">
          <div className="p-4">
            <ul className="flex flex-col gap-1 text-sm">{q.keyPoints.map((k) => <li key={k}><span className="text-accent">■ </span>{k}</li>)}</ul>
            {offlineAnswers[qi] && <p className="mt-3 whitespace-pre-wrap text-xs text-dim">You said: {offlineAnswers[qi]}</p>}
            <div className="mt-4 flex flex-wrap gap-1">
              {q.cardId ? RATINGS.map((r) => <button key={r.id} type="button" className="btn btn-sm" onClick={() => nextOffline(r.id)}>{r.label}</button>) : <button type="button" className="btn btn-primary" onClick={() => nextOffline()}>Next</button>}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel title="Your answer">
          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <MicButton state={mic} supported={support.listen} onStart={listen} onStop={() => listener.current?.stop()} onInterrupt={listen} />
              {mic === "listening" && <button type="button" className="btn btn-sm" onClick={() => { listener.current?.abort(); setHeard(""); setMic("idle"); }}>Cancel</button>}
            </div>
            {(heard || mic === "listening") && <p className="min-h-6 text-sm text-accent" data-testid="heard">{heard || "listening…"}</p>}
            <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); send(draft); setDraft(""); }}>
              <textarea className="field min-h-[72px]" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={support.listen ? "Or type your answer" : "Type, or use the keyboard's dictation key"} aria-label="Typed answer" disabled={mic === "thinking"} />
              <div className="flex flex-wrap items-center gap-1">
                <button type="submit" className="btn" disabled={!draft.trim() || mic === "thinking"}>Send</button>
                {offline && <button type="button" className="btn" onClick={() => setRevealed(true)}>Show key points</button>}
              </div>
            </form>
            {!offline && (round === "coding" || round === "full") && (
              <details>
                <summary className="label cursor-pointer">Code pad (sent with your next answer)</summary>
                <textarea className="field mt-2 min-h-[140px] font-mono text-sm" value={code} onChange={(e) => setCode(e.target.value)} placeholder="def solve(...):" aria-label="Code pad" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
              </details>
            )}
          </div>
        </Panel>
      )}

      {!offline && turns.length > 0 && (
        <Panel title="Transcript">
          <ol className="flex max-h-[320px] flex-col gap-3 overflow-y-auto p-4 text-sm" data-testid="transcript">
            {turns.map((t, i) => (
              <li key={i}>
                <span className={cx("label", t.role === "assistant" ? "text-second" : "text-accent")}>{t.role === "assistant" ? "Interviewer" : "You"}</span>
                <p className="mt-1 whitespace-pre-wrap">{t.content}</p>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}
