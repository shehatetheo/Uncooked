"use client";
import Link from "next/link";
import { AsciiBar, PageHeader, Panel } from "@/components/ui";
import { catalog, catalogById, groupStats, mastery, statusOf, TRACKS, type TrackId } from "@/lib/catalog";
import { useNow } from "@/lib/hooks";
import { DAY, dayKey, streak } from "@/lib/srs";
import { useStore } from "@/lib/store";

const BLOCKS = " ▁▂▃▄▅▆▇█";

export default function StatsPage() {
  const s = useStore();
  const now = useNow(60_000);
  const days = new Set(s.attempts.map((a) => dayKey(a.at)));
  const code = catalog.filter((c) => c.track === "code");
  const patterns = groupStats(s, code).sort((a, b) => a.score - b.score);
  const weakest = patterns.filter((p) => p.started > 0 && p.score < 0.75).slice(0, 3);
  const mastered = catalog.filter((c) => statusOf(s, c.id) === "mastered");
  const mistakes = s.attempts.filter((a) => !a.pass).slice(-40).reverse();
  // everything you've typed and saved: explanations, resume answers, the intro script
  const saved = Object.entries(s.answers)
    .filter(([, list]) => list[0])
    .map(([id, list]) => ({ id, ...list[0]!, versions: list.length, item: catalogById.get(id) }))
    .sort((a, b) => b.at - a.at);

  // last 14 days of activity as a block-character histogram
  const perDay = Array.from({ length: 14 }, (_, i) => {
    const key = dayKey((now || Date.now()) - (13 - i) * DAY);
    return { key, n: s.attempts.filter((a) => dayKey(a.at) === key).length };
  });
  const max = Math.max(1, ...perDay.map((d) => d.n));
  const ghost = s.attempts.filter((a) => a.phase === "ghost" && a.wpm);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker="Dashboard" title="Where you stand" />

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ["Streak", `${now ? streak(days, now) : 0}d`],
          ["Mastered", `${mastered.length}`],
          ["Attempts logged", `${s.attempts.length}`],
          ["Avg ghost WPM", `${avg(ghost.map((g) => g.wpm!))}`],
        ].map(([k, v]) => (
          <div key={k} className="panel p-3">
            <p className="label">{k}</p>
            <p className="mt-1 font-pixel text-xl text-accent">{v}</p>
          </div>
        ))}
      </section>

      <section className="grid items-start gap-3 lg:grid-cols-2">
        <Panel title="Progress by track">
          <table className="w-full text-sm">
            <tbody>
              {(Object.keys(TRACKS) as TrackId[]).map((t) => {
                const items = catalog.filter((c) => c.track === t);
                return (
                  <tr key={t} className="border-b border-line last:border-0">
                    <td className="px-3 py-2"><Link href={TRACKS[t].href} className="hover:text-accent">{TRACKS[t].label}</Link></td>
                    <td className="px-1 py-2 text-right"><AsciiBar value={mastery(s, items.map((i) => i.id))} width={14} /></td>
                    <td className="w-24 px-3 py-2 text-right text-xs tabular-nums text-dim">{items.filter((i) => statusOf(s, i.id) === "mastered").length}/{items.length} ■</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Last 14 days">
          <div className="p-3">
            <pre className="m-0 text-xl leading-none tracking-[0.3em] text-accent" aria-label="Activity per day">{perDay.map((d) => BLOCKS[Math.ceil((d.n / max) * 8)]).join("")}</pre>
            <pre className="m-0 mt-1 text-xl leading-none tracking-[0.3em] text-ghost">{perDay.map((d) => (d.n ? "▔" : "·")).join("")}</pre>
            <p className="mt-2 text-xs text-dim">{perDay.reduce((a, d) => a + d.n, 0)} attempts in two weeks · today {perDay[13]!.n}</p>
          </div>
        </Panel>
      </section>

      <section className="grid items-start gap-3 lg:grid-cols-2">
        <Panel title="Progress by pattern" right={<span className="label">weakest first</span>}>
          <table className="w-full text-sm">
            <tbody>
              {patterns.map((p) => (
                <tr key={p.group} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{p.group}</td>
                  <td className="px-1 py-2 text-right"><AsciiBar value={p.score} width={10} /></td>
                  <td className="w-20 px-3 py-2 text-right text-xs tabular-nums text-dim">{p.started}/{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-3">
          <Panel title="Weakest patterns">
            <div className="p-3 text-sm">
              {weakest.length === 0 && <p className="text-ghost">Nothing started is weak right now. Start a new pattern.</p>}
              {weakest.map((w) => {
                const item = code.find((c) => c.group === w.group && statusOf(s, c.id) !== "mastered");
                return (
                  <p key={w.group} className="flex items-center justify-between gap-3 py-1">
                    <span><span className="text-second">▒ </span>{w.group}</span>
                    {item && <Link href={item.href} className="btn btn-sm">Drill {item.title}</Link>}
                  </p>
                );
              })}
            </div>
          </Panel>
          <Panel title={`Mastered wall · ${mastered.length}`}>
            <div className="flex flex-wrap gap-1 p-3">
              {mastered.length === 0 && <p className="text-sm text-ghost">Empty for now. A coding problem lands here after hint-free cold solves on two different days.</p>}
              {mastered.map((m) => <Link key={m.id} href={m.href} className="chip text-accent" title={m.title}>■ {m.title.slice(0, 28)}</Link>)}
            </div>
          </Panel>
        </div>
      </section>

      <Panel title={`Saved explanations and answers · ${saved.length}`} right={<span className="label">stored on this device</span>}>
        {saved.length === 0 && <p className="p-3 text-sm text-ghost">Nothing saved yet. Explanations, resume answers and your intro script save as you type and show up here.</p>}
        <ul data-testid="saved-answers">
          {saved.map((a) => (
            <li key={a.id} className="border-b border-line px-3 py-2 last:border-0">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                {a.item ? <Link href={a.item.href} className="hover:text-accent">{a.item.title}</Link> : <span>{a.id === "drill-intro-60" ? "60-second intro script" : a.id}</span>}
                <span className="text-xs text-ghost">{new Date(a.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}{a.versions > 1 ? ` · ${a.versions} versions` : ""}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-dim">{a.text.length > 280 ? `${a.text.slice(0, 280)}…` : a.text}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Mistakes log" right={<span className="label">latest {mistakes.length}</span>}>
        {mistakes.length === 0 && <p className="p-3 text-sm text-ghost">No misses logged yet. Failed submits and wrong quiz answers show up here.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {mistakes.map((m) => {
                const item = catalogById.get(m.itemId);
                return (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-ghost">{new Date(m.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
                    <td className="px-3 py-2 uppercase text-dim">{m.phase}</td>
                    <td className="max-w-[320px] truncate px-3 py-2">{item ? <Link href={item.href} className="hover:text-accent">{item.title}</Link> : m.itemId}</td>
                    <td className="max-w-[360px] truncate px-3 py-2 text-error">{m.note ?? "missed"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
