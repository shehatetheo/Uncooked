"use client";
import { useMemo, useState } from "react";
import { cx, Panel } from "@/components/ui";

type Join = "INNER" | "LEFT" | "RIGHT" | "FULL";
const JOINS: Join[] = ["INNER", "LEFT", "RIGHT", "FULL"];
const CUSTOMERS = [{ id: 1, name: "Ada" }, { id: 2, name: "Ben" }, { id: 3, name: "Cy" }];
const ORDERS = [{ id: 10, customer_id: 1, total: 40 }, { id: 11, customer_id: 1, total: 15 }, { id: 12, customer_id: 3, total: 90 }, { id: 13, customer_id: 9, total: 5 }];

const SAY: Record<Join, string> = {
  INNER: "Only rows with a match on both sides. Ben (no orders) and order 13 (no customer) both vanish.",
  LEFT: "Every row from the left table. Ben stays, with NULLs where the order would be. Order 13 still vanishes.",
  RIGHT: "Every row from the right table. Order 13 stays with a NULL customer. Ben vanishes.",
  FULL: "Everything from both sides. Unmatched rows from either table are kept and padded with NULLs.",
};
const name = (j: Join) => (j === "INNER" ? "INNER" : `${j} OUTER`);

type Row = { name: string | null; order: number | null; total: number | null; side: "both" | "left" | "right" };

function joinRows(j: Join): Row[] {
  const rows: Row[] = [];
  for (const c of CUSTOMERS) {
    const matches = ORDERS.filter((o) => o.customer_id === c.id);
    for (const o of matches) rows.push({ name: c.name, order: o.id, total: o.total, side: "both" });
    if (!matches.length && (j === "LEFT" || j === "FULL")) rows.push({ name: c.name, order: null, total: null, side: "left" });
  }
  if (j === "RIGHT" || j === "FULL") for (const o of ORDERS) if (!CUSTOMERS.some((c) => c.id === o.customer_id)) rows.push({ name: null, order: o.id, total: o.total, side: "right" });
  return rows;
}

/** A Venn diagram drawn on a character grid, so it matches the rest of the app. */
function Venn({ join }: { join: Join }) {
  const lines = useMemo(() => {
    const W = 44, H = 15, r = 6.6;
    const a = { x: 15, y: 7 }, b = { x: 28, y: 7 };
    const out: { ch: string; on: boolean }[][] = [];
    for (let y = 0; y < H; y++) {
      const row: { ch: string; on: boolean }[] = [];
      for (let x = 0; x < W; x++) {
        // characters are about twice as tall as wide, so squash x
        const inA = ((x - a.x) / 2) ** 2 + (y - a.y) ** 2 <= r * r;
        const inB = ((x - b.x) / 2) ** 2 + (y - b.y) ** 2 <= r * r;
        const on = (inA && inB) || (inA && !inB && (join === "LEFT" || join === "FULL")) || (inB && !inA && (join === "RIGHT" || join === "FULL"));
        row.push({ ch: inA || inB ? (on ? "▓" : "░") : " ", on });
      }
      out.push(row);
    }
    return out;
  }, [join]);
  return (
    <pre className="m-0 select-none text-[11px] leading-[1.05] md:text-[13px]" aria-label={`${join} join Venn diagram`} role="img">
      {lines.map((row, y) => (
        <div key={y}>{row.map((c, x) => <span key={x} className={c.on ? "text-accent" : "text-ghost"}>{c.ch}</span>)}</div>
      ))}
      <div className="text-dim">{"      customers (left)      orders (right)"}</div>
    </pre>
  );
}

const cell = "px-2 py-1 shadow-[inset_0_0_0_1px_var(--color-line)]";
const NULL = <span className="text-ghost">NULL</span>;

/** Live inner vs. left/right/full outer join: diagram, query and result rows. */
export function JoinLab() {
  const [join, setJoin] = useState<Join>("INNER");
  const [guess, setGuess] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Join>("LEFT");
  const rows = joinRows(join);
  const answer = joinRows(quiz).length;

  return (
    <div className="grid items-start gap-3 lg:grid-cols-2">
      <Panel title="Inner vs. outer join, live">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap gap-1">
            {JOINS.map((j) => (
              <button key={j} type="button" className="btn btn-sm" aria-pressed={join === j} onClick={() => setJoin(j)}>{name(j)}</button>
            ))}
          </div>
          <div className="overflow-x-auto"><Venn join={join} /></div>
          <pre className="m-0 overflow-x-auto bg-inset p-3 text-xs shadow-[inset_0_0_0_1px_var(--color-line)]">
            <span className="text-second">SELECT</span> c.name, o.id, o.total{"\n"}
            <span className="text-second">FROM</span> customers c{"\n"}
            <span className="text-accent">{name(join)} JOIN</span> orders o <span className="text-second">ON</span> o.customer_id = c.id;
          </pre>
          <p className="text-sm">{SAY[join]}</p>
          <p className="text-xs text-dim">Say it in one line: an inner join keeps only matches; an outer join also keeps the unmatched rows from one side (left or right) or both (full), filling the gaps with NULL.</p>
        </div>
      </Panel>

      <div className="flex flex-col gap-3">
        <Panel title={`Result · ${rows.length} rows`}>
          <div className="flex flex-wrap gap-4 p-4">
            <table className="self-start text-xs">
              <caption className="label pb-1 text-left">customers</caption>
              <tbody>{CUSTOMERS.map((c) => <tr key={c.id}><td className={cell}>{c.id}</td><td className={cell}>{c.name}</td></tr>)}</tbody>
            </table>
            <table className="self-start text-xs">
              <caption className="label pb-1 text-left">orders</caption>
              <tbody>{ORDERS.map((o) => <tr key={o.id}><td className={cell}>{o.id}</td><td className={cell}>cust {o.customer_id}</td><td className={cell}>{o.total}</td></tr>)}</tbody>
            </table>
            <table className="self-start text-xs" data-testid="join-result">
              <caption className="label pb-1 text-left text-accent">{join} join output</caption>
              <thead><tr className="text-dim"><th className={cell}>name</th><th className={cell}>id</th><th className={cell}>total</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={r.side === "both" ? "" : "text-second"}>
                    <td className={cell}>{r.name ?? NULL}</td>
                    <td className={cell}>{r.order ?? NULL}</td>
                    <td className={cell}>{r.total ?? NULL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Mini-drill · predict the row count">
          <div className="p-4">
            <p className="text-sm">Same two tables. How many rows does a <span className="text-accent">{name(quiz)} JOIN</span> return?</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {[3, 4, 5, 6].map((n) => (
                <button key={n} type="button" className={cx("btn btn-sm", guess !== null && answer === n && "text-accent", guess === n && answer !== n && "text-error")} disabled={guess !== null} onClick={() => setGuess(n)}>{n}</button>
              ))}
              {guess !== null && (
                <button type="button" className="btn btn-sm btn-primary" onClick={() => { setGuess(null); setQuiz(JOINS[(JOINS.indexOf(quiz) + 1) % 4]!); }}>Next</button>
              )}
            </div>
            {guess !== null && <p className="mt-3 text-sm text-dim">{answer} rows. {SAY[quiz]}</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
