import { defineCards } from "@/lib/content/types";

/**
 * Resume defence cards: one group per resume entry, 2-4 cards per line.
 * keyPoints are a checklist of what a strong answer contains. They never
 * supply the facts for you; fill those in from what you actually did.
 */

const FORMULA = 'Use the formula: "I chose X because Y. I considered Z, but..."';

/* Groups */
const EDU = "Education";
const SKILLS = "Skills";
const DFG = "Develop for Good – Student Design Manager";
const BEREAL = "BeReal – Product Management Extern";
const CHIPOTLE = "Chipotle – Team Member";
const CFA = "Chick-fil-A – Team Member / Trainer";
const TIDE = "Tide – Marine Species Identifier";
const RMM = "ReMindMap – AI Mind Mapping";
const CB = "ClearBill – Hospital Bill Analyzer";
const ACT = "Activities";
const CERT = "Certifications";

/* Resume lines */
const EDU_DEGREE = "Temple University, B.S. Computer Science, expected May 2030";
const EDU_FOCUS = "Focus: Cybersecurity, Cloud Security, Network Defense, AI Applications";

const SK_LANGS = "Programming Languages: Python, Java, JavaScript, TypeScript, SQL, HTML, CSS, Bash";
const SK_FRAMEWORKS = "Frameworks & Libraries: React.js, Next.js, Node.js, Flask, TensorFlow, Tailwind CSS";
const SK_TOOLS =
  "Tools & Technologies: Kali Linux, Wireshark, Docker, Google Cloud Platform, Linux, REST APIs, Firebase, Git, Stripe, Postman";
const SK_SPOKEN = "Languages: English, Spanish (Intermediate/Conversational)";

const DFG_HEAD = "Student Design Manager, Develop for Good (Fellow), Remote, Oct 2026 – Feb 2027";
const DFG_B1 = "Co-manage a WordPress website redesign for ASHwell Sexual Health and Wellness, an Austin nonprofit";
const DFG_B2 =
  "Define and delegate design work in Figma: information architecture, visual design to the brand guide, and usability testing";
const DFG_B3 =
  "Plan an events calendar, clearer navigation, and editing templates so nonprofit staff can run the site after launch";

const BR_HEAD = "Product Management Extern, BeReal (via Extern), Remote, Sep 2026 – Oct 2026";
const BR_B1 =
  "Designed and prototyped a new social feature in Replit and Canva to grow BeReal's monthly active users (MAUs)";
const BR_B2 =
  "Mapped the user journey to find friction and drop-off; benchmarked TikTok, Instagram, and Snapchat for engagement gaps";
const BR_B3 =
  "Ran peer usability tests, synthesized feedback, and pitched the feature and rollout plan in a stakeholder deck";

const CH_HEAD = "Team Member, Chipotle Mexican Grill, Barrington NJ, Apr 2026 – Aug 2026";
const CH_B1 =
  "Prepared food efficiently in a high-volume kitchen while upholding food safety and cleanliness standards";
const CH_B2 =
  "Collaborated with team members to deliver fast, accurate service and a positive customer experience";

const CFA_HEAD =
  "Team Member / Trainer, Chick-fil-A Clara Barton Service Plaza, Pedricktown NJ, Jul 2024 – Mar 2026";
const CFA_B1 = "Trained new team members on front-of-house and back-of-house operations";
const CFA_B2 =
  "Excelled in customer service and order accuracy while maintaining a high-performing environment";

const TIDE_HEAD = "Tide – Marine Species Identifier | 2nd Place, OwlHacks | Sep 2026";
const TIDE_B1 =
  "Built a Next.js + TypeScript app that identifies sea creatures from one photo with conservation and sustainability data";
const TIDE_B2 =
  "Implemented confidence-scored species ID via the Google Gemini API, verified against GBIF and the IUCN Red List";
const TIDE_B3 =
  "Unified 4 public APIs (GBIF, IUCN, NOAA, Wikimedia) into conservation cards and sustainable alternatives on Vercel";

const RMM_HEAD = "ReMindMap – AI Mind Mapping | Top 85 of 1,000+, Student HackPad | Dec 2025";
const RMM_B1 =
  "Built an offline-first PWA (Next.js, TypeScript) with a drag-and-drop HTML5 Canvas mind map and recurring reminders";
const RMM_B2 =
  "Wrote client-side algorithms for deadline risk prediction and conflict detection, storing data locally with IndexedDB";

const CB_HEAD = "ClearBill – Hospital Bill Analyzer";
const CB_B1 =
  "Developed a full-stack web app (React, Python/Flask, SQL) that analyzes hospital bills to detect overcharges";
const CB_B2 = "Integrated Stripe for secure payments and Firebase for authentication and data storage";

const ACT_ORGS = "Member of HASA, NSBE, ACM-W, RHA Community Council at Temple (Aug 2026 – Present)";
const ACT_RESEARCH = "Participating in undergraduate research";

const CERT_GCYBER = "Google Cybersecurity Professional Certificate";
const CERT_SUPPORT = "Google Technical Support Fundamentals";
const CERT_THM = "TryHackMe SOC Level 1";
const CERT_ALL =
  "Certifications: Google Cybersecurity Professional Certificate; Google Technical Support Fundamentals; TryHackMe SOC Level 1";

