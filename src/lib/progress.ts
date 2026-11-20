"use client";
import { useSyncExternalStore } from "react";
import type { Scorecard } from "@/lib/ai/protocol";
import type { Phase } from "@/lib/types";

/**
 * Progress lives in localStorage for now. The shape is one flat record per
 * question, so it maps straight onto a database table later.
 */
export interface QuestionProgress {
  /** Which phases have been completed at least once. */
  phases: Partial<Record<Phase, boolean>>;
  /** How many times Submit was pressed. */
  attempts: number;
  /** Did the latest blind Submit pass every test? */
  passed: boolean;
  /** Seconds from starting the interview to passing the blind solve (latest pass). */
  seconds?: number;
  scorecard?: Scorecard;
  updatedAt: number;
}
export type ProgressMap = Record<string, QuestionProgress>;

const KEY = "uncooked:v2:progress";
const EMPTY: ProgressMap = {};
let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

function read(): ProgressMap {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as ProgressMap;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: ProgressMap) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: keep it in memory */
  }
  listeners.forEach((l) => l());
}

export function updateProgress(id: string, change: (p: QuestionProgress) => Partial<QuestionProgress>) {
  const all = read();
  const cur = all[id] ?? { phases: {}, attempts: 0, passed: false, updatedAt: 0 };
  write({ ...all, [id]: { ...cur, ...change(cur), updatedAt: Date.now() } });
}
export const completePhase = (id: string, phase: Phase) => updateProgress(id, (p) => ({ phases: { ...p.phases, [phase]: true } }));
export const resetProgress = () => write({});

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

/** All progress. Empty during server render and the first client paint. */
export const useProgress = (): ProgressMap => useSyncExternalStore(subscribe, read, () => EMPTY);

export type Status = "Not started" | "Ghost done" | "Blind solved";
export const statusOf = (p?: QuestionProgress): Status => (p?.phases.blind ? "Blind solved" : p?.phases.ghost ? "Ghost done" : "Not started");
