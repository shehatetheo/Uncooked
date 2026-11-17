"use client";
import Link from "next/link";
import type { Lesson } from "@content/course";
import type { PlanDay, PlanTask } from "@content/plan";
import { useState } from "react";
import { taskProgress } from "@/lib/assignments";
import { actions, useStore } from "@/lib/store";
import { AsciiBar, cx } from "@/components/ui";

/** One day's assignment list. Auto tasks fill from progress; manual ones are ticked. */
export function DayTasks({ day, now, compact }: { day: PlanDay; now: number; compact?: boolean }) {
  return <TaskList tasks={day.tasks} now={now} compact={compact} testId={`plan-${day.date}`} />;
}

function ReadNotes({ lines, open }: { lines: string[]; open: boolean }) {
  if (!open) return null;
  return (
    <ul className="fade-in mt-2 flex flex-col gap-1 text-sm" data-testid="read-notes">
      {lines.map((l) => <li key={l}><span className="text-accent">▸ </span>{l}</li>)}
    </ul>
  );
}

/** A list of tasks or course lessons. Lessons with notes can expand inline. */
export function TaskList({ tasks, now, compact, testId, start = 1, openFirst }: { tasks: (PlanTask | Lesson)[]; now: number; compact?: boolean; testId?: string; start?: number; openFirst?: string }) {
  const s = useStore();
  const [open, setOpen] = useState<Record<string, boolean>>(openFirst ? { [openFirst]: true } : {});
  return (
    <ol data-testid={testId}>
      {tasks.map((t, idx) => {
        const i = idx + start - 1;
        const p = taskProgress(s, t, now);
        const read = "read" in t ? t.read : undefined;
        return (
          <li key={t.id} id={t.id} className="scroll-mt-16 grid grid-cols-[36px_1fr_auto] items-start gap-x-3 border-b border-line px-3 py-3 last:border-0" data-testid={`task-${t.id}`} data-done={p.done}>
            {p.auto ? (
              <span className={cx("pt-px font-mono text-base", p.done ? "text-accent" : "text-ghost")} aria-label={p.done ? "done" : "not done"} title="Ticks itself when you finish the work">
                {p.done ? "[■]" : "[ ]"}
              </span>
            ) : (
              <button type="button" role="checkbox" aria-checked={p.done} aria-label={`Mark "${t.title}" done`} onClick={() => actions.togglePlanTask(t.id)} className={cx("pt-px text-left font-mono text-base", p.done ? "text-accent" : "text-dim hover:text-text")}>
                {p.done ? "[■]" : "[ ]"}
              </button>
            )}
            <div className="min-w-0">
              <Link href={t.href} className="group block">
                <span className={cx("block text-sm group-hover:text-accent", p.done && "text-dim line-through decoration-ghost")}>
                  <span className="pr-2 font-pixel text-2xs text-ghost">{String(i + 1).padStart(2, "0")}</span>
                  {t.title}
                </span>
                {!compact && <span className="mt-0.5 block text-xs text-dim">{t.detail}</span>}
              </Link>
              {read && !compact && (
                <>
                  <button type="button" className="label mt-1 hover:text-text" aria-expanded={!!open[t.id]} onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))}>
                    {open[t.id] ? "▾ hide notes" : "▸ read notes"}
                  </button>
                  <ReadNotes lines={read} open={!!open[t.id]} />
                </>
              )}
            </div>
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
