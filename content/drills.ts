/**
 * Timed presentation drills. `say` lines are prompts for what to say on each
 * slide. They are scaffolding: fill in your own facts, and check any SAP
 * product detail before you present it.
 */

export interface Slide {
  title: string;
  /** Bullet prompts for what to say on this slide. */
  say: string[];
}

export interface Drill {
  id: string;
  title: string;
  minutes: number;
  brief: string;
  slides: Slide[];
}

export const DRILLS: Drill[] = [
  {
    id: "sap-ai-healthcare",
    title: "SAP's AI strategy for healthcare",
    minutes: 5,
    brief:
      "Present how SAP's AI approach could help a healthcare organization. Stay on the business side of healthcare, keep product claims high-level, and say clearly when an example is hypothetical. About 50 seconds per slide.",
    slides: [
      {
        title: "The problem in healthcare",
        say: [
          "Open with the pressure a hospital or health system is under: rising costs, staff shortages, supply disruptions, heavy administration",
          "Point out that the data is split across many systems, so nobody sees the whole picture",
          "Optional personal hook: ClearBill showed you how hard a hospital bill is to understand",
          "State your one-sentence thesis: AI helps most where it is connected to trusted business data",
        ],
      },
      {
        title: "SAP's approach to AI",
        say: [
          "SAP Business AI: AI built into the applications people already use",
          "Joule is the assistant; Joule agents carry out multi-step tasks",
          "Business Data Cloud brings SAP and non-SAP data together so the AI has something reliable to work from",
          "Keep it to these three ideas. Do not list features you cannot explain",
        ],
      },
      {
        title: "Where it fits in a health organization",
        say: [
          "SAP typically runs the business side: finance, supply chain, procurement, workforce. Clinical records usually live in separate systems",
          "Pick two areas and say what AI could do in each, for example forecasting supply needs or reducing manual invoice work",
          "Say who benefits in each case: a buyer, a finance analyst, an HR planner",
          "Label examples as illustrations, not as things a named customer has done",
        ],
      },
      {
        title: "One scenario, start to finish",
        say: [
          "Walk through a single hypothetical: a critical supply is running low",
          "What the system notices, what the assistant or agent proposes, what the human approves",
          "Name the data it needed and where that data came from",
          "End with the outcome for staff and, indirectly, for patients",
        ],
      },
      {
        title: "Risks and responsible use",
        say: [
          "Health data is highly sensitive and regulated (in the US, HIPAA). Access control and audit trails come first",
          "A human stays in the loop for decisions that affect care or money",
          "AI can be confidently wrong: say how outputs are checked, as you did by verifying model output in Tide",
          "This is the slide where your cybersecurity focus should show",
        ],
      },
      {
        title: "Recommendation and close",
        say: [
          "Recommend a starting point: one narrow, measurable use case before anything broad",
          "Name the metric you would track: time saved, stock-outs avoided, errors reduced",
          "Restate the thesis in one sentence",
          "Invite questions, and be ready to say 'I do not know, here is how I would find out'",
        ],
      },
    ],
  },
  {
    id: "project-walkthrough",
    title: "Project walkthrough: Tide",
    minutes: 4,
    brief:
      "Walk an interviewer through one project in four minutes. Tide is the default; the same five slides work for ReMindMap or ClearBill. Say 'I' for your own work and give your reasons for every tool.",
    slides: [
      {
        title: "Problem",
        say: [
          "Who has the problem and when: one sentence, one named user",
          "Why existing options fall short for that person",
          "The setting: OwlHacks, September 2026, with your team size and time limit",
          "Keep this under 30 seconds",
        ],
      },
      {
        title: "What I built",
        say: [
          "What the app does in one sentence: one photo in, species and conservation card out",
          "The part you personally built, stated with 'I'",
          "The stack in one breath: Next.js, TypeScript, Gemini API, four public data APIs, Vercel",
          "Show or describe one screen",
        ],
      },
      {
        title: "How it works",
        say: [
          "Trace one request from photo upload to rendered card",
          "Where Gemini is called and what it returns, including the confidence score",
          "How the result is checked against GBIF and the IUCN Red List",
          "How the four data sources are combined, and what happens when one fails",
        ],
      },
      {
        title: "Hardest decision",
        say: [
          "Pick one decision, for example an existing AI API vs your own model, or how much to trust the model's answer",
          'Use the formula: "I chose X because Y. I considered Z, but..."',
          "Name the trade-off you accepted",
          "Say what you would decide differently with more time",
        ],
      },
      {
        title: "Result and what is next",
        say: [
          "The result exactly as printed on your resume: 2nd Place at OwlHacks, and out of how many teams",
          "One limitation you know about",
          "The next two things you would build or measure",
          "One sentence on what the project taught you that you would bring to SAP",
        ],
      },
    ],
  },
  {
    id: "sales-case",
    title: "Group sales case framework",
    minutes: 5,
    brief:
      "A structure for a group case where your team recommends an SAP solution to a customer. Use only the facts in the case packet, state your assumptions out loud, and split the slides so every teammate speaks.",
    slides: [
      {
        title: "Customer",
        say: [
          "Who the customer is: industry, size, what they sell, taken from the case",
          "Who you are presenting to (a CFO, a CIO, an operations lead) and what that person cares about",
          "Their goal in one sentence",
          "State any assumptions you had to make",
        ],
      },
      {
        title: "Pain points",
        say: [
          "The two or three biggest problems, ranked",
          "For each: the evidence from the case and who feels it",
          "What it costs them today in time, money or risk, using case numbers only",
          "The root cause they share, if there is one, such as disconnected systems or poor data",
        ],
      },
      {
        title: "SAP solution",
        say: [
          "Map each pain point to one part of the solution. Do not list products without a reason",
          "Stay at the level you can defend: cloud ERP for core processes, BTP to connect and extend, Business Data Cloud for data, Joule for AI assistance",
          "Describe what a user's day looks like after the change",
          "Say what you left out and why",
        ],
      },
      {
        title: "Value",
        say: [
          "The benefit in the customer's own terms: revenue, cost, speed, risk",
          "One or two metrics they could track, with a clearly labeled estimate if the case gives you numbers",
          "Why this beats doing nothing or patching the current systems",
          "Tie the value back to the goal from the first slide",
        ],
      },
      {
        title: "Rollout and risks",
        say: [
          "Phases: start with the most painful area, prove value, then expand",
          "A rough timeline and who needs to be involved on the customer side",
          "The top risks (data migration, user adoption, cost, security) and one mitigation for each",
          "Close with a clear ask or next step, then hand to questions",
        ],
      },
    ],
  },
];
