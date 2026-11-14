import type { Problem } from "@/lib/content/types";

export function ProblemText({ p, showLinks = true }: { p: Problem; showLinks?: boolean }) {
  return (
    <div className="p-4">
      <div className="prose max-w-[68ch] text-sm leading-relaxed">
        {p.statement.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {p.examples.map((ex, i) => (
          <div key={i} className="bg-inset p-3 text-sm shadow-[inset_0_0_0_1px_var(--color-line)]">
            <p className="label mb-1">Example {i + 1}</p>
            <p><span className="text-dim">in&nbsp;&nbsp;</span>{ex.input}</p>
            <p><span className="text-dim">out </span><span className="text-accent">{ex.output}</span></p>
            {ex.note && <p className="mt-1 text-dim"># {ex.note}</p>}
          </div>
        ))}
      </div>
      {p.constraints.length > 0 && (
        <ul className="mt-4 text-xs text-dim">
          {p.constraints.map((c) => <li key={c}>· {c}</li>)}
        </ul>
      )}
      {showLinks && (p.links.leetcode || p.links.neetcode) && (
        <p className="mt-4 flex gap-4 text-xs">
          {p.links.leetcode && <a className="text-dim underline underline-offset-4 hover:text-text" href={p.links.leetcode} target="_blank" rel="noreferrer">LeetCode ↗</a>}
          {p.links.neetcode && <a className="text-dim underline underline-offset-4 hover:text-text" href={p.links.neetcode} target="_blank" rel="noreferrer">NeetCode video ↗</a>}
        </p>
      )}
    </div>
  );
}
