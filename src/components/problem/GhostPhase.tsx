"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ART, CLIPS } from "@content/media.gen";
import type { Problem } from "@/lib/content/types";
import { BLIND_REPS, SHADOW_REPS, TOTAL_REPS } from "@/lib/ghost";
import { useIsDesktop } from "@/lib/hooks";
import { quoteFor } from "@/lib/quotes";
import { runPython } from "@/lib/runner/python";
import { wrapSolution } from "@/lib/runner/types";
import { blip } from "@/lib/sound";
import { actions, progressOf, useStore } from "@/lib/store";
import { cx, fmtTime, Panel, QuoteLine } from "@/components/ui";
import { GhostEditor, type RepResult } from "./GhostEditor";
import { Scene } from "./Scene";

const pad = (n: number) => String(n).padStart(2, "0");

function Ladder({ done }: { done: number }) {
  const row = (from: number, n: number) => Array.from({ length: n }, (_, i) => (from + i < done ? "■" : "□")).join("");
  return (
    <span className="font-pixel text-xs" data-testid="ladder" title="Three reps with the shadow, then three from memory">
      <span className="text-dim">SHADOW </span><span className="text-accent">{row(0, SHADOW_REPS)}</span>
      <span className="text-dim"> · BLIND </span><span className="text-accent">{row(SHADOW_REPS, BLIND_REPS)}</span>
    </span>
  );
}

