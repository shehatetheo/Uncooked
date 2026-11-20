"use client";
import { useEffect, useRef, useState } from "react";
import type { Interviewer } from "@/lib/useInterviewer";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Hold to talk; a quick tap toggles instead. Used in the panel and in the phone's bottom bar. */
export function MicButton({ iv, size = "lg" }: { iv: Interviewer; size?: "lg" | "sm" }) {
  const downAt = useRef(0);
  if (!iv.support.listen) return null;
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    if (iv.listening) return iv.stopListening(); // second tap in toggle mode
    downAt.current = Date.now();
    iv.startListening();
  };
  const up = () => {
    if (!downAt.current) return;
    const held = Date.now() - downAt.current;
    downAt.current = 0;
    if (held > 400) iv.stopListening(); // it was a hold: release sends
  };
  return (
    <button
      type="button"
      aria-label={iv.listening ? "Stop and send" : "Hold to talk"}
      aria-pressed={iv.listening}
      data-testid="mic"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
      className={cx(
        "flex shrink-0 touch-none select-none items-center justify-center gap-2 rounded-full border font-medium transition-colors",
        size === "lg" ? "h-12 px-5 text-sm" : "h-10 w-10",
        iv.listening ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-panel text-text hover:bg-hover",
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
      {size === "lg" && (iv.listening ? "Listening… release to send" : "Hold to talk")}
    </button>
  );
}

interface Props {
  iv: Interviewer;
  started: boolean;
  /** Shown before the interview starts. */
  intro: React.ReactNode;
}

/** The interviewer: who they are, whether they're speaking or listening, the transcript, and how you answer. */
export function InterviewerPanel({ iv, started, intro }: Props) {
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [iv.turns, iv.heard]);

  const state = iv.listening ? "Listening" : iv.status === "speaking" ? "Speaking" : iv.status === "thinking" ? "Thinking" : started ? "Your turn" : "Ready when you are";

  return (
    <section className="panel flex h-full min-h-0 flex-col" aria-label="Interviewer">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent" aria-hidden="true">S</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Sam <span className="font-normal text-faint">· SAP STAR interviewer</span></p>
          <p className="flex items-center gap-2 text-xs text-dim" data-testid="ai-state" aria-live="polite">
            {iv.status === "speaking" && !iv.listening && <span className="bars" aria-hidden="true"><span /><span /><span /></span>}
            {iv.listening && <span className="pulse h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}
            {iv.status === "thinking" && !iv.listening && <span className="pulse h-2 w-2 rounded-full bg-dim" aria-hidden="true" />}
            {state}
          </p>
        </div>
        {iv.support.speak && (
          <button type="button" className="btn btn-quiet h-8 px-2 text-xs" aria-pressed={iv.muted} onClick={() => iv.setMuted(!iv.muted)} data-testid="mute">
            {iv.muted ? "Voice off" : "Voice on"}
          </button>
        )}
      </header>

      {iv.error && (
        <div className="border-b border-line bg-inset px-4 py-3 text-sm" role="alert" data-testid="ai-error">
          <p className="text-bad">{iv.error}</p>
          <button type="button" className="btn mt-2 h-8 text-xs" onClick={iv.retry}>Try the interviewer again</button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3" data-testid="transcript">
        {!started && iv.turns.length === 0 ? (
          intro
        ) : (
          <ol className="flex flex-col gap-3 text-sm">
            {iv.turns.map((t, i) => (
              <li key={i} className={cx("max-w-[92%]", t.who === "you" && "self-end")}>
                <p className="label mb-0.5">{t.who === "ai" ? "Sam" : "You"}</p>
                <p className={cx("whitespace-pre-wrap rounded-lg px-3 py-2 leading-relaxed", t.who === "ai" ? "bg-inset" : "bg-accent-soft")} data-testid={t.who === "ai" ? "ai-line" : "you-line"}>{t.text}</p>
              </li>
            ))}
            {iv.listening && (
              <li className="max-w-[92%] self-end">
                <p className="label mb-0.5">You</p>
                <p className="rounded-lg border border-dashed border-line-strong px-3 py-2 text-dim" data-testid="heard">{iv.heard || "…"}</p>
              </li>
            )}
            {iv.status === "thinking" && <li className="text-xs text-faint" data-testid="thinking">Sam is thinking…</li>}
          </ol>
        )}
        <div ref={end} />
      </div>

      {started && (
        <footer className="border-t border-line p-3">
          {iv.micError && <p className="mb-2 text-xs text-bad">{iv.micError}</p>}
          <div className="flex items-center gap-2">
            <MicButton iv={iv} />
            {iv.support.listen ? (
              <span className="hidden text-xs text-faint lg:block">or hold Space</span>
            ) : (
              <span className="text-xs text-faint">This browser can't hear you. Type below.</span>
            )}
            {iv.status === "speaking" && (
              <button type="button" className="btn btn-quiet ml-auto h-8 px-2 text-xs" onClick={iv.stopSpeaking}>Stop voice</button>
            )}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              iv.say(draft);
              setDraft("");
            }}
          >
            <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Or type your answer" aria-label="Type your answer" />
            <button type="submit" className="btn" disabled={!draft.trim()}>Send</button>
          </form>
        </footer>
      )}
    </section>
  );
}
