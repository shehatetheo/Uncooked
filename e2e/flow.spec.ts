import { expect, test, type Page } from "@playwright/test";

type Body = { phase: string; event?: string; code: string; run: { passed: number; total: number; mode: string } | null; messages: { role: string; content: string }[] };

/** Stand in for the AI: reply with a line that depends on the event, and record what the app sent. */
async function mockAi(page: Page, sent: Body[] = []) {
  // no server voice in tests: the app falls back to the browser's voice
  await page.route("**/api/speak", (route) => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
  await page.route("**/api/interview", async (route) => {
    const body = route.request().postDataJSON() as Body;
    sent.push(body);
    const last = body.messages.at(-1)?.content ?? "";
    const reply =
      body.event === "start" ? "Hi, I'm Sam from SAP. You get a list of numbers and a target. Can you restate the problem for me?"
      : body.event === "ghost" ? "Go ahead and type it out, and explain each line as you go."
      : body.event === "blind" ? "This is the real thing now. Talk me through your plan."
      : body.event === "passed" ? "Nice work, all tests pass. What if the list were already sorted?"
      : body.event === "ghost-passed" ? "Well done. Why does the dictionary make it fast?"
      : body.event === "ran" ? "Looks like a test is failing. What should happen there?"
      : body.event === "wrap" ? "Thanks for your time today. Your scorecard is coming up."
      : `You said: ${last}. What's the time complexity of that?`;
    await route.fulfill({ status: 200, contentType: "text/plain; charset=utf-8", body: reply });
  });
  await page.route("**/api/scorecard", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        scores: {
          problemSolving: { score: 4, tip: "You found the dictionary idea quickly; say the brute force first next time." },
          communication: { score: 3, tip: "Restate the problem before you start." },
          codeQuality: { score: 4, tip: "Clear names. Keep it." },
          complexity: { score: 2, tip: "You never said the space complexity." },
          edgeCases: { score: 3, tip: "Mention duplicates like 3 and 3." },
        },
        verdict: "lean hire",
        summary: "Solid solve. State complexity without being asked.",
      }),
    }),
  );
}

const ONE_LINE = "return next([i, j] for i in range(len(nums)) for j in range(i + 1, len(nums)) if nums[i] + nums[j] == target)";
const phone = (page: Page) => (page.viewportSize()?.width ?? 1200) < 1024;
const tab = async (page: Page, name: "interviewer" | "problem" | "code" | "tests") => {
  if (phone(page)) await page.getByTestId(`m-${name}`).click();
};
const typeCode = async (page: Page, text: string) => {
  await tab(page, "code");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type(text);
};

test("dashboard lists all 32 questions in order", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-testid^="row-"]')).toHaveCount(32);
  await expect(page.locator('[data-testid^="row-"]').first()).toContainText("Two Sum");
  await expect(page.getByTestId("status-two-sum")).toHaveText("Not started");
  await page.getByTestId("continue").click();
  await expect(page).toHaveURL(/\/q\/two-sum$/);
  await expect(page.getByTestId("intro")).toContainText("Mock interview: Two Sum");
  await tab(page, "problem");
  await expect(page.getByRole("heading", { name: "Two Sum" })).toBeVisible();
});

