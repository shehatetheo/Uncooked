"use client";
import Link from "next/link";
import { CORE, problems, REST } from "@content/index";
import { Dots } from "@/components/ScorecardView";
import { CATEGORIES } from "@/lib/ai/protocol";
import { statusOf, useProgress, type ProgressMap } from "@/lib/progress";
import type { Problem } from "@/lib/types";

const VERDICT = { hire: "Hire", "lean hire": "Lean hire", "lean no": "Lean no" } as const;
const time = (s?: number) => (s === undefined ? "–" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

function Table({ title, note, list, progress, from }: { title: string; note: string; list: Problem[]; progress: ProgressMap; from: number }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-dim">{note}</p>
      <div className="mt-3 hidden grid-cols-[2rem_minmax(0,1fr)_5rem_8rem_6rem_4rem] gap-x-3 px-4 md:grid" aria-hidden="true">
        <span />
        <span className="label">Question</span>
        <span className="label">Level</span>
        <span className="label">Status</span>
        <span className="label">Last call</span>
        <span className="label text-right">Time</span>
      </div>
      <ul className="panel mt-1 divide-y divide-line overflow-hidden">
        {list.map((p, i) => {
          const q = progress[p.id];
          const status = statusOf(q);
          return (
            <li key={p.id}>
              <Link href={`/q/${p.id}`} className="grid grid-cols-[2rem_1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-hover md:grid-cols-[2rem_minmax(0,1fr)_5rem_8rem_6rem_4rem]" data-testid={`row-${p.id}`}>
                <span className="font-mono text-xs text-faint">{String(from + i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-faint">{p.tags.join(" · ")}</span>
                </span>
                <span className="hidden text-xs text-dim md:block">{p.difficulty}</span>
                <span className={`text-xs font-medium ${status === "Blind solved" ? "text-ok" : status === "Ghost done" ? "text-accent" : "text-faint"}`} data-testid={`status-${p.id}`}>{status}</span>
                <span className="hidden text-xs text-dim md:block">{q?.scorecard ? VERDICT[q.scorecard.verdict] : "–"}</span>
                <span className="hidden text-right font-mono text-xs text-dim md:block">{time(q?.seconds)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home() {
  const progress = useProgress();
  const blind = problems.filter((p) => progress[p.id]?.phases.blind).length;
  const ghost = problems.filter((p) => progress[p.id]?.phases.ghost).length;
  const cards = problems.map((p) => progress[p.id]?.scorecard).filter((c) => !!c);
  const next = problems.find((p) => !progress[p.id]?.phases.blind) ?? problems[0]!;

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-16 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-bold text-accent">uncooked</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">SAP mock interviews</h1>
          <p className="mt-1 max-w-[60ch] text-sm text-dim">An AI interviewer gives you a problem SAP candidates have reported, talks it through with you, and scores you at the end. Python, in your browser.</p>
        </div>
        <Link href={`/q/${next.id}`} className="btn btn-primary h-11 px-5" data-testid="continue">{blind || ghost ? "Continue" : "Start"}: {next.title}</Link>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="label">Blind solved</p>
          <p className="mt-1 font-mono text-2xl font-bold" data-testid="blind-count">{blind}<span className="text-sm text-faint"> / {problems.length}</span></p>
        </div>
        <div className="panel p-4">
          <p className="label">Ghost done</p>
          <p className="mt-1 font-mono text-2xl font-bold">{ghost}<span className="text-sm text-faint"> / {problems.length}</span></p>
        </div>
        <div className="panel p-4">
          <p className="label">Scorecard averages · {cards.length} interview{cards.length === 1 ? "" : "s"}</p>
          {cards.length ? (
            <ul className="mt-2 space-y-1.5" data-testid="averages">
              {CATEGORIES.map((c) => {
                const avg = cards.reduce((a, card) => a + card.scores[c.key].score, 0) / cards.length;
                return (
                  <li key={c.key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-dim">{c.label}</span>
                    <span className="flex items-center gap-2"><Dots score={Math.round(avg)} /><span className="w-6 text-right font-mono">{avg.toFixed(1)}</span></span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-faint">Finish an interview to see your averages.</p>
          )}
        </div>
      </section>

      <Table title="Core set" note="The ones to nail first: the classics plus the strings and sorting STAR students say they get asked." list={CORE} progress={progress} from={0} />
      <Table title="More SAP questions" note="The rest of the reported easy and medium questions." list={REST} progress={progress} from={CORE.length} />
      <p className="mt-8 text-xs text-faint">Progress is saved in this browser only.</p>
    </main>
  );
}
