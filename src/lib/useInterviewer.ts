"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EVENT_MARKER } from "@/lib/ai/prompt";
import type { ApiError, ChatMessage, InterviewEvent, InterviewRequest } from "@/lib/ai/protocol";
import { canListen, canSpeak, Listener, plainSpeech, Speaker } from "@/lib/speech";

export interface Turn {
  who: "ai" | "you";
  text: string;
}
export type AiStatus = "idle" | "thinking" | "speaking";
type Context = Pick<InterviewRequest, "phase" | "code" | "run" | "minutesLeft" | "hintsShown">;

/**
 * The conversation with the interviewer: sends what you said (plus your code
 * and test results) to the server, streams the reply into the transcript, and
 * speaks it sentence by sentence as it arrives.
 */
export function useInterviewer(problemId: string, getContext: () => Context) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<AiStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);

  const history = useRef<ChatMessage[]>([]);
  const down = useRef(false);
  const inflight = useRef<AbortController | null>(null);
  const speaker = useRef<Speaker | null>(null);
  const listener = useRef<Listener | null>(null);
  const ctx = useRef(getContext);
  ctx.current = getContext;
  const sayRef = useRef<(text: string) => void>(() => {});
  const support = useMemo(() => ({ listen: typeof window !== "undefined" && canListen(), speak: typeof window !== "undefined" && canSpeak() }), []);

  const request = useCallback(
    async (event?: InterviewEvent) => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      const sp = speaker.current;
      sp?.begin();
      setStatus("thinking");
      let said = "";
      let started = false;
      const show = (text: string) =>
        setTurns((ts) => {
          if (!started) {
            started = true;
            return [...ts, { who: "ai", text }];
          }
          return [...ts.slice(0, -1), { who: "ai", text }];
        });
      try {
        const body: InterviewRequest = { problemId, messages: history.current, event, ...ctx.current() };
        const res = await fetch("/api/interview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
        if (!res.ok || !res.body) {
          const err = (await res.json().catch(() => null)) as ApiError | null;
          throw new Error(err?.message ?? "The AI interviewer isn't reachable right now. The coding, tests and ghost guide still work.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        let fed = 0;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          said = plainSpeech(raw);
          if (said) show(said);
          if (said.length > fed) {
            sp?.feed(said.slice(fed));
            fed = said.length;
          }
        }
        if (!said.trim()) throw new Error("The interviewer didn't answer. Try again.");
        history.current = [...history.current, { role: "assistant", content: said.trim() }];
        down.current = false;
        setError(null);
        sp?.end();
        if (!sp || sp.muted || !sp.speaking) setStatus("idle");
      } catch (e) {
        if (controller.signal.aborted) {
          // interrupted by a newer message: keep whatever was already said
          if (said.trim()) history.current = [...history.current, { role: "assistant", content: said.trim() }];
          return;
        }
        sp?.cancel();
        down.current = true;
        setError(e instanceof Error && e.message && !/failed to fetch|load failed|networkerror/i.test(e.message) ? e.message : "Couldn't reach the AI interviewer. Check your connection. The coding, tests and ghost guide still work.");
        setStatus("idle");
      }
    },
    [problemId],
  );

  /** The candidate says something (typed or spoken). */
  const say = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setTurns((ts) => [...ts, { who: "you", text: clean }]);
      history.current = [...history.current, { role: "user", content: clean }];
      void request();
    },
    [request],
  );
  sayRef.current = say;

  /** Something happened in the app. Skipped while the AI is down, unless forced. */
  const event = useCallback(
    (e: InterviewEvent, force = false) => {
      history.current = [...history.current, { role: "user", content: EVENT_MARKER[e] }];
      if (down.current && !force) return;
      void request(e);
    },
    [request],
  );

  /** Ask again after an error. */
  const retry = useCallback(() => {
    setError(null);
    if (history.current[history.current.length - 1]?.role !== "user") history.current = [...history.current, { role: "user", content: "[The candidate is waiting for you to continue.]" }];
    void request();
  }, [request]);

  useEffect(() => {
    const sp = new Speaker();
    sp.onChange = (speaking) => setStatus((s) => (speaking ? "speaking" : s === "speaking" ? "idle" : s));
    speaker.current = sp;
    listener.current = new Listener(
      (text) => setHeard(text),
      (text) => {
        setListening(false);
        setHeard("");
        sayRef.current(text);
      },
      (message) => {
        setListening(false);
        setHeard("");
        setMicError(message);
      },
    );
    return () => {
      inflight.current?.abort();
      sp.onChange = null;
      sp.cancel();
      listener.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!listener.current || listener.current.active) return;
    // talking over the interviewer interrupts it, like a real call
    inflight.current?.abort();
    speaker.current?.cancel();
    setStatus("idle");
    setMicError(null);
    setHeard("");
    setListening(true);
    listener.current.start();
  }, []);
  /** Stop and send what was heard. */
  const stopListening = useCallback(() => listener.current?.stop(), []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    if (speaker.current) {
      speaker.current.muted = m;
      if (m) speaker.current.cancel();
    }
  }, []);

  return {
    turns,
    status,
    error,
    listening,
    heard,
    micError,
    muted,
    support,
    say,
    event,
    retry,
    startListening,
    stopListening,
    setMuted,
    /** Call inside the first tap, so iPhone allows the voice. */
    unlock: () => speaker.current?.unlock(),
    stopSpeaking: () => speaker.current?.cancel(),
    getHistory: () => history.current,
  };
}
export type Interviewer = ReturnType<typeof useInterviewer>;
