import { defineCards } from "@/lib/content/types";

/**
 * Consistency cards: every place the resume SAP holds (old) differs from the
 * current one (new), or where reality has moved past both. keyPoints say how
 * to talk so the two versions never contradict each other.
 */

const VERSIONS = "Old vs new resume";
const BEYOND = "Beyond both resumes";

export default defineCards([
  {
    id: "cons-dfg-new-only",
    track: "consistency",
    group: VERSIONS,
    source: "Student Design Manager, Develop for Good (Fellow), Remote, Oct 2026 – Feb 2027",
    kind: "consistency",
    question:
      "The interviewer is reading the resume you applied with. Your Develop for Good role is not on it. How do you bring it up?",
    keyPoints: [
      "Bring printed copies of the current resume and offer one at the start: 'I have an updated copy; one role was added since I applied'",
      "Say what changed in one sentence: one new experience entry at the top, everything else identical",
      "Raise it yourself early (in 'tell me about yourself' or 'anything new since you applied'), not as a correction in the middle of a question",
      "Never imply it was on the version they have. 'This started after I applied' is the honest framing",
      "Then describe the role in present tense: you co-manage a nonprofit website redesign",
    ],
  },
  {
    id: "cons-dfg-end-date",
    track: "consistency",
    group: VERSIONS,
    source: "Student Design Manager, Develop for Good (Fellow), Remote, Oct 2026 – Feb 2027",
    kind: "consistency",
    question: "Your new resume lists Develop for Good as Oct 2026 – Feb 2027. February has not happened. How do you say it?",
    keyPoints: [
      "Say 'current role, started in October, and the project is scheduled to run through February'",
      "Use present tense for what you are doing and future tense for what is planned",
      "Do not describe launch, results or finished deliverables that do not exist yet",
      "Be able to split the work into done, in progress and planned",
      "If asked about the schedule alongside STAR, say plainly when the commitment ends",
    ],
  },
  {
    id: "cons-current-title",
    track: "consistency",
    group: VERSIONS,
    source: "Product Management Extern, BeReal (via Extern), Remote, Sep 2026 – Oct 2026",
    kind: "consistency",
    question:
      "The most recent title SAP sees is 'Product Management Extern'. Yours is now 'Student Design Manager'. How do you introduce your current role?",
    keyPoints: [
      "Lead with what is true today: 'Right now I am a Student Design Manager with Develop for Good; before that I finished a product management externship on a BeReal project'",
      "Say that the externship ended in October so nobody thinks it is ongoing",
      "Keep both titles exactly as written. Do not merge them into a title that is on neither resume",
      "Explain the thread between them: product thinking, then leading design work",
      "Then steer to engineering: your projects are the evidence for a technical role",
    ],
  },
  {
    id: "cons-clearbill-no-date",
    track: "consistency",
    group: VERSIONS,
    source: "ClearBill – Hospital Bill Analyzer",
    kind: "consistency",
    question: "ClearBill has no date on either resume version. What do you say when asked when you built it?",
    keyPoints: [
      "Decide the answer before the interview: month and year started, and whether it is finished",
      "Give that same answer every time, to every interviewer",
      "Place it on your timeline relative to ReMindMap (Dec 2025) and Tide (Sep 2026)",
      "If it is unfinished or not deployed, say so first rather than being asked",
      "Do not explain the missing date as an oversight if the real reason is that the project is ongoing",
    ],
  },
  {
    id: "cons-same-numbers",
    track: "consistency",
    group: VERSIONS,
    kind: "consistency",
    question:
      "Everything except the Develop for Good entry is identical on both versions. Which numbers must you say exactly as printed?",
    keyPoints: [
      "2nd Place at OwlHacks, not 'we placed' or 'we won'",
      "4 public APIs: GBIF, IUCN, NOAA, Wikimedia (Gemini is separate)",
      "Top 85 of 1,000+ at Student HackPad",
      "Dates: BeReal Sep to Oct 2026, Chipotle Apr to Aug 2026, Chick-fil-A Jul 2024 to Mar 2026, graduation May 2030",
      "If you round or rephrase a number out loud, the interviewer will compare it with the page. Use the printed wording",
    ],
  },
  {
    id: "cons-research-on-neither",
    track: "consistency",
    group: BEYOND,
    source: "Participating in undergraduate research",
    kind: "consistency",
    question:
      "Both resumes only say 'participating in undergraduate research'. You have since started HCI research on AAC. How do you describe it accurately?",
    keyPoints: [
      "Connect it to the line they can see: 'The research mentioned under activities is now an HCI project on AAC'",
      "Define the terms: HCI is human-computer interaction; AAC is augmentative and alternative communication, tools that help people who cannot rely on speech to communicate",
      "State your actual role and start date, and who you work with",
      "Say what stage it is at. Do not imply results, a paper, or a larger role than you have",
      "If the resume line was written before you had a project, say that: 'When I applied I had just joined; now I can tell you what it is'",
    ],
  },
  {
    id: "cons-what-changed",
    track: "consistency",
    group: BEYOND,
    kind: "consistency",
    question: "'What has changed since you applied?' Give the complete answer in 30 seconds.",
    keyPoints: [
      "Two things, in this order: the Develop for Good design manager role, and the HCI research on AAC becoming a concrete project",
      "If the BeReal externship was still running when you applied, say that it has now finished",
      "Activities are unchanged: still listed as Aug 2026 to present",
      "Nothing else on the page has changed. Say so, so the interviewer trusts the copy in front of them",
      "Offer the updated resume once, then move on",
    ],
  },
]);
