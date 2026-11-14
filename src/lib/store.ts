"use client";
import { get, set } from "idb-keyval";
import { useSyncExternalStore } from "react";
import { dayKey, deriveStatus, NEW_SRS, schedule, type Rating, type SrsFields, type Status } from "./srs";

/**
 * Local-first progress store. Everything lives in IndexedDB on this device.
 * Every row carries a `userId` so a sync backend can be added later without
 * reshaping the data; for now there is a single local user.
 */
export const LOCAL_USER = "local";
export type ItemKind = "problem" | "sql" | "quiz" | "card";
export type Phase = "understand" | "ghost" | "cold" | "explain" | "quiz" | "card" | "sql";

export interface ItemProgress extends SrsFields {
  userId: string;
  id: string;
  kind: ItemKind;
  status: Status;
  phases: Partial<Record<"understand" | "ghost" | "cold" | "explain", boolean>>;
  /** Ghost reps finished in the current ladder (0-6: three shadow, three blind). */
  ghostReps: number;
  attempts: number;
  passes: number;
  rating?: Rating;
  /** Days with a cold solve that passed Submit with zero hints. */
  cleanColdDays: string[];
  bestColdMs?: number;
  lastColdMs?: number;
  bestWpm?: number;
  lastWpm?: number;
  lastAccuracy?: number;
  lastReviewedAt?: number;
  updatedAt: number;
}

export interface Attempt {
  userId: string;
  id: string;
  itemId: string;
  kind: ItemKind;
  phase: Phase;
  at: number;
  pass: boolean;
  hints?: number;
  ms?: number;
  wpm?: number;
  accuracy?: number;
  errors?: number;
  /** Free-form context: mode (sprint/mock), wrong choice, error summary. */
  note?: string;
}

export interface SavedAnswer {
  text: string;
  at: number;
}

export interface Settings {
  sound: boolean;
  reduceMotion: boolean;
  visualsDefault: boolean;
  visuals: Record<string, boolean>;
  media: Record<string, string>;
  /** Seconds of optional rest between ghost reps. 0 turns rest off. */
  restSeconds: number;
  /** Which resume the interviewer is holding. */
  resumeVersion: "old" | "new" | "both";
}

export interface State {
  ready: boolean;
  progress: Record<string, ItemProgress>;
  attempts: Attempt[];
  answers: Record<string, SavedAnswer[]>;
  drafts: Record<string, string>;
  settings: Settings;
}

const DEFAULT_SETTINGS: Settings = {
  sound: false,
  reduceMotion: false,
  visualsDefault: true,
  visuals: {},
  media: {},
  restSeconds: 20,
  resumeVersion: "old",
};

const KEY = "uncooked:v1";
let state: State = { ready: false, progress: {}, attempts: [], answers: {}, drafts: {}, settings: DEFAULT_SETTINGS };
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { ready: _ready, ...data } = state;
    void set(KEY, data).catch(() => {});
  }, 250);
}

function update(fn: (s: State) => State) {
  state = fn(state);
  emit();
  persist();
}

let loading: Promise<void> | null = null;
export function loadStore(): Promise<void> {
  loading ??= (async () => {
    let saved: Partial<State> | undefined;
    try {
      saved = await get<Partial<State>>(KEY);
    } catch {
      /* private mode or blocked storage: run in memory */
    }
    state = {
      ready: true,
      progress: saved?.progress ?? {},
      attempts: saved?.attempts ?? [],
      answers: saved?.answers ?? {},
      drafts: saved?.drafts ?? {},
      settings: { ...DEFAULT_SETTINGS, ...saved?.settings },
    };
    emit();
  })();
  return loading;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  void loadStore();
  return () => listeners.delete(l);
};
const SERVER_STATE = state;
export const useStore = (): State => useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
export const getState = (): State => state;

const blank = (id: string, kind: ItemKind): ItemProgress => ({
  userId: LOCAL_USER, id, kind, status: "not_started", phases: {}, ghostReps: 0, attempts: 0, passes: 0, cleanColdDays: [], updatedAt: 0, ...NEW_SRS,
});

export const progressOf = (s: State, id: string, kind: ItemKind): ItemProgress => s.progress[id] ?? blank(id, kind);

function patch(id: string, kind: ItemKind, fn: (p: ItemProgress) => Partial<ItemProgress>) {
  update((s) => {
    const prev = progressOf(s, id, kind);
    const next = { ...prev, ...fn(prev), updatedAt: Date.now() };
    next.status = deriveStatus(next.rating, next.cleanColdDays, true, kind === "problem");
    return { ...s, progress: { ...s.progress, [id]: next } };
  });
}

let attemptSeq = 0;
function log(a: Omit<Attempt, "userId" | "id" | "at">) {
  const at = Date.now();
  update((s) => ({ ...s, attempts: [...s.attempts, { ...a, userId: LOCAL_USER, id: `${at}-${attemptSeq++}`, at }].slice(-5000) }));
}

