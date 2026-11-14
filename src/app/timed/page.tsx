"use client";
import { useCallback, useMemo, useState } from "react";
import { Clock, useCountdown } from "@/components/drill/Countdown";
import { ColdSolve } from "@/components/problem/ColdSolve";
import { GhostPhase } from "@/components/problem/GhostPhase";
import { PageHeader, Panel, QuoteLine } from "@/components/ui";
import { problems } from "@/lib/content";
import { PATTERNS, type Problem } from "@/lib/content/types";
import { quoteFor } from "@/lib/quotes";
import type { RunReport } from "@/lib/runner/types";
import { useStore } from "@/lib/store";

type Mode = "menu" | "sprint" | "mock" | "speed";

// rotate the order by the hour so each session starts somewhere new, without Math.random in render
const rotate = <T,>(list: T[], by: number): T[] => list.map((_, i) => list[(i + by) % list.length]!);

function Sprint({ onExit }: { onExit: () => void }) {
  const queue = useMemo(() => rotate(problems.filter((p) => p.difficulty === "easy"), Math.floor(Date.now() / 60_000)), []);
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const t = useCountdown(10 * 60, () => setOver(true));
  const p = queue[i % queue.length]!;

  const onSubmitted = useCallback(
    (r: RunReport) => {
      if (r.status !== "pass") return;
      setSolved((s) => [...s, p.title]);
      setTimeout(() => setI((n) => n + 1), 900);
    },
    [p.title],
  );

  if (over)
    return (
      <Panel accent title="Sprint over">
        <div className="p-4">
          <p className="font-pixel text-2xl">{solved.length} <span className="text-base text-dim">solved in 10:00</span></p>
          <ul className="mt-3 text-sm">{solved.map((s, k) => <li key={k}><span className="text-accent">■ </span>{s}</li>)}</ul>
          <QuoteLine quote={quoteFor(solved.length + 11)} className="mt-4" />
          <button type="button" className="btn btn-primary mt-4" onClick={onExit}>Done</button>
        </div>
      </Panel>
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Clock ms={t.left} big />
        <span className="label">solved <span className="text-accent">{solved.length}</span></span>
        {!t.running && <button type="button" className="btn btn-primary" onClick={t.start}>{t.elapsed > 0 ? "Resume" : "Start 10:00"}</button>}
        <button type="button" className="btn" onClick={() => setI(i + 1)}>Skip</button>
        <button type="button" className="btn" onClick={onExit}>Quit</button>
      </div>
      <h2 className="h2 mb-3">{p.title}</h2>
      {t.elapsed > 0 ? <ColdSolve key={`${p.id}-${i}`} problem={p} context="sprint" allowHints={false} onSubmitted={onSubmitted} /> : <p className="text-sm text-dim">As many Easy problems as you can. No hints. The clock starts when you do.</p>}
    </div>
  );
}

const OPENERS = [
  "Before you write anything: restate the problem in your own words.",
  "What are the input and output types? Any constraints you want to ask me about?",
  "What's the brute force, and what would it cost?",
  "Which data structure are you reaching for, and why that one?",
];

