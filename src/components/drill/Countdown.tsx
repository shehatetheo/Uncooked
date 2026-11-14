"use client";
import { useEffect, useRef, useState } from "react";
import { blip } from "@/lib/sound";
import { cx, fmtTime } from "@/components/ui";

/** Start/pause countdown. Amber in the last 10 seconds, red when over. */
export function useCountdown(seconds: number, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);
  const endAt = useRef(0);
  const ended = useRef(false);
  const cb = useRef(onEnd);
  cb.current = onEnd;

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left;
    const id = setInterval(() => {
      const l = endAt.current - Date.now();
      setLeft(l);
      if (l <= 0 && !ended.current) {
        ended.current = true;
        blip.fail();
        cb.current?.();
      }
    }, 200);
    return () => clearInterval(id);
    // `left` is only the starting point for this run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return {
    left,
    running,
    elapsed: seconds * 1000 - left,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false);
      ended.current = false;
      setLeft(seconds * 1000);
    },
  };
}

export function Clock({ ms, big }: { ms: number; big?: boolean }) {
  const over = ms <= 0;
  return (
    <span className={cx("font-pixel tabular-nums", big ? "text-2xl" : "text-base", over ? "text-error" : ms < 10_000 ? "text-second" : "text-text")} data-testid="clock">
      {over ? "+" : ""}{fmtTime(Math.abs(ms))}
    </span>
  );
}
