/**
 * Ghost-typing engine. Pure functions over an immutable state so scoring is
 * unit-testable and the same engine drives typing, autoplay and speed races.
 *
 * Rules: a correct key advances; a wrong key counts an error and does not
 * advance (so the finished text is always exactly the solution). Indentation
 * is auto-skipped after Enter, which keeps it usable on a phone.
 */
export interface GhostState {
  target: string;
  /** Index of the next character to type. */
  pos: number;
  /** First typeable index: everything before it (the `def` line) is given. */
  start: number;
  correct: number;
  errors: number;
  /** Position of the most recent wrong key, for the red flash. */
  wrongAt: number | null;
  wrongSeq: number;
  startedAt: number | null;
  finishedAt: number | null;
}

/** Skip the run of spaces that begins a line. */
const skipIndent = (target: string, pos: number): number => {
  while (target[pos] === " ") pos++;
  return pos;
};

/** `lockedLines` leading lines are pre-filled (the function signature). */
export function createGhost(target: string, lockedLines = 1): GhostState {
  let start = 0;
  for (let i = 0; i < lockedLines; i++) {
    const nl = target.indexOf("\n", start);
    if (nl === -1) break;
    start = nl + 1;
  }
  start = skipIndent(target, start);
  return { target, pos: start, start, correct: 0, errors: 0, wrongAt: null, wrongSeq: 0, startedAt: null, finishedAt: null };
}

export const isDone = (s: GhostState): boolean => s.pos >= s.target.length;

/** Apply one typed character. Enter is "\n". */
export function typeChar(s: GhostState, ch: string, now: number): GhostState {
  if (isDone(s)) return s;
  const startedAt = s.startedAt ?? now;
  if (ch !== s.target[s.pos]) return { ...s, startedAt, errors: s.errors + 1, wrongAt: s.pos, wrongSeq: s.wrongSeq + 1 };
  let pos = s.pos + 1;
  if (ch === "\n") pos = skipIndent(s.target, pos);
  const done = pos >= s.target.length;
  return { ...s, startedAt, pos, correct: s.correct + 1, wrongAt: null, finishedAt: done ? now : null };
}

/** Line index (0-based over the whole target) the cursor is on. */
export function currentLine(s: GhostState): number {
  let n = 0;
  for (let i = 0; i < s.pos && i < s.target.length; i++) if (s.target[i] === "\n") n++;
  return n;
}

export interface GhostStats {
  wpm: number;
  accuracy: number;
  errors: number;
  ms: number;
  progress: number;
}

export function ghostStats(s: GhostState, now: number): GhostStats {
  const ms = s.startedAt === null ? 0 : (s.finishedAt ?? now) - s.startedAt;
  const minutes = ms / 60000;
  const keys = s.correct + s.errors;
  const span = s.target.length - s.start;
  return {
    wpm: minutes > 0 ? Math.round(s.correct / 5 / minutes) : 0,
    accuracy: keys ? Math.round((s.correct / keys) * 100) : 100,
    errors: s.errors,
    ms,
    progress: span > 0 ? Math.min(1, (s.pos - s.start) / span) : 1,
  };
}

/** The six-rep ladder: three with the shadow visible, three from memory. */
export const SHADOW_REPS = 3;
export const BLIND_REPS = 3;
export const TOTAL_REPS = SHADOW_REPS + BLIND_REPS;
export const repMode = (repsDone: number): "shadow" | "blind" => (repsDone % TOTAL_REPS < SHADOW_REPS ? "shadow" : "blind");
