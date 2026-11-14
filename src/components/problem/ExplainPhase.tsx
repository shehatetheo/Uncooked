"use client";
import { useEffect, useRef, useState } from "react";
import type { Problem } from "@/lib/content/types";
import { checkExplanation } from "@/lib/explain";
import type { Rating } from "@/lib/srs";
import { actions, progressOf, useStore } from "@/lib/store";
import { cx, Panel } from "@/components/ui";

export const RATINGS: { id: Rating; label: string; hint: string }[] = [
  { id: "again", label: "Again", hint: "back in 10 min" },
  { id: "shaky", label: "Shaky", hint: "tomorrow" },
  { id: "got_it", label: "Got it", hint: "in a few days" },
  { id: "mastered", label: "Mastered", hint: "spaced out" },
];

/** Record yourself explaining, then play it back. Audio stays on this device. */
export function Recorder() {
  const [state, setState] = useState<"idle" | "recording" | "done" | "denied" | "unsupported">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) setState("unsupported");
    return () => rec.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
        setState("done");
      };
      rec.current = r;
      r.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  if (state === "unsupported") return <p className="text-xs text-ghost">Recording isn't supported in this browser. Say it out loud anyway.</p>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "recording" ? (
        <button type="button" className="btn" onClick={() => rec.current?.stop()}><span className="text-error">■</span> Stop</button>
      ) : (
        <button type="button" className="btn" onClick={() => void start()}>{state === "done" ? "Record again" : "Record myself"}</button>
      )}
      {state === "recording" && <span className="text-xs text-error">recording… explain it like the interviewer is across the table</span>}
      {state === "denied" && <span className="text-xs text-error">Microphone access was blocked. Allow it in the browser's site settings.</span>}
      {url && state === "done" && <audio src={url} controls className="h-9" />}
    </div>
  );
}

/** Phase 4: explain it in your own words, out loud, then self-rate. */
export function ExplainPhase({ problem: p, onRated }: { problem: Problem; onRated: () => void }) {
  const store = useStore();
  const prog = progressOf(store, p.id, "problem");
  const saved = store.answers[p.id]?.[0];
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (store.ready && !loaded.current) {
      loaded.current = true;
      setText(saved?.text ?? "");
    }
  }, [store.ready, saved]);

  const checks = checkExplanation(text);
  const cleanDays = new Set(prog.cleanColdDays).size;

  const rate = (r: Rating) => {
    actions.saveAnswer(p.id, text);
    actions.completePhase(p.id, "explain");
    actions.rate(p.id, "problem", r);
    onRated();
  };

  return (
    <div className="grid items-start gap-3 md:grid-cols-2">
      <Panel title="In my words" className="min-w-0">
        <div className="p-4">
          <p className="text-sm leading-relaxed">{p.myWords}</p>
          <p className="mt-3 text-xs text-dim">Time {p.time} · Space {p.space}</p>
          <pre className="mt-4 overflow-x-auto bg-inset p-3 text-xs leading-relaxed text-dim shadow-[inset_0_0_0_1px_var(--color-line)]">{p.solution}</pre>
          <p className="label mb-2 mt-5">The interviewer might ask next</p>
          <ul className="flex flex-col gap-2 text-sm">
            {p.followUps.map((f) => (
              <li key={f.q}>
                <details>
                  <summary className="cursor-pointer text-text">{f.q}</summary>
                  <p className="mt-1 pl-4 text-dim">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel title="Now you explain it" className="min-w-0">
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-dim">Say it out loud first. Then type the version you'd give an interviewer: approach, why, complexity, an edge case.</p>
          <Recorder />
          <textarea className="field min-h-[140px]" value={text} onChange={(e) => { setText(e.target.value); setChecked(false); }} placeholder="I'd walk the list once and…" autoCapitalize="sentences" aria-label="Your explanation" />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn" disabled={!text.trim()} onClick={() => { setChecked(true); actions.saveAnswer(p.id, text); }}>Check my explanation</button>
            {saved && <span className="text-xs text-ghost">last saved {new Date(saved.at).toLocaleDateString()}</span>}
          </div>
          {checked && (
            <ul className="fade-in flex flex-col gap-1 text-sm" data-testid="explain-checks">
              {checks.map((c) => (
                <li key={c.key} className={c.hit ? "text-accent" : "text-second"}>
                  {c.hit ? "■" : "□"} {c.label}
                  {!c.hit && <span className="text-dim"> — {c.tip}</span>}
                </li>
              ))}
            </ul>
          )}
          <div>
            <p className="label mb-2">How did that feel?</p>
            <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
              {RATINGS.map((r) => (
                <button key={r.id} type="button" className={cx("btn h-auto flex-col gap-0 py-2", prog.rating === r.id && "text-accent")} onClick={() => rate(r.id)}>
                  {r.label}
                  <span className="font-mono text-2xs normal-case tracking-normal text-dim">{r.hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-dim">
              Mastered status needs proof: a hint-free cold solve on two different days. You have <span className={cleanDays >= 2 ? "text-accent" : "text-second"}>{Math.min(2, cleanDays)}/2</span>.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
