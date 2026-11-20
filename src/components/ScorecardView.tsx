"use client";
import { CATEGORIES, type Scorecard } from "@/lib/ai/protocol";

const VERDICT: Record<Scorecard["verdict"], string> = { hire: "Hire", "lean hire": "Lean hire", "lean no": "Lean no" };

export function Dots({ score }: { score: number }) {
  return (
    <span className="flex gap-1" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2 w-5 rounded-sm ${n <= score ? "bg-accent" : "bg-line-strong"}`} />)}
    </span>
  );
}

/** Five areas scored 1 to 5 with one tip each, and the overall call. */
export function ScorecardView({ card }: { card: Scorecard }) {
  const avg = CATEGORIES.reduce((a, c) => a + card.scores[c.key].score, 0) / CATEGORIES.length;
  return (
    <div data-testid="scorecard">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="label">Overall</p>
          <p className="text-2xl font-bold text-accent" data-testid="verdict-call">{VERDICT[card.verdict]}</p>
        </div>
        <div>
          <p className="label">Average</p>
          <p className="font-mono text-2xl font-bold">{avg.toFixed(1)}<span className="text-sm text-faint"> / 5</span></p>
        </div>
      </div>
      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed">{card.summary}</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {CATEGORIES.map((c) => (
          <li key={c.key} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[170px_1fr]">
            <div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="mt-1 flex items-center gap-2"><Dots score={card.scores[c.key].score} /><span className="font-mono text-xs text-dim">{card.scores[c.key].score}/5</span></p>
            </div>
            <p className="text-sm text-dim">{card.scores[c.key].tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
