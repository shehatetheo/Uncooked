"use client";
import { cx } from "@/components/ui";

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cx("h-10 shrink-0 border-b-2 px-3 font-pixel text-xs uppercase tracking-wider", value === t.id ? "border-accent bg-raised text-text" : "border-line text-dim hover:text-text")}>
          {t.label}
          {t.count !== undefined && <span className="pl-2 text-ghost">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
