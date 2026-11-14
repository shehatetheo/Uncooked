import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "hci-aac-meaning",
    topic: "hci",
    prompt: "In accessibility research, what does AAC stand for?",
    choices: [
      "Advanced Audio Coding for assistive devices",
      "Augmentative and Alternative Communication",
      "Automated Accessibility and Compliance checking",
      "Adaptive Access Control for shared tablets",
    ],
    answer: 1,
    explain:
      "AAC covers the tools and strategies that supplement or replace speech for people with complex communication needs, from picture boards to tablet apps that speak. Advanced Audio Coding is an unrelated audio format with the same initials.",
  },
  {
    id: "hci-augmentative-vs-alternative",
    topic: "hci",
    prompt: "In AAC, what is the difference between 'augmentative' and 'alternative'?",
    choices: [
      "Augmentative is high-tech; alternative is paper-based",
      "Augmentative is for adults; alternative is for children",
      "They are two words for the same thing",
      "Augmentative adds to speech; alternative replaces it",
    ],
    answer: 3,
    explain:
      "Some users have some speech and use AAC to supplement it; others use it in place of speech. Both low-tech systems (symbol boards) and high-tech ones (speech-generating devices) can serve either role.",
  },
  {
    id: "hci-vsd-vs-grid",
    topic: "hci",
    prompt: "How does a visual scene display (VSD) differ from a grid display in an AAC app?",
    choices: [
      "A VSD embeds vocabulary as hotspots in a contextual photo",
      "A VSD shows words in rows and columns of equal cells",
      "A VSD is text-only, while a grid uses pictures",
      "A VSD needs an eye tracker, while a grid uses touch",
    ],
    answer: 0,
    explain:
      "A grid arranges separate symbols in rows and columns. A VSD embeds language in a meaningful scene, such as a photo of the child's kitchen with tappable hotspots, which can be easier for young or beginning communicators because the context is kept.",
  },
  {
    id: "hci-think-aloud",
    topic: "hci",
    prompt: "What is a think-aloud study?",
    choices: [
      "Researchers explain the design while participants listen",
      "Users fill in a survey after using the product",
      "Participants voice their thoughts while doing tasks",
      "The team brainstorms ideas out loud in a meeting",
    ],
    answer: 2,
    explain:
      "Asking participants to verbalize their thoughts as they work reveals why they struggle, not just where: their expectations, confusion and reasoning. The facilitator prompts them to keep talking without leading or helping.",
  },
  {
    id: "hci-low-vs-high-fidelity",
    topic: "hci",
    prompt: "When is a low-fidelity prototype, such as paper sketches or rough wireframes, the better choice?",
    choices: [
      "When testing final visual polish and animations",
      "Early on, to test ideas quickly and cheaply",
      "When handing final specs over to engineers",
      "When measuring real page load performance",
    ],
    answer: 1,
    explain:
      "Low-fidelity prototypes are fast to make and throw away, and people feel freer to criticize something that looks unfinished. High-fidelity prototypes look and behave like the real product and are used later to test detailed interaction and visual design.",
  },
  {
    id: "hci-irb",
    topic: "hci",
    prompt: "What is an IRB's role in a research study with human participants?",
    choices: [
      "It provides the funding for the study",
      "It recruits and schedules the participants",
      "It analyzes the data after collection",
      "It reviews the study to protect participants",
    ],
    answer: 3,
    explain:
      "An Institutional Review Board reviews the protocol before any data is collected, checking that risks are minimized, consent is informed and voluntary, and data stays confidential. Research with children gets extra scrutiny.",
  },
  {
    id: "hci-consent-and-assent",
    topic: "hci",
    prompt: "A research study involves children. What is typically required before a child takes part?",
    choices: [
      "Parental permission plus the child's own assent",
      "Only the child's signature on the consent form",
      "Only approval from the child's teacher",
      "Nothing, as long as the study is low risk",
    ],
    answer: 0,
    explain:
      "Minors cannot give legal consent, so a parent or guardian gives permission, and the child is asked in age-appropriate language whether they agree (assent). A child's refusal or signs of distress are respected even if the parent has agreed.",
  },
  {
    id: "hci-usability-testing",
    topic: "hci",
    prompt: "What is the core activity in a usability test?",
    choices: [
      "Asking users which new features they would like to see added",
      "Running automated tests against the codebase",
      "Watching representative users attempt realistic tasks",
      "Comparing the product's price with competitors",
    ],
    answer: 2,
    explain:
      "You observe what people actually do, not what they say they would do, and record measures such as task success, time on task, errors and satisfaction. A handful of participants is usually enough to expose the biggest problems.",
  },
]);
