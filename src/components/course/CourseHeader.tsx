"use client";
import Link from "next/link";
import { courseProgress, minutesLabel, totalMinutes } from "@/lib/course";
import { useStore } from "@/lib/store";
import { AsciiBar } from "@/components/ui";

/** Overall progress and the one button that matters: continue with the next lesson. */
export function CourseHeader({ now }: { now: number }) {
  const s = useStore();
  const p = courseProgress(s, now);
  const finished = !p.next;
  return (
    <div className="flex flex-col gap-3 p-4" data-testid="course-header">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <AsciiBar value={p.done / p.total} width={16} />
        <span className="tabular-nums text-dim">
          <span className="text-text">{p.done}</span>/{p.total} lessons · {minutesLabel(p.minutesDone)} of {minutesLabel(totalMinutes)}
        </span>
      </div>
      {finished ? (
        <p className="text-sm text-accent">Course complete. Rest, eat lunch, bring your ID. You're ready.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={p.next!.href === "/course" ? `/course#${p.next!.id}` : p.next!.href} className="btn btn-primary" data-testid="course-continue">
            Continue: {p.next!.title}
          </Link>
          <span className="text-xs text-dim">
            {p.nextModule?.day} · {p.nextModule?.title} · {p.next!.minutes} min
          </span>
        </div>
      )}
    </div>
  );
}
