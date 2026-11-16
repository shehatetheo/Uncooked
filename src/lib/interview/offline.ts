import { cards } from "@/lib/content/cards";
import { problems } from "@/lib/content/problems";
import type { OpenCard } from "@/lib/content/types";
import type { Round } from "./rounds";

/** One question in the offline interviewer, built from the app's own content. */
export interface OfflineQuestion {
  /** Card id when the question comes from a card, so answers and grades are saved to it. */
  cardId?: string;
  question: string;
  keyPoints: string[];
  label: string;
}

const shuffle = <T,>(xs: T[]): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const fromCard = (c: OpenCard): OfflineQuestion => ({
  cardId: c.id,
  question: c.source && c.track === "resume" ? `On your resume: ${c.source}. ${c.question}` : c.question,
  keyPoints: c.keyPoints,
  label: c.group,
});

const pick = (filter: (c: OpenCard) => boolean, n: number) => shuffle(cards.filter(filter)).slice(0, n).map(fromCard);

function codingQuestions(): OfflineQuestion[] {
  const p = shuffle(problems.filter((x) => x.tags.includes("made-up") || x.tags.includes("sap")))[0]!;
  const example = p.examples[0];
  return [
    {
      question: `Here's a problem. ${p.statement.replace(/\s*\n\s*/g, " ")} ${example ? `For example, with ${example.input}, the answer is ${example.output}.` : ""} Talk me through how you'd solve it, and the time and space complexity.`,
      keyPoints: [p.myWords, `Time ${p.time}, space ${p.space}.`, ...(p.reveal ? [p.reveal] : []), "Restated the problem and asked about edge cases before coding."],
      label: `Coding · ${p.title}`,
    },
    ...p.followUps.slice(0, 2).map((f) => ({ question: f.q, keyPoints: [f.a], label: `Follow-up · ${p.title}` })),
  ];
}

export function buildOfflineQueue(round: Round, version: "old" | "new" | "both"): OfflineQuestion[] {
  const resume = (c: OpenCard) => c.track === "resume" && (version === "both" || c.versions.includes(version));
  switch (round) {
    case "coding":
      return codingQuestions();
    case "sql":
      return [...pick((c) => c.track === "sql-concept" && c.group === "Inner vs outer joins", 1), ...pick((c) => c.track === "sql-concept" && c.group !== "Inner vs outer joins", 4)];
    case "resume":
      return pick(resume, 6);
    case "behavioral":
      return [...pick((c) => c.track === "behavioral" && c.group === "Intro", 1), ...pick((c) => c.track === "behavioral" && !["Intro", "Why SAP / why STAR"].includes(c.group), 4), ...pick((c) => c.track === "behavioral" && c.group === "Why SAP / why STAR", 1)];
    case "host":
      return [...pick((c) => c.id === "beh-host-greeting", 1), ...pick((c) => c.group === "Your host" && !["beh-host-greeting", "beh-host-close"].includes(c.id), 4), ...pick((c) => c.id === "beh-host-close", 1)];
    case "full":
      return [
        ...pick((c) => c.track === "behavioral" && c.group === "Intro", 1),
        ...pick(resume, 2),
        ...codingQuestions().slice(0, 1),
        ...pick((c) => c.track === "sql-concept" && c.group === "Inner vs outer joins", 1),
        ...pick((c) => c.track === "behavioral" && c.group === "Why SAP / why STAR", 1),
      ];
  }
}
