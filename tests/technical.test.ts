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
