import { describe, expect, it } from "vitest";
import { cards, problems, quiz, remixesOf, sqlProblems } from "@/lib/content";
import { checkExplanation } from "@/lib/explain";
import { BLIND_REPS, createGhost, currentLine, ghostStats, isDone, repMode, SHADOW_REPS, typeChar } from "@/lib/ghost";
import { outputsMatch } from "@/lib/runner/types";
import { DAY, dayKey, deriveStatus, NEW_SRS, schedule, streak } from "@/lib/srs";

const TARGET = "def f(self, x):\n    y = x\n    return y";
const typeAll = (text: string, start = createGhost(TARGET), t0 = 1000) => [...text].reduce((s, ch, i) => typeChar(s, ch, t0 + i * 100), start);

describe("ghost typing", () => {
  it("pre-fills the signature and skips leading indentation", () => {
    const g = createGhost(TARGET);
    expect(TARGET.slice(g.pos, g.pos + 5)).toBe("y = x");
    expect(currentLine(g)).toBe(1);
  });

  it("advances on correct keys and auto-indents after Enter", () => {
    const g = typeAll("y = x\n");
    expect(TARGET.slice(g.pos)).toBe("return y");
    expect(g.errors).toBe(0);
    expect(currentLine(g)).toBe(2);
  });

  it("counts a wrong key as an error without advancing", () => {
    const g = typeAll("yq");
    expect(g.errors).toBe(1);
    expect(g.correct).toBe(1);
    expect(TARGET[g.pos]).toBe(" ");
    expect(g.wrongAt).toBe(g.pos);
  });

  it("finishes exactly at the end and scores WPM and accuracy", () => {
    const g = typeAll("y = x\nreturn yZ".replace("Z", ""));
    expect(isDone(g)).toBe(true);
    const typed = "y = x\nreturn y".length;
    const stats = ghostStats(g, 0);
    expect(stats.accuracy).toBe(100);
    expect(stats.progress).toBe(1);
    // 14 keys, 100ms apart = 1.3s between first and last
    expect(stats.ms).toBe((typed - 1) * 100);
    expect(stats.wpm).toBe(Math.round(typed / 5 / (stats.ms / 60000)));
  });

  it("drops accuracy for errors and ignores keys after the end", () => {
    const g = typeAll("yy = x\nreturn y!!!");
    expect(isDone(g)).toBe(true);
    expect(g.errors).toBe(1);
    expect(ghostStats(g, 0).accuracy).toBe(Math.round((14 / 15) * 100));
  });

  it("runs three shadow reps then three blind reps", () => {
    expect([0, 1, 2, 3, 4, 5].map(repMode)).toEqual(["shadow", "shadow", "shadow", "blind", "blind", "blind"]);
    expect(SHADOW_REPS).toBe(3);
    expect(BLIND_REPS).toBe(3);
  });
});

describe("spaced repetition", () => {
  const now = new Date("2026-01-10T12:00:00").getTime();
  const far = now + 365 * DAY;

  it("Again comes back within the session; Shaky tomorrow", () => {
    expect(schedule(NEW_SRS, "again", now, far).dueAt - now).toBe(10 * 60_000);
    expect(schedule(NEW_SRS, "shaky", now, far).interval).toBe(1);
  });

  it("grows intervals with Got it and faster with Mastered", () => {
    let s = schedule(NEW_SRS, "got_it", now, far);
    expect(s.interval).toBe(1);
    s = schedule(s, "got_it", now, far);
    expect(s.interval).toBe(3);
    const got = schedule(s, "got_it", now, far).interval;
    const mastered = schedule(s, "mastered", now, far).interval;
    expect(got).toBeGreaterThan(3);
    expect(mastered).toBeGreaterThan(got);
  });

  it("lowers ease on lapses but never below 1.3", () => {
    let s = NEW_SRS;
    for (let i = 0; i < 20; i++) s = schedule(s, "again", now, far);
    expect(s.ease).toBe(1.3);
  });

  it("caps intervals at half the days left before the deadline", () => {
    const deadline = now + 6 * DAY;
    const s = schedule({ ease: 2.5, interval: 30, dueAt: 0 }, "mastered", now, deadline);
    expect(s.interval).toBe(3);
    expect(s.dueAt).toBeLessThan(deadline);
    expect(schedule({ ease: 2.5, interval: 30, dueAt: 0 }, "got_it", now, now + 1.5 * DAY).interval).toBe(1);
  });

  it("only grants Mastered to a problem after clean cold solves on two different days", () => {
    expect(deriveStatus("mastered", [], true, true)).toBe("got_it");
    expect(deriveStatus("mastered", ["2026-01-10"], true, true)).toBe("got_it");
    expect(deriveStatus("mastered", ["2026-01-10", "2026-01-10"], true, true)).toBe("got_it");
    expect(deriveStatus("shaky", ["2026-01-10", "2026-01-11"], true, true)).toBe("mastered");
    expect(deriveStatus("mastered", [], true, false)).toBe("mastered");
    expect(deriveStatus(undefined, [], false, true)).toBe("not_started");
    expect(deriveStatus(undefined, [], true, true)).toBe("learning");
  });

  it("counts a streak of consecutive days, tolerating today not done yet", () => {
    const days = new Set([dayKey(now - DAY), dayKey(now - 2 * DAY), dayKey(now - 4 * DAY)]);
    expect(streak(days, now)).toBe(2);
    days.add(dayKey(now));
    expect(streak(days, now)).toBe(3);
    expect(streak(new Set(), now)).toBe(0);
  });
});

