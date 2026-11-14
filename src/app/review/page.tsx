"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CardDrill } from "@/components/drill/CardDrill";
import { Clock, useCountdown } from "@/components/drill/Countdown";
import { QuizRunner } from "@/components/drill/QuizRunner";
import { PageHeader, Panel, QuoteLine, StatusTag } from "@/components/ui";
import { dueItems, shakyItems, statusOf, type CatalogItem } from "@/lib/catalog";
import { cards, quiz } from "@/lib/content";
import { useNow, useQueryParam } from "@/lib/hooks";
import { todayPlan } from "@/lib/plan";
import { quoteOfDay } from "@/lib/quotes";
import { useStore } from "@/lib/store";

const quizById = new Map(quiz.map((q) => [q.id, q]));
const cardById = new Map(cards.map((c) => [c.id, c]));

export default function ReviewPage() {
  const s = useStore();
  const now = useNow(30_000);
  const night = useQueryParam("mode") === "night";
  const clock = useCountdown(15 * 60);
  const [run, setRun] = useState<"quiz" | "cards" | null>(null);

  // snapshot the queue when a session starts so answered items don't reshuffle it
  const pool: CatalogItem[] = useMemo(() => (!now || !s.ready ? [] : night ? shakyItems(s) : dueItems(s, now)), [s, now, night]);
  const [frozen, setFrozen] = useState<CatalogItem[] | null>(null);
  const list = frozen ?? pool;
  const code = list.filter((i) => i.kind === "problem" || i.kind === "sql");
  const quizDue = list.filter((i) => i.kind === "quiz").map((i) => quizById.get(i.id)!).filter(Boolean);
  const cardsDue = list.filter((i) => i.kind === "card").map((i) => cardById.get(i.id)!).filter(Boolean);
  const begin = (kind: "quiz" | "cards") => {
    setFrozen(pool);
    setRun(kind);
    if (night && !clock.running) clock.start();
  };
  const exit = () => {
    setRun(null);
    setFrozen(null);
  };

  const header = night ? (
    <PageHeader kicker="Night-before mode" title="Fifteen minutes, shaky only">
      Everything you rated Shaky or Again, once through. When the clock hits zero, close the laptop. Sleep is worth more than one more rep.
    </PageHeader>
  ) : (
    <PageHeader kicker="Daily review" title="What's due">
      Spaced repetition across coding, SQL, fundamentals and resume cards. Intervals are capped so everything comes back before Nov 20.
    </PageHeader>
  );

  if (run === "quiz") return <div className="mx-auto max-w-[760px]">{night && <p className="mb-2 text-right"><Clock ms={clock.left} /></p>}<QuizRunner title="Review" questions={quizDue} onExit={exit} /></div>;
  if (run === "cards") return <div className="mx-auto max-w-[820px]">{night && <p className="mb-2 text-right"><Clock ms={clock.left} /></p>}<CardDrill title="Review" cards={cardsDue} onExit={exit} /></div>;

  const empty = s.ready && now > 0 && list.length === 0;
  return (
    <div>
      {header}
      {night && (
        <div className="mb-4 flex items-center gap-3">
          <Clock ms={clock.left} big />
          {clock.running ? <button type="button" className="btn" onClick={clock.pause}>Pause</button> : <button type="button" className="btn btn-primary" onClick={clock.start}>Start 15:00</button>}
        </div>
      )}

      {empty ? (
        <Panel title={night ? "Nothing shaky" : "Nothing due"} accent>
          <div className="p-4">
            <p className="text-sm">{night ? "Nothing is marked Shaky right now. Run your intro once, then rest." : "You're caught up. Learn something new instead:"}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {(night ? [] : todayPlan(s, now).slice(0, 4)).map((p) => <li key={p.title}><Link href={p.href} className="hover:text-accent"><span className="text-accent">▸ </span>{p.title}</Link></li>)}
            </ul>
            <QuoteLine quote={quoteOfDay(now)} className="mt-4" />
          </div>
        </Panel>
      ) : (
        <div className="grid items-start gap-3 md:grid-cols-2">
          <Panel title={`Solve again · ${code.length}`}>
            {code.length === 0 && <p className="p-3 text-sm text-ghost">No coding or SQL problems {night ? "marked shaky" : "due"}.</p>}
            {code.map((i) => (
              <Link key={i.id} href={i.href} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 last:border-0 hover:bg-inset">
                <span className="truncate text-sm">{i.title}<span className="pl-2 text-xs text-dim">{i.group}</span></span>
                <StatusTag status={statusOf(s, i.id)} />
              </Link>
            ))}
            {code.length > 0 && <p className="border-t border-line px-3 py-2 text-xs text-ghost">Cold solve with no hints, then rate it again in Explain.</p>}
          </Panel>
          <div className="flex flex-col gap-3">
            <Panel title={`Fundamentals · ${quizDue.length}`}>
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="text-sm text-dim">{quizDue.length ? "Tap-to-answer questions you missed or that are due again." : "No quiz questions waiting."}</p>
                <button type="button" className="btn btn-primary" disabled={!quizDue.length} onClick={() => begin("quiz")}>Start</button>
              </div>
            </Panel>
            <Panel title={`Resume, behavioral, SQL concepts · ${cardsDue.length}`}>
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="text-sm text-dim">{cardsDue.length ? "Answer out loud, check the key points, grade yourself." : "No cards waiting."}</p>
                <button type="button" className="btn btn-primary" disabled={!cardsDue.length} onClick={() => begin("cards")}>Start</button>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
