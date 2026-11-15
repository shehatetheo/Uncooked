"use client";
import { useEffect, useRef, useState } from "react";
import { actions, getState } from "@/lib/store";

/** True at tablet/desktop widths. False during SSR and on phones. */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

/** Current time, refreshed on an interval. 0 until mounted (avoids hydration mismatch). */
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

/** Read a query parameter on the client without forcing a Suspense boundary. */
export function useQueryParam(name: string): string | null {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => setValue(new URLSearchParams(window.location.search).get(name)), [name]);
  return value;
}

/**
 * Save an answer while it is being typed. The first save of an editing
 * session adds a history entry; later saves in the same session amend it.
 * Returns the time of the last save so the UI can confirm it.
 */
export function useAutosaveAnswer(id: string, text: string, enabled: boolean): number | null {
  const started = useRef<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !text.trim()) return;
    // unchanged from what is already stored (for example, just loaded): nothing to save
    if (getState().answers[id]?.[0]?.text === text.trim()) return;
    const t = setTimeout(() => {
      actions.saveAnswer(id, text, started.current === id);
      started.current = id;
      setSavedAt(Date.now());
    }, 500);
    return () => clearTimeout(t);
  }, [id, text, enabled]);
  return savedAt;
}