describe("test-case comparison", () => {
  it("exact mode is order-sensitive", () => {
    expect(outputsMatch([0, 1], [0, 1], "exact")).toBe(true);
    expect(outputsMatch([1, 0], [0, 1], "exact")).toBe(false);
    expect(outputsMatch(true, 1, "exact")).toBe(false);
  });
  it("unordered mode ignores order but not counts", () => {
    expect(outputsMatch([2, 1], [1, 2], "unordered")).toBe(true);
    expect(outputsMatch([1, 1, 2], [1, 2, 2], "unordered")).toBe(false);
    expect(outputsMatch([1], [1, 1], "unordered")).toBe(false);
    expect(outputsMatch(null, [1], "unordered")).toBe(false);
  });
  it("groups mode ignores group order and order inside groups", () => {
    expect(outputsMatch([["tan", "nat"], ["bat"], ["ate", "eat", "tea"]], [["bat"], ["nat", "tan"], ["eat", "tea", "ate"]], "groups")).toBe(true);
    expect(outputsMatch([["tan"], ["nat"]], [["tan", "nat"]], "groups")).toBe(false);
  });
});

describe("explanation checker", () => {
  it("flags what a thin answer skipped", () => {
    const hit = Object.fromEntries(checkExplanation("I use a hash map.").map((c) => [c.key, c.hit]));
    expect(hit).toEqual({ approach: true, complexity: false, edge: false, brute: false });
  });
  it("passes a complete answer", () => {
    const all = checkExplanation("Brute force is nested loops, O(n^2). Instead I use a hash map for O(n) time and space. Edge case: duplicates and an empty list.");
    expect(all.every((c) => c.hit)).toBe(true);
  });
});

describe("content", () => {
  it("meets the v1 content targets", () => {
    expect(problems.filter((p) => p.tags.includes("core")).length).toBe(12);
    expect(problems.filter((p) => p.tags.includes("sap")).length).toBeGreaterThanOrEqual(6);
    expect(problems.filter((p) => p.tags.includes("made-up")).length).toBeGreaterThanOrEqual(5);
    expect(sqlProblems.length).toBeGreaterThanOrEqual(10);
    expect(quiz.length).toBeGreaterThanOrEqual(150);
    expect(cards.filter((c) => c.track === "resume").length).toBeGreaterThan(50);
  });
  it("has a remix for every core problem and every made-up problem explains its pattern", () => {
    for (const p of problems.filter((x) => x.tags.includes("core"))) expect(remixesOf(p.id).length, p.id).toBeGreaterThan(0);
    for (const p of problems.filter((x) => x.tags.includes("made-up"))) expect(p.reveal, p.id).toBeTruthy();
  });
  it("keeps contact details out of the cards", () => {
    const text = JSON.stringify(cards);
    expect(text).not.toMatch(/@gmail\.com|\(\d{3}\) \d{3}-\d{4}/);
  });
  it("tags Develop for Good cards as new-resume only", () => {
    const dfg = cards.filter((c) => c.track === "resume" && /develop for good/i.test(c.group));
    expect(dfg.length).toBeGreaterThan(0);
    expect(dfg.every((c) => c.versions.length === 1 && c.versions[0] === "new")).toBe(true);
  });
});

import { PLAN } from "@content/plan";

describe("four-day plan", () => {
  it("covers Mon-Fri before the super day and every link points somewhere real", () => {
    expect(PLAN.map((d) => d.date)).toEqual(["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21"]);
    const problemIds = new Set(problems.map((p) => p.id));
    const sqlIds = new Set(sqlProblems.map((p) => p.id));
    const cardGroups = new Set(cards.map((c) => c.group));
    for (const d of PLAN.slice(0, 4)) {
      const minutes = d.tasks.reduce((a, t) => a + t.minutes, 0);
      expect(minutes, d.date).toBeGreaterThanOrEqual(110);
      expect(minutes, d.date).toBeLessThanOrEqual(130);
    }
    for (const t of PLAN.flatMap((d) => d.tasks)) {
      const c = t.check;
      if (c.kind === "solve" || c.kind === "clean-today") for (const id of c.ids) expect(problemIds.has(id), id).toBe(true);
      if (c.kind === "sql") for (const id of c.ids) expect(sqlIds.has(id), id).toBe(true);
      if (c.kind === "cards") {
        for (const g of c.groups ?? []) expect(cardGroups.has(g), g).toBe(true);
        if (c.prefix) expect(cards.some((x) => x.id.startsWith(c.prefix!)), c.prefix).toBe(true);
      }
      const m = t.href.match(/^\/p\/([a-z0-9-]+)/);
      if (m) expect(problemIds.has(m[1]!), t.href).toBe(true);
      const q = t.href.match(/^\/sql\/([a-z0-9-]+)/);
      if (q) expect(sqlIds.has(q[1]!), t.href).toBe(true);
    }
  });
});
