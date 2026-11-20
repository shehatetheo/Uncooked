import type { Phase } from "@/lib/types";

/** What the app sends the interviewer with every message. */
export interface InterviewRequest {
  problemId: string;
  phase: Phase;
  /** The conversation so far, oldest first. The last entry is what the candidate just said (or an event marker). */
  messages: ChatMessage[];
  /** Something that happened without the candidate speaking. */
  event?: InterviewEvent;
  code: string;
  /** The latest Run or Submit, summarised. */
  run: RunSummary | null;
  minutesLeft: number;
  hintsShown: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type InterviewEvent =
  | "start" // the candidate joined: give the problem
  | "ghost" // moved to the guided solve
  | "blind" // moved to the blind solve
  | "ran" // they submitted and something failed
  | "passed" // all tests pass in the blind solve: ask one follow-up
  | "ghost-passed" // all tests pass in the guided solve
  | "wrap"; // the interview is ending: say goodbye

export interface RunSummary {
  mode: "run" | "submit";
  passed: number;
  total: number;
  /** Syntax error, timeout, or crash before any test ran. */
  fatal?: string;
  /** The first few failing tests. */
  failures: { input: string; expected: string; got?: string; error?: string; hidden: boolean }[];
}

export interface ScorecardRequest {
  problemId: string;
  messages: ChatMessage[];
  code: string;
  run: RunSummary | null;
  solved: boolean;
  minutesUsed: number;
  hintsShown: number;
  skippedGhost: boolean;
}

export const CATEGORIES = [
  { key: "problemSolving", label: "Problem solving" },
  { key: "communication", label: "Communication" },
  { key: "codeQuality", label: "Code quality" },
  { key: "complexity", label: "Complexity analysis" },
  { key: "edgeCases", label: "Edge cases" },
] as const;
export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export type Verdict = "hire" | "lean hire" | "lean no";

export interface Scorecard {
  scores: Record<CategoryKey, { score: number; tip: string }>;
  verdict: Verdict;
  summary: string;
}

/** An error the app can show as-is. */
export interface ApiError {
  error: "rate_limited" | "no_credits" | "needs_card" | "auth" | "unavailable" | "bad_request";
  message: string;
}

export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_CODE_CHARS = 6000;
