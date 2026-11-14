"use client";
import { useEffect, useState } from "react";
import { CardDrill, FORMULA } from "@/components/drill/CardDrill";
import { Tabs } from "@/components/drill/Tabs";
import { AsciiBar, PageHeader, Panel } from "@/components/ui";
import { mastery } from "@/lib/catalog";
import { cards } from "@/lib/content";
import type { OpenCard } from "@/lib/content/types";
import { useQueryParam } from "@/lib/hooks";
import { pickWeakest } from "@/lib/pick";
import { actions, useStore } from "@/lib/store";

type Tab = "resume" | "skills" | "consistency";
const TRACK: Record<Tab, OpenCard["track"]> = { resume: "resume", skills: "skill", consistency: "consistency" };

export default function ResumePage() {
  const s = useStore();
  const qp = useQueryParam("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>("resume");
  const [session, setSession] = useState<{ title: string; cards: OpenCard[] } | null>(null);
  useEffect(() => { if (qp && qp in TRACK) setTab(qp); }, [qp]);

  const version = s.settings.resumeVersion;
  const visible = (c: OpenCard) => version === "both" || c.track === "consistency" || c.versions.includes(version);
  const pool = cards.filter((c) => c.track === TRACK[tab] && visible(c));
  const groups = [...new Set(pool.map((c) => c.group))];
  const start = (title: string, list: OpenCard[], n: number) => setSession({ title, cards: pickWeakest(s, list, n, Date.now()) });

  if (session) return <div className="mx-auto max-w-[820px]"><CardDrill key={session.cards[0]?.id} {...session} onExit={() => setSession(null)} /></div>;

  return (
    <div>
      <PageHeader kicker="Resume defense" title="Every line is a question">
        They go line by line. For each one: what you did individually, the number behind it, and why you chose the tool. Formula: <span className="text-text">{FORMULA}</span>
      </PageHeader>

      <Panel title="Which resume is the interviewer holding?" className="mb-4">
        <div className="flex flex-wrap items-center gap-1 p-3">
          {([["old", "SAP's copy (v10)"], ["new", "Current (v11)"], ["both", "Both"]] as const).map(([id, label]) => (
            <button key={id} type="button" className="btn btn-sm" aria-pressed={version === id} onClick={() => actions.setSettings({ resumeVersion: id })}>{label}</button>
          ))}
          <span className="pl-2 text-xs text-dim">SAP has the version without the Develop for Good role. Bring printed copies of the current one.</span>
        </div>
      </Panel>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "resume", label: "Line by line", count: cards.filter((c) => c.track === "resume" && visible(c)).length },
          { id: "skills", label: "Skills quick-fire", count: cards.filter((c) => c.track === "skill").length },
          { id: "consistency", label: "Consistency", count: cards.filter((c) => c.track === "consistency").length },
        ]}
      />

      <div className="mb-4 flex flex-wrap gap-1">
        <button type="button" className="btn btn-primary" disabled={!pool.length} onClick={() => start(tab === "skills" ? "Quick-fire" : "Defense", pool, tab === "skills" ? 10 : 6)}>
          {tab === "skills" ? "Quick-fire 10" : tab === "consistency" ? "Run all" : "Drill 6 weakest"}
        </button>
        {tab === "resume" && <button type="button" className="btn" onClick={() => start("Numbers", pool.filter((c) => c.kind === "number"), 8)}>Defend the numbers</button>}
        {tab === "resume" && <button type="button" className="btn" onClick={() => start("Why X over Y", pool.filter((c) => c.kind === "why"), 8)}>Why X over Y</button>}
      </div>

      <Panel title={tab === "skills" ? "By category" : "By resume section"}>
        {groups.map((g) => {
          const list = pool.filter((c) => c.group === g);
          return (
            <div key={g} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 last:border-0 md:grid-cols-[1fr_auto_56px_auto]">
              <span className="truncate text-sm">{g}</span>
              <AsciiBar value={mastery(s, list.map((c) => c.id))} className="hidden md:inline" />
              <span className="hidden text-right text-xs tabular-nums text-dim md:block">{list.length}</span>
              <button type="button" className="btn btn-sm" onClick={() => setSession({ title: "Defense", cards: list })}>Drill</button>
            </div>
          );
        })}
        {!groups.length && <p className="p-3 text-sm text-ghost">No cards here yet.</p>}
      </Panel>
    </div>
  );
}
