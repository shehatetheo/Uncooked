/** Shared by the interview page (client) and the API route (server). */
export const ROUNDS = {
  coding: { label: "Coding", note: "A made-up easy/medium sorting or string problem. Talk it through, then code it." },
  sql: { label: "SQL", note: "Its own interview at SAP. Joins, GROUP BY, NULLs, and why." },
  resume: { label: "Resume", note: "Line by line: what you did, the numbers, why each tool." },
  behavioral: { label: "Behavioral", note: "STAR stories, why SAP, why STAR." },
  host: { label: "Your host", note: "Greeting, small talk, and asking her your questions." },
  full: { label: "Full mix", note: "A bit of everything, like the real super day." },
} as const;
export type Round = keyof typeof ROUNDS;
export const isRound = (r: unknown): r is Round => typeof r === "string" && r in ROUNDS;

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export const MAX_TURNS = 60;
export const MAX_TURN_CHARS = 6000;
