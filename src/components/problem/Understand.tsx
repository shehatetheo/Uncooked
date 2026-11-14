"use client";
import { useEffect, useState } from "react";
import type { Choice } from "@/lib/content/types";
import { blip } from "@/lib/sound";
import { cx } from "@/components/ui";

/** One tap-to-answer question with an explanation after answering. */
export function ChoiceQuestion({ q, index, total, onAnswer, onNext, nextLabel = "Next" }: { q: Choice; index?: number; total?: number; onAnswer?: (correct: boolean, picked: number) => void; onNext: () => void; nextLabel?: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [q]);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) blip.pass();
    else blip.error();
    onAnswer?.(i === q.answer, i);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.tagName === "TEXTAREA" || tgt.tagName === "INPUT" || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= q.choices.length) pick(n - 1);
      else if (picked !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      {total !== undefined && index !== undefined && <p className="label mb-2">Question {index + 1} of {total}</p>}
      <p className="mb-4 whitespace-pre-wrap text-lg leading-snug">{q.prompt}</p>
      <div className="flex flex-col gap-2">
        {q.choices.map((c, i) => {
          const state = picked === null ? undefined : i === q.answer ? "right" : i === picked ? "wrong" : undefined;
          return (
            <button key={i} type="button" className="choice" data-state={state} disabled={picked !== null} onClick={() => pick(i)}>
              <span className={cx("shrink-0 font-pixel text-xs", state ? "" : "text-dim")}>{state === "right" ? "■" : state === "wrong" ? "×" : i + 1}</span>
              <span className="whitespace-pre-wrap text-sm">{c}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="fade-in mt-4">
          <p className={cx("label mb-1", picked === q.answer ? "text-accent" : "text-error")}>{picked === q.answer ? "Correct" : "Not quite"}</p>
          <p className="text-sm text-dim">{q.explain}</p>
          <button type="button" className="btn btn-primary mt-4" onClick={onNext} autoFocus>{nextLabel}</button>
        </div>
      )}
    </div>
  );
}
