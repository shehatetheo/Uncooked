import { describe, expect, it } from "vitest";
import { TECH } from "@content/technical";
import { problems, sqlProblems } from "@/lib/content";
import { liveCheck, localGrade } from "@/lib/technical";

describe("technical interview questions", () => {
  it("has ten questions with rubrics that add up to 100", () => {
    expect(TECH).toHaveLength(10);
    for (const q of TECH) expect(q.rubric.reduce((a, p) => a + p.max, 0), q.id).toBe(100);
  });

  it("references real problems so ghost typing has a solution", () => {
    const code = new Set(problems.map((p) => p.id));
    const sql = new Set(sqlProblems.map((p) => p.id));
    for (const q of TECH) expect(q.kind === "sql" ? sql.has(q.ref) : code.has(q.ref), q.id).toBe(true);
  });

  for (const q of TECH) {
    it(`${q.id}: the model answer scores 100 in the browser grader`, () => {
      const g = localGrade(q, q.say, "", "");
      expect(g.points.filter((p) => !p.earned).map((p) => p.id), q.id).toEqual([]);
      expect(g.score).toBe(100);
    });
    it(`${q.id}: a vague answer scores low`, () => {
      expect(localGrade(q, "I would just write some code and test it.", "", "").score, q.id).toBeLessThanOrEqual(25);
    });
  }

  it("understands spoken complexity", () => {
    const q = TECH.find((x) => x.id === "t-two-sum")!;
    const point = (text: string) => liveCheck(q, text, "").find((p) => p.id === "complexity")!.hit;
    expect(point("it's big O of n time and O of n space")).toBe(true);
    expect(point("that's linear time with linear extra memory")).toBe(true);
    expect(point("o(n) time, o(n) space")).toBe(true);
    expect(point("it's o of n log n time")).toBe(false);
  });
});

import { FINAL_VIDEOS } from "@content/technical";

describe("technical interview videos", () => {
  it("every question has one video and there are three final videos, all well-formed", () => {
    const all = [...TECH.map((q) => q.video), ...FINAL_VIDEOS];
    expect(FINAL_VIDEOS).toHaveLength(3);
    for (const v of all) {
      expect(v.id, v.title).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(v.length, v.title).toMatch(/^\d{1,2}:\d{2}$/);
      expect(v.note.length, v.title).toBeGreaterThan(20);
    }
    expect(new Set(all.map((v) => v.id)).size).toBe(all.length);
  });
});

import { nextStep, probeOf } from "@/lib/simulator";

describe("interview simulator", () => {
  const q = TECH.find((x) => x.id === "t-two-sum")!;
  const byId = (...ids: string[]) => q.rubric.filter((p) => ids.includes(p.id));
  it("asks the candidate to keep going when they've barely spoken", () => {
    expect(nextStep(q.rubric, [], 5, false)).toEqual({ kind: "probe", probe: "more" });
  });
  it("probes for missing points in a natural order, then follows up, then wraps", () => {
    expect(nextStep(byId("brute", "complexity", "edge"), ["more"], 60, false)).toEqual({ kind: "probe", probe: "brute" });
    expect(nextStep(byId("complexity", "edge"), ["more", "brute"], 80, false)).toEqual({ kind: "probe", probe: "complexity" });
    expect(nextStep([], ["more"], 120, false)).toEqual({ kind: "follow" });
    expect(nextStep([], [], 120, true)).toEqual({ kind: "wrap" });
  });
  it("stops probing after four questions", () => {
    expect(nextStep(byId("edge"), ["brute", "core", "complexity", "why"], 200, false)).toEqual({ kind: "follow" });
  });
  it("gives every rubric point a probe the interviewer can ask", () => {
    for (const t of TECH) for (const p of t.rubric) expect(["clarify", "brute", "core", "why", "alt", "example", "complexity", "edge"]).toContain(probeOf(p));
  });
});

import { clipMenu, GAUNTLET, isQuestion, matchQuestion, verdict } from "@/lib/simulator";
import { techById } from "@content/technical";
import { existsSync } from "node:fs";

describe("asking the interviewer", () => {
  it("tells questions from answers", () => {
    expect(isQuestion("Can the numbers be negative?")).toBe(true);
    expect(isQuestion("is the input sorted")).toBe(true);
    expect(isQuestion("Can numbers repeat? I'll assume yes, so duplicates work.")).toBe(false);
    expect(isQuestion("I'd use a dictionary.")).toBe(false);
    expect(isQuestion("What I'd do is sort first, then walk the list and merge any overlapping ranges by extending the end of the last one, which is O(n log n) overall because of the sort.")).toBe(false);
  });
  it("matches a spoken question to the prepared answer", () => {
    const two = techById.get("t-two-sum")!;
    expect(matchQuestion(two, "can there be duplicates or negative numbers?")).toBe(0);
    expect(matchQuestion(two, "do I return the indices?")).toBe(2);
    expect(matchQuestion(two, "what's your favorite color?")).toBe(-1);
    const merge = techById.get("t-merge-intervals")!;
    expect(matchQuestion(merge, "Is the input already sorted?")).toBe(0);
    expect(matchQuestion(merge, "do touching intervals overlap?")).toBe(1);
  });
  it("has a recorded clip for every answer and every line Claude can pick", () => {
    for (const q of TECH) {
      expect(q.qa.length).toBeGreaterThanOrEqual(3);
      for (const key of Object.keys(clipMenu(q))) expect(existsSync(`public/voice/${key}.mp3`), key).toBe(true);
    }
    for (const k of ["gauntlet-intro", "gauntlet-next", "gauntlet-end", "time-1min", "time-up"]) expect(existsSync(`public/voice/${k}.mp3`), k).toBe(true);
  });
});

describe("the gauntlet", () => {
  it("is five real questions with different clocks", () => {
    expect(GAUNTLET).toHaveLength(5);
    for (const r of GAUNTLET) expect(techById.has(r.id)).toBe(true);
    expect(new Set(GAUNTLET.map((r) => r.seconds)).size).toBe(5);
  });
  it("gives a verdict on the app's scale", () => {
    expect(verdict(95).title).toBe("Uncooked");
    expect(verdict(10).title).toBe("Burnt");
  });
});
