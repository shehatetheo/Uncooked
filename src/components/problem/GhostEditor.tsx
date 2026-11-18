"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createGhost, currentLine, ghostStats, isDone, typeChar, type GhostState, type GhostStats } from "@/lib/ghost";
import { blip } from "@/lib/sound";
import { cx, fmtTime } from "@/components/ui";
import { KeyRow } from "./KeyRow";

export interface RepResult extends GhostStats {
  peeks: number;
}

/** iOS smart punctuation swaps in curly quotes and dashes; map them back. */
const normalise = (s: string) => s.replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"').replace(/ /g, " ").replace(/—/g, "--").replace(/…/g, "...");

const AUTOPLAY_MS = 55;
const STUCK_AFTER = 3; // wrong keys at one spot before the blind rep shows that character

interface Props {
  target: string;
  /** Hide the ghost: type from memory. */
  blind: boolean;
  /** Changing this starts a fresh rep. */
  repKey: number;
  paused?: boolean;
  onLine?: (bodyLine: number) => void;
  onDone: (r: RepResult) => void;
  header?: React.ReactNode;
  pills?: React.ReactNode;
  showTimer?: boolean;
  autoplay: boolean;
  onAutoplayEnd: () => void;
  /** Leading lines given for free (the def line). 0 for SQL. */
  lockedLines?: number;
}

