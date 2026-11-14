"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CardDrill } from "@/components/drill/CardDrill";
import { Tabs } from "@/components/drill/Tabs";
import { JoinLab } from "@/components/sql/JoinLab";
import { AsciiBar, PageHeader, Panel, StatusTag } from "@/components/ui";
import { mastery } from "@/lib/catalog";
import { cards, sqlProblems } from "@/lib/content";
import type { OpenCard } from "@/lib/content/types";
import { useQueryParam } from "@/lib/hooks";
import { progressOf, useStore } from "@/lib/store";

type Tab = "problems" | "joins" | "concepts";

export default function SqlPage() {
  const s = useStore();
  const qp = useQueryParam("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>("problems");
  const [session, setSession] = useState<{ title: string; cards: OpenCard[] } | null>(null);
  useEffect(() => { if (qp && ["problems", "joins", "concepts"].includes(qp)) setTab(qp); }, [qp]);
  const concepts = cards.filter((c) => c.track === "sql-concept");

  if (session) return <div className="mx-auto max-w-[820px]"><CardDrill key={session.cards[0]?.id} {...session} onExit={() => setSession(null)} /></div>;

  return (
    <div>
      <PageHeader kicker="SQL track" title="SQL is its own interview">
        Queries run in your browser on SQLite. Your result is compared with the expected rows, on the seed you can see and on hidden ones. The STAR student was asked inner join vs. outer join: start with the Joins tab.
      </PageHeader>
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "problems", label: "Problems", count: sqlProblems.length }, { id: "joins", label: "Joins, live" }, { id: "concepts", label: "Concept cards", count: concepts.length }]} />

      {tab === "problems" && (
        <div className="flex flex-col gap-6">
          {([["seed", "Classic five"], ["original", "Originals"]] as const).map(([tag, title]) => {
            const list = sqlProblems.filter((p) => p.tags.includes(tag));
            return (
              <Panel key={tag} title={title} right={<AsciiBar value={mastery(s, list.map((p) => p.id))} />}>
                {list.map((p, i) => (
                  <Link key={p.id} href={`/sql/${p.id}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-x-3 border-b border-line px-3 py-2 last:border-0 hover:bg-inset md:grid-cols-[28px_1fr_260px_96px]">
                    <span className="text-xs tabular-nums text-ghost">{String(i + 1).padStart(2, "0")}</span>
                    <span className="truncate text-sm">{p.title}{p.difficulty === "medium" && <span className="pl-2 text-2xs text-second">MED</span>}</span>
                    <span className="hidden truncate text-xs text-dim md:block">{p.concept}</span>
                    <span className="text-right">{s.ready && <StatusTag status={progressOf(s, p.id, "sql").status} />}</span>
                  </Link>
                ))}
              </Panel>
            );
          })}
        </div>
      )}
      {tab === "joins" && <JoinLab />}
      {tab === "concepts" && (
        <Panel title="Explain it out loud">
          {[...new Set(concepts.map((c) => c.group))].map((g) => {
            const list = concepts.filter((c) => c.group === g);
            return (
              <div key={g} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 last:border-0 md:grid-cols-[1fr_auto_40px_auto]">
                <span className="text-sm">{g}</span>
                <AsciiBar value={mastery(s, list.map((c) => c.id))} className="hidden md:inline" />
                <span className="hidden text-right text-xs tabular-nums text-dim md:block">{list.length}</span>
                <button type="button" className="btn btn-sm" onClick={() => setSession({ title: "SQL concepts", cards: list })}>Drill</button>
              </div>
            );
          })}
        </Panel>
      )}
    </div>
  );
}
