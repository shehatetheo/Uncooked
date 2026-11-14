"use client";
import { useEffect, useState } from "react";
import { QuizRunner } from "@/components/drill/QuizRunner";
import { AsciiBar, PageHeader, Panel } from "@/components/ui";
import { mastery } from "@/lib/catalog";
import { quiz } from "@/lib/content";
import { QUIZ_TOPICS, type QuizQuestion, type QuizTopic } from "@/lib/content/types";
import { useQueryParam } from "@/lib/hooks";
import { pickWeakest } from "@/lib/pick";
import { useStore } from "@/lib/store";

export default function QuizPage() {
  const s = useStore();
  const want = useQueryParam("topic") as QuizTopic | null;
  const [session, setSession] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [auto, setAuto] = useState(false);

  const start = (topic: QuizTopic | "mixed", n: number) => {
    const pool = topic === "mixed" ? quiz : quiz.filter((q) => q.topic === topic);
    setSession({ title: topic === "mixed" ? "Mixed" : "Quiz", questions: pickWeakest(s, pool, n, Date.now()) });
  };

  // deep link from the daily plan: /quiz?topic=python starts straight away
  useEffect(() => {
    if (!auto && s.ready && want && want in QUIZ_TOPICS) {
      setAuto(true);
      start(want, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.ready, want, auto]);

  if (session) return <div className="mx-auto max-w-[760px]"><QuizRunner key={session.questions[0]?.id} {...session} onExit={() => setSession(null)} /></div>;

  return (
    <div>
      <PageHeader kicker="Fundamentals" title="Quiz bank">
        {quiz.length} tap-to-answer questions on the things your resume says you know. Sessions pull due and weak questions first.
      </PageHeader>
      <div className="mb-4"><button type="button" className="btn btn-primary" onClick={() => start("mixed", 15)}>Mixed 15</button></div>
      <Panel title="Topics">
        {(Object.keys(QUIZ_TOPICS) as QuizTopic[]).map((t) => {
          const pool = quiz.filter((q) => q.topic === t);
          if (!pool.length) return null;
          const seen = pool.filter((q) => s.progress[q.id]).length;
          return (
            <div key={t} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-3 py-2 last:border-0 md:grid-cols-[1fr_auto_72px_auto]">
              <span className="text-sm">{QUIZ_TOPICS[t]}</span>
              <AsciiBar value={mastery(s, pool.map((q) => q.id))} className="hidden md:inline" />
              <span className="hidden text-right text-xs tabular-nums text-dim md:block">{seen}/{pool.length}</span>
              <button type="button" className="btn btn-sm" onClick={() => start(t, 10)}>Start 10</button>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
