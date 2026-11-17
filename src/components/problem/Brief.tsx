"use client";
import { useEffect, useState } from "react";
import type { Problem } from "@/lib/content/types";
import { cx } from "@/components/ui";

/** Read the briefing aloud with the browser's voice. Decorative; silent if unsupported. */
function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const toggle = (text: string) => {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.onend = u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };
  return { supported, speaking, toggle };
}

/** The problem in plain words: what it asks, the first example, one thing to watch. No approach. */
export function BriefBody({ p, compact }: { p: Problem; compact?: boolean }) {
  const speech = useSpeak();
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => setCanSpeak(speech.supported), [speech.supported]);
  const rows: [string, string][] = [
    ["What it's asking", p.brief.what],
    ["The example", p.brief.example],
    ["Watch for", p.brief.watch],
  ];
  return (
    <div data-testid="brief">
      <dl className={cx("flex flex-col", compact ? "gap-2" : "gap-4")}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className={cx("label mb-1", k === "Watch for" ? "text-second" : "text-accent")}>{k}</dt>
            <dd className={cx("leading-relaxed", compact ? "text-sm" : "text-base")}>{v}</dd>
          </div>
        ))}
      </dl>
      {canSpeak && (
        <button type="button" className="btn btn-sm mt-3" aria-pressed={speech.speaking} onClick={() => speech.toggle(rows.map(([, v]) => v).join(" "))}>
          {speech.speaking ? "Stop reading" : "Read it to me"}
        </button>
      )}
    </div>
  );
}

/** First step of a problem: read the briefing, then start. */
export function BriefStep({ p, onStart }: { p: Problem; onStart: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Enter" && t.tagName !== "TEXTAREA" && t.tagName !== "INPUT" && t.tagName !== "BUTTON") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);
  return (
    <div className="fade-in">
      <p className="label mb-3">Step 0 · the problem in plain words</p>
      <BriefBody p={p} />
      <p className="mt-4 text-xs text-dim">Say it back in your own words before you go on. That's the first thing an interviewer wants to hear.</p>
      <button type="button" className="btn btn-primary mt-4" onClick={onStart} autoFocus>Got it, start the questions</button>
    </div>
  );
}
