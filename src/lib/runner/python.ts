"use client";
import type { Problem, TestCase } from "@/lib/content/types";
import { HARNESS } from "./harness";
import { buildPayload, grade, type RawRun, type RunReport } from "./types";

const RUN_TIMEOUT_MS = 6000;

type Reply = { id: number; ok: boolean; raw?: RawRun; error?: string };

let worker: Worker | null = null;
let booted: Promise<void> | null = null;
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
  for (const resolve of waiting.values()) resolve({ id: 0, ok: false, error: "killed" });
  waiting.clear();
}

/** Start (or reuse) the Python runtime. Safe to call early to warm it up. */
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
  });
  return booted;
}

/** Run code against tests. `hiddenFrom` marks where hidden tests start. */
export async function runPython(p: Problem, code: string, tests: TestCase[], hiddenFrom: number): Promise<RunReport> {
  await bootPython();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), RUN_TIMEOUT_MS);
  });
  const reply = await Promise.race([send({ type: "run", payload: buildPayload(p, code, tests) }), timeout]);
  clearTimeout(timer);
  if (reply === "timeout") {
    kill();
    void bootPython().catch(() => {});
    return {
      status: "timeout",
      fatal: `Time limit exceeded: stopped after ${RUN_TIMEOUT_MS / 1000}s. Check for a loop that never ends.`,
      results: [],
      passed: 0,
      total: tests.length,
      ms: RUN_TIMEOUT_MS,
    };
  }
  if (!reply.ok || !reply.raw)
    return { status: "error", fatal: reply.error ?? "Runner crashed", results: [], passed: 0, total: tests.length, ms: 0 };
  return grade(p, tests, hiddenFrom, reply.raw);
}
