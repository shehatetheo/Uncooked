"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/content/types";
import { QUIZ_TOPICS } from "@/lib/content/types";
import { quoteFor } from "@/lib/quotes";
import { actions } from "@/lib/store";
import { AsciiBar, Panel, QuoteLine } from "@/components/ui";
import { ChoiceQuestion } from "@/components/problem/Understand";

/** Runs a fixed list of tap-to-answer questions and records each answer. */
export function QuizRunner({ questions, title, onExit }: { questions: QuizQuestion[]; title: string; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<QuizQuestion[]>([]);
  const q = questions[i];

  if (!q)
    return (
      <Panel accent title={`${title} · done`}>
        <div className="p-4">
          <p className="font-pixel text-xl">{right}/{questions.length}</p>
          {missed.length > 0 && (
            <>
              <p className="label mb-1 mt-4">Missed, back in the review queue</p>
              <ul className="flex flex-col gap-2 text-sm">
                {missed.map((m) => (
                  <li key={m.id}><span className="text-error">× </span>{m.prompt}<span className="block pl-4 text-dim">{m.choices[m.answer]}</span></li>
                ))}
              </ul>
            </>
          )}
          <QuoteLine quote={quoteFor(right * 3 + questions.length)} className="mt-4" />
          <button type="button" className="btn btn-primary mt-4" onClick={onExit} autoFocus>Done</button>
        </div>
      </Panel>
    );

  return (
    <Panel title={`${title} · ${QUIZ_TOPICS[q.topic]}`} right={<><AsciiBar value={i / questions.length} width={8} /><button type="button" className="btn btn-sm" onClick={onExit}>Exit</button></>}>
      <div className="p-4">
        <ChoiceQuestion
          key={q.id}
          q={q}
          index={i}
          total={questions.length}
          onAnswer={(ok, picked) => {
            actions.answerQuiz(q.id, ok, ok ? undefined : `picked: ${q.choices[picked]}`);
            if (ok) setRight((r) => r + 1);
            else setMissed((m) => [...m, q]);
          }}
          onNext={() => setI(i + 1)}
          nextLabel={i === questions.length - 1 ? "Finish" : "Next"}
        />
      </div>
    </Panel>
  );
}
