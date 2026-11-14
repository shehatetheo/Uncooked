"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "./Nav";
import { Panel } from "@/components/ui";

const SHEET: [string, string][] = [
  ["?", "Open or close this sheet"],
  ["g then a letter", "Go to a page (letters below)"],
  ["Tab", "Ghost typing: restart the rep"],
  ["Esc", "Ghost typing: stop autoplay / leave the editor"],
  ["Ctrl + Enter", "Cold solve and SQL: Run"],
  ["Ctrl + Shift + Enter", "Cold solve and SQL: Submit"],
  ["Alt + 1…4", "Problem: jump to phase 1–4"],
  ["1…4", "Questions: pick an answer"],
  ["Enter / Space", "Questions and cards: continue"],
  ["Alt + H", "Cold solve: next hint"],
];

const typingTarget = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || !!t.closest("[data-typing]"));
};

/** Global keyboard shortcuts and the `?` sheet. */
export function Shortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gAt = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typingTarget(e)) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "g") {
        gAt = Date.now();
      } else if (Date.now() - gAt < 900) {
        const dest = NAV.find((n) => n.key === e.key.toLowerCase());
        gAt = 0;
        if (dest) {
          e.preventDefault();
          router.push(dest.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bg/90 p-4" onClick={() => setOpen(false)} role="dialog" aria-modal aria-label="Keyboard shortcuts">
      <div className="w-full max-w-[560px]" onClick={(e) => e.stopPropagation()}>
        <Panel title="Keyboard shortcuts" right={<button className="btn btn-sm" onClick={() => setOpen(false)}>Close</button>}>
          <table className="w-full text-sm">
            <tbody>
              {SHEET.map(([k, d]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <td className="w-[44%] px-3 py-2 text-second">{k}</td>
                  <td className="px-3 py-2 text-dim">{d}</td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 align-top text-second">g + …</td>
                <td className="px-3 py-2 text-dim">{NAV.map((n) => `${n.key} ${n.label}`).join(" · ")}</td>
              </tr>
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
