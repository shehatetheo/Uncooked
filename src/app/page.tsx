"use client";
import Link from "next/link";
import { catalog, dueItems, mastery, TRACKS, type TrackId } from "@/lib/catalog";
import { useNow } from "@/lib/hooks";
import { firstUnfinished, todayPlan } from "@/lib/plan";
import { currentDay, dayMinutes } from "@/lib/assignments";
import { CourseHeader } from "@/components/course/CourseHeader";
import { courseActive, totalMinutes, minutesLabel } from "@/lib/course";
import { DayBar, DayTasks } from "@/components/plan/DayTasks";
import { quoteOfDay } from "@/lib/quotes";
import { DAY, dayKey, streak, SUPER_DAY } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { AsciiBar, Panel, QuoteLine } from "@/components/ui";

const two = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const s = useStore();
  const now = useNow(1000);
  const left = Math.max(0, SUPER_DAY - now);
  const d = Math.floor(left / DAY);
  const h = Math.floor((left % DAY) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const sec = Math.floor((left % 60_000) / 1000);
  const plan = now && s.ready ? todayPlan(s, now) : [];
  const due = now ? dueItems(s, now).length : 0;
  const days = new Set(s.attempts.map((a) => dayKey(a.at)));
  const next = firstUnfinished(s);
  const total = plan.reduce((a, p) => a + p.minutes, 0);
  const course = now ? courseActive(now) : false;
  const assignment = now && !course ? currentDay(now) : null;

  return (
    <div className="flex flex-col gap-6">
      {course && (
        <Panel accent title={`Crash course · Wed → Fri morning · ${minutesLabel(totalMinutes)}`} right={<Link href="/course" className="label hover:text-text">Open course →</Link>}>
          <CourseHeader now={now} />
        </Panel>
      )}

      <section className="grid items-stretch gap-3 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="SAP STAR super day · Fri Nov 20 · Newtown Square">
          <div className="p-4">
            <p className="font-pixel text-2xl tabular-nums leading-none md:text-[44px]" data-testid="countdown">
              {now ? (
                left > 0 ? (
                  <>
                    <span className="text-accent">{d}</span><span className="text-dim text-lg">d </span>
                    {two(h)}<span className="text-dim text-lg">h </span>
                    {two(m)}<span className="text-dim text-lg">m </span>
                    <span className="text-ghost">{two(sec)}</span><span className="text-ghost text-lg">s</span>
                  </>
                ) : (
                  <span className="text-accent">Today. Go get it.</span>
                )
              ) : (
                <span className="text-ghost">--d --h --m</span>
              )}
            </p>
            <p className="mt-4 max-w-[60ch] text-sm text-dim">
              Coding is easy to medium, mostly sorting and strings, and the interviewer may invent the problem. SQL is its own interview. They will walk your resume line by line.
            </p>
            <div className="mt-5 flex flex-wrap gap-1">
              {!course && next && <Link href={next.href} className="btn btn-primary">Continue: {next.title}</Link>}
              <Link href="/technical" className="btn btn-primary">Technical interview · top 10</Link>
              {course && <Link href="/course" className="btn">Crash course</Link>}
              <Link href="/review" className="btn">Daily review{due ? ` (${due})` : ""}</Link>
              <Link href="/interview" className="btn">Voice mock interview</Link>
            </div>
            <QuoteLine quote={quoteOfDay(now || 0)} className="mt-5" />
          </div>
        </Panel>

        <Panel title="Progress by track" right={<span className="label">streak <span className="text-accent">{now ? streak(days, now) : 0}d</span></span>}>
          <table className="w-full text-sm">
            <tbody>
              {(Object.keys(TRACKS) as TrackId[]).map((t) => {
                const items = catalog.filter((c) => c.track === t);
                const started = items.filter((i) => s.progress[i.id] && s.progress[i.id]!.status !== "not_started").length;
                return (
                  <tr key={t} className="border-b border-line last:border-0">
                    <td className="px-3 py-2"><Link href={TRACKS[t].href} className="hover:text-accent">{TRACKS[t].label}</Link></td>
                    <td className="px-1 py-2 text-right"><AsciiBar value={mastery(s, items.map((i) => i.id))} width={12} /></td>
                    <td className="w-20 px-3 py-2 text-right text-xs tabular-nums text-dim">{started}/{items.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-line px-3 py-2 text-xs text-ghost">Bars fill with mastery, not attempts. Count on the right is items started.</p>
        </Panel>
      </section>

      {assignment && (
        <Panel accent title={`Today's assignment · ${assignment.label} · ${dayMinutes(assignment)} min`} right={s.ready ? <DayBar day={assignment} now={now} /> : undefined}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-3 py-3">
            <h2 className="h2">{assignment.title}</h2>
            <Link href="/plan" className="label hover:text-text">All four days →</Link>
          </div>
          <DayTasks day={assignment} now={now} />
        </Panel>
      )}

      <Panel title={assignment ? "Extra, if you finish early" : "What to drill today"} right={plan.length ? <span className="label">about {Math.round(total)} min</span> : undefined}>
        <ol>
          {plan.map((step, i) => (
            <li key={i} className="border-b border-line last:border-0">
              <Link href={step.href} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-inset">
                <span className="font-pixel text-xs text-ghost">{two(i + 1)}</span>
                <span>
                  <span className="block text-sm">{step.title}</span>
                  <span className="block text-xs text-dim">{step.detail}</span>
                </span>
                <span className="text-xs tabular-nums text-second">{Math.round(step.minutes)}m</span>
              </Link>
            </li>
          ))}
          {!plan.length && <li className="px-3 py-3 text-sm text-ghost">building today's plan…</li>}
        </ol>
      </Panel>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { href: "/sheets", t: "Cheat sheets", d: "Big-O table and the Python tricks worth knowing by heart." },
          { href: "/timed", t: "Timed modes", d: "10-minute sprint, 20-minute mock interview, ghost-typing races." },
          { href: "/review?mode=night", t: "Night-before mode", d: "15 minutes through everything marked Shaky." },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="panel block p-4 hover:bg-inset">
            <span className="h2 block">{c.t}</span>
            <span className="mt-1 block text-sm text-dim">{c.d}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
