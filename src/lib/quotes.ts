export interface Quote {
  text: string;
  by?: string;
}

/**
 * Lines shown around the app. Attributed quotes are ones with a well-known
 * source; "attributed" marks ones commonly credited but not firmly sourced.
 * Unsigned lines are written for this app.
 */
export const QUOTES: Quote[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", by: "Will Durant, on Aristotle" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius" },
  { text: "I fear not the man who has practiced 10,000 kicks once, but the man who has practiced one kick 10,000 times.", by: "attributed to Bruce Lee" },
  { text: "It always seems impossible until it's done.", by: "attributed to Nelson Mandela" },
  { text: "Luck is what happens when preparation meets opportunity.", by: "attributed to Seneca" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", by: "James Clear" },
  { text: "First, solve the problem. Then, write the code.", by: "attributed to John Johnson" },
  { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
  { text: "Simplicity is prerequisite for reliability.", by: "Edsger Dijkstra" },
  { text: "The only way to learn a new programming language is by writing programs in it.", by: "Dennis Ritchie" },
  { text: "Twenty problems, known cold, beat a hundred you half remember." },
  { text: "Say it out loud. If you can't explain it, you don't own it yet." },
  { text: "They can invent the problem. They can't invent a new pattern." },
  { text: "Rationale over answer: I chose X because Y. I considered Z, but…" },
  { text: "One more clean rep. Then rest." },
  { text: "Slow is smooth. Smooth is fast." },
  { text: "Every number on your resume is a question. Have the answer ready." },
  { text: "Nervous means you care. Prepared means it won't matter." },
  { text: "You already got to the final round. Now make it easy for them to say yes." },
  { text: "Shaky today is Got it tomorrow, if you come back tomorrow." },
];

/** Stable pick for a given seed (so a quote doesn't change on every render). */
export const quoteFor = (seed: number): Quote => QUOTES[Math.abs(Math.floor(seed)) % QUOTES.length]!;
/** One quote per calendar day. */
export const quoteOfDay = (now: number): Quote => quoteFor(Math.floor(now / 86_400_000));
