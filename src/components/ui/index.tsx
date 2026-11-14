import type { ReactNode } from "react";
import type { Quote } from "@/lib/quotes";
import type { Status } from "@/lib/srs";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");
export { cx };

export function Panel({ title, right, children, className, inset, accent }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; inset?: boolean; accent?: boolean }) {
  return (
    <section className={cx("panel", inset && "panel-inset", accent && "panel-accent", className)}>
      {(title || right) && (
        <header className="flex min-h-9 items-center justify-between gap-3 border-b border-line px-3">
          <span className="label">{title}</span>
          <span className="flex items-center gap-2">{right}</span>
        </header>
      )}
      {children}
    </section>
  );
}

/** [■■■□□] style progress bar. `value` is 0-1. */
export function AsciiBar({ value, width = 10, className }: { value: number; width?: number; className?: string }) {
  const filled = Math.round(Math.min(1, Math.max(0, value)) * width);
  return (
    <span className={cx("whitespace-nowrap", className)} aria-label={`${Math.round(value * 100)} percent`}>
      <span className="text-ghost">[</span>
      <span className="text-accent">{"■".repeat(filled)}</span>
      <span className="text-ghost">{"□".repeat(width - filled)}]</span>
    </span>
  );
}

export const STATUS_LABEL: Record<Status, string> = { not_started: "new", learning: "learning", shaky: "shaky", got_it: "got it", mastered: "mastered" };
const STATUS_GLYPH: Record<Status, string> = { not_started: "□", learning: "▒", shaky: "▒", got_it: "▓", mastered: "■" };

export function StatusTag({ status }: { status: Status }) {
  const tone = status === "mastered" ? "text-accent" : status === "got_it" ? "text-text" : status === "shaky" ? "text-second" : "text-dim";
  return (
    <span className={cx("whitespace-nowrap text-xs", tone)}>
      {STATUS_GLYPH[status]} {STATUS_LABEL[status]}
    </span>
  );
}

export function QuoteLine({ quote, className }: { quote: Quote; className?: string }) {
  return (
    <p className={cx("text-sm text-dim", className)}>
      <span className="text-ghost"># </span>
      {quote.text}
      {quote.by && <span className="text-ghost"> — {quote.by}</span>}
    </p>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <p className="label mb-2">{kicker}</p>
      <h1 className="h1">{title}</h1>
      {children && <div className="mt-2 max-w-[70ch] text-sm text-dim">{children}</div>}
    </header>
  );
}

export const fmtTime = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
