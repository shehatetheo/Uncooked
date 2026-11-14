"use client";
import { useEffect, useState } from "react";
import type { OpenCard } from "@/lib/content/types";
import { quoteFor } from "@/lib/quotes";
import type { Rating } from "@/lib/srs";
import { actions, useStore } from "@/lib/store";
import { AsciiBar, cx, Panel, QuoteLine } from "@/components/ui";
import { RATINGS, Recorder } from "@/components/problem/ExplainPhase";

const KIND_LABEL: Record<OpenCard["kind"], string> = {
  individual: "What did you do",
  number: "Defend the number",
  why: "Why this choice",
  basic: "Quick-fire",
  story: "STAR story",
  concept: "Concept",
  consistency: "Consistency",
};
export const FORMULA = "I chose X because Y. I considered Z, but…";

/**
 * Open-answer cards: answer by typing or speaking, reveal the key points a
 * strong answer hits alongside your last saved answer, then self-grade.
 */
export function CardDrill({ cards, title, onExit }: { cards: OpenCard[]; title: string; onExit: () => void }) {
  const { answers } = useStore();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const [tally, setTally] = useState<Record<Rating, number>>({ again: 0, shaky: 0, got_it: 0, mastered: 0 });
  const card = cards[i];
  const last = card ? answers[card.id]?.[0] : undefined;

  useEffect(() => {
    setText("");
    setShown(false);
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey || !card) return;
      if (!shown && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setShown(true);
      } else if (shown && ["1", "2", "3", "4"].includes(e.key)) grade(RATINGS[Number(e.key) - 1]!.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card)
    return (
      <Panel accent title={`${title} · done`}>
        <div className="p-4">
          <p className="text-sm">
            {cards.length} card{cards.length === 1 ? "" : "s"}: <span className="text-accent">{tally.got_it + tally.mastered} solid</span>, <span className="text-second">{tally.shaky} shaky</span>, <span className="text-error">{tally.again} again</span>.
          </p>
          <QuoteLine quote={quoteFor(cards.length + tally.shaky * 5)} className="mt-4" />
          <button type="button" className="btn btn-primary mt-4" onClick={onExit} autoFocus>Done</button>
        </div>
      </Panel>
    );

  function grade(r: Rating) {
    if (!card) return;
    actions.saveAnswer(card.id, text);
    actions.gradeCard(card.id, r);
    setTally((t) => ({ ...t, [r]: t[r] + 1 }));
    setI((n) => n + 1);
  }

  const showFormula = card.kind === "why" || card.kind === "individual" || card.kind === "number";
  return (
    <Panel title={`${title} · ${card.group}`} right={<><span className="label tabular-nums">{i + 1}/{cards.length}</span><AsciiBar value={i / cards.length} width={8} /><button type="button" className="btn btn-sm" onClick={onExit}>Exit</button></>}>
      <div className="flex flex-col gap-4 p-4" data-testid="card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{KIND_LABEL[card.kind]}</span>
          {card.versions.length === 1 && <span className="chip text-second">{card.versions[0] === "new" ? "new resume only" : "SAP's copy only"}</span>}
          {card.verify && <span className="chip text-second">verify before the interview</span>}
        </div>
        {card.source && <p className="border-l-2 border-line-strong pl-3 text-sm text-dim">{card.source}</p>}
        <p className="text-lg leading-snug">{card.question}</p>
        {showFormula && <p className="text-xs text-ghost">Formula: {FORMULA}</p>}

        <textarea className="field min-h-[110px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer, or say it out loud and record it." aria-label="Your answer" />
        <Recorder />

        {!shown ? (
          <div><button type="button" className="btn btn-primary" onClick={() => setShown(true)}>Show key points</button></div>
        ) : (
          <div className="fade-in flex flex-col gap-4">
            <div>
              <p className="label mb-2 text-accent">A strong answer hits</p>
              <ul className="flex flex-col gap-1 text-sm">
                {card.keyPoints.map((k) => <li key={k}><span className="text-accent">■ </span>{k}</li>)}
              </ul>
            </div>
            {last && (
              <div>
                <p className="label mb-1">Your answer last time · {new Date(last.at).toLocaleDateString()}</p>
                <p className="whitespace-pre-wrap bg-inset p-3 text-sm text-dim shadow-[inset_0_0_0_1px_var(--color-line)]">{last.text}</p>
              </div>
            )}
            <div>
              <p className="label mb-2">Grade yourself honestly</p>
              <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
                {RATINGS.map((r, k) => (
                  <button key={r.id} type="button" className={cx("btn h-auto flex-col gap-0 py-2")} onClick={() => grade(r.id)}>
                    {r.label}
                    <span className="font-mono text-2xs normal-case tracking-normal text-dim">{k + 1} · {r.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