test("full interview: talk, ghost, blind, scorecard, progress saved", async ({ page }) => {
  const sent: Body[] = [];
  await mockAi(page, sent);
  await page.goto("/q/two-sum");
  await expect(page.getByTestId("timer")).toHaveText("25:00");
  await expect(page.getByTestId("run")).toBeDisabled();

  // Talk: the interviewer opens, and replies to what you say
  await page.getByTestId("start").click();
  await expect(page.getByTestId("ai-line").first()).toContainText("I'm Sam from SAP");
  await page.getByLabel("Type your answer").fill("I'd use a dictionary");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("ai-line").last()).toContainText("You said: I'd use a dictionary");
  expect(sent.at(-1)!.phase).toBe("talk");
  await tab(page, "problem");
  await page.getByTestId("tab-solution").click();
  await expect(page.getByTestId("solution")).toContainText("opens in the Ghost phase");

  // Ghost: the reference is shown faintly; passing the tests completes it, not matching the ghost
  await tab(page, "code");
  await expect(page.getByTestId("editor-lock")).toBeVisible();
  await page.getByTestId("next-phase").click();
  await expect(page.getByTestId("ghost")).toContainText("seen = {}");
  await expect(page.getByTestId("ghost-caption")).not.toBeEmpty();
  await typeCode(page, ONE_LINE);
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("console")).toContainText("7/7 passed", { timeout: 60_000 });
  const ghostPassed = sent.find((b) => b.event === "ghost-passed")!;
  expect(ghostPassed.code).toContain("return next(");
  expect(ghostPassed.run).toMatchObject({ passed: 7, total: 7, mode: "submit" });

  // Blind: editor reset, ghost gone, solution locked
  await page.getByTestId("next-phase").click();
  await expect(page.getByTestId("ghost")).toHaveCount(0);
  await tab(page, "code");
  await expect(page.locator(".cm-content")).not.toContainText("return next(");
  await tab(page, "problem");
  await page.getByTestId("tab-solution").click();
  await expect(page.getByTestId("solution")).toContainText("Hidden during the blind solve");
  await typeCode(page, "return [0, 1]");
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("console")).toContainText(/[1-6]\/7 passed/);
  await tab(page, "tests");
  await expect(page.getByTestId("test-results")).toContainText("Expected");
  await expect.poll(() => sent.some((b) => b.event === "ran")).toBe(true);
  await tab(page, "code");
  await page.getByRole("button", { name: "Reset" }).click();
  await typeCode(page, ONE_LINE);
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("console")).toContainText("7/7 passed");
  await tab(page, "interviewer");
  await expect(page.getByTestId("ai-line").last()).toContainText("already sorted");

  // Feedback
  await page.getByTestId("next-phase").click();
  await tab(page, "code");
  await expect(page.getByTestId("scorecard")).toContainText("Lean hire");
  await expect(page.getByTestId("scorecard")).toContainText("Complexity analysis");
  await expect(page.getByTestId("next-question")).toContainText("Valid Parentheses");
  await page.goto("/");
  await expect(page.getByTestId("status-two-sum")).toHaveText("Blind solved");
  await expect(page.getByTestId("blind-count")).toContainText("1");
  await expect(page.getByTestId("averages")).toContainText("3.2".slice(0, 1));
});

test("when the AI is down, the message is clear and coding still works", async ({ page }) => {
  await page.route("**/api/interview", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "rate_limited", message: "The AI interviewer is rate limited on the free tier right now. Wait a minute and try again. Your code and tests still work." }) }));
  await page.route("**/api/scorecard", (route) => route.fulfill({ status: 402, contentType: "application/json", body: JSON.stringify({ error: "no_credits", message: "The AI Gateway free credits have run out for now." }) }));
  await page.goto("/q/two-sum");
  await page.getByTestId("start").click();
  await expect(page.getByTestId("ai-error")).toContainText("rate limited");
  await tab(page, "code");
  await page.getByTestId("next-phase").click();
  await typeCode(page, ONE_LINE);
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("3/3 passed", { timeout: 60_000 });
  await page.getByTestId("next-phase").click(); // skip to blind
  await typeCode(page, "while True: pass");
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("Time limit exceeded", { timeout: 20_000 });
  await tab(page, "code");
  await page.getByRole("button", { name: "Reset" }).click();
  await typeCode(page, "return nums[99]");
  await page.getByTestId("run").click();
  await tab(page, "tests");
  await expect(page.getByTestId("test-results")).toContainText("IndexError", { timeout: 30_000 });
  await expect(page.getByTestId("test-results")).toContainText("line 3");
  await page.getByTestId("end").click();
  await tab(page, "code");
  await expect(page.getByTestId("card-error")).toContainText("free credits");
});

