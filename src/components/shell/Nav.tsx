"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DAY, SUPER_DAY } from "@/lib/srs";
import { cx } from "@/components/ui";

export const NAV = [
  { href: "/", label: "Home", key: "h" },
  { href: "/problems", label: "Code", key: "p" },
  { href: "/sql", label: "SQL", key: "s" },
  { href: "/quiz", label: "Quiz", key: "q" },
  { href: "/resume", label: "Resume", key: "e" },
  { href: "/behavioral", label: "Behavioral", key: "b" },
  { href: "/review", label: "Review", key: "r" },
  { href: "/timed", label: "Timed", key: "t" },
  { href: "/stats", label: "Stats", key: "d" },
] as const;

const MOBILE = [
  { href: "/", label: "Home" },
  { href: "/problems", label: "Code" },
  { href: "/review", label: "Review" },
  { href: "/tracks", label: "Tracks" },
  { href: "/stats", label: "Stats" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function daysLeft(now: number): number {
  return Math.max(0, Math.ceil((SUPER_DAY - now) / DAY));
}

export function Nav() {
  const path = usePathname();
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(daysLeft(Date.now())), []);
  const codeActive = path.startsWith("/p/");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-4 px-4">
          <Link href="/" className="font-pixel text-base tracking-wider">
            UNC<span className="text-accent">OO</span>KED
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = isActive(path, n.href) || (n.href === "/problems" && codeActive);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cx("px-2 py-1 font-pixel text-2xs uppercase tracking-wider", active ? "bg-raised text-accent" : "text-dim hover:text-text")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <span className="flex-1 md:hidden" />
          {days !== null && (
            <Link href="/" className="chip" title="Days until the SAP STAR super day, Fri Nov 20">
              <span className="text-second">T-{days}d</span>
            </Link>
          )}
          <Link href="/settings" className="px-1 font-pixel text-2xs uppercase tracking-wider text-dim hover:text-text" aria-current={path === "/settings" ? "page" : undefined}>
            Set
          </Link>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
        <div className="grid grid-cols-5">
          {MOBILE.map((n) => {
            const active = isActive(path, n.href) || (n.href === "/problems" && codeActive) || (n.href === "/tracks" && ["/sql", "/quiz", "/resume", "/behavioral", "/timed", "/sheets"].some((h) => path.startsWith(h)));
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cx("flex h-12 items-center justify-center font-pixel text-2xs uppercase tracking-wider", active ? "text-accent" : "text-dim")}>
                {active ? `[${n.label}]` : n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
