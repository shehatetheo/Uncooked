"use client";
import { useEffect, useState } from "react";

const KEYS = ["(", ")", "[", "]", "{", "}", ":", "=", '"', "'", "#", "_"];

/**
 * Symbol row pinned above the on-screen keyboard. Touch devices only.
 * Buttons use pointerdown + preventDefault so the editor keeps focus.
 */
export function KeyRow({ active, onKey, onIndent, onDedent, onMove }: { active: boolean; onKey: (ch: string) => void; onIndent?: () => void; onDedent?: () => void; onMove?: (dir: -1 | 1) => void }) {
  const [bottom, setBottom] = useState(0);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const vv = window.visualViewport;
    if (!vv) return;
    const place = () => setBottom(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    place();
    vv.addEventListener("resize", place);
    vv.addEventListener("scroll", place);
    return () => {
      vv.removeEventListener("resize", place);
      vv.removeEventListener("scroll", place);
    };
  }, []);

  if (!active || !touch) return null;
  const press = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    fn();
  };
  const cls = "flex h-10 min-w-9 shrink-0 items-center justify-center border-r border-line px-2 text-base text-text active:bg-line";
  return (
    <div className="fixed inset-x-0 z-40 flex overflow-x-auto border-t border-line-strong bg-raised" style={{ bottom }} data-testid="key-row">
      {onDedent && <button type="button" className={cls} onPointerDown={press(onDedent)} aria-label="Dedent">⇤</button>}
      {onIndent && <button type="button" className={cls} onPointerDown={press(onIndent)} aria-label="Indent">⇥</button>}
      {KEYS.map((k) => (
        <button type="button" key={k} className={cls} onPointerDown={press(() => onKey(k))}>
          {k}
        </button>
      ))}
      {onMove && <button type="button" className={cls} onPointerDown={press(() => onMove(-1))} aria-label="Cursor left">←</button>}
      {onMove && <button type="button" className={cls} onPointerDown={press(() => onMove(1))} aria-label="Cursor right">→</button>}
    </div>
  );
}