export default defineCards([
  /* ───────────────────────── Education ───────────────────────── */
  {
    id: "res-edu-grad-date",
    track: "resume",
    group: EDU,
    source: EDU_DEGREE,
    kind: "number",
    question:
      "Your resume says expected May 2030. What year are you, and how does that timeline fit a multi-year program like STAR?",
    keyPoints: [
      "State your year and start term plainly: first-year, started fall 2026",
      "Do the math out loud: four years from fall 2026 lands on May 2030",
      "Turn it into a strength: you can stay in a multi-year rotation longer than an upperclassman could",
      "If transfer or AP credits could move graduation earlier, say so now so the date never surprises anyone",
    ],
  },
  {
    id: "res-edu-why-cs-temple",
    track: "resume",
    group: EDU,
    source: EDU_DEGREE,
    kind: "why",
    question: "Why computer science, and why Temple?",
    keyPoints: [
      "Give one concrete moment that pulled you into CS, not 'I always liked computers'",
      "Name one thing Temple specifically gives you (a course, a lab, a club, location, cost)",
      "Say what you considered instead (another major or school) and why you did not pick it",
      "Connect it forward: what you want to be able to build or secure by graduation",
      "Keep it under 45 seconds",
    ],
  },
  {
    id: "res-edu-coursework",
    track: "resume",
    group: EDU,
    source: EDU_DEGREE,
    kind: "individual",
    question:
      "You are in your first semester. Which CS courses are you taking right now, and what have you written in them?",
    keyPoints: [
      "Name the courses by their real titles and the language each uses",
      "Describe one assignment you wrote yourself",
      "Be honest that most of your project work is self-taught outside class, then say how you learn",
      "Do not claim a course you have not taken (data structures, algorithms); say when you will take it",
    ],
  },
  {
    id: "res-edu-focus-vs-projects",
    track: "resume",
    group: EDU,
    source: EDU_FOCUS,
    kind: "why",
    question: "Your focus is cybersecurity but your projects are web apps. Why SAP, and why this role?",
    keyPoints: [
      "Do not apologize for the gap. Explain it: you study security through certificates and labs, and you learn to ship through web projects",
      "Bridge the two with one security decision you actually made inside a project (where API keys live in Tide, how ClearBill handles login and card data)",
      "Why SAP: enterprise software holds the finance, HR and supply chain data of large companies, so security and cloud are part of every product",
      "Why STAR: rotations let you try security, cloud and AI teams before you specialize",
      "End with what you want to learn, not only what you offer",
    ],
  },
  {
    id: "res-edu-focus-evidence",
    track: "resume",
    group: EDU,
    source: EDU_FOCUS,
    kind: "individual",
    question:
      "You list four focus areas: Cybersecurity, Cloud Security, Network Defense, AI Applications. What have you personally done in each?",
    keyPoints: [
      "Give one piece of evidence per area: a certificate, a lab, a project",
      "Cloud Security is the hardest to back up. Say exactly what you have done on a cloud platform and what you have only studied",
      "AI Applications: point to Tide and the Gemini API, and say which part you wrote",
      "If an area is an interest rather than experience, call it an interest",
    ],
  },
  {
    id: "res-edu-focus-official",
    track: "resume",
    group: EDU,
    source: EDU_FOCUS,
    kind: "number",
    question: "Is 'Focus' an official concentration at Temple, or your own description of your interests?",
    keyPoints: [
      "Answer directly: a declared track, a planned one, or self-directed",
      "If self-directed, say what backs it: the three certificates and what you are studying next",
      "Never let the interviewer believe it is an official program if it is not",
      "Four areas is a lot for a first-year: say which one you would pick if you had to choose today",
    ],
  },

  /* ───────────────────────── Skills ───────────────────────── */
  {
    id: "res-skills-tensorflow",
    track: "resume",
    group: SKILLS,
    source: SK_FRAMEWORKS,
    kind: "individual",
    question: "You list TensorFlow. Where did you use it?",
    keyPoints: [
      "Name the exact place: a project, a course, a tutorial, and what you trained or ran",
      "None of your three listed projects mention TensorFlow, so say that first instead of letting them find it",
      "Be able to explain a tensor, a layer, and what model.fit does",
      "If it was tutorial-level, say 'I trained a small model following X'. Do not stretch it",
      "Link to Tide: explain why you called Gemini there instead of training a TensorFlow model",
    ],
  },
  {
    id: "res-skills-top-three",
    track: "resume",
    group: SKILLS,
    source: SK_LANGS,
    kind: "number",
    question: "You list 8 programming languages. Rank your top three by how much real code you have written in each.",
    keyPoints: [
      "Rank them honestly and name the project behind each",
      "Name the weakest of the eight and where you have used it",
      "HTML and CSS are markup and styling languages, not programming languages. Acknowledge that if pressed",
      "Java does not appear in any listed project: say where you have written it",
      "Offer to write code on the spot in your strongest one",
    ],
  },
  {
    id: "res-skills-docker-gcp",
    track: "resume",
    group: SKILLS,
    source: SK_TOOLS,
    kind: "individual",
    question:
      "Docker and Google Cloud Platform are on your skills list but in none of your project bullets. Where did you use them?",
    keyPoints: [
      "Say what you actually ran: a container you built, a service you deployed, a lab",
      "Firebase and the Gemini API are Google products. If that is your GCP experience, say exactly that",
      "Know the basics cold: image vs container, what a Dockerfile is",
      "If it is lab-level, say so and say what you want to do with it next",
    ],
  },
  {
    id: "res-skills-kali-wireshark",
    track: "resume",
    group: SKILLS,
    source: SK_TOOLS,
    kind: "individual",
    question: "Kali Linux and Wireshark: tell me about one time you actually used them.",
    keyPoints: [
      "Name the setting: a certificate lab, a TryHackMe room, a home lab",
      "Describe one concrete task: what you captured or scanned and what you found",
      "Say that you only use these tools on systems you are authorized to test",
      "Name one Wireshark display filter you have typed yourself",
    ],
  },
  {
    id: "res-skills-spanish-level",
    track: "resume",
    group: SKILLS,
    source: SK_SPOKEN,
    kind: "number",
    question: "Spanish, 'Intermediate/Conversational'. What does that level mean for you in practice?",
    keyPoints: [
      "Say how you learned it and how often you use it",
      "Be ready to answer a simple question in Spanish on the spot",
      "Do not upgrade it to fluent. Say what you can do: hold a conversation, not write a technical document",
      "Mention where it has been useful (customers at work, family, community) if that is true",
    ],
  },

  /* ─────────────── Develop for Good (new resume only) ─────────────── */
  {
    id: "res-dfg-role",
    track: "resume",
    group: DFG,
    source: DFG_HEAD,
    kind: "individual",
    versions: ["new"],
    question: "What is Develop for Good, and what does a Student Design Manager do there day to day?",
    keyPoints: [
      "Explain the organization in one sentence: students working on real projects for nonprofit clients",
      "Explain what 'Fellow' means in their program",
      "Describe your week: the meetings you run and the decisions you own",
      "Say who you report to and who looks to you for direction",
    ],
  },
  {
    id: "res-dfg-dates",
    track: "resume",
    group: DFG,
    source: DFG_HEAD,
    kind: "number",
    versions: ["new"],
    question:
      "The role runs Oct 2026 to Feb 2027. You are only weeks in. What is done, and what is still planned?",
    keyPoints: [
      "Say 'current role, started in October'. February 2027 is the planned project end",
      "Split it into three lists: finished, in progress, not started",
      "Use present tense for ongoing work and never past tense for things that have not happened",
      "Give the next milestone and its date",
    ],
  },
  {
    id: "res-dfg-design-vs-tech",
    track: "resume",
    group: DFG,
    source: DFG_HEAD,
    kind: "why",
    versions: ["new"],
    question: "Your newest role is design management, not engineering. Why should a technical program pick you?",
    keyPoints: [
      "Do not get defensive: you build (three projects) and you manage design",
      "Say what this role teaches that code does not: scoping, delegating, talking to a client",
      "Point back to code: Tide and ReMindMap are your engineering evidence",
      "Tie to STAR: rotations reward people who can work across product, design and engineering",
    ],
  },
  {
    id: "res-dfg-comanage",
    track: "resume",
    group: DFG,
    source: DFG_B1,
    kind: "individual",
    versions: ["new"],
    question: "'Co-manage': who is the other manager, how big is the team, and what is yours alone?",
    keyPoints: [
      "Give the real team size and roles, even if the team is small",
      "Name how responsibility is split between you and your co-manager",
      "Name one decision that was yours",
      "Use 'I' for your part and 'we' only for what was joint",
    ],
  },
  {
    id: "res-dfg-wordpress",
    track: "resume",
    group: DFG,
    source: DFG_B1,
    kind: "why",
    versions: ["new"],
    question: "Why WordPress for the redesign instead of a custom Next.js site, which you know how to build?",
    keyPoints: [
      "Say whether WordPress was the client's existing platform or a choice the team made",
      "The core reason either way: non-technical staff must edit pages after you leave, and WordPress gives them an editor, not a codebase",
      "Admit the trade-off: less control than custom code, plus plugin and update maintenance",
      "Link to bullet three: templates and handoff are the point of the project",
      FORMULA,
    ],
  },
  {
    id: "res-dfg-sensitive-topic",
    track: "resume",
    group: DFG,
    source: DFG_B1,
    kind: "why",
    versions: ["new"],
    question: "The client is a sexual health nonprofit. How does the subject change your design decisions?",
    keyPoints: [
      "Privacy: visitors may not want to be identified, so think about what the site tracks and collects",
      "Plain, non-judgmental, inclusive language and short paths to services",
      "Accessibility: contrast, readable type, mobile first",
      "Say which of these you have already acted on and which are still intentions",
    ],
  },
  {
    id: "res-dfg-figma",
    track: "resume",
    group: DFG,
    source: DFG_B2,
    kind: "why",
    versions: ["new"],
    question: "Why Figma for the design work?",
    keyPoints: [
      "Real-time collaboration: a remote team edits and comments in one file",
      "Components and shared styles keep every screen tied to the brand guide",
      "Clickable prototypes let you run usability tests without writing code",
      "Say what you considered (Canva, which you used at BeReal, or designing directly in WordPress) and why not",
      FORMULA,
    ],
  },
  {
    id: "res-dfg-ia",
    track: "resume",
    group: DFG,
    source: DFG_B2,
    kind: "individual",
    versions: ["new"],
    question: "Define information architecture, then tell me what you did about it on this site.",
    keyPoints: [
      "Definition: how content is organized, grouped and labeled so people can find it (sitemap, navigation, page hierarchy)",
      "Describe the method you used or plan to use: content audit, sitemap, card sorting",
      "Give one specific navigation problem on the current site",
      "Say what is decided and what is still a proposal",
    ],
  },
  {
    id: "res-dfg-delegate",
    track: "resume",
    group: DFG,
    source: DFG_B2,
    kind: "individual",
    versions: ["new"],
    question: "'Define and delegate': give me one task you defined and handed to someone else.",
    keyPoints: [
      "One real task: the deliverable, who took it, the deadline",
      "How you wrote it down so it was unambiguous (a brief, a Figma frame, a ticket)",
      "How you checked the work without redoing it yourself",
      "What you kept for yourself and why",
    ],
  },
  {
    id: "res-dfg-usability",
    track: "resume",
    group: DFG,
    source: DFG_B2,
    kind: "number",
    versions: ["new"],
    question: "How many usability test sessions have you run for this site so far, and with whom?",
    keyPoints: [
      "Be exact on tense: run, scheduled, or only planned. Zero is an acceptable answer if you say what is scheduled",
      "Say who the test users are and how many you are aiming for",
      "Name the tasks you ask them to complete (for example finding an event or a service)",
      "Say what you measure: task success, time, where people get stuck",
    ],
  },
  {
    id: "res-dfg-priorities",
    track: "resume",
    group: DFG,
    source: DFG_B3,
    kind: "why",
    versions: ["new"],
    question:
      "An events calendar, clearer navigation, editing templates. How did you decide those three were the priorities?",
    keyPoints: [
      "Say where the priorities came from: the client brief, staff interviews, an audit of the current site",
      "Name what you chose not to do and why",
      "'Plan' means it is not built yet: say what stage each of the three is at",
      "Say which one you personally own",
    ],
  },
  {
    id: "res-dfg-handoff",
    track: "resume",
    group: DFG,
    source: DFG_B3,
    kind: "why",
    versions: ["new"],
    question: "Why spend effort on editing templates instead of just delivering a finished site?",
    keyPoints: [
      "The site has to outlive the project: staff, not developers, will update it",
      "Templates limit how badly a page can break and keep the brand consistent",
      "Name what staff need to do most often and how a template makes it safe",
      "Enterprise parallel: software is only valuable if the customer can run it after go-live",
    ],
  },

  /* ───────────────────────── BeReal ───────────────────────── */
  {
    id: "res-bereal-via-extern",
    track: "resume",
    group: BEREAL,
    source: BR_HEAD,
    kind: "individual",
    question: "What does 'via Extern' mean? Did you work at BeReal?",
    keyPoints: [
      "Answer in the first sentence and be exact about the relationship: an externship through the Extern platform on a BeReal project, not an employee role",
      "Say who set the brief and who gave you feedback (Extern staff, BeReal staff, or both)",
      "Say whether you worked alone or in a team, and what was yours",
      "Never say 'when I worked at BeReal'",
    ],
  },
  {
    id: "res-bereal-dates",
    track: "resume",
    group: BEREAL,
    source: BR_HEAD,
    kind: "number",
    question: "Sep 2026 to Oct 2026. How many weeks was that, and how many hours a week?",
    keyPoints: [
      "Give the real number of weeks and hours. A short program is fine if you are exact",
      "It overlapped your first semester: say how you managed both",
      "List the deliverables you finished in that time",
      "Do not round a few weeks up to 'a couple of months'",
    ],
  },
  {
    id: "res-bereal-pm-or-eng",
    track: "resume",
    group: BEREAL,
    source: BR_HEAD,
    kind: "why",
    question: "You did a product management externship. Do you want to be a PM or an engineer?",
    keyPoints: [
      "Give a direct answer for the next few years, not 'both'",
      "Say what PM work taught you that makes you a better engineer: start from the user problem and a metric",
      "Tie to STAR: rotations let you test this question on real teams",
      "Do not talk down either path",
    ],
  },
  {
    id: "res-bereal-feature",
    track: "resume",
    group: BEREAL,
    source: BR_B1,
    kind: "individual",
    question: "Describe the feature you designed in two sentences. What problem does it solve, and for which user?",
    keyPoints: [
      "Name the feature and the user it is for",
      "State the problem as a user behavior (opens less often, stops posting), not as 'low engagement'",
      "Say which part was your idea and which was given in the brief",
      "Say how far it got: mockups, a clickable prototype, or working code",
    ],
  },
  {
    id: "res-bereal-maus",
    track: "resume",
    group: BEREAL,
    source: BR_B1,
    kind: "number",
    question: "You say the feature was 'to grow MAUs'. Define MAU. Did MAUs actually grow?",
    keyPoints: [
      "Definition: monthly active users, the unique users who do a qualifying action at least once in a month",
      "Be honest: a prototype cannot move a real company's MAU. Growth was the goal of the design, not a measured result",
      "Explain the chain you argued: the feature gives more reasons to open the app, which improves retention, which raises MAU",
      "Name the metric you would watch first if it shipped (retention, DAU/MAU ratio, posts per user)",
      "If you quoted a BeReal user figure in your deck, know its source and date",
    ],
  },
  {
    id: "res-bereal-replit-canva",
    track: "resume",
    group: BEREAL,
    source: BR_B1,
    kind: "why",
    question: "Why prototype in Replit and Canva rather than Figma?",
    keyPoints: [
      "Say what you made in each tool",
      "Give your real reasons: speed, no setup, a shareable link, tools you already knew",
      "Admit the trade-off: Figma is the standard for interactive UI prototypes. Say whether you have used it since",
      FORMULA,
    ],
  },
  {
    id: "res-bereal-prototype-code",
    track: "resume",
    group: BEREAL,
    source: BR_B1,
    kind: "individual",
    question: "What exactly did you build in Replit? Was it working code?",
    keyPoints: [
      "Name the language or framework and what the prototype could actually do",
      "Separate real from faked: hard-coded data, no backend, no real users",
      "Say how much you wrote by hand and how much Replit's AI tools generated, and what you changed",
      "Explain why a rough prototype was the right fidelity for the test",
    ],
  },
  {
    id: "res-bereal-journey",
    track: "resume",
    group: BEREAL,
    source: BR_B2,
    kind: "individual",
    question: "Walk me through the user journey you mapped. Where was the biggest drop-off, and how did you know?",
    keyPoints: [
      "List the journey stages you used (for example: notification, open, capture, post, browse, return)",
      "Name the single biggest friction point you identified",
      "State your evidence honestly: your own use, peer interviews, public reviews. Not internal BeReal data, unless you had it",
      "Say how your feature addresses that exact point",
    ],
  },
  {
    id: "res-bereal-benchmark",
    track: "resume",
    group: BEREAL,
    source: BR_B2,
    kind: "why",
    question: "Why benchmark TikTok, Instagram, and Snapchat? What did each one teach you?",
    keyPoints: [
      "Why those three: they compete for the same daily attention from the same age group",
      "Name the criteria you compared on (reasons to return, effort to create, social feedback loops)",
      "Give one specific takeaway per app",
      "State the 'engagement gap' you found for BeReal in one sentence",
      "Say what you chose not to copy and why",
    ],
  },
  {
    id: "res-bereal-usability-count",
    track: "resume",
    group: BEREAL,
    source: BR_B3,
    kind: "number",
    question: "How many people were in your peer usability tests, and what changed because of them?",
    keyPoints: [
      "Give the real number of testers, even if it is small",
      "Say who they were and admit the bias: peers are not a representative sample",
      "Describe the tasks you gave them",
      "'Synthesized' means you grouped feedback into themes: name the top theme",
      "Name one change you made because of the feedback",
    ],
  },
  {
    id: "res-bereal-pitch",
    track: "resume",
    group: BEREAL,
    source: BR_B3,
    kind: "individual",
    question: "Who were the stakeholders for your deck, and what happened after the pitch?",
    keyPoints: [
      "Say exactly who saw it: Extern mentors, BeReal employees, peers",
      "Give the structure of the deck: problem, insight, feature, test results, rollout, metrics",
      "State the outcome honestly: feedback, a score, a selection, or nothing further",
      "If it was a team deck, say which slides were your work",
    ],
  },
  {
    id: "res-bereal-rollout",
    track: "resume",
    group: BEREAL,
    source: BR_B3,
    kind: "why",
    question: "What was your rollout plan, and why roll out in stages instead of launching to everyone?",
    keyPoints: [
      "Describe the phases you proposed",
      "Why staged: limit risk, compare against a control group, fix problems before everyone sees them",
      "Name the success metric and the result that would make you stop",
      "Know the vocabulary: A/B test, feature flag, control group",
    ],
  },

  /* ───────────────────────── Chipotle ───────────────────────── */
  {
    id: "res-chipotle-dates",
    track: "resume",
    group: CHIPOTLE,
    source: CH_HEAD,
    kind: "number",
    question:
      "April to August 2026 is five months. Why so short, and why move there right after Chick-fil-A?",
    keyPoints: [
      "Give the plain reason you left in August",
      "Give the plain reason you switched jobs in spring 2026",
      "No complaints about a past employer",
      "Name one thing the second kitchen taught you that the first did not",
    ],
  },
  {
    id: "res-chipotle-why-listed",
    track: "resume",
    group: CHIPOTLE,
    source: CH_HEAD,
    kind: "why",
    question: "Why keep food service jobs on a tech resume?",
    keyPoints: [
      "They are your longest real work experience: showing up, pace, customers, teamwork",
      "You worked while in school. Say what that took",
      "Pick one transferable skill and prove it with one example",
      "Say it without apology",
    ],
  },
  {
    id: "res-chipotle-volume",
    track: "resume",
    group: CHIPOTLE,
    source: CH_B1,
    kind: "number",
    question: "What does 'high-volume' mean in numbers?",
    keyPoints: [
      "Give a figure you can stand behind: orders or customers in a rush hour, people on the line",
      "If you do not know a number, describe the rush concretely instead of guessing",
      "Say which station you worked",
      "Never invent a statistic in the room",
    ],
  },
  {
    id: "res-chipotle-food-safety",
    track: "resume",
    group: CHIPOTLE,
    source: CH_B1,
    kind: "individual",
    question: "Name a food safety standard you personally upheld, and a time it was inconvenient to do so.",
    keyPoints: [
      "Name real practices you followed: temperature checks, glove changes, hand washing, avoiding cross-contamination, cleaning logs",
      "Tell one moment where the rush made a shortcut tempting and you did it right anyway",
      "Connect it to engineering: following a process under pressure is the same habit as testing before you ship",
    ],
  },
  {
    id: "res-chipotle-falling-behind",
    track: "resume",
    group: CHIPOTLE,
    source: CH_B2,
    kind: "individual",
    question: "Tell me about a time the line was falling behind. What did you do?",
    keyPoints: [
      "Set the scene in one sentence: when, how busy",
      "Your action, not the team's: what you said or did",
      "The result for the customer or the shift",
      "What you do differently now",
    ],
  },
  {
    id: "res-chipotle-fast-vs-accurate",
    track: "resume",
    group: CHIPOTLE,
    source: CH_B2,
    kind: "why",
    question: "'Fast, accurate service': when you cannot have both, which do you choose and why?",
    keyPoints: [
      "Pick one and defend it with a real moment from a shift",
      "Say what it cost and how you limited the damage",
      "Carry it over: the same trade-off as shipping quickly vs shipping correctly",
      FORMULA,
    ],
  },

  /* ───────────────────────── Chick-fil-A ───────────────────────── */
  {
    id: "res-cfa-dates",
    track: "resume",
    group: CFA,
    source: CFA_HEAD,
    kind: "number",
    question:
      "Jul 2024 to Mar 2026 is about 20 months, while you were still in school. How many hours a week, and how did you balance it?",
    keyPoints: [
      "Give typical weekly hours during the school year and in summer",
      "Say how you kept up with school",
      "Say why you left in March 2026",
      "Twenty months in one job is evidence of reliability: say so once, briefly",
    ],
  },
  {
    id: "res-cfa-title",
    track: "resume",
    group: CFA,
    source: CFA_HEAD,
    kind: "individual",
    question: "Your title is 'Team Member / Trainer'. When did you become a trainer, and what changed?",
    keyPoints: [
      "Give the month you started training others",
      "Say how you were chosen: asked, applied, certified",
      "Say what you were responsible for as a trainer that you were not before",
      "Be clear whether 'Trainer' was an official title or a duty added to your role",
    ],
  },
  {
    id: "res-cfa-trainee-count",
    track: "resume",
    group: CFA,
    source: CFA_B1,
    kind: "number",
    question: "How many new team members did you train?",
    keyPoints: [
      "Give a real count or an honest range, and the period it covers",
      "If you do not know exactly, say how you estimate it",
      "Name one trainee outcome you are proud of",
    ],
  },
  {
    id: "res-cfa-train-method",
    track: "resume",
    group: CFA,
    source: CFA_B1,
    kind: "individual",
    question: "How do you train someone on their first day? Walk me through your method.",
    keyPoints: [
      "Give your sequence (for example: show, do it together, watch them, give feedback)",
      "Say what you teach first and why",
      "Say how you handle someone who keeps making the same mistake",
      "Say how you know they are ready to work alone",
      "Parallel to SAP: explaining a system to a new user is a daily skill in enterprise software",
    ],
  },
  {
    id: "res-cfa-stations",
    track: "resume",
    group: CFA,
    source: CFA_B1,
    kind: "individual",
    question: "Front-of-house and back-of-house: which stations did you work, and which did you train others on?",
    keyPoints: [
      "List the stations you actually worked",
      "Say which you were strongest at and which you trained",
      "Say what is different about teaching a customer-facing station vs a kitchen one",
    ],
  },
  {
    id: "res-cfa-accuracy",
    track: "resume",
    group: CFA,
    source: CFA_B2,
    kind: "number",
    question: "'Excelled in order accuracy'. How was that measured?",
    keyPoints: [
      "Say whether there was a real metric (accuracy scores, customer surveys, service times) and whether you saw your numbers",
      "If there was no number, give the evidence you do have, such as being made a trainer",
      "Describe your own habit that prevents errors",
      "Do not claim a percentage you cannot source",
    ],
  },
  {
    id: "res-cfa-difficult-customer",
    track: "resume",
    group: CFA,
    source: CFA_B2,
    kind: "individual",
    question: "Tell me about a difficult customer and how you handled it.",
    keyPoints: [
      "What they wanted and why they were upset",
      "Your exact words or action",
      "The outcome",
      "What you learned about staying calm, which matters in client-facing work",
    ],
  },
  {
    id: "res-cfa-high-performing",
    track: "resume",
    group: CFA,
    source: CFA_B2,
    kind: "why",
    question: "'Maintaining a high-performing environment' is vague. What did you personally do to maintain it?",
    keyPoints: [
      "Admit the phrase is general, then make it specific",
      "Name one behavior: covering stations, coaching, holding standards in a rush",
      "Give one example with a result",
      "A highway service plaza gets travel surges: describe what a peak looked like, if that applies",
    ],
  },

  /* ───────────────────────── Tide ───────────────────────── */
  {
    id: "res-tide-second-place",
    track: "resume",
    group: TIDE,
    source: TIDE_HEAD,
    kind: "number",
    question: "2nd Place at OwlHacks. Out of how many teams? Overall, or in a track?",
    keyPoints: [
      "Give the number of teams or participants",
      "Say whether it was overall or a category prize, and name the category",
      "Say what OwlHacks is (Temple's student hackathon) and how many hours it ran",
      "If you do not know the team count, say where it can be checked instead of guessing",
    ],
  },
  {
    id: "res-tide-your-part",
    track: "resume",
    group: TIDE,
    source: TIDE_HEAD,
    kind: "individual",
    question: "Was Tide a solo or team project? What did you personally build?",
    keyPoints: [
      "Team size and each person's area in one sentence",
      "Name the one part you personally built (not 'we')",
      "Name a part you did not build and can only describe at a high level",
      "Be ready to open the repo and point at your commits",
    ],
  },
  {
    id: "res-tide-pitch",
    track: "resume",
    group: TIDE,
    source: TIDE_HEAD,
    kind: "individual",
    question: "Explain Tide in 30 seconds to someone non-technical.",
    keyPoints: [
      "Problem first, in one sentence, for a named user (beachgoer, diver, seafood shopper: whichever you built for)",
      "What it does: one photo in, species and conservation status out",
      "What makes it more than a wrapper around an AI model: checking the answer against scientific databases",
      "End with the result and your own contribution",
    ],
  },
  {
    id: "res-tide-still-live",
    track: "resume",
    group: TIDE,
    source: TIDE_HEAD,
    kind: "number",
    question: "September 2026 was two months ago. Is Tide still live, and has anyone used it since the hackathon?",
    keyPoints: [
      "Know whether the Vercel URL works today. Test it before the interview",
      "Say if any API keys or free tiers have expired",
      "Usage: give real numbers or say 'demo only'",
      "Say what you have changed since the hackathon, if anything",
    ],
  },
  {
    id: "res-tide-nextjs",
    track: "resume",
    group: TIDE,
    source: TIDE_B1,
    kind: "why",
    question: "Why Next.js instead of plain React?",
    keyPoints: [
      "Route handlers run on the server, so API keys can stay out of the browser (confirm that is how your code does it)",
      "File-based routing and one project for frontend and backend: fast for a hackathon",
      "Deploys to Vercel with no configuration",
      "What you could have considered: React with Vite plus a separate Flask or Express server, which means more setup and two deploys",
      FORMULA,
    ],
  },
  {
    id: "res-tide-typescript",
    track: "resume",
    group: TIDE,
    source: TIDE_B1,
    kind: "why",
    question: "Why TypeScript and not plain JavaScript, especially under hackathon time pressure?",
    keyPoints: [
      "Several APIs return different JSON shapes. Types catch a wrong field name before runtime",
      "Editor autocomplete speeds you up more than annotations slow you down",
      "Limit to admit: types are erased at runtime, so API responses still need checking",
      FORMULA,
    ],
  },
  {
    id: "res-tide-request-flow",
    track: "resume",
    group: TIDE,
    source: TIDE_B1,
    kind: "individual",
    question: "What happens, step by step, between the user uploading one photo and seeing a result?",
    keyPoints: [
      "Trace the request: browser, your server route, Gemini, lookups to GBIF, IUCN, NOAA and Wikimedia, then the rendered card",
      "Say how the image is sent and any size limit",
      "Say which calls run in parallel and which must wait for the species name",
      "Say what the user sees while waiting and when something fails",
      "Mark which steps you wrote yourself",
    ],
  },
  {
    id: "res-tide-hardest-decision",
    track: "resume",
    group: TIDE,
    source: TIDE_B1,
    kind: "why",
    question: "What was the hardest technical decision in Tide, and what would you change with one more week?",
    keyPoints: [
      "Pick one decision, not a list",
      "State the options you had and why you chose one. The rationale matters more than the outcome",
      "Admit a limitation in what shipped",
      "Name the next step concretely",
      FORMULA,
    ],
  },
  {
    id: "res-tide-gemini",
    track: "resume",
    group: TIDE,
    source: TIDE_B2,
    kind: "why",
    question: "Why the Gemini API instead of training your own TensorFlow model?",
    keyPoints: [
      "Time: a hackathon is hours; collecting labeled images and training a classifier takes weeks",
      "Coverage: a general multimodal model recognizes far more species than a small custom dataset",
      "Cost and infrastructure: an API call vs GPUs and model hosting",
      "Trade-offs: no control over the model, rate limits, per-call cost, and it can be confidently wrong, which is why you verify",
      "Say whether you considered other vision APIs or a pretrained model",
      FORMULA,
    ],
  },
  {
    id: "res-tide-confidence",
    track: "resume",
    group: TIDE,
    source: TIDE_B2,
    kind: "number",
    question: "What does 'confidence-scored' mean concretely? Where does the number come from?",
    keyPoints: [
      "Say exactly how the score is produced: requested in the prompt and returned by the model, or computed by your code",
      "If it is the model's self-reported number, admit it is not a calibrated probability",
      "Say what the app does at low confidence and what the threshold is",
      "Say whether the GBIF and IUCN check changes the score",
      "Say how you would measure real accuracy: a labeled test set of photos",
    ],
  },
  {
    id: "res-tide-verified",
    track: "resume",
    group: TIDE,
    source: TIDE_B2,
    kind: "individual",
    question: "'Verified against GBIF and the IUCN Red List'. What does the verification actually check?",
    keyPoints: [
      "GBIF is the Global Biodiversity Information Facility, an open database of species names and occurrence records: it can confirm the name is a real, accepted species",
      "The IUCN Red List is the standard source for conservation status, from Least Concern to Critically Endangered",
      "Say exactly what your code does when the name is not found",
      "Be honest about the limit: this proves the species exists, not that the photo shows it",
      "Mark which part you wrote",
    ],
  },
  {
    id: "res-tide-when-wrong",
    track: "resume",
    group: TIDE,
    source: TIDE_B2,
    kind: "individual",
    question: "What happens when Tide gets a species wrong? What is the worst case?",
    keyPoints: [
      "Give a real failure you saw in testing",
      "Name the worst case: a threatened or dangerous species identified as something else",
      "Say what the app shows to reduce harm: the score, alternatives, source links",
      "Say what you would add next: a test set, a way for users to report errors",
    ],
  },
  {
    id: "res-tide-four-apis",
    track: "resume",
    group: TIDE,
    source: TIDE_B3,
    kind: "number",
    question: "Give the real count behind '4 public APIs' and name each. Is Gemini a fifth?",
    keyPoints: [
      "Name all four and what you take from each: GBIF, IUCN, NOAA, Wikimedia",
      "Gemini is a separate AI service on top of the four data sources, so five external services in total. Say it before they count",
      "Say which NOAA dataset and which Wikimedia API you call",
      "Say which ones need an API key and where the keys are stored",
    ],
  },
  {
    id: "res-tide-unified",
    track: "resume",
    group: TIDE,
    source: TIDE_B3,
    kind: "individual",
    question: "'Unified' four APIs. What was hard about combining them, and which part did you write?",
    keyPoints: [
      "Different identifiers: common names, scientific names, taxon keys. Say how you matched records",
      "Different response shapes mapped into one card type",
      "Failure handling: what the card shows when one source is down or has no data",
      "Rate limits and latency: parallel calls, caching if any",
      "Name the piece you personally wrote",
    ],
  },
  {
    id: "res-tide-alternatives",
    track: "resume",
    group: TIDE,
    source: TIDE_B3,
    kind: "individual",
    question: "What are 'sustainable alternatives', and how does the app decide what to suggest?",
    keyPoints: [
      "Define it in your app's own terms",
      "Say where the suggestion comes from: NOAA data, the model, or a hand-written list",
      "Be honest if it is generated text rather than sourced data",
      "Say how you would validate it against an expert source",
    ],
  },
  {
    id: "res-tide-vercel",
    track: "resume",
    group: TIDE,
    source: TIDE_B3,
    kind: "why",
    question: "Why deploy on Vercel?",
    keyPoints: [
      "Made by the team behind Next.js: deploys from a Git push with no configuration",
      "Server routes run as serverless functions, with secrets held in environment variables",
      "A preview URL for every branch, useful for judges and teammates",
      "Trade-offs: function time limits, cold starts, free-tier limits, dependence on one vendor",
      "What you could have considered: Netlify, Firebase Hosting, a cloud VM",
      FORMULA,
    ],
  },

  /* ───────────────────────── ReMindMap ───────────────────────── */
  {
    id: "res-rmm-top-85",
    track: "resume",
    group: RMM,
    source: RMM_HEAD,
    kind: "number",
    question: "Top 85 of 1,000+. 1,000 what? And is 'Top 85' an official ranking?",
    keyPoints: [
      "Say whether 1,000+ counts participants, teams, or submissions",
      "Say whether Top 85 is a published tier (a finalist list) or your individual rank",
      "Do the math: roughly the top 8.5 percent if the base is 1,000",
      "Know where the result is published so it can be checked",
      "Explain what Student HackPad is in one sentence",
    ],
  },
  {
    id: "res-rmm-date",
    track: "resume",
    group: RMM,
    source: RMM_HEAD,
    kind: "number",
    question: "December 2025 is before you started at Temple. How did you learn to build this?",
    keyPoints: [
      "Confirm the timeline plainly",
      "Say how you taught yourself: resources, earlier projects",
      "Say how long the build took",
      "Say what you would do better now",
    ],
  },
  {
    id: "res-rmm-where-is-ai",
    track: "resume",
    group: RMM,
    source: RMM_HEAD,
    kind: "individual",
    question: "The title says 'AI Mind Mapping'. Where is the AI?",
    keyPoints: [
      "Answer precisely: name the AI feature, or say the 'AI' is the prediction and conflict logic",
      "If it is rule-based, say so. Do not call rules machine learning",
      "If an LLM API is involved, say which one, for what, and how that fits 'offline-first'",
      "Offer the more accurate label yourself before they push",
    ],
  },
  {
    id: "res-rmm-your-part",
    track: "resume",
    group: RMM,
    source: RMM_HEAD,
    kind: "individual",
    question: "Solo or team on ReMindMap? Which parts are your code?",
    keyPoints: [
      "Say solo or team in the first sentence",
      "Name the part you would be happiest to walk through line by line",
      "Say what came from a library, a template or an AI assistant, and what you changed",
      "Be ready to open the repo",
    ],
  },
  {
    id: "res-rmm-offline-first",
    track: "resume",
    group: RMM,
    source: RMM_B1,
    kind: "why",
    question: "Why offline-first? What does that mean technically?",
    keyPoints: [
      "Definition: the app works with no network, and local data is the source of truth",
      "PWA pieces: a service worker caches the app shell; a web app manifest makes it installable",
      "Why for this app: your reason (works anywhere, no account, privacy, no server cost)",
      "Trade-off: no sync across devices, and data is lost if browser storage is cleared",
      "What you could have considered: a cloud backend such as Firebase",
      FORMULA,
    ],
  },
  {
    id: "res-rmm-canvas",
    track: "resume",
    group: RMM,
    source: RMM_B1,
    kind: "why",
    question: "Why HTML5 Canvas for the mind map instead of SVG or DOM elements?",
    keyPoints: [
      "Canvas draws pixels in one element and stays fast with many nodes and lines",
      "SVG and DOM give each node its own element with built-in events and accessibility, but slow down as elements grow",
      "The cost of Canvas you had to pay: your own hit-testing, redraw loop and drag logic",
      "Say whether you considered a library (React Flow, D3, Konva) and why you did not use one",
      FORMULA,
    ],
  },
  {
    id: "res-rmm-drag-drop",
    track: "resume",
    group: RMM,
    source: RMM_B1,
    kind: "individual",
    question: "How does drag-and-drop work on a Canvas, where there are no elements to click?",
    keyPoints: [
      "Pointer down: convert the pointer position to canvas coordinates and test which node contains it (hit-testing)",
      "Pointer move: update that node's x and y and redraw",
      "Pointer up: save the new position",
      "Mention pan, zoom and touch support only if you built them",
      "Describe it in terms of your own code, not the general idea",
    ],
  },
  {
    id: "res-rmm-reminders",
    track: "resume",
    group: RMM,
    source: RMM_B1,
    kind: "individual",
    question: "How do recurring reminders fire in an offline app, including when the tab is closed?",
    keyPoints: [
      "Say how recurrence is stored and how the next occurrence is computed",
      "Say what triggers the alert: a timer while the app is open, the Notifications API",
      "Be honest about the web's limit: without a push server, a closed PWA cannot reliably wake itself",
      "Say what you would add to fix that",
    ],
  },
  {
    id: "res-rmm-risk-prediction",
    track: "resume",
    group: RMM,
    source: RMM_B2,
    kind: "number",
    question: "What is 'deadline risk prediction'? Is it machine learning or rules?",
    keyPoints: [
      "Say which in the first sentence: a rule-based score or a trained model",
      "List the inputs (for example time remaining, estimated effort, overlapping tasks)",
      "Give the formula or thresholds in plain words",
      "'Prediction' implies accuracy: say whether you ever checked it against real outcomes",
      "If it is rules, say why rules fit: no training data, explainable, runs offline",
    ],
  },
  {
    id: "res-rmm-conflict-detection",
    track: "resume",
    group: RMM,
    source: RMM_B2,
    kind: "individual",
    question: "How does your conflict detection work, and what is its time complexity?",
    keyPoints: [
      "Define a conflict in your app's terms",
      "Standard overlap test: A starts before B ends and B starts before A ends",
      "Comparing every pair is O(n^2); sorting by start time and scanning is O(n log n)",
      "Say which one you implemented and why it was acceptable at your data size",
    ],
  },
  {
    id: "res-rmm-indexeddb",
    track: "resume",
    group: RMM,
    source: RMM_B2,
    kind: "why",
    question: "Why IndexedDB instead of localStorage?",
    keyPoints: [
      "localStorage is synchronous, stores only strings, and holds about 5 MB: fine for a setting, wrong for a growing data set",
      "IndexedDB is asynchronous, stores structured objects, has a much larger quota, supports indexes and transactions, and works inside a service worker",
      "Trade-off: a clumsier API. Say whether you used a wrapper library",
      "Describe your object stores: what one record looks like",
      FORMULA,
    ],
  },
  {
    id: "res-rmm-client-side",
    track: "resume",
    group: RMM,
    source: RMM_B2,
    kind: "why",
    question: "Why run the algorithms client-side instead of on a server?",
    keyPoints: [
      "Offline-first requires it: no network, no server call",
      "Privacy: personal schedules never leave the device",
      "No server cost and no network latency",
      "Trade-off: limited to one device's data, and harder to update logic for everyone",
      FORMULA,
    ],
  },

  /* ───────────────────────── ClearBill ───────────────────────── */
  {
    id: "res-cb-no-date",
    track: "resume",
    group: CB,
    source: CB_HEAD,
    kind: "number",
    question: "ClearBill has no date. When did you build it, and is it live?",
    keyPoints: [
      "Give the month and year, and how long it took",
      "Say whether it is deployed, runs only locally, or is unfinished",
      "Explain why it has no date or award: it was not a hackathon entry, if that is the reason",
      "Have the repo or a demo ready to show",
      "Give the same date every time you are asked",
    ],
  },
  {
    id: "res-cb-your-part",
    track: "resume",
    group: CB,
    source: CB_HEAD,
    kind: "individual",
    question: "Was ClearBill solo or a team project? Which layer did you write: React, Flask, or the database?",
    keyPoints: [
      "Say solo or team in the first sentence",
      "Name the layer you know best and the one you know least",
      "Say what came from tutorials, templates or AI assistance, and what you changed",
      "Say why you built it: where the idea came from",
    ],
  },
  {
    id: "res-cb-detect-overcharge",
    track: "resume",
    group: CB,
    source: CB_B1,
    kind: "individual",
    question: "How does it actually detect an overcharge?",
    keyPoints: [
      "Describe the input: typed line items, an uploaded PDF, or a photo, and how it is parsed",
      "Name the reference you compare against (a price list, public rate data, duplicate-charge rules)",
      "State the rule: what makes a line count as an overcharge",
      "Be honest about accuracy and how many real bills you tested",
      "If part of this is planned rather than built, say so",
    ],
  },
  {
    id: "res-cb-how-many-bills",
    track: "resume",
    group: CB,
    source: CB_B1,
    kind: "number",
    question: "How many bills has ClearBill analyzed, and how do you know its flags are right?",
    keyPoints: [
      "Give the real count of test bills and whether they were real or sample data",
      "Say how you checked that a flag was a true overcharge",
      "False positives matter: wrongly telling someone they were overcharged has a cost",
      "Do not quote a savings figure you cannot source",
    ],
  },
  {
    id: "res-cb-flask",
    track: "resume",
    group: CB,
    source: CB_B1,
    kind: "why",
    question: "Why Flask for the backend instead of Node, when you already write JavaScript?",
    keyPoints: [
      "Python is strong for parsing and analyzing data such as text, PDFs and tables",
      "Flask is minimal: a few routes returning JSON to React",
      "What you could have considered: Node with Express (one language across the stack) or Django (more built in than you needed)",
      "Trade-off: two languages and two things to deploy",
      FORMULA,
    ],
  },
  {
    id: "res-cb-sql-schema",
    track: "resume",
    group: CB,
    source: CB_B1,
    kind: "individual",
    question: "Which SQL database does ClearBill use, and what are the tables?",
    keyPoints: [
      "Name the engine (SQLite, PostgreSQL, MySQL)",
      "List the main tables and how they relate",
      "Say one query out loud, such as the total per bill with GROUP BY",
      "Say how Flask talks to it: raw SQL or an ORM such as SQLAlchemy",
    ],
  },
  {
    id: "res-cb-request-flow",
    track: "resume",
    group: CB,
    source: CB_B1,
    kind: "individual",
    question: "'Full-stack': trace one request through the whole stack. The user submits a bill. What happens?",
    keyPoints: [
      "React form or upload, an HTTP request to a Flask route, analysis in Python, a write to SQL, JSON back, React renders the flags",
      "Say where the user's identity is checked",
      "Say where errors are handled and what the user sees",
      "Mark which parts you wrote",
    ],
  },
  {
    id: "res-cb-two-stores",
    track: "resume",
    group: CB,
    source: CB_B2,
    kind: "why",
    question: "You list SQL and Firebase for data storage. What lives where, and why two stores?",
    keyPoints: [
      "State exactly which data is in SQL and which is in Firebase",
      "Give your reason for the split",
      "Admit the cost: two sources of truth to keep consistent",
      "If you would use one store today, say which and why",
      FORMULA,
    ],
  },
  {
    id: "res-cb-firebase-auth",
    track: "resume",
    group: CB,
    source: CB_B2,
    kind: "why",
    question: "Why Firebase Authentication instead of writing your own login?",
    keyPoints: [
      "Auth is easy to get wrong: password hashing, reset flows, session tokens",
      "Firebase provides tested sign-in, token handling and providers such as Google",
      "Say how your Flask backend knows who the user is (the usual way is verifying the Firebase ID token on each request)",
      "Trade-off: dependence on one vendor. Alternatives to name: Auth0, Supabase Auth, Flask-Login",
      FORMULA,
    ],
  },
  {
    id: "res-cb-stripe",
    track: "resume",
    group: CB,
    source: CB_B2,
    kind: "why",
    question: "Why Stripe, and what does 'secure payments' mean in your app?",
    keyPoints: [
      "Say what the user pays for",
      "Secure means card details go straight to Stripe (Checkout or Elements) and never touch your server",
      "The server should confirm payment through a Stripe webhook, not by trusting the browser. Say whether yours does",
      "The secret key stays server-side. Say whether you only ever ran in test mode",
      "Alternatives to name: PayPal, Square",
      FORMULA,
    ],
  },
  {
    id: "res-cb-privacy",
    track: "resume",
    group: CB,
    source: CB_B2,
    kind: "why",
    question: "Hospital bills are sensitive health data. How did you protect them?",
    keyPoints: [
      "Say what you store and for how long. Storing less is the strongest control",
      "Access control: each user can see only their own bills. Say how that is enforced",
      "Transport and storage: HTTPS, encryption at rest by the provider",
      "Know the term HIPAA, and be honest that a student project is not a compliance-audited system",
      "This is where your cybersecurity focus should show: name one threat and your mitigation",
    ],
  },

  /* ───────────────────────── Activities ───────────────────────── */
  {
    id: "res-act-acronyms",
    track: "resume",
    group: ACT,
    source: ACT_ORGS,
    kind: "individual",
    question: "Expand each acronym, HASA, NSBE, ACM-W and RHA, and tell me what you do in each.",
    keyPoints: [
      "Say all four full names without hesitating (NSBE is the National Society of Black Engineers; ACM-W is ACM's community for women in computing; RHA is the Residence Hall Association)",
      "One sentence per group on what you actually attend or do",
      "Be honest about depth: member vs active contributor",
      "Say what the Community Council does and whether you hold a position",
    ],
  },
  {
    id: "res-act-four-orgs",
    track: "resume",
    group: ACT,
    source: ACT_ORGS,
    kind: "number",
    question: "Four organizations since August 2026. Which one gets most of your time, and how many hours a week in total?",
    keyPoints: [
      "Pick one and say why",
      "Give rough weekly hours across all four",
      "Name one concrete thing you did: an event, a meeting, a vote",
      "Say how this fits alongside classes, research, and a part-time STAR schedule",
    ],
  },
  {
    id: "res-act-research-what",
    track: "resume",
    group: ACT,
    source: ACT_RESEARCH,
    kind: "individual",
    question: "It says 'participating in undergraduate research'. What research, with whom, and what do you do?",
    keyPoints: [
      "Name the area: human-computer interaction, on AAC (augmentative and alternative communication, the tools that help people who cannot rely on speech)",
      "Name the lab or faculty mentor and the month you started",
      "Describe your tasks so far exactly, without inflating them",
      "Say what stage it is at: no results or publications yet, if that is the case",
    ],
  },
  {
    id: "res-act-research-why",
    track: "resume",
    group: ACT,
    source: ACT_RESEARCH,
    kind: "why",
    question: "Why join research as a first-year, and why HCI rather than security?",
    keyPoints: [
      "Give your real reason for this topic",
      "Do not abandon the cybersecurity focus: explain how the two sit together for you",
      "Say what you considered instead and why you chose this",
      "Say what you hope to have done in it by the end of the year",
    ],
  },

  /* ───────────────────────── Certifications ───────────────────────── */
  {
    id: "res-cert-gcyber-covered",
    track: "resume",
    group: CERT,
    source: CERT_GCYBER,
    kind: "individual",
    question: "What did the Google Cybersecurity Professional Certificate cover, and what did you do hands-on?",
    keyPoints: [
      "It is a multi-course online program aimed at entry-level security analyst skills",
      "Name the topics you can still explain: for example the CIA triad, network security, Linux and SQL basics, SIEM tools, incident response, Python automation",
      "Describe one lab you remember doing",
      "Say when you finished it",
    ],
  },
  {
    id: "res-cert-gcyber-effort",
    track: "resume",
    group: CERT,
    source: CERT_GCYBER,
    kind: "number",
    question: "How many courses is that certificate, and how long did it take you?",
    keyPoints: [
      "Know the course count from your own Coursera record (the program is listed as eight courses)",
      "Give your real completion time and date",
      "It is a certificate of completion, not a proctored industry exam such as Security+. Say so if asked",
      "Say what you plan next, if anything",
    ],
  },
  {
    id: "res-cert-gcyber-cia",
    track: "resume",
    group: CERT,
    source: CERT_GCYBER,
    kind: "individual",
    question: "Explain the CIA triad and apply each part to one of your own projects.",
    keyPoints: [
      "Confidentiality: only authorized people can see data",
      "Integrity: data is not changed improperly",
      "Availability: the system works when it is needed",
      "Give one example of each from your own work (ClearBill's bill data is the obvious place to look)",
    ],
  },
  {
    id: "res-cert-support-scope",
    track: "resume",
    group: CERT,
    source: CERT_SUPPORT,
    kind: "number",
    question:
      "Technical Support Fundamentals is one course in the Google IT Support certificate. Did you finish the full certificate?",
    keyPoints: [
      "Answer yes or no first",
      "It is the first course of the Google IT Support Professional Certificate. Do not let it be mistaken for the whole program",
      "Say what it covered: hardware, operating systems, networking basics, troubleshooting, customer support",
      "Say why you listed it",
    ],
  },
  {
    id: "res-cert-support-troubleshoot",
    track: "resume",
    group: CERT,
    source: CERT_SUPPORT,
    kind: "individual",
    question: "Give me an example of a technical problem you troubleshot, step by step.",
    keyPoints: [
      "Pick a real problem you fixed",
      "Show a method: reproduce it, isolate the cause, change one thing at a time, verify the fix",
      "Say how you explained it to a non-technical person",
      "Tie it to your customer-service experience",
    ],
  },
  {
    id: "res-cert-thm-what",
    track: "resume",
    group: CERT,
    source: CERT_THM,
    kind: "individual",
    question: "What is TryHackMe SOC Level 1, and what does a SOC analyst do?",
    keyPoints: [
      "SOC means security operations center. A level 1 analyst triages alerts, investigates, and escalates",
      "Name the areas you covered (for example network traffic analysis, endpoint monitoring, SIEM, phishing analysis)",
      "Describe one room in detail: the alert, what you looked at, your conclusion",
      "Name only the tools you actually touched",
    ],
  },
  {
    id: "res-cert-thm-status",
    track: "resume",
    group: CERT,
    source: CERT_THM,
    kind: "number",
    question: "Is SOC Level 1 a completed learning path or a proctored certification exam?",
    keyPoints: [
      "Be exact about which one you hold and the completion date",
      "Do not let the interviewer assume more than is true",
      "Give the rough number of hours or rooms from your TryHackMe profile",
      "Offer your public profile link",
    ],
  },
  {
    id: "res-cert-why-certs",
    track: "resume",
    group: CERT,
    source: CERT_ALL,
    kind: "why",
    question: "Three security certificates but no security project. Why certificates?",
    keyPoints: [
      "Give your real reason: structure, labs you could not set up alone, a starting point before college",
      "Admit the gap: certificates show study, projects show application",
      "Say what security project you would build next, or what security thinking is already in your web projects",
      FORMULA,
    ],
  },
]);
