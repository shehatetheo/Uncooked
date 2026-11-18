"use client";
import { useCallback, useMemo, useState } from "react";
import type { TechQuestion } from "@content/technical";
import { GhostEditor, type RepResult } from "@/components/problem/GhostEditor";
import { cx, fmtTime, Panel } from "@/components/ui";
import { problemById } from "@/lib/content/problems";
import { sqlById } from "@/lib/content/sql";
import { blip } from "@/lib/sound";
import { actions, useStore } from "@/lib/store";

export const ghostTarget = (q: TechQuestion) => (q.kind === "sql" ? sqlById.get(q.ref)?.solution ?? "" : problemById.get(q.ref)?.solution ?? "");
/** 100 only with zero errors; otherwise accuracy, capped at 99 so rounding never fakes a perfect run. */
export const ghostScore = (r: RepResult) => (r.errors === 0 ? 100 : Math.min(99, r.accuracy));

/** Type the solution over the ghost, as many times as it takes to hit 100. */
export function TechGhost({ q, onNext, nextLabel }: { q: TechQuestion; onNext?: () => void; nextLabel?: string }) {
  const { tech } = useStore();
  const best = tech[q.id]?.ghostBest ?? 0;
  const [repKey, setRepKey] = useState(0);
  const [blind, setBlind] = useState(false);
  const [last, setLast] = useState<{ r: RepResult; score: number } | null>(null);
  const [line, setLine] = useState(0);
  const target = useMemo(() => ghostTarget(q), [q]);
  const captions = q.kind === "code" ? problemById.get(q.ref)?.captions ?? [] : [];

  const onDone = useCallback(
    (r: RepResult) => {
      const score = ghostScore(r);
      actions.techGhost(q.id, score);
      setLast({ r, score });
      if (score === 100) blip.pass();
      else blip.fail();
    },
    [q.id],
  );
  const retry = () => {
    setLast(null);
    setLine(0);
    setRepKey((k) => k + 1);
  };
  const cap = captions[Math.min(line, captions.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <Panel inset>
        <GhostEditor
          target={target}
          lockedLines={q.kind === "sql" ? 0 : 1}
          blind={blind}
          repKey={repKey}
          paused={!!last}
          onLine={setLine}
          onDone={onDone}
          autoplay={false}
          onAutoplayEnd={() => {}}
          header={<span className="font-pixel text-xs">BEST <span className={best === 100 ? "text-accent" : "text-text"}>{best}%</span> · goal <span className="text-accent">100</span></span>}
          pills={<button type="button" className="btn btn-sm" aria-pressed={blind} onClick={() => { setBlind(!blind); retry(); }}>{blind ? "Ghost hidden" : "Hide ghost"}</button>}
        />
        {cap && (
          <div className="border-t border-line px-3 py-2 text-sm">
            <span className="font-pixel text-2xs uppercase tracking-wider text-accent">{cap.label}</span>
            <span className="text-dim"> — </span>
            {cap.text}
          </div>
        )}
      </Panel>

      {last && (
        <Panel accent={last.score === 100} title={last.score === 100 ? "100 · locked in" : `Score ${last.score} · go again`} className="fade-in">
          <div className="p-4" data-testid="ghost-result">
            <p className="font-pixel text-lg tabular-nums">
              <span className={last.score === 100 ? "text-accent" : "text-second"}>{last.score}</span><span className="text-dim">/100</span>
              <span className="text-dim"> · </span>{last.r.wpm} <span className="text-dim">WPM</span>
              <span className="text-dim"> · </span><span className={last.r.errors ? "text-error" : ""}>{last.r.errors}</span> <span className="text-dim">ERR</span>
              <span className="text-dim"> · </span><span className="text-second">{fmtTime(last.r.ms)}</span>
            </p>
            <p className="mt-2 text-sm text-dim">{last.score === 100 ? (blind ? "Perfect, from memory." : "Perfect run. Try it with the ghost hidden, or move on.") : "Any error keeps you under 100. Slow down on the lines that tripped you."}</p>
            <div className="mt-4 flex flex-wrap gap-1">
              <button type="button" className={cx("btn", last.score < 100 && "btn-primary")} onClick={retry} autoFocus={last.score < 100}>Retry</button>
              {onNext && <button type="button" className={cx("btn", last.score === 100 && "btn-primary")} onClick={onNext} autoFocus={last.score === 100}>{nextLabel ?? "Next"}</button>}
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
