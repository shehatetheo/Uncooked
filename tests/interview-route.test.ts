import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/interview/route";
import { systemPrompt, FEEDBACK_PROMPT } from "@/lib/interview/prompt";
import { ROUNDS, type Round } from "@/lib/interview/rounds";

const req = (body: unknown, passcode: string | null = "letmein") =>
  new Request("http://localhost/api/interview", {
    method: "POST",
    headers: { "content-type": "application/json", ...(passcode ? { "x-interview-passcode": passcode } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("interview route guards (no API call is made)", () => {
  const saved = { key: process.env.ANTHROPIC_API_KEY, pass: process.env.INTERVIEW_PASSCODE };
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key-not-real";
    process.env.INTERVIEW_PASSCODE = "letmein";
  });
  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = saved.key;
    process.env.INTERVIEW_PASSCODE = saved.pass;
  });

  it("refuses when the server isn't configured", async () => {
    delete process.env.INTERVIEW_PASSCODE;
    const res = await POST(req({ round: "sql", mode: "turn", messages: [] }));
    expect(res.status).toBe(503);
  });

  it("refuses a missing or wrong passcode", async () => {
    expect((await POST(req({ round: "sql", mode: "turn", messages: [] }, null))).status).toBe(401);
    expect((await POST(req({ round: "sql", mode: "turn", messages: [] }, "nope"))).status).toBe(401);
  });

  it("rejects malformed bodies", async () => {
    expect((await POST(req("not json"))).status).toBe(400);
    expect((await POST(req({ round: "chess", mode: "turn", messages: [] }))).status).toBe(400);
    expect((await POST(req({ round: "sql", mode: "nope", messages: [] }))).status).toBe(400);
    expect((await POST(req({ round: "sql", mode: "turn", messages: [{ role: "system", content: "x" }] }))).status).toBe(400);
    expect((await POST(req({ round: "sql", mode: "turn", messages: [{ role: "user", content: "x".repeat(7000) }] }))).status).toBe(400);
  });
});

describe("interview prompts", () => {
  it("has a brief for every round and keeps contact details out", () => {
    for (const r of Object.keys(ROUNDS) as Round[]) {
      const p = systemPrompt(r);
      expect(p).toContain("SAP STAR");
      expect(p).not.toMatch(/@gmail\.com|\(\d{3}\) \d{3}-\d{4}|theok/i);
    }
    expect(systemPrompt("sql")).toMatch(/inner join and an outer join/i);
    expect(FEEDBACK_PROMPT).toContain("FIX BEFORE FRIDAY");
  });
});

import { POST as GRADE } from "@/app/api/grade/route";

describe("grade route guards (no API call is made)", () => {
  const saved = { key: process.env.ANTHROPIC_API_KEY, pass: process.env.INTERVIEW_PASSCODE };
  const greq = (body: unknown, passcode: string | null = "letmein") =>
    new Request("http://localhost/api/grade", { method: "POST", headers: { "content-type": "application/json", ...(passcode ? { "x-interview-passcode": passcode } : {}) }, body: JSON.stringify(body) });
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key-not-real";
    process.env.INTERVIEW_PASSCODE = "letmein";
  });
  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = saved.key;
    process.env.INTERVIEW_PASSCODE = saved.pass;
  });
  it("needs the passcode", async () => {
    expect((await GRADE(greq({ questionId: "t-two-sum", answer: "hi" }, null))).status).toBe(401);
  });
  it("rejects unknown questions and empty answers", async () => {
    expect((await GRADE(greq({ questionId: "nope", answer: "hi" }))).status).toBe(400);
    expect((await GRADE(greq({ questionId: "t-two-sum", answer: "  ", code: "" }))).status).toBe(400);
  });
});
