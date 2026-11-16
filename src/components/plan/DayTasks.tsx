"use client";
import Link from "next/link";
import type { PlanDay } from "@content/plan";
import { taskProgress } from "@/lib/assignments";
import { actions, useStore } from "@/lib/store";
import { AsciiBar, cx } from "@/components/ui";

/** One day's assignment list. Auto tasks fill from progress; manual ones are ticked. */
export function DayTasks({ day, now, compact }: { day: PlanDay; now: number; compact?: boolean }) {
  const s = useStore();
  return (
    <ol data-testid={`plan-${day.date}`}>
      {day.tasks.map((t, i) => {
        const p = taskProgress(s, t, now);
        return (
          <li key={t.id} className="grid grid-cols-[36px_1fr_auto] items-start gap-x-3 border-b border-line px-3 py-3 last:border-0" data-testid={`task-${t.id}`} data-done={p.done}>
            {p.auto ? (
              <span className={cx("pt-px font-mono text-base", p.done ? "text-accent" : "text-ghost")} aria-label={p.done ? "done" : "not done"} title="Ticks itself when you finish the work">
                {p.done ? "[■]" : "[ ]"}
              </span>
            ) : (
              <button type="button" role="checkbox" aria-checked={p.done} aria-label={`Mark "${t.title}" done`} onClick={() => actions.togglePlanTask(t.id)} className={cx("pt-px text-left font-mono text-base", p.done ? "text-accent" : "text-dim hover:text-text")}>
                {p.done ? "[■]" : "[ ]"}
              </button>
            )}
            <Link href={t.href} className="group min-w-0">
              <span className={cx("block text-sm group-hover:text-accent", p.done && "text-dim line-through decoration-ghost")}>
                <span className="pr-2 font-pixel text-2xs text-ghost">{String(i + 1).padStart(2, "0")}</span>
                {t.title}
              </span>
              {!compact && <span className="mt-0.5 block text-xs text-dim">{t.detail}</span>}
            </Link>
            <span className="flex flex-col items-end gap-1 text-xs tabular-nums">
              <span className="text-second">{t.minutes}m</span>
              {p.auto && p.need > 1 && <span className={p.done ? "text-accent" : "text-dim"}>{p.have}/{p.need}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function DayBar({ day, now }: { day: PlanDay; now: number }) {
  const s = useStore();
  const done = day.tasks.filter((t) => taskProgress(s, t, now).done).length;
  return (
    <span className="flex items-center gap-2 text-xs tabular-nums text-dim">
      <AsciiBar value={done / day.tasks.length} width={day.tasks.length} />
      {done}/{day.tasks.length}
    </span>
  );
}
