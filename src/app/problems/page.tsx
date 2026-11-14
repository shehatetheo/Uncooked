"use client";
import Link from "next/link";
import { useState } from "react";
import { problems } from "@/lib/content/problems";
import { PATTERNS, type PatternId, type Problem } from "@/lib/content/types";
import { TOTAL_REPS } from "@/lib/ghost";
import { progressOf, useStore } from "@/lib/store";
import { AsciiBar, cx, PageHeader, Panel, StatusTag } from "@/components/ui";
import { mastery } from "@/lib/catalog";

const SECTIONS: { title: string; note: string; filter: (p: Problem) => boolean }[] = [
  { title: "Core 12", note: "The main list. Know these cold.", filter: (p) => p.tags.includes("core") },
  { title: "Sorting and strings", note: "What the STAR student was actually asked.", filter: (p) => p.tags.includes("sap") },
  { title: "Made-up problems", note: "Interviewers invent problems. Each one is a known pattern in disguise.", filter: (p) => p.tags.includes("made-up") },
];

function Row({ p, n }: { p: Problem; n: number }) {
  const s = useStore();
  const prog = progressOf(s, p.id, "problem");
  const phases = (["understand", "ghost", "cold", "explain"] as const).map((k) => (prog.phases[k] ? "■" : "□")).join("");
  return (
    <Link href={`/p/${p.id}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-x-3 border-b border-line px-3 py-2 last:border-0 hover:bg-inset md:grid-cols-[28px_1fr_160px_72px_64px_96px]">
      <span className="text-xs tabular-nums text-ghost">{String(n).padStart(2, "0")}</span>
      <span className="truncate text-sm">{p.title}{p.difficulty === "medium" && <span className="pl-2 text-2xs text-second">MED</span>}</span>
      <span className="hidden truncate text-xs text-dim md:block">{PATTERNS[p.pattern]}</span>
      <span className="hidden text-xs text-dim md:block">{p.time}</span>
      <span className="hidden text-xs tracking-widest text-accent md:block" title={`Phases done. Ghost reps ${prog.ghostReps}/${TOTAL_REPS}`}>{phases}</span>
      <span className="text-right">{s.ready && <StatusTag status={prog.status} />}</span>
    </Link>
  );
}

export default function ProblemsPage() {
  const s = useStore();
  const [view, setView] = useState<"list" | "patterns">("list");
  const byPattern = (Object.keys(PATTERNS) as PatternId[]).map((id) => ({ id, list: problems.filter((p) => p.pattern === id) })).filter((g) => g.list.length);

  return (
    <div>
      <PageHeader kicker="Coding track" title="Problems">
        Every problem runs the same loop: understand it, type the ghost three times with the shadow and three without, solve it cold, explain it out loud.
      </PageHeader>
      <div className="mb-4 flex gap-1">
        <button type="button" className="btn btn-sm" aria-pressed={view === "list"} onClick={() => setView("list")}>List</button>
        <button type="button" className="btn btn-sm" aria-pressed={view === "patterns"} onClick={() => setView("patterns")}>Pattern map</button>
      </div>

      {view === "list" ? (
        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec) => {
            const list = problems.filter(sec.filter);
            if (!list.length) return null;
            return (
              <Panel key={sec.title} title={sec.title} right={<AsciiBar value={mastery(s, list.map((p) => p.id))} />}>
                <p className="border-b border-line px-3 py-2 text-xs text-dim">{sec.note}</p>
                {list.map((p, i) => <Row key={p.id} p={p} n={i + 1} />)}
              </Panel>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {byPattern.map((g) => (
            <Panel key={g.id} title={PATTERNS[g.id]} right={<AsciiBar value={mastery(s, g.list.map((p) => p.id))} width={8} />}>
              <ul className="p-3 text-sm">
                {g.list.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-1">
                    <Link href={`/p/${p.id}`} className={cx("truncate hover:text-accent", p.tags.includes("made-up") && "text-dim")}>
                      {p.tags.includes("made-up") ? "└ " : ""}{p.title}
                    </Link>
                    {s.ready && <StatusTag status={progressOf(s, p.id, "problem").status} />}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
