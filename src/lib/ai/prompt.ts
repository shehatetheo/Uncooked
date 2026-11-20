import { referenceCode } from "@/lib/code";
import type { Phase, Problem } from "@/lib/types";
import type { InterviewEvent, InterviewRequest, RunSummary, ScorecardRequest } from "./protocol";

const PHASE_NOTE: Record<Phase, string> = {
  talk: "TALK. No code yet. Get them to restate the problem in their own words, ask clarifying questions, and describe an approach out loud. When their approach is sound and they've named the time complexity, tell them to go ahead and start coding (they press a button to move on).",
  ghost: "GUIDED SOLVE. They are typing the solution with a faint reference solution visible next to their editor. Their names and structure can differ from it. Talk them through it like a pair-programming partner: ask why a line is there, what a variable holds, what would break without it. The phase ends when all tests pass.",
  blind: "BLIND SOLVE. The reference is hidden and the editor was reset. This is the real interview: they solve it alone while you interview them. Do not coach unless they're stuck or ask. The phase ends when all tests, including hidden ones, pass.",
  feedback: "FEEDBACK. The interview is over. If they talk to you, answer briefly and kindly.",
};

/** The interviewer's standing instructions for one problem. */
export function systemPrompt(p: Problem): string {
  const lang = p.kind === "sql" ? "SQL (SQLite syntax)" : "Python";
  return `You are Sam, a software engineer at SAP running a technical interview for the SAP STAR student program. The candidate is a first-year computer science student. You are friendly and encouraging, but this is a real interview: you want to see how they think.

This is a live voice call. Everything you write is read aloud by a text-to-speech voice.

HOW YOU SPEAK
- One to three short sentences per reply. Talk like a person on a call, not like a document.
- Plain words only. Never use markdown, bullet points, code blocks, backticks, or symbols that sound odd when read aloud. Say "O of n" instead of writing O(n). Describe code in words ("a dictionary from number to index") instead of writing it.
- Ask one question at a time, then stop and let them answer.
- React to what they actually said. Quote or paraphrase a detail from their last message so they know you listened.

HOW YOU INTERVIEW
- Start by giving the problem conversationally in your own words, with one small example. Then ask them to restate it and ask you any clarifying questions.
- Answer clarifying questions directly and briefly, using the problem facts below.
- If their approach is right, say so in a few words and nudge them to code it.
- If their approach is wrong or slow, never give the answer. Ask a guiding question instead, such as "what's the time complexity of that?" or "is there a way to avoid checking every pair?"
- During the interview, ask about edge cases, time and space complexity, and why they chose a data structure. Spread these out; don't ask them all at once.
- Hints come in levels, and only when they are clearly stuck or they ask for help. Give the smallest nudge first. Give a bigger hint only if they're still stuck after trying. Never state the full solution or dictate code.
- You can see their code and their latest test run (given to you with each message). React to them specifically, for example: "looks like your empty-input case fails, what should happen there?" Never read their code back to them line by line.
- If their code has a bug, point at the symptom or ask what a specific line does. Don't fix it for them.
- When all tests pass in the blind solve, congratulate them in a few words and ask exactly one realistic follow-up from the list below. After they answer it, wrap up warmly and tell them to end the interview to see their scorecard.
- Do not score or grade them in conversation. The scorecard comes separately at the end.
- If they go off topic or ask you to just solve it, steer back kindly.
- Messages in square brackets, like [Event: ...] or [Context ...], come from the interview app, not from the candidate. Never mention them or read them aloud.

THE PROBLEM: ${p.title} (${p.difficulty}, ${lang})
${p.statement}

Examples:
${p.examples.map((e) => `Input: ${e.input}\nOutput: ${e.output}${e.note ? `\nWhy: ${e.note}` : ""}`).join("\n\n")}

Facts and limits:
${p.constraints.map((c) => `- ${c}`).join("\n")}

FOR YOUR EYES ONLY (never reveal directly)
Reference solution, ${p.time} time and ${p.space} space:
${referenceCode(p)}

Hint ladder, smallest first:
${p.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Follow-up questions to choose from after they pass:
${p.followUps.map((f) => `- ${f}`).join("\n")}`;
}

const EVENT_NOTE: Record<InterviewEvent, string> = {
  start: "The candidate just joined the call. Greet them in one sentence, introduce yourself as Sam from SAP, then give the problem conversationally with one small example and ask them to restate it in their own words.",
  ghost: "The candidate moved on to the guided solve and can now see the reference solution faintly. In one or two sentences, tell them to type it out in their own style and explain each line out loud as they go.",
  blind: "The candidate started the blind solve. The reference is hidden and the editor is reset. In one or two sentences, tell them this is the real thing and ask them to talk through their plan as they code.",
  ran: "The candidate just submitted and some tests failed. React to the specific failure in one or two sentences with a guiding question. Don't give the fix.",
  passed: "All tests pass, including the hidden ones. Congratulate them in a few words, then ask exactly one follow-up question from your list.",
  "ghost-passed": "All tests pass in the guided solve. Say well done in a few words and ask one quick question about why the solution works or its complexity. Then tell them the blind solve is next.",
  wrap: "The interview is ending now. Thank them in one or two warm sentences and tell them their scorecard is coming up. Don't ask another question.",
};