function Mock({ onExit }: { onExit: () => void }) {
  const p: Problem = useMemo(() => {
    const pool = problems.filter((x) => x.difficulty === "easy" || x.tags.includes("made-up"));
    return pool[Math.floor(Date.now() / 1000) % pool.length]!;
  }, []);
  const t = useCountdown(20 * 60);
  const [passed, setPassed] = useState(false);
  const minutes = t.elapsed / 60_000;

  const interviewer = (
    <div className="border-t border-line p-4">
      <p className="label mb-2 text-second">Interviewer</p>
      <ul className="flex flex-col gap-2 text-sm">
        {OPENERS.filter((_, k) => minutes >= k * 1.5).map((q) => <li key={q}><span className="text-second">▸ </span>{q}</li>)}
        {minutes >= 8 && !passed && <li><span className="text-second">▸ </span>Talk me through what you have so far. What's left?</li>}
        {minutes >= 14 && !passed && <li><span className="text-second">▸ </span>We have a few minutes. Which edge cases would you test first?</li>}
        {passed && p.followUps.map((f) => (
          <li key={f.q}><details><summary className="cursor-pointer"><span className="text-second">▸ </span>{f.q}</summary><p className="mt-1 pl-4 text-dim">{f.a}</p></details></li>
        ))}
        {passed && p.reveal && <li className="text-dim"><span className="label text-accent">Pattern </span>{p.reveal}</li>}
      </ul>
      <p className="mt-3 text-xs text-ghost">Answer each one out loud. They care about your reasoning more than the answer.</p>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Clock ms={t.left} big />
        <span className="chip">{PATTERNS[p.pattern] && passed ? PATTERNS[p.pattern] : "pattern hidden"}</span>
        {!t.running && <button type="button" className="btn btn-primary" onClick={t.start}>{t.elapsed > 0 ? "Resume" : "Start 20:00"}</button>}
        <button type="button" className="btn" onClick={onExit}>End interview</button>
      </div>
      <h2 className="h2 mb-3">{p.tags.includes("made-up") ? "A problem the interviewer made up" : "Interview problem"}</h2>
      {t.elapsed > 0 ? (
        <ColdSolve problem={p} context="mock" allowHints={false} onSubmitted={(r) => { if (r.status === "pass") { setPassed(true); t.pause(); } }} aside={interviewer} />
      ) : (
        <p className="max-w-[60ch] text-sm text-dim">One problem, 20 minutes, no hints, pattern hidden. The interviewer panel asks follow-ups as time passes. Think out loud the whole way.</p>
      )}
    </div>
  );
}

function Speed({ onExit }: { onExit: () => void }) {
  const s = useStore();
  const [p, setP] = useState<Problem | null>(null);
  if (p)
    return (
      <div>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="h2">{p.title}</h2>
          <button type="button" className="btn btn-sm" onClick={() => setP(null)}>Pick another</button>
        </div>
        <GhostPhase problem={p} race onFinished={() => setP(null)} />
      </div>
    );
  return (
    <Panel title="Speed type · race your best WPM" right={<button type="button" className="btn btn-sm" onClick={onExit}>Back</button>}>
      {problems.map((x) => (
        <button key={x.id} type="button" className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 text-left last:border-0 hover:bg-inset" onClick={() => setP(x)}>
          <span className="truncate text-sm">{x.title}</span>
          <span className="text-xs tabular-nums text-dim">best <span className="text-accent">{s.progress[x.id]?.bestWpm ?? "--"}</span> wpm</span>
        </button>
      ))}
    </Panel>
  );
}

export default function TimedPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const back = () => setMode("menu");
  if (mode === "sprint") return <Sprint onExit={back} />;
  if (mode === "mock") return <Mock onExit={back} />;
  if (mode === "speed") return <Speed onExit={back} />;
  return (
    <div>
      <PageHeader kicker="Timed" title="Under the clock">Practice feeling the time pressure now so it isn't new on Friday.</PageHeader>
      <div className="grid gap-3 md:grid-cols-3">
        {([
          ["sprint", "Sprint", "10 min", "As many Easy problems as you can solve cold. No hints."],
          ["mock", "Mock interview", "20 min", "One random Easy or made-up problem with an interviewer asking follow-ups."],
          ["speed", "Speed type", "per problem", "Ghost-type races against your own best WPM."],
        ] as const).map(([id, t, time, d]) => (
          <button key={id} type="button" className="panel p-4 text-left hover:bg-inset" onClick={() => setMode(id)}>
            <span className="h2 block">{t}</span>
            <span className="mt-1 block text-xs text-second">{time}</span>
            <span className="mt-2 block text-sm text-dim">{d}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