export function GhostEditor({ target, blind, repKey, paused, onLine, onDone, header, pills, showTimer = true, autoplay, onAutoplayEnd, lockedLines = 1 }: Props) {
  const [g, setG] = useState<GhostState>(() => createGhost(target, lockedLines));
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  const [peekLine, setPeekLine] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const peeks = useRef(0);
  const stuck = useRef({ pos: -1, n: 0 });
  const input = useRef<HTMLTextAreaElement>(null);
  // the finished state that was already reported, so a rep can never be counted twice
  const reported = useRef<GhostState | null>(null);
  const wasAuto = useRef(false);

  const reset = useCallback(() => {
    setG(createGhost(target, lockedLines));
    setRevealed(new Set());
    setPeekLine(null);
    peeks.current = 0;
    stuck.current = { pos: -1, n: 0 };
    wasAuto.current = false;
  }, [target, lockedLines]);
  useEffect(reset, [reset, repKey]);

  const line = currentLine(g);
  useEffect(() => {
    onLine?.(Math.max(0, line - 1));
  }, [line, onLine]);

  // live clock while a rep is running
  useEffect(() => {
    if (g.startedAt === null || g.finishedAt !== null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [g.startedAt, g.finishedAt]);

  const feed = useCallback(
    (text: string) => {
      if (paused) return;
      setG((prev) => {
        let s = prev;
        for (const ch of normalise(text)) {
          const before = s;
          s = typeChar(s, ch, Date.now());
          if (s.pos > before.pos) {
            if (ch === "\n") blip.line();
            else blip.key();
            stuck.current = { pos: -1, n: 0 };
          } else if (s.errors > before.errors) {
            blip.error();
            stuck.current = stuck.current.pos === s.pos ? { pos: s.pos, n: stuck.current.n + 1 } : { pos: s.pos, n: 1 };
            if (blind && stuck.current.n >= STUCK_AFTER) {
              const at = s.pos;
              peeks.current++;
              setRevealed((r) => new Set(r).add(at));
            }
          }
        }
        return s;
      });
    },
    [blind, paused],
  );

  // autoplay types the solution by itself; it never counts as a rep
  useEffect(() => {
    if (!autoplay) return;
    wasAuto.current = true;
    const id = setInterval(() => {
      setG((s) => {
        if (isDone(s)) return s;
        const ch = s.target[s.pos]!;
        if (ch === "\n") blip.line();
        return typeChar(s, ch, Date.now());
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplay]);

  useEffect(() => {
    if (!isDone(g) || reported.current === g) return;
    reported.current = g;
    if (wasAuto.current) onAutoplayEnd();
    else onDone({ ...ghostStats(g, Date.now()), peeks: peeks.current });
  }, [g, onDone, onAutoplayEnd]);

  const peek = () => {
    if (!blind || isDone(g)) return;
    peeks.current++;
    setPeekLine(line);
    setTimeout(() => setPeekLine(null), 1800);
    input.current?.focus();
  };

  const stats = ghostStats(g, now || Date.now());
  const lines = useMemo(() => target.split("\n"), [target]);
  const offsets = useMemo(() => {
    const out: number[] = [];
    let o = 0;
    for (const l of lines) {
      out.push(o);
      o += l.length + 1;
    }
    return out;
  }, [lines]);

  return (
    <div className="flex flex-col" data-typing>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-dim">{header}</div>
        <div className="flex items-center gap-3 font-pixel text-xs tabular-nums" aria-live="off" data-testid="ghost-stats">
          <span><span className="text-text">{stats.wpm}</span> <span className="text-dim">WPM</span></span>
          <span><span className={stats.accuracy >= 95 ? "text-accent" : "text-text"}>{stats.accuracy}%</span> <span className="text-dim">ACC</span></span>
          <span><span className={stats.errors ? "text-error" : "text-text"}>{stats.errors}</span> <span className="text-dim">ERR</span></span>
          {showTimer && <span className="text-second">{fmtTime(stats.ms)}</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1">
        {pills}
        <button type="button" className="btn btn-sm" onClick={() => { reset(); input.current?.focus(); }}>Reset</button>
        {blind && <button type="button" className="btn btn-sm" onClick={peek}>Peek line</button>}
      </div>

      <div
        className={cx("relative min-h-[220px] cursor-text overflow-x-auto bg-inset py-3 text-[14px] leading-[1.7] md:text-[15px]", focused ? "" : "opacity-90")}
        onClick={() => input.current?.focus()}
        data-testid="ghost-editor"
      >
        <textarea
          ref={input}
          className="absolute left-0 top-0 h-full w-full resize-none opacity-0"
          style={{ fontSize: 16, caretColor: "transparent" }}
          aria-label="Type the solution"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          value=""
          onChange={(e) => feed(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              reset();
            } else if (e.key === "Enter") {
              e.preventDefault();
              feed("\n");
            } else if (e.key === "Escape") {
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
        />
        <pre className="pointer-events-none m-0 font-mono" aria-hidden>
          {lines.map((text, li) => {
            const off = offsets[li]!;
            const showGhost = !blind || peekLine === li;
            return (
              <div key={li} className={cx("flex", li === line && !isDone(g) && "bg-raised")}>
                <span className="w-10 shrink-0 select-none pr-3 text-right text-ghost">{li + 1}</span>
                <span className="whitespace-pre pr-4">
                  {[...text].map((ch, ci) => {
                    const i = off + ci;
                    if (i < g.pos) return <span key={ci} className={i < g.start ? "text-dim" : "text-accent"}>{ch}</span>;
                    if (i === g.pos)
                      return (
                        <span key={`${ci}-${g.wrongSeq}`} className={cx("ghost-cursor", g.wrongAt === i && "ghost-wrong")}>
                          {showGhost || revealed.has(i) ? ch : " "}
                        </span>
                      );
                    return <span key={ci} className="text-ghost">{showGhost || revealed.has(i) ? ch : " "}</span>;
                  })}
                  {/* end of line: the cursor sits on the Enter key */}
                  {g.pos === off + text.length && li < lines.length - 1 && (
                    <span key={`nl-${g.wrongSeq}`} className={cx("ghost-cursor", g.wrongAt === g.pos && "ghost-wrong")}>{showGhost ? "↵" : " "}</span>
                  )}
                </span>
              </div>
            );
          })}
        </pre>
        {!focused && !isDone(g) && !autoplay && (
          <p className="label pointer-events-none absolute inset-x-0 bottom-2 text-center text-second">tap or click here, then type</p>
        )}
      </div>
      <KeyRow active={focused} onKey={feed} />
    </div>
  );
}
