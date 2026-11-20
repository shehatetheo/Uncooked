import type { Problem, PythonProblem } from "./types";

const indent = (lines: string[], n: number) => lines.map((l) => (l ? " ".repeat(n) + l : l));

/** What the editor starts with: just the signature. */
export function starterCode(p: Problem): string {
  if (p.kind === "sql") return "SELECT ";
  if (p.design) return p.design.starter;
  return `class Solution:\n    ${p.signature}\n        `;
}

/** The full reference solution, runnable as-is. */
export function referenceCode(p: Problem): string {
  if (p.kind === "sql" || p.design) return p.solution.join("\n");
  return [`class Solution:`, `    ${p.signature}`, ...indent(p.solution, 8)].join("\n") + "\n";
}

/** The ghost guide: each line of the reference with its caption, indented as you'd type it. */
export function ghostLines(p: Problem): { code: string; caption: string }[] {
  const lines = p.kind === "python" && !p.design ? indent(p.solution, 8) : p.solution;
  return lines.map((code, i) => ({ code, caption: p.captions[i] ?? "" }));
}

/** How a test's arguments read on screen: "nums = [2,7,11,15], target = 9". */
export function showArgs(p: PythonProblem, args: unknown[]): string {
  if (p.design) return `${show(args[0])}\n${show(args[1])}`;
  return p.params
    .map((param, i) => {
      if (param.kind === "cycle") {
        const [list, pos] = args[i] as [unknown[], number];
        return `${param.name} = ${show(list)}, pos = ${pos}`;
      }
      return `${param.name} = ${show(args[i])}`;
    })
    .join(", ");
}

/** A value the way Python prints it: None, True, False, and spaces after commas. */
export function show(v: unknown): string {
  if (v === null || v === undefined) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(show).join(", ")}]`;
  if (typeof v === "object") return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${show(x)}`).join(", ")}}`;
  return String(v);
}
