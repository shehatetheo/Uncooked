"use client";
import { useEffect, useState } from "react";
import { ghostLines } from "@/lib/code";
import type { Problem } from "@/lib/types";

/**
 * The reference solution, shown faintly next to the editor in the Ghost phase.
 * One line is lit at a time with its caption. It follows the editor's cursor,
 * and you can step through it by hand. It is a guide, not a typing test: the
 * phase is done when your own code passes the tests.
 */
export function GhostGuide({ p, cursorLine }: { p: Problem; cursorLine: number }) {
  const lines = ghostLines(p);
  // normal problems: the editor has `class Solution:` and the def line above the body
  const offset = p.kind === "python" && !p.design ? 2 : 0;
  const [at, setAt] = useState(0);
  // phones show one line at a time unless you ask for the whole thing
  const [all, setAll] = useState(false);
  useEffect(() => {
    setAt(Math.max(0, Math.min(lines.length - 1, cursorLine - 1 - offset)));
  }, [cursorLine, offset, lines.length]);
  const move = (d: number) => {
    let i = at;
    do i = Math.max(0, Math.min(lines.length - 1, i + d));
    while (!lines[i]!.code.trim() && i > 0 && i < lines.length - 1);
    setAt(i);
  };

  return (
    <div className="shrink-0 border-b border-line bg-inset" data-testid="ghost">
      <div className="flex items-center gap-2 px-3 pt-2">
        <span className="label text-accent">Ghost guide</span>
        <span className="min-w-0 truncate text-xs text-faint">line {at + 1} of {lines.length}<span className="hidden sm:inline"> · type it your way, tests decide</span></span>
        <span className="ml-auto flex shrink-0 gap-1">
          <button type="button" className="btn btn-quiet h-7 px-2 text-xs lg:hidden" onClick={() => setAll(!all)} aria-pressed={all}>{all ? "One line" : "All lines"}</button>
          <button type="button" className="btn btn-quiet h-7 px-2 text-xs" onClick={() => move(-1)} disabled={at === 0} aria-label="Previous line">Prev</button>
          <button type="button" className="btn btn-quiet h-7 px-2 text-xs" onClick={() => move(1)} disabled={at === lines.length - 1} aria-label="Next line">Next</button>
        </span>
      </div>
      <pre className="overflow-x-auto px-3 py-1 font-mono text-[12.5px] leading-[1.6] text-accent lg:hidden" hidden={all} aria-hidden="true">{lines[at]?.code.trimStart() || " "}</pre>
      <pre className={`max-h-[30vh] overflow-auto px-3 py-2 font-mono text-[12.5px] leading-[1.6] lg:block lg:max-h-[220px] ${all ? "block" : "hidden"}`} aria-label="Reference solution">
        {p.kind === "python" && !p.design && (
          <>
            <div className="text-faint/70">class Solution:</div>
            <div className="text-faint/70">{"    "}{p.signature}</div>
          </>
        )}
        {lines.map((l, i) => (
          <div key={i} className={i === at ? "bg-accent-soft text-accent" : "cursor-pointer text-faint"} onClick={() => setAt(i)} data-current={i === at || undefined}>
            {l.code || " "}
          </div>
        ))}
      </pre>
      <p className="border-t border-line px-3 py-2 text-sm" data-testid="ghost-caption">{lines[at]?.caption || "…"}</p>
    </div>
  );
}
