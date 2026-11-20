"use client";
import type { PythonProblem } from "@/lib/types";
import { HARNESS } from "./harness";
import { buildPayload, grade, type RawRun, type RunReport } from "./grade";

/** A run that takes longer than this is treated as an infinite loop and killed. */
export const RUN_TIMEOUT_MS = 5000;

type Reply = { id: number; ok: boolean; raw?: RawRun; error?: string };

let worker: Worker | null = null;
let booted: Promise<void> | null = null;
let loaded = false;
let seq = 0;
const waiting = new Map<number, (r: Reply) => void>();

function send(msg: Record<string, unknown>): Promise<Reply> {
  const id = ++seq;
  return new Promise((resolve) => {
    waiting.set(id, resolve);
    worker!.postMessage({ ...msg, id });
  });
}

function kill() {
  worker?.terminate();
  worker = null;
  booted = null;
  loaded = false;
  for (const resolve of waiting.values()) resolve({ id: 0, ok: false, error: "killed" });
  waiting.clear();
}

/** Start (or reuse) the Python runtime. Lazy: nothing loads until this is called. */
export function bootPython(): Promise<void> {
  if (booted) return booted;
  worker = new Worker("/py-worker.mjs", { type: "module" });
  worker.onmessage = (e: MessageEvent<Reply>) => {
    waiting.get(e.data.id)?.(e.data);
    waiting.delete(e.data.id);
  };
  booted = send({ type: "init", harness: HARNESS }).then((r) => {
    if (!r.ok) {
      kill();
      throw new Error(r.error ?? "Python failed to load");
    }
    loaded = true;
  });
  return booted;
}
/** True once the runtime has finished loading. */
export const pythonLoaded = () => loaded;

/** Run: visible tests only. Submit: visible + hidden. */
export async function runPython(p: PythonProblem, code: string, mode: "run" | "submit"): Promise<RunReport> {
  const tests = mode === "submit" ? [...p.tests.visible, ...p.tests.hidden] : p.tests.visible;
  const failed = (status: "error" | "timeout", fatal: string): RunReport => ({ mode, status, fatal, results: [], passed: 0, total: tests.length, ms: 0 });
  try {
    await bootPython();
  } catch (e) {
    return failed("error", `Python didn't load: ${e instanceof Error ? e.message : String(e)}. Check your connection and try again.`);
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), RUN_TIMEOUT_MS);
  });
  const reply = await Promise.race([send({ type: "run", payload: buildPayload(p, code, tests) }), timeout]);
  clearTimeout(timer);
  if (reply === "timeout") {
    kill();
    void bootPython().catch(() => {});
    return failed("timeout", `Time limit exceeded: stopped after ${RUN_TIMEOUT_MS / 1000} seconds. Look for a loop that never ends.`);
  }
  if (!reply.ok || !reply.raw) return failed("error", reply.error ?? "The runner crashed. Try again.");
  return grade(p, tests, p.tests.visible.length, reply.raw, mode);
}