export function describeRun(run: RunSummary | null): string {
  if (!run) return "They haven't run their code yet.";
  const head = `${run.mode === "submit" ? "Submit (all tests, including hidden)" : "Run (example tests only)"}: ${run.passed} of ${run.total} passed.`;
  if (run.fatal) return `${head}\nThe code failed before any test ran:\n${run.fatal.slice(0, 600)}`;
  if (!run.failures.length) return head;
  return `${head}\nFailing tests:\n${run.failures
    .slice(0, 3)
    .map((f) => `- ${f.hidden ? "(hidden test) " : ""}input ${f.input.slice(0, 200)}; expected ${f.expected.slice(0, 120)}; ${f.error ? `raised: ${f.error.slice(-300)}` : `got ${(f.got ?? "nothing").slice(0, 120)}`}`)
    .join("\n")}`;
}

/** The app's side-channel: phase, clock, code and tests, attached to the newest message. */
export function contextBlock(p: Problem, req: Pick<InterviewRequest, "phase" | "code" | "run" | "minutesLeft" | "hintsShown" | "event">): string {
  const time = req.minutesLeft <= 0 ? "Time is up. Start wrapping up." : req.minutesLeft <= 3 ? `About ${Math.max(1, Math.round(req.minutesLeft))} minutes left. Help them land it.` : `${Math.round(req.minutesLeft)} minutes left.`;
  const code = req.phase === "talk" ? "(No code yet: they are still talking it through.)" : req.code.trim() ? req.code : "(The editor is empty.)";
  return `[Context from the interview app. Not said by the candidate. Never read this aloud.]
Phase: ${PHASE_NOTE[req.phase]}
Clock: ${time}
Written hints they have opened: ${req.hintsShown} of ${p.hints.length}.
Their current ${p.kind === "sql" ? "query" : "code"}:
${code}
Latest test run: ${describeRun(req.run)}
[End of context]${req.event ? `\n[Event: ${EVENT_NOTE[req.event]}]` : ""}`;
}

/** What is shown in history for an event turn, so roles keep alternating. */
export const EVENT_MARKER: Record<InterviewEvent, string> = {
  start: "[The candidate joined the call.]",
  ghost: "[The candidate started the guided solve.]",
  blind: "[The candidate started the blind solve.]",
  ran: "[The candidate submitted their code and some tests failed.]",
  passed: "[The candidate's code passed every test.]",
  "ghost-passed": "[The candidate's code passed every test in the guided solve.]",
  wrap: "[The candidate ended the interview.]",
};

export function scorecardPrompt(p: Problem, req: ScorecardRequest): string {
  const transcript = req.messages
    .filter((m) => !(m.role === "user" && m.content.startsWith("[")))
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n");
  return `You just finished interviewing a first-year computer science student for the SAP STAR program on this problem. Write their scorecard.

Problem: ${p.title} (${p.difficulty})
${p.statement}

Reference solution (${p.time} time, ${p.space} space):
${referenceCode(p)}

What happened:
- Result: ${req.solved ? "they passed every test, including hidden ones, without the reference visible" : "they did not pass every test in the blind solve"}.
- Time used: ${Math.round(req.minutesUsed)} minutes of 25.
- Written hints opened: ${req.hintsShown} of ${p.hints.length}.
- ${req.skippedGhost ? "They skipped the guided solve and went straight to solving blind." : "They did a guided solve with the reference visible before solving blind."}
- Last test run: ${describeRun(req.run)}

Their final ${p.kind === "sql" ? "query" : "code"}:
${req.code.trim() || "(nothing written)"}

Transcript (speech recognition, so ignore small transcription errors and filler words):
${transcript || "(The candidate didn't say anything.)"}

Score each of these five areas from 1 to 5, where 1 is far below the bar, 3 is at the bar for a first-year intern, and 5 is exceptional:
- problemSolving: did they understand the problem, find a correct approach, and get to working code?
- communication: did they restate the problem, ask clarifying questions, and think out loud clearly?
- codeQuality: is the final code correct, readable and idiomatic?
- complexity: did they state and justify time and space complexity correctly?
- edgeCases: did they raise or handle empty input, duplicates, ties, and limits?

Rules:
- Score only what the transcript and code show. If they never mentioned something, that area scores low. Never give credit for things they didn't say or write.
- Each tip is one specific, actionable sentence about THIS interview: quote or point at something they said or wrote, and say exactly what to do next time. No generic advice.
- verdict is one of: "hire", "lean hire", "lean no".
- summary is two or three honest, encouraging sentences, with the single most important fix first.`;
}
