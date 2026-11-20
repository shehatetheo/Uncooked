import { describe, expect, it } from "vitest";
import { problemById, problems } from "@content/index";
import { FALLBACK_MODELS, INTERVIEWER_MODEL } from "@/lib/ai/config";
import { contextBlock, describeRun, scorecardPrompt, systemPrompt } from "@/lib/ai/prompt";
import { cleanMessages, cleanRun, explain } from "@/lib/ai/server";
import { ghostLines, referenceCode, show, showArgs, starterCode } from "@/lib/code";
import { plainSpeech, voiceScore } from "@/lib/speech";
import type { PythonProblem } from "@/lib/types";

const two = problemById.get("two-sum") as PythonProblem;

describe("interviewer prompt", () => {
  it("gives the interviewer the problem, the reference and the hint ladder for every question", () => {
    for (const p of problems) {
      const s = systemPrompt(p);
      expect(s).toContain(p.title);
      expect(s).toContain(referenceCode(p).trim().split("\n").at(-1)!.trim());
      expect(s).toContain(p.hints[0]);
      expect(s).toContain(p.followUps[0]);
      expect(s).toMatch(/Never use markdown/);
    }
  });

  it("sends the phase, clock, code and failing test with each message", () => {
    const run = cleanRun({ mode: "submit", passed: 5, total: 7, failures: [{ input: "nums = [], target = 0", expected: "[]", error: "IndexError: list index out of range", hidden: true }] });
    const c = contextBlock(two, { phase: "blind", code: "class Solution:\n    pass", run, minutesLeft: 2, hintsShown: 1, event: "ran" });
    expect(c).toContain("BLIND SOLVE");
    expect(c).toContain("About 2 minutes left");
    expect(c).toContain("class Solution:");
    expect(c).toContain("5 of 7 passed");
    expect(c).toContain("IndexError");
    expect(c).toContain("(hidden test)");
    expect(c).toContain("[Event:");
    // no code during the talk phase, whatever is in the editor
    expect(contextBlock(two, { phase: "talk", code: "secret", run: null, minutesLeft: 25, hintsShown: 0 })).not.toContain("secret");
    expect(describeRun(null)).toContain("haven't run");
  });

  it("builds a scorecard prompt from the transcript without the app's event markers", () => {
    const s = scorecardPrompt(two, { problemId: two.id, messages: [{ role: "user", content: "[The candidate joined the call.]" }, { role: "assistant", content: "Hi, I'm Sam." }, { role: "user", content: "I'd use a dictionary" }], code: "x", run: null, solved: true, minutesUsed: 9, hintsShown: 0, skippedGhost: false });
    expect(s).toContain("Candidate: I'd use a dictionary");
    expect(s).not.toContain("joined the call");
    expect(s).toContain("lean hire");
  });
});

describe("request cleaning and errors", () => {
  it("keeps a conversation that starts with the candidate and alternates", () => {
    expect(cleanMessages([{ role: "assistant", content: "hi" }, { role: "user", content: " a " }, { role: "user", content: "b" }, { role: "assistant", content: "" }])).toEqual([{ role: "user", content: "a\nb" }]);
    expect(cleanMessages("nope")).toBeNull();
    expect(cleanMessages([{ role: "system", content: "x" }])).toBeNull();
  });
  it("explains gateway failures in plain words", () => {
    expect(explain(Object.assign(new Error("Too many requests"), { statusCode: 429 })).body.error).toBe("rate_limited");
    expect(explain(new Error("Rate limit exceeded for free tier")).body.error).toBe("rate_limited");
    expect(explain(new Error("Insufficient credit balance")).body.error).toBe("no_credits");
    expect(explain(Object.assign(new Error("AI Gateway requires a valid credit card on file to service requests."), { statusCode: 403 })).body.error).toBe("needs_card");
    expect(explain(new Error("OIDC token missing")).body.error).toBe("auth");
    expect(explain(new Error("boom")).body.message).toContain("still work");
  });
  it("has one model constant and free fallbacks", () => {
    expect(INTERVIEWER_MODEL).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/);
    expect(FALLBACK_MODELS.length).toBeGreaterThan(0);
  });
});

describe("code helpers", () => {
  it("builds starter, reference and ghost lines", () => {
    expect(starterCode(two)).toBe("class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ");
    expect(referenceCode(two)).toContain("        seen = {}\n");
    expect(ghostLines(two)).toHaveLength(two.solution.length);
    expect(ghostLines(two)[0]).toEqual({ code: "        seen = {}", caption: two.captions[0] });
    const lru = problemById.get("lru-cache")!;
    expect(starterCode(lru)).toContain("class LRUCache:");
    expect(referenceCode(lru)).toContain("OrderedDict()");
  });
  it("prints values the way Python does", () => {
    expect(show([1, null, true, "a"])).toBe('[1, None, True, "a"]');
    expect(show(undefined)).toBe("None");
    expect(showArgs(two, [[2, 7], 9])).toBe("nums = [2, 7], target = 9");
    const cycle = problemById.get("linked-list-cycle") as PythonProblem;
    expect(showArgs(cycle, [[[3, 2, 0], 1]])).toBe("head = [3, 2, 0], pos = 1");
  });
});

describe("speech", () => {
  it("prefers natural English voices and skips novelty ones", () => {
    const rank = (names: [string, string][]) => names.map(([name, lang]) => ({ name, lang })).sort((a, b) => voiceScore(b) - voiceScore(a))[0]!.name;
    expect(rank([["Fred", "en-US"], ["Samantha", "en-US"], ["Thomas", "fr-FR"]])).toBe("Samantha");
    expect(rank([["Microsoft David - English (United States)", "en-US"], ["Microsoft Aria Online (Natural) - English (United States)", "en-US"]])).toContain("Aria");
    expect(rank([["Google US English", "en-US"], ["Albert", "en-US"]])).toBe("Google US English");
    expect(voiceScore({ name: "Amélie", lang: "fr-CA" })).toBe(-1);
  });
  it("strips markdown before anything is shown or spoken", () => {
    expect(plainSpeech("**Nice.** Use a `dict`.\n- one")).toBe("Nice. Use a dict.\none");
    expect(plainSpeech("<think>hmm</think>Hello")).toBe("Hello");
  });
});
