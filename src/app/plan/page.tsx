"use client";
import { DayBar, DayTasks } from "@/components/plan/DayTasks";
import { cx, PageHeader, Panel, QuoteLine } from "@/components/ui";
import { currentDay, dayMinutes, PLAN } from "@/lib/assignments";
import { useNow } from "@/lib/hooks";
import { quoteOfDay } from "@/lib/quotes";
import { dayKey } from "@/lib/srs";
import { useStore } from "@/lib/store";

export default function PlanPage() {
  const s = useStore();
  const now = useNow(60_000);
  const today = now ? currentDay(now) : null;
  const todayKey = now ? dayKey(now) : "";

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4">
      <PageHeader kicker="Assignments" title="Four days to Friday">
        About two hours a day. Tasks with a <span className="text-text">[ ]</span> box tick themselves when you finish the work; the rest you tick by hand. Re-solving earlier problems cold on a later day is on purpose: a second hint-free day is what makes a problem Mastered.
      </PageHeader>
      {PLAN.map((d) => {
        const isToday = today?.date === d.date;
        const past = !!todayKey && d.date < todayKey;
        return (
          <Panel
            key={d.date}
            accent={isToday}
            title={
              <span className={cx(isToday ? "text-accent" : past ? "text-ghost" : "")}>
                {d.label}
                {isToday ? " · today" : past ? " · past" : ""} · {dayMinutes(d)} min
              </span>
            }
            right={s.ready && now ? <DayBar day={d} now={now} /> : undefined}
          >
            <div className="border-b border-line px-3 py-3">
              <h2 className="h2">{d.title}</h2>
              <p className="mt-1 text-sm text-dim">{d.why}</p>
            </div>
            {now ? <DayTasks day={d} now={now} compact={past} /> : null}
          </Panel>
        );
      })}
      <QuoteLine quote={quoteOfDay(now || 0)} />
    </div>
  );
}