test("skip to blind, and the SQL problem runs against its tables", async ({ page }) => {
  await mockAi(page);
  await page.goto("/q/movie-rating");
  await tab(page, "problem");
  await expect(page.getByTestId("question")).toContainText("MovieRating");
  await tab(page, "interviewer");
  await page.getByTestId("skip-ghost").check();
  await page.getByTestId("start").click();
  await expect(page.getByTestId("phases").locator('[aria-current="step"]')).toHaveText("Blind");
  await tab(page, "code");
  await expect(page.getByTestId("ghost")).toHaveCount(0);
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type(
    "SELECT results FROM (SELECT u.name AS results FROM MovieRating r JOIN Users u ON u.user_id = r.user_id GROUP BY u.user_id ORDER BY COUNT(*) DESC, u.name LIMIT 1) UNION ALL SELECT results FROM (SELECT m.title AS results FROM MovieRating r JOIN Movies m ON m.movie_id = r.movie_id WHERE r.created_at BETWEEN '2020-02-01' AND '2020-02-29' GROUP BY m.movie_id ORDER BY AVG(r.rating) DESC, m.title LIMIT 1);",
  );
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("console")).toContainText("5/5 passed", { timeout: 30_000 });
  await expect(page.getByTestId("output")).toContainText("Frozen 2");
});

test("voice: hold Space or the mic to talk, and the reply is spoken", async ({ page }) => {
  // A stand-in recognizer and synthesizer, since a test browser has no microphone or speakers.
  await page.addInitScript(() => {
    class FakeRecognition {
      onresult: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      start() {
        setTimeout(() => this.onresult?.({ resultIndex: 0, results: { length: 1, 0: { isFinal: false, length: 1, 0: { transcript: "check every pair" } } } }), 50);
      }
      stop() {
        setTimeout(() => this.onend?.(), 10);
      }
      abort() {}
    }
    const w = window as unknown as Record<string, unknown>;
    w.webkitSpeechRecognition = FakeRecognition;
    w.SpeechRecognition = FakeRecognition;
    const spoken: string[] = [];
    w.__spoken = spoken;
    window.speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
      spoken.push(u.text);
      setTimeout(() => u.onend?.(new Event("end") as SpeechSynthesisEvent), 20);
    };
  });
  await mockAi(page);
  await page.goto("/q/two-sum");
  await page.getByTestId("start").click();
  await expect(page.getByTestId("ai-line").first()).toContainText("I'm Sam");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.join(" "))).toContain("Can you restate the problem for me?");

  if (!phone(page)) {
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.down("Space");
    await expect(page.getByTestId("heard")).toContainText("check every pair");
    await page.keyboard.up("Space");
  } else {
    const mic = page.getByTestId("mic").first();
    await mic.dispatchEvent("pointerdown");
    await expect(page.getByTestId("heard")).toContainText("check every pair");
    await page.waitForTimeout(450);
    await mic.dispatchEvent("pointerup");
  }
  await expect(page.getByTestId("you-line").last()).toContainText("check every pair");
  await expect(page.getByTestId("ai-line").last()).toContainText("You said: check every pair");

  // muted: the transcript still updates, nothing is spoken
  await page.getByTestId("mute").click();
  const before = await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length);
  await page.getByLabel("Type your answer").fill("a dictionary instead");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("ai-line").last()).toContainText("a dictionary instead");
  expect(await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length)).toBe(before);
});

/** Replace the editor's contents by pasting, the way you'd paste real code. */
async function pasteCode(page: Page, code: string) {
  await tab(page, "code");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.locator(".cm-content").evaluate((el, text) => {
    const data = new DataTransfer();
    data.setData("text/plain", text);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  }, code);
}

test("LeetCode-style inputs: operation lists for LRU Cache, linked lists with a cycle", async ({ page }) => {
  await mockAi(page);
  await page.goto("/q/lru-cache");
  await page.getByTestId("skip-ghost").check();
  await page.getByTestId("start").click();
  await tab(page, "code");
  await expect(page.locator(".cm-content")).toContainText("class LRUCache:");
  await pasteCode(
    page,
    `class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.data = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key: int, value: int) -> None:
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.cap:
            self.data.popitem(last=False)
`,
  );
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("console")).toContainText("7/7 passed", { timeout: 60_000 });

  await page.goto("/q/linked-list-cycle");
  await page.getByTestId("skip-ghost").check();
  await page.getByTestId("start").click();
  await pasteCode(page, "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        return False\n");
  await page.getByTestId("run").click();
  await tab(page, "tests");
  await expect(page.getByTestId("test-results")).toContainText("head = [3, 2, 0, -4], pos = 1", { timeout: 60_000 });
  await expect(page.getByTestId("test-results")).toContainText("True");
  await expect(page.getByTestId("console")).toContainText("1/3 passed");
});