export const actions = {
  /** A phase of the 4-phase flow was finished (understand / explain). */
  completePhase(id: string, phase: "understand" | "ghost" | "cold" | "explain", pass = true) {
    patch(id, "problem", (p) => ({ phases: { ...p.phases, [phase]: true } }));
    if (phase === "understand" || phase === "explain") log({ itemId: id, kind: "problem", phase, pass });
  },

  ghostRep(id: string, r: { wpm: number; accuracy: number; errors: number; ms: number; blind: boolean; peeks: number }, totalReps: number) {
    patch(id, "problem", (p) => {
      // totalReps 0 = a speed race, which never moves the ladder
      const reps = totalReps ? Math.min(totalReps, p.ghostReps + 1) : p.ghostReps;
      return {
        ghostReps: reps,
        lastWpm: r.wpm,
        lastAccuracy: r.accuracy,
        bestWpm: Math.max(p.bestWpm ?? 0, r.wpm),
        phases: { ...p.phases, ghost: p.phases.ghost || (totalReps > 0 && reps >= totalReps) },
      };
    });
    log({ itemId: id, kind: "problem", phase: "ghost", pass: true, ...r, note: `${r.blind ? "blind" : "shadow"}${r.peeks ? `, ${r.peeks} peeks` : ""}` });
  },

  resetGhostLadder(id: string) {
    patch(id, "problem", () => ({ ghostReps: 0 }));
  },

  /** A Submit on a cold solve (problem or SQL). */
  coldSubmit(id: string, kind: "problem" | "sql", r: { pass: boolean; hints: number; ms: number; note?: string }) {
    patch(id, kind, (p) => {
      const clean = r.pass && r.hints === 0;
      const today = dayKey(Date.now());
      return {
        attempts: p.attempts + 1,
        passes: p.passes + (r.pass ? 1 : 0),
        lastColdMs: r.pass ? r.ms : p.lastColdMs,
        bestColdMs: r.pass ? Math.min(p.bestColdMs ?? Infinity, r.ms) : p.bestColdMs,
        cleanColdDays: clean && !p.cleanColdDays.includes(today) ? [...p.cleanColdDays, today] : p.cleanColdDays,
        phases: { ...p.phases, cold: p.phases.cold || r.pass },
      };
    });
    log({ itemId: id, kind, phase: kind === "sql" ? "sql" : "cold", pass: r.pass, hints: r.hints, ms: r.ms, note: r.note });
  },

  /** Self-rating: drives spaced repetition for every kind of item. */
  rate(id: string, kind: ItemKind, rating: Rating) {
    const now = Date.now();
    patch(id, kind, (p) => ({ rating, lastReviewedAt: now, ...schedule(p, rating, now) }));
  },

  /** A tap-to-answer question. Right answers space out; wrong ones come back. */
  answerQuiz(id: string, correct: boolean, note?: string) {
    const now = Date.now();
    patch(id, "quiz", (p) => {
      const rating: Rating = correct ? (p.rating === "got_it" || p.rating === "mastered" ? "mastered" : "got_it") : "again";
      return { rating, attempts: p.attempts + 1, passes: p.passes + (correct ? 1 : 0), lastReviewedAt: now, ...schedule(p, rating, now) };
    });
    log({ itemId: id, kind: "quiz", phase: "quiz", pass: correct, note });
  },

  gradeCard(id: string, rating: Rating) {
    actions.rate(id, "card", rating);
    patch(id, "card", (p) => ({ attempts: p.attempts + 1, passes: p.passes + (rating === "again" ? 0 : 1) }));
    log({ itemId: id, kind: "card", phase: "card", pass: rating !== "again" && rating !== "shaky", note: rating });
  },

  saveAnswer(id: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    update((s) => {
      const prev = s.answers[id] ?? [];
      if (prev[0]?.text === trimmed) return s;
      return { ...s, answers: { ...s.answers, [id]: [{ text: trimmed, at: Date.now() }, ...prev].slice(0, 5) } };
    });
  },

  saveDraft(id: string, code: string) {
    update((s) => (s.drafts[id] === code ? s : { ...s, drafts: { ...s.drafts, [id]: code } }));
  },

  setSettings(p: Partial<Settings>) {
    update((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  },

  exportJson(): string {
    const { ready: _ready, ...data } = state;
    return JSON.stringify({ app: "uncooked", version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
  },

  /** Replace local progress with an export. Throws on a file that isn't one. */
  importJson(json: string) {
    const data = JSON.parse(json) as Partial<State> & { app?: string };
    if (data.app !== "uncooked" || typeof data.progress !== "object" || !Array.isArray(data.attempts)) throw new Error("Not an Uncooked export file.");
    update(() => ({
      ready: true,
      progress: data.progress ?? {},
      attempts: data.attempts ?? [],
      answers: data.answers ?? {},
      drafts: data.drafts ?? {},
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
    }));
  },

  wipe() {
    update((s) => ({ ...s, progress: {}, attempts: [], answers: {}, drafts: {} }));
  },
};
