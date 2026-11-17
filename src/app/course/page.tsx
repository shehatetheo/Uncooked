"use client";
import { CourseHeader } from "@/components/course/CourseHeader";
import { TaskList } from "@/components/plan/DayTasks";
import { cx, PageHeader, Panel, QuoteLine } from "@/components/ui";
import { taskProgress } from "@/lib/assignments";
import { COURSE, lessonOffset, minutesLabel } from "@/lib/course";
import { useNow } from "@/lib/hooks";
import { quoteOfDay } from "@/lib/quotes";
import { useStore } from "@/lib/store";

const DAY_NAME = { Wed: "Wednesday", Thu: "Thursday", Fri: "Friday morning" } as const;

export default function CoursePage() {
  const s = useStore();
  const now = useNow(60_000);
  const days = (["Wed", "Thu", "Fri"] as const).map((d) => ({ d, modules: COURSE.filter((m) => m.day === d) }));

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4">
      <PageHeader kicker="Crash course · Wed → Fri morning" title="Everything, in one path">
        About eight hours, in order. Each lesson opens the right screen in Uncooked; most tick themselves off when you finish the work, and the rest you tick by hand. Hit Continue and keep going.
      </PageHeader>

      <Panel accent title="Your progress">{now ? <CourseHeader now={now} /> : <div className="h-24" />}</Panel>

      {days.map(({ d, modules }) => {
        const mins = modules.flatMap((m) => m.lessons).reduce((a, l) => a + l.minutes, 0);
        return (
          <section key={d} className="flex flex-col gap-3">
            <h2 className="h2 mt-2 flex items-baseline justify-between gap-3">
              <span>{DAY_NAME[d]}</span>
              <span className="label">{minutesLabel(mins)}</span>
            </h2>
            {modules.map((m) => {
              const done = now ? m.lessons.filter((l) => taskProgress(s, l, now).done).length : 0;
              return (
                <Panel
                  key={m.id}
                  title={<span className={cx(done === m.lessons.length && "text-accent")}>{m.title} · {minutesLabel(m.lessons.reduce((a, l) => a + l.minutes, 0))}</span>}
                  right={<span className="text-xs tabular-nums text-dim">{done}/{m.lessons.length}</span>}
                >
                  <p className="border-b border-line px-3 py-2 text-sm text-dim">{m.why}</p>
                  {now ? <TaskList tasks={m.lessons} now={now} start={lessonOffset(m) + 1} testId={`module-${m.id}`} openFirst={m.id === "m1" ? "c-gameplan" : undefined} /> : null}
                </Panel>
              );
            })}
          </section>
        );
      })}
      <QuoteLine quote={quoteOfDay(now || 0)} />
    </div>
  );
}