/** Phase 2: type the solution over the ghost three times, then three times without it. */
export function GhostPhase({ problem: p, onFinished, race }: { problem: Problem; onFinished: () => void; race?: boolean }) {
  const store = useStore();
  const desktop = useIsDesktop();
  const prog = progressOf(store, p.id, "problem");
  const { settings } = store;

  const [repKey, setRepKey] = useState(0);
  const [bodyLine, setBodyLine] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [result, setResult] = useState<RepResult | null>(null);
  const [rest, setRest] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [clean, setClean] = useState(false);
  const [timer, setTimer] = useState(true);
  const [term, setTerm] = useState<{ text: string; tone?: "ok" | "bad" | "dim" }[]>([]);
  const repsAtStart = useRef(prog.ghostReps);

  const ladderDone = prog.ghostReps >= TOTAL_REPS;
  // in a speed race every rep is a shadow rep against your best WPM
  const blind = !race && !ladderDone && prog.ghostReps >= SHADOW_REPS;
  const frames = useMemo(() => p.visual ?? [], [p.visual]);
  const visualOn = desktop && !clean && (settings.visuals[p.id] ?? settings.visualsDefault);
  // a pasted URL wins, then the problem's own mediaUrl, then a generated clip in /public/clips
  const media = settings.media[p.id] ?? p.mediaUrl ?? CLIPS[p.id];
  const art = ART[p.id];
  const [view, setView] = useState<"trace" | "art" | "clip">("trace");

  useEffect(() => {
    const i = frames.findIndex((f) => f.line === bodyLine);
    if (i >= 0) setFrameIdx(i);
  }, [bodyLine, frames]);

  const onDone = useCallback(
    (r: RepResult) => {
      blip.pass();
      setResult(r);
      actions.ghostRep(p.id, { wpm: r.wpm, accuracy: r.accuracy, errors: r.errors, ms: r.ms, blind, peeks: r.peeks }, race ? 0 : TOTAL_REPS);
      setRest(settings.restSeconds);
      // print real test output for the code just typed, like the reference terminal
      setTerm([{ text: "$ python solution.py", tone: "dim" }, { text: "loading python…", tone: "dim" }]);
      runPython(p, wrapSolution(p.solution), p.tests.visible, p.tests.visible.length)
        .then((rep) =>
          setTerm([
            { text: "$ python solution.py", tone: "dim" },
            ...rep.results.map((t) => ({ text: `${t.pass ? "PASS" : "FAIL"} test ${t.index + 1}  ${JSON.stringify(t.output)}  ${t.ms.toFixed(1)} ms`, tone: (t.pass ? "ok" : "bad") as "ok" | "bad" })),
            { text: `${rep.passed}/${rep.total} passed`, tone: rep.status === "pass" ? "ok" : "bad" },
          ]),
        )
        .catch(() => setTerm([{ text: "$ python solution.py", tone: "dim" }, { text: "python runtime unavailable offline until it has loaded once", tone: "dim" }]));
    },
    [p, blind, race, settings.restSeconds],
  );

  const next = useCallback(() => {
    setResult(null);
    setRest(0);
    setBodyLine(0);
    setRepKey((k) => k + 1);
  }, []);

  // optional rest countdown between reps
  useEffect(() => {
    if (!result || rest <= 0) return;
    const id = setTimeout(() => {
      setRest((s) => s - 1);
      if (rest <= 4) blip.tick();
    }, 1000);
    return () => clearTimeout(id);
  }, [result, rest]);

  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (prog.ghostReps >= TOTAL_REPS && !race) onFinished();
        else next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, next, onFinished, prog.ghostReps, race]);

  const cap = p.captions[Math.min(bodyLine, p.captions.length - 1)]!;
  const frame = frames[frameIdx];
  const best = prog.bestWpm ?? 0;

  const repCard = result && (
    <Panel accent title={race ? "Race finished" : `Rep ${prog.ghostReps} of ${TOTAL_REPS} done`} className="fade-in">
      <div className="p-4" data-testid="rep-card">
        <p className="font-pixel text-lg tabular-nums">
          {result.wpm} <span className="text-dim">WPM</span> · <span className={result.accuracy >= 95 ? "text-accent" : ""}>{result.accuracy}%</span> · <span className={result.errors ? "text-error" : ""}>{result.errors}</span> <span className="text-dim">ERR</span> · <span className="text-second">{fmtTime(result.ms)}</span>
        </p>
        {race && <p className="mt-1 text-sm text-dim">{result.wpm >= best ? "New best for this problem." : `Your best is ${best} WPM.`}</p>}
        {result.peeks > 0 && <p className="mt-1 text-sm text-second">{result.peeks} peek{result.peeks === 1 ? "" : "s"} this rep.</p>}
        {!race && prog.ghostReps === SHADOW_REPS && <p className="mt-2 text-sm">Shadow reps done. The next three hide the code: type it from memory. Captions stay, and Peek line is there if you blank.</p>}
        {!race && prog.ghostReps >= TOTAL_REPS && <p className="mt-2 text-sm text-accent">Ladder complete: three with the shadow, three without. Time to solve it cold.</p>}
        <QuoteLine quote={quoteFor(prog.ghostReps + p.id.length + repsAtStart.current)} className="mt-4" />
        <div className="mt-4 flex flex-wrap items-center gap-1">
          {!race && prog.ghostReps >= TOTAL_REPS ? (
            <button type="button" className="btn btn-primary" onClick={onFinished} autoFocus>Solve it cold</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next} autoFocus>{rest > 0 ? `Next rep (rest ${rest}s)` : "Next rep"}</button>
          )}
          {rest > 0 && <button type="button" className="btn" onClick={() => setRest(0)}>Skip rest</button>}
          {rest > 0 && <span className="text-xs text-dim">Rest is optional. Breathe, look away, shake out your hands.</span>}
        </div>
      </div>
    </Panel>
  );

  return (
    <div className={cx("grid items-start gap-3", visualOn ? "grid-cols-2" : "grid-cols-1")}>
      <div className="flex min-w-0 flex-col gap-3">
        <Panel inset>
          <GhostEditor
            target={p.solution}
            blind={blind}
            repKey={repKey}
            paused={!!result}
            onLine={setBodyLine}
            onDone={onDone}
            autoplay={autoplay}
            onAutoplayEnd={() => setAutoplay(false)}
            showTimer={timer}
            header={
              race ? <span className="font-pixel text-xs text-dim">BEST <span className="text-accent">{best}</span> WPM</span> : ladderDone ? <span className="font-pixel text-xs text-accent">LADDER COMPLETE · FREE PRACTICE</span> : (
                <>
                  <Ladder done={prog.ghostReps} />
                  <span className={cx("chip", blind && "text-second")}>{blind ? "from memory" : "shadow on"}</span>
                </>
              )
            }
            pills={
              <>
                <button type="button" className="btn btn-sm" aria-pressed={autoplay} onClick={() => { setResult(null); setAutoplay((a) => !a); if (!autoplay) setRepKey((k) => k + 1); }}>Autoplay</button>
                <button type="button" className="btn btn-sm" aria-pressed={settings.sound} onClick={() => actions.setSettings({ sound: !settings.sound })}>Sound</button>
                <button type="button" className="btn btn-sm" aria-pressed={timer} onClick={() => setTimer((t) => !t)}>Timer</button>
                <button type="button" className="btn btn-sm" aria-pressed={clean} onClick={() => setClean((c) => !c)}>Clean</button>
                {ladderDone && !race && <button type="button" className="btn btn-sm" onClick={() => { actions.resetGhostLadder(p.id); next(); }}>New ladder</button>}
              </>
            }
          />
          <div className="border-t border-line px-3 py-2 text-sm" data-testid="caption">
            <span className="font-pixel text-2xs uppercase tracking-wider text-accent">LINE {pad(bodyLine + 1)} · {cap.label}</span>
            <span className="text-dim"> — </span>
            {cap.text}
          </div>
        </Panel>

        {repCard}

        {!clean && (
          <Panel title="Terminal" inset>
            <div className="min-h-[72px] p-3 text-xs leading-relaxed" data-testid="ghost-terminal">
              {term.length === 0 && <p className="text-ghost">$ python solution.py <span className="text-ghost"># runs when you finish a rep</span></p>}
              {term.map((l, i) => <p key={i} className={l.tone === "ok" ? "text-accent" : l.tone === "bad" ? "text-error" : "text-dim"}>{l.text}</p>)}
            </div>
          </Panel>
        )}
      </div>

      {visualOn && (
        <Panel
          title={
            <span className="flex flex-wrap items-center gap-1">
              {p.captions.map((c, i) => (
                <button key={i} type="button" className={cx("px-1", i === bodyLine ? "text-accent" : "text-dim hover:text-text")} onClick={() => { const f = frames.findIndex((x) => x.line === i); if (f >= 0) setFrameIdx(f); }}>
                  {pad(i + 1)} {c.label}{i < p.captions.length - 1 && <span className="pl-1 text-ghost">→</span>}
                </button>
              ))}
            </span>
          }
          right={
            (art || media) && (
              <>
                <button type="button" className="btn btn-sm" aria-pressed={view === "trace"} onClick={() => setView("trace")}>Trace</button>
                {art && <button type="button" className="btn btn-sm" aria-pressed={view === "art"} onClick={() => setView("art")}>Art</button>}
                {media && <button type="button" className="btn btn-sm" aria-pressed={view === "clip"} onClick={() => setView("clip")}>Clip</button>}
              </>
            )
          }
          className="min-w-0"
        >
          <div className="min-h-[320px] p-4" data-testid="scene">
            {media && view === "clip" ? (
              <video src={media} controls loop muted autoPlay playsInline className="w-full" />
            ) : art && view === "art" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art} alt={`Pixel-art picture of the idea behind ${p.title}`} className="w-full" style={{ imageRendering: "pixelated" }} loading="lazy" />
            ) : frame ? (
              <Scene frame={frame} />
            ) : (
              <p className="text-sm text-ghost">No visual timeline for this problem yet. Captions still follow each line.</p>
            )}
          </div>
          {frames.length > 0 && view === "trace" && (
            <div className="flex items-center gap-2 border-t border-line px-3 py-2 text-sm">
              <button type="button" className="btn btn-sm" disabled={frameIdx === 0} onClick={() => setFrameIdx((i) => Math.max(0, i - 1))} aria-label="Previous step">◄</button>
              <button type="button" className="btn btn-sm" disabled={frameIdx >= frames.length - 1} onClick={() => setFrameIdx((i) => Math.min(frames.length - 1, i + 1))} aria-label="Next step">►</button>
              <span className="label tabular-nums">step {frameIdx + 1}/{frames.length}</span>
              <span className="text-dim">{frame?.note}</span>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
