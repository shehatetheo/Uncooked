"use client";
import { useEffect, useState } from "react";
import { DRILLS, type Drill } from "@content/drills";
import { CardDrill } from "@/components/drill/CardDrill";
import { Clock, useCountdown } from "@/components/drill/Countdown";
import { Tabs } from "@/components/drill/Tabs";
import { Recorder } from "@/components/problem/ExplainPhase";
import { AsciiBar, cx, PageHeader, Panel } from "@/components/ui";
import { mastery } from "@/lib/catalog";
import { cards } from "@/lib/content/cards";
import type { OpenCard } from "@/lib/content/types";
import { useAutosaveAnswer, useQueryParam } from "@/lib/hooks";
import { useStore } from "@/lib/store";

type Tab = "stories" | "intro" | "present" | "sap";
const INTRO_ID = "drill-intro-60";
const BEATS = [
  ["0–10s", "Who you are: name, freshman CS at Temple, what you're focused on."],
  ["10–35s", "Two proof points: one project you built (what it does, what you chose and why) and one experience where you worked with people."],
  ["35–50s", "What you're good at and what you want to learn next."],
  ["50–60s", "Why SAP and why STAR, in one sentence. Stop talking."],
] as const;

function IntroDrill() {
  const s = useStore();
  const t = useCountdown(60);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saved = s.answers[INTRO_ID]?.[0];
  useEffect(() => {
    if (s.ready && !loaded) {
      setLoaded(true);
      setText(saved?.text ?? "");
    }
  }, [s.ready, loaded, saved]);
  const savedAt = useAutosaveAnswer(INTRO_ID, text, loaded);

  return (
    <div className="grid items-start gap-3 md:grid-cols-2">
      <Panel title="60-second intro" right={<Clock ms={t.left} />}>
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-dim">"Tell me about yourself." Start the timer, say it out loud, stop at zero. Record it once and listen back.</p>
          <div className="flex flex-wrap gap-1">
            {t.running ? <button type="button" className="btn" onClick={t.pause}>Pause</button> : <button type="button" className="btn btn-primary" onClick={t.start}>{t.elapsed > 0 ? "Resume" : "Start 60s"}</button>}
            <button type="button" className="btn" onClick={t.reset}>Reset</button>
          </div>
          <Recorder />
          <ol className="flex flex-col gap-2 text-sm">
            {BEATS.map(([when, what], i) => {
              const now = t.elapsed / 1000;
              const active = t.elapsed > 0 && now >= [0, 10, 35, 50][i]! && now < [10, 35, 50, 999][i]!;
              return (
                <li key={when} className={cx("grid grid-cols-[64px_1fr] gap-2", active ? "text-text" : "text-dim")}>
                  <span className={active ? "text-accent" : "text-ghost"}>{when}</span>
                  <span>{what}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </Panel>
      <Panel title="Your script">
        <div className="flex flex-col gap-3 p-4">
          <textarea className="field min-h-[220px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write the version you'd actually say. About 150 words is 60 seconds." aria-label="Intro script" />
          <div className="flex items-center gap-3">
            <span className="text-xs">{savedAt ? <span className="text-accent">■ saved on this device</span> : <span className="text-ghost">saves as you type</span>}</span>
            <span className={cx("text-xs tabular-nums", text.trim().split(/\s+/).filter(Boolean).length > 165 ? "text-second" : "text-dim")}>
              {text.trim().split(/\s+/).filter(Boolean).length} words · about {Math.round((text.trim().split(/\s+/).filter(Boolean).length / 150) * 60)}s spoken
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function PresentationDrill({ drill, onExit }: { drill: Drill; onExit: () => void }) {
  const t = useCountdown(drill.minutes * 60);
  const [i, setI] = useState(0);
  const per = (drill.minutes * 60_000) / drill.slides.length;
  const pace = t.elapsed - per * (i + 1);
  const slide = drill.slides[i]!;
  return (
    <Panel title={`${drill.title} · ${drill.minutes} min`} right={<><Clock ms={t.left} /><button type="button" className="btn btn-sm" onClick={onExit}>Exit</button></>}>
      <div className="grid md:grid-cols-[220px_1fr]">
        <ol className="border-b border-line p-3 text-sm md:border-b-0 md:border-r">
          {drill.slides.map((sl, k) => (
            <li key={sl.title}>
              <button type="button" className={cx("flex w-full gap-2 py-1 text-left", k === i ? "text-accent" : k < i ? "text-ghost" : "text-dim")} onClick={() => setI(k)}>
                <span className="font-pixel text-2xs">{String(k + 1).padStart(2, "0")}</span>
                <span>{sl.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-dim">{drill.brief}</p>
          <div>
            <p className="label mb-1">Slide {i + 1} of {drill.slides.length} · about {Math.round(per / 1000)}s</p>
            <h2 className="h2 mb-3">{slide.title}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {slide.say.map((line) => <li key={line}><span className="text-accent">▸ </span>{line}</li>)}
            </ul>
          </div>
          {t.elapsed > 0 && <p className={cx("text-xs", pace > 0 ? "text-second" : "text-dim")}>{pace > 0 ? `Running ${Math.round(pace / 1000)}s long on this slide. Wrap it up.` : "On pace."}</p>}
          <div className="flex flex-wrap gap-1">
            {t.running ? <button type="button" className="btn" onClick={t.pause}>Pause</button> : <button type="button" className="btn btn-primary" onClick={t.start}>{t.elapsed > 0 ? "Resume" : "Start timer"}</button>}
            <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Prev</button>
            <button type="button" className="btn" disabled={i >= drill.slides.length - 1} onClick={() => setI(i + 1)}>Next slide</button>
            <button type="button" className="btn" onClick={() => { t.reset(); setI(0); }}>Reset</button>
          </div>
          <Recorder />
        </div>
      </div>
    </Panel>
  );
}

export default function BehavioralPage() {
  const s = useStore();
  const qp = useQueryParam("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>("stories");
  const [session, setSession] = useState<{ title: string; cards: OpenCard[] } | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  useEffect(() => { if (qp && ["stories", "intro", "present", "sap"].includes(qp)) setTab(qp); }, [qp]);

  const stories = cards.filter((c) => c.track === "behavioral");
  const sap = cards.filter((c) => c.track === "sap");
  if (session) return <div className="mx-auto max-w-[820px]"><CardDrill key={session.cards[0]?.id} {...session} onExit={() => setSession(null)} /></div>;
  if (drill) return <PresentationDrill drill={drill} onExit={() => setDrill(null)} />;

  const groupList = (pool: OpenCard[], title: string) => (
    <Panel title={title}>
      {[...new Set(pool.map((c) => c.group))].map((g) => {
        const list = pool.filter((c) => c.group === g);
        return (
          <div key={g} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 last:border-0 md:grid-cols-[1fr_auto_40px_auto]">
            <span className="text-sm">{g}</span>
            <AsciiBar value={mastery(s, list.map((c) => c.id))} className="hidden md:inline" />
            <span className="hidden text-right text-xs tabular-nums text-dim md:block">{list.length}</span>
            <button type="button" className="btn btn-sm" onClick={() => setSession({ title, cards: list })}>Drill</button>
          </div>
        );
      })}
    </Panel>
  );

  return (
    <div>
      <PageHeader kicker="Behavioral and SAP" title="The rest of the day">
        One-on-one behavioral questions, a group case, maybe a short presentation. Build each story once in Situation, Task, Action, Result, then rehearse it out loud.
      </PageHeader>
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "stories", label: "STAR stories", count: stories.length }, { id: "intro", label: "60s intro" }, { id: "present", label: "Presentations", count: DRILLS.length }, { id: "sap", label: "SAP 101", count: sap.length }]} />
      {tab === "stories" && groupList(stories, "Story slots")}
      {tab === "intro" && <IntroDrill />}
      {tab === "present" && (
        <div className="grid gap-3 md:grid-cols-3">
          {DRILLS.map((d) => (
            <button key={d.id} type="button" className="panel p-4 text-left hover:bg-inset" onClick={() => setDrill(d)}>
              <span className="h2 block">{d.title}</span>
              <span className="mt-1 block text-xs text-second">{d.minutes} min · {d.slides.length} slides</span>
              <span className="mt-2 block text-sm text-dim">{d.brief}</span>
            </button>
          ))}
        </div>
      )}
      {tab === "sap" && (
        <>
          <p className="mb-3 text-sm text-second">Verify these before the interview. Product names and details change; check sap.com the night before.</p>
          {groupList(sap, "SAP 101")}
        </>
      )}
    </div>
  );
}
