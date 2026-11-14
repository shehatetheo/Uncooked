"use client";
import type { Frame } from "@/lib/content/types";
import { cx } from "@/components/ui";

const Cell = ({ children, hi, dim, at }: { children: React.ReactNode; hi?: boolean; dim?: boolean; at?: boolean }) => (
  <span
    className={cx(
      "flex h-9 min-w-9 items-center justify-center px-2 text-sm",
      hi ? "bg-accent-dim text-text shadow-[inset_0_0_0_2px_var(--color-accent)]" : at ? "shadow-[inset_0_0_0_2px_var(--color-second)]" : "shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
      dim && "text-ghost",
    )}
  >
    {children}
  </span>
);

function ArrayRow({ a }: { a: NonNullable<Frame["arrays"]>[number] }) {
  const pointersAt = (i: number) => Object.entries(a.pointers ?? {}).filter(([, v]) => v === i).map(([k]) => k);
  const sep = a.link === "next" ? "→" : a.link === "prev" ? "←" : null;
  return (
    <div>
      <p className="label mb-1">{a.name}</p>
      <div className="flex flex-wrap items-end gap-y-2">
        {a.values.length === 0 && <span className="text-sm text-ghost">(empty)</span>}
        {a.values.map((v, i) => {
          const ps = pointersAt(i);
          return (
            <div key={i} className="flex items-end">
              <div className="flex flex-col items-center">
                <span className="h-5 text-xs text-second">{ps.length ? `${ps.join(",")}▼` : ""}</span>
                <Cell hi={a.hi?.includes(i)} dim={a.dim?.includes(i)} at={ps.length > 0}>{String(v)}</Cell>
                <span className="text-2xs text-ghost">{i}</span>
              </div>
              {sep && i < a.values.length - 1 && <span className="mb-6 px-1 text-dim">{sep}</span>}
              {!sep && <span className="w-1" />}
            </div>
          );
        })}
        {a.link && a.values.length > 0 && <span className="mb-6 pl-1 text-sm text-ghost">{a.link === "next" ? "→ None" : ""}</span>}
      </div>
    </div>
  );
}

function Tree({ t }: { t: NonNullable<Frame["tree"]> }) {
  const depth = Math.max(1, Math.ceil(Math.log2(t.nodes.length + 1)));
  const W = 320;
  const rowH = 52;
  const pos = (i: number) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i + 1 - 2 ** d;
    return { x: ((k + 0.5) * W) / 2 ** d, y: d * rowH + 20 };
  };
  return (
    <svg viewBox={`0 0 ${W} ${depth * rowH}`} className="w-full max-w-[360px]" role="img" aria-label="binary tree">
      {t.nodes.map((v, i) => {
        if (v === null || i === 0) return null;
        const parent = Math.floor((i - 1) / 2);
        if (t.nodes[parent] === null) return null;
        const a = pos(parent), b = pos(i);
        return <path key={`e${i}`} d={`M${a.x} ${a.y} V${(a.y + b.y) / 2} H${b.x} V${b.y}`} fill="none" className="stroke-line-strong" strokeWidth={2} />;
      })}
      {t.nodes.map((v, i) => {
        if (v === null) return null;
        const p = pos(i);
        const hi = t.hi?.includes(i);
        return (
          <g key={i}>
            <rect x={p.x - 15} y={p.y - 15} width={30} height={30} className={hi ? "fill-accent-dim stroke-accent" : "fill-inset stroke-line-strong"} strokeWidth={2} />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-text font-mono text-[13px]">{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** One snapshot of a problem's visual timeline, drawn in the app's pixel style. */
export function Scene({ frame }: { frame: Frame }) {
  return (
    <div className="flex flex-col gap-5">
      {frame.arrays?.map((a, i) => <ArrayRow key={i} a={a} />)}
      {frame.tree && <Tree t={frame.tree} />}
      {frame.grid && (
        <div className="inline-flex flex-col gap-1">
          {frame.grid.cells.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((c, col) => {
                const at = frame.grid!.at?.[0] === r && frame.grid!.at?.[1] === col;
                return (
                  <span key={col} className={cx("flex h-8 w-8 items-center justify-center text-sm", c === "1" ? "bg-accent-dim text-text" : "bg-inset text-ghost", at ? "shadow-[inset_0_0_0_2px_var(--color-second)]" : "shadow-[inset_0_0_0_1px_var(--color-line)]")}>
                    {c === "1" ? "▓" : c === "0" ? "·" : c}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-6">
        {frame.map && (
          <div>
            <p className="label mb-1">{frame.map.name}</p>
            <table className="text-sm">
              <tbody>
                {frame.map.entries.length === 0 && <tr><td className="px-2 py-1 text-ghost shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{"{ }"}</td></tr>}
                {frame.map.entries.map(([k, v], i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-second shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{k}</td>
                    <td className="px-2 py-1 shadow-[inset_0_0_0_1px_var(--color-line-strong)]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {frame.stack && (
          <div>
            <p className="label mb-1">{frame.stack.name} <span className="text-ghost">(top first)</span></p>
            <div className="flex min-w-16 flex-col">
              {frame.stack.items.length === 0 && <Cell dim>empty</Cell>}
              {[...frame.stack.items].reverse().map((s, i) => <Cell key={i} hi={i === 0}>{s}</Cell>)}
            </div>
          </div>
        )}
        {frame.vars && (
          <div>
            <p className="label mb-1">vars</p>
            <dl className="text-sm">
              {Object.entries(frame.vars).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-dim">{k}</dt>
                  <dd className={k === "return" ? "text-accent" : ""}>= {v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
