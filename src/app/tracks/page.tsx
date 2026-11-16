import Link from "next/link";
import { PageHeader } from "@/components/ui";

const LINKS = [
  ["/plan", "Four-day plan", "Daily assignments to Friday, about two hours each."],
  ["/problems", "Coding", "Core 12, sorting and strings, made-up problems."],
  ["/sql", "SQL", "Run queries in the browser. Joins, GROUP BY, window functions."],
  ["/quiz", "Fundamentals quiz", "Tap-to-answer questions on everything your resume lists."],
  ["/resume", "Resume defense", "Line by line: what you did, the numbers, why each tool."],
  ["/behavioral", "Behavioral + SAP", "STAR stories, 60-second intro, presentation drills, SAP 101."],
  ["/interview", "Voice mock interview", "Talk to an AI interviewer out loud, then get scored feedback."],
  ["/timed", "Timed modes", "Sprint, mock interview, speed typing."],
  ["/sheets", "Cheat sheets", "Complexity table and Python tricks."],
  ["/settings", "Settings", "Sound, motion, rest timer, export and import."],
] as const;

export default function TracksPage() {
  return (
    <div>
      <PageHeader kicker="Everything" title="Tracks" />
      <div className="grid gap-3 md:grid-cols-2">
        {LINKS.map(([href, t, d]) => (
          <Link key={href} href={href} className="panel block p-4 hover:bg-inset">
            <span className="h2 block">{t}</span>
            <span className="mt-1 block text-sm text-dim">{d}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
