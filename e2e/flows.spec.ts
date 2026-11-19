import { expect, test, type Page } from "@playwright/test";

const TWO_SUM_BODY = ["seen = {}", "for i, n in enumerate(nums):", "if target - n in seen: return [seen[target - n], i]", "seen[n] = i"].join("\n");
const TWO_SUM = `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen: return [seen[target - n], i]
            seen[n] = i
`;

const skipIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("uncooked:intro", "1"));
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1000) < 768;

async function setCode(page: Page, code: string) {
  if (isPhone(page)) await page.getByRole("tab", { name: /code/i }).click();
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
}

test("intro plays once per session and any key skips it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("press any key to skip")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByText("press any key to skip")).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("countdown")).toBeVisible();
  await expect(page.getByText("press any key to skip")).toBeHidden();
});

test("home shows the countdown and a drill plan", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-18T18:00:00"));
  await skipIntro(page);
  await page.goto("/");
  await expect(page.getByTestId("countdown")).toContainText(/\d+d|Today/);
  await expect(page.getByText(/Crash course · Wed → Fri morning/)).toBeVisible();
  await expect(page.getByTestId("course-continue")).toContainText("Read: how the day works");
  await expect(page.getByText("Extra, if you finish early")).toBeHidden();
  await expect(page.getByRole("link", { name: /Learn: Two Sum/ })).toBeVisible();
});

test("understand: briefing first, then three questions, then on to ghost typing", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await expect(page.getByTestId("brief")).toContainText("What it's asking");
  await expect(page.getByTestId("brief")).toContainText("[0, 1]");
  await page.getByRole("button", { name: "Got it, start the questions" }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible();
    await page.locator("button.choice").first().click();
    await expect(page.getByText(/Correct|Not quite/)).toBeVisible();
    await page.getByRole("button", { name: /Next question|Done/ }).click();
  }
  await expect(page.getByText("first try")).toBeVisible();
  await page.getByRole("button", { name: "Type the ghost" }).click();
  await expect(page.getByTestId("ghost-editor")).toBeVisible();
});

test("ghost typing: errors count, three shadow reps unlock the blind reps", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "off", exact: true }).click(); // rest off, to keep the test quick
  await page.waitForTimeout(600); // settings are saved on a short debounce
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Ghost type" }).click();
  const editor = page.getByTestId("ghost-editor");
  const input = editor.locator("textarea");

  await input.focus();
  await page.keyboard.type("x"); // wrong key
  await expect(page.getByTestId("ghost-stats")).toContainText("1 ERR");
  await page.keyboard.press("Tab"); // restart
  await expect(page.getByTestId("ghost-stats")).toContainText("0 ERR");
  await expect(page.getByTestId("caption")).toContainText("LINE 01");

  for (let rep = 1; rep <= 3; rep++) {
    await input.focus();
    await page.keyboard.type(TWO_SUM_BODY);
    await expect(page.getByTestId("rep-card")).toBeVisible();
    await expect(page.getByText(`Rep ${rep} of 6 done`)).toBeVisible();
    await page.getByRole("button", { name: /Next rep/ }).click();
  }
  await expect(page.getByText("from memory")).toBeVisible();
  // blind: the untyped code is no longer rendered
  await expect(editor).not.toContainText("enumerate");
  await input.focus();
  await page.keyboard.type(TWO_SUM_BODY);
  await expect(page.getByText("Rep 4 of 6 done")).toBeVisible();

  // the ladder survives a reload (IndexedDB)
  await page.waitForTimeout(600);
  await page.reload();
  await page.getByRole("button", { name: "Ghost type" }).click();
  await expect(page.getByTestId("ladder")).toContainText("■■■");
});

test("phone hides the visual pane but keeps captions; desktop shows it", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Ghost type" }).click();
  await expect(page.getByTestId("caption")).toBeVisible();
  if (isPhone(page)) await expect(page.getByTestId("scene")).toHaveCount(0);
  else await expect(page.getByTestId("scene")).toBeVisible();
});

test("cold solve: run, wrong answer, traceback, timeout, then accepted", async ({ page }) => {
  test.setTimeout(180_000);
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Cold solve" }).click();
  const panel = page.getByTestId("tests-panel");
  const submit = page.getByRole("button", { name: "Submit" }).first();

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]\n");
  await submit.click();
  await expect(panel).toContainText("passed", { timeout: 90_000 });
  await expect(panel).toContainText("FAIL");
  await expect(panel).toContainText("(hidden)");

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        return nums[99]\n");
  await submit.click();
  await expect(panel).toContainText("IndexError");
  await expect(panel).toContainText("line 3, in twoSum");

  await setCode(page, "class Solution:\n    def twoSum(self, nums, target):\n        while True: pass\n");
  await submit.click();
  await expect(panel).toContainText("Time limit exceeded", { timeout: 30_000 });

  await setCode(page, TWO_SUM);
  await submit.click();
  await expect(page.getByTestId("accepted")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("accepted")).toContainText("with no hints");
  await expect(page.getByTestId("accepted")).toContainText("1/2");
});

test("solution panel explains the approach and reveals code only on request", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Cold solve" }).click();
  if (isPhone(page)) await page.getByRole("tab", { name: /problem/i }).click();
  await page.getByRole("tab", { name: "Solution" }).click();
  const panel = page.getByTestId("solution-panel");
  await expect(panel).toContainText("Approach");
  await expect(panel).toContainText("O(n)");
  await expect(panel).not.toContainText("enumerate(nums)");
  await page.getByRole("button", { name: "Reveal the code" }).click();
  await expect(panel).toContainText("enumerate(nums)");
  await expect(page.getByText(/Hints used 3\/3/)).toBeVisible();
});

test("explanations save as you type and survive a reload, with no button pressed", async ({ page }) => {
  await skipIntro(page);
  const notes: Record<string, string> = {
    "two-sum": "Walk the list once with a hash map of number to index. O(n) time, O(n) space.",
    "contains-duplicate": "Put everything in a set. If the set is smaller than the list, something repeated.",
  };
  for (const [id, text] of Object.entries(notes)) {
    await page.goto(`/p/${id}`);
    await page.getByRole("button", { name: "Explain it" }).click();
    await page.getByLabel("Your explanation").fill(text);
    await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");
  }
  // typed last, then left the page straight away: the pagehide flush has to catch it
  await page.goto("/p/valid-anagram");
  await page.getByRole("button", { name: "Explain it" }).click();
  await page.getByLabel("Your explanation").fill("Counter both strings and compare.");
  await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");

  for (const [id, text] of Object.entries(notes)) {
    await page.goto(`/p/${id}`);
    await page.getByRole("button", { name: "Explain it" }).click();
    await expect(page.getByLabel("Your explanation")).toHaveValue(text);
  }
  await page.goto("/stats");
  const saved = page.getByTestId("saved-answers");
  await expect(saved).toContainText("Two Sum");
  await expect(saved).toContainText("Contains Duplicate");
  await expect(saved).toContainText("Counter both strings and compare.");

  // editing again later keeps the earlier version in history instead of overwriting it
  await page.goto("/p/two-sum");
  await page.getByRole("button", { name: "Explain it" }).click();
  await page.getByLabel("Your explanation").fill(notes["two-sum"] + " Edge case: duplicates.");
  await expect(page.getByTestId("explain-saved")).toContainText("saved on this device");
  await page.goto("/stats");
  await expect(page.getByTestId("saved-answers")).toContainText("2 versions");
});

test("sql: wrong query shows expected rows, the right one is accepted", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/sql/customers-who-never-order");
  const result = page.getByTestId("sql-result");
  await setCode(page, "SELECT name FROM Customers");
  await page.getByRole("button", { name: "Run" }).first().click();
  await expect(result).toContainText(/Rows don't match|SQL error/);
  await setCode(page, "SELECT c.name FROM Customers c LEFT JOIN Orders o ON o.customerId = c.id WHERE o.id IS NULL");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(result).toContainText(/Accepted|SQL error/);
});

test("joins lab switches join type live", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/sql?tab=joins");
  const out = page.getByTestId("join-result");
  await expect(out.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("button", { name: "FULL OUTER" }).click();
  await expect(out.locator("tbody tr")).toHaveCount(5);
});

test("quiz session records answers and resume cards reveal key points", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/quiz");
  await page.getByRole("button", { name: "Start 10" }).first().click();
  await page.locator("button.choice").first().click();
  await expect(page.getByText(/Correct|Not quite/)).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();

  await page.goto("/resume");
  await page.getByRole("button", { name: "Drill 6 weakest" }).click();
  await page.getByLabel("Your answer").fill("I chose Next.js because of file routing. I considered plain React, but wanted API routes.");
  await page.getByRole("button", { name: "Show key points" }).click();
  await expect(page.getByText("A strong answer hits")).toBeVisible();
  await page.getByRole("button", { name: /Got it/ }).click();
  await expect(page.getByText("2/6")).toBeVisible();
});

test("every page renders without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await skipIntro(page);
  for (const path of ["/", "/problems", "/sql", "/quiz", "/resume", "/behavioral", "/review", "/review?mode=night", "/timed", "/stats", "/sheets", "/settings", "/tracks", "/p/number-of-islands", "/p/undo-playlist-order"]) {
    await page.goto(path);
    await expect(page.locator("main")).not.toBeEmpty();
    await expect(page.locator("h1, [data-testid=countdown]").first()).toBeVisible();
    // no horizontal scrolling at any width
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${path} overflows horizontally`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("voice mock interview: passcode, streamed turns, typed answers, feedback saved", async ({ page }) => {
  await skipIntro(page);
  const bodies: { mode: string; messages: { role: string; content: string }[] }[] = [];
  await page.route("**/api/interview", async (route) => {
    const body = route.request().postDataJSON() as (typeof bodies)[number];
    bodies.push(body);
    expect(route.request().headers()["x-interview-passcode"]).toBe("test-pass");
    const reply =
      body.mode === "feedback"
        ? "SCORES\nCommunication: 4/5 - clear.\n\nFIX BEFORE FRIDAY\nSay the complexity first."
        : body.messages.length === 0
          ? "Hi, thanks for joining. What's the difference between an inner join and an outer join?"
          : "Good. When would a left join return more rows than the left table has?";
    await route.fulfill({ status: 200, contentType: "text/plain; charset=utf-8", body: reply });
  });
  await page.goto("/interview");
  await page.getByRole("button", { name: /^SQL/ }).click();
  await page.getByRole("button", { name: /interviewer speaks/ }).click(); // text only, so tests don't wait on speech
  await page.getByLabel("Interview passcode").fill("test-pass");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Start interview" }).click();
  await expect(page.getByTestId("interviewer")).toContainText("inner join and an outer join");

  await page.getByLabel("Typed answer").fill("An inner join keeps only matching rows; a left outer join keeps every left row and fills NULLs.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByTestId("interviewer")).toContainText("more rows than the left table");
  await expect(page.getByTestId("transcript")).toContainText("fills NULLs");
  expect(bodies[1]!.messages.at(-1)!.content).toContain("fills NULLs");

  await page.getByRole("button", { name: "End + feedback" }).click();
  await expect(page.getByTestId("feedback")).toContainText("FIX BEFORE FRIDAY");
  expect(bodies.at(-1)!.mode).toBe("feedback");
  await page.waitForTimeout(600);
  await page.goto("/stats");
  await expect(page.getByTestId("saved-answers")).toContainText("Voice mock interview feedback");
});

test("voice mock interview falls back to offline practice when the AI is unavailable", async ({ page }) => {
  await skipIntro(page);
  await page.route("**/api/interview", (route) =>
    route.fulfill({ status: 402, contentType: "application/json", body: JSON.stringify({ error: "no_credits", message: "The Anthropic account has no API credits." }) }),
  );
  await page.addInitScript(() => localStorage.setItem("uncooked:interview-passcode", "test-pass"));
  await page.goto("/interview");
  await page.getByRole("button", { name: /^Resume/ }).click();
  await page.getByRole("button", { name: /interviewer speaks/ }).click();
  await page.getByRole("button", { name: "Start interview" }).click();
  await expect(page.getByText("The Anthropic account has no API credits.")).toBeVisible();
  await page.getByRole("button", { name: "Practice offline instead" }).click();
  await expect(page.getByText("1/6")).toBeVisible();
  await page.getByLabel("Typed answer").fill("I built the Gemini call and the GBIF check myself.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("A strong answer hits")).toBeVisible();
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByText("2/6")).toBeVisible();
});

test("plan: today's assignment on Home, manual ticks persist, solves tick themselves", async ({ page }) => {
  test.setTimeout(150_000);
  await page.clock.setFixedTime(new Date("2026-11-16T18:00:00"));
  await skipIntro(page);
  await page.goto("/");
  await expect(page.getByText("Today's assignment · Mon · Day 1")).toBeVisible();
  const manual = page.getByRole("checkbox", { name: /60-second intro/ });
  await manual.click();
  await expect(manual).toHaveAttribute("aria-checked", "true");
  await page.waitForTimeout(600);
  await page.goto("/plan");
  await expect(page.getByRole("checkbox", { name: /60-second intro/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("task-d1-core-b")).toHaveAttribute("data-done", "false");

  await page.goto("/p/group-anagrams");
  await page.getByRole("button", { name: "Cold solve" }).click();
  await setCode(page, 'class Solution:\n    def groupAnagrams(self, strs):\n        g = defaultdict(list)\n        for w in strs: g["".join(sorted(w))].append(w)\n        return list(g.values())\n');
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(page.getByTestId("accepted")).toBeVisible({ timeout: 90_000 });
  await page.waitForTimeout(600);
  await page.goto("/plan");
  await expect(page.getByTestId("task-d1-core-b")).toHaveAttribute("data-done", "true");
});

test("crash course: continue walks the path, notes expand, ticks persist", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-18T10:00:00"));
  await skipIntro(page);
  await page.goto("/course");
  const header = page.getByTestId("course-header");
  await expect(header).toContainText("0/");
  await expect(page.getByTestId("course-continue")).toContainText("Read: how the day works");
  // the first lesson's notes start open; the second's open on demand
  await expect(page.getByTestId("module-m1").getByTestId("read-notes").first()).toContainText("government photo ID");
  await page.getByRole("checkbox", { name: /how the day works/ }).click();
  await expect(page.getByTestId("course-continue")).toContainText("how to answer any coding problem");
  await page.getByTestId("module-m1").getByRole("button", { name: "▸ read notes" }).click();
  await expect(page.getByTestId("module-m1")).toContainText("Restate it in your own words");
  await page.getByRole("checkbox", { name: /how to answer any coding problem/ }).click();
  await expect(page.getByTestId("course-continue")).toContainText("Two Sum: all four phases");
  await expect(header).toContainText("2/");
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.getByTestId("course-continue")).toContainText("Two Sum: all four phases");
  await page.getByTestId("course-continue").click();
  await expect(page).toHaveURL(/\/p\/two-sum/);
});

test("cold solve shows the briefing, timed modes don't", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/p/merge-intervals");
  await page.getByRole("button", { name: "Cold solve" }).click();
  if (isPhone(page)) await page.getByRole("tab", { name: /problem/i }).click();
  await expect(page.getByText("In plain words")).toBeVisible();
  await expect(page.getByTestId("brief")).toContainText("Watch for");
  await page.goto("/timed");
  await page.getByRole("button", { name: /^Mock interview/ }).click();
  await page.getByRole("button", { name: "Start 20:00" }).click();
  if (isPhone(page)) await page.getByRole("tab", { name: /problem/i }).click();
  await expect(page.getByText("Problem").first()).toBeVisible();
  await expect(page.getByText("In plain words")).toHaveCount(0);
});

test("top 10: ghost run needs a perfect rep to score 100, retries are unlimited", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/technical");
  await page.getByRole("button", { name: "Start ghost run" }).click();
  await expect(page.getByRole("heading", { name: "Rank students by grade, then name" })).toBeVisible();
  const input = page.getByTestId("ghost-editor").locator("textarea");
  const body = "ranked = sorted(students, key=lambda s: (-s[1], s[0]))\nreturn [name for name, grade in ranked]";
  await input.focus();
  await page.keyboard.type("x" + body); // one wrong key first
  await expect(page.getByTestId("ghost-result")).toContainText("/100");
  await expect(page.getByTestId("ghost-result")).not.toContainText("100/100");
  await page.getByRole("button", { name: "Retry" }).click();
  await input.focus();
  await page.keyboard.type(body);
  await expect(page.getByText("100 · locked in")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: /Compress a string/ })).toBeVisible();
  await page.waitForTimeout(600);
  await page.goto("/technical");
  await expect(page.getByText("1/10 at 100%").first()).toBeVisible();
});

test("top 10: interview pops up recommendations, grades by points, retry to 100", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/technical");
  await page.locator("li", { hasText: "Two Sum" }).getByRole("button", { name: "Interview" }).click();
  await page.getByRole("button", { name: "Voice on" }).click(); // voice off so the test doesn't wait on speech
  await page.getByTestId("ask").click();
  await expect(page.getByTestId("conversation")).toContainText("add up to the target");
  await page.getByLabel("Your answer").fill("I'd use a dictionary to remember what I've seen.");
  await expect(page.getByTestId("live-checklist")).toContainText("Uses a hash map");
  await expect(page.getByTestId("toasts")).toContainText("+25");
  await page.getByTestId("submit-answer").click();
  const score = page.getByTestId("tech-score");
  await expect(score).toBeVisible();
  expect(Number((await score.innerText()).match(/\d+/)![0])).toBeLessThan(100);
  await expect(page.getByTestId("tech-result")).toContainText("graded in browser");
  await expect(page.getByTestId("what-to-say")).toContainText("dictionary");
  await page.getByRole("button", { name: "Retry" }).click();
  await page.getByTestId("ask").click();
  await expect(page.getByLabel("Your answer")).toBeVisible();
  await page.getByLabel("Your answer").fill(
    "Can numbers repeat? I'll assume yes. Brute force checks every pair, O(n squared). Instead I keep a dictionary from number to index and check if target minus the number is already there, checking before storing so a number can't pair with itself, which handles duplicates like 3 and 3. O(n) time and O(n) space.",
  );
  await page.getByTestId("submit-answer").click();
  await expect(score).toContainText("100");
  await expect(page.getByText("100 · nailed it")).toBeVisible();
});

test("top 10: uses Claude's grade when the grader answers", async ({ page }) => {
  await skipIntro(page);
  await page.addInitScript(() => localStorage.setItem("uncooked:interview-passcode", "test-pass"));
  await page.route("**/api/grade", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        score: 85,
        points: [{ id: "inner", label: "Inner join keeps only matching rows", max: 20, earned: 20, feedback: "Clear." }],
        summary: "Strong definitions. Add the alternative.",
        whatToSay: "An inner join keeps only matching rows...",
        example: "SELECT c.name FROM Customers c LEFT JOIN Orders o ON o.customerId = c.id WHERE o.id IS NULL;",
        followUp: "What would a full outer join return?",
        source: "ai",
      }),
    }),
  );
  await page.goto("/technical");
  await page.locator("li", { hasText: "Inner vs. outer join" }).getByRole("button", { name: "Interview" }).click();
  await page.getByRole("button", { name: "Voice on" }).click();
  await page.getByTestId("ask").click();
  await expect(page.getByLabel("Your answer")).toBeVisible();
  await page.getByLabel("Your answer").fill("An inner join keeps matching rows, a left join keeps all rows.");
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("tech-result")).toContainText("graded by Claude");
  await expect(page.getByTestId("tech-score")).toContainText("85");
  await expect(page.getByTestId("tech-result")).toContainText("full outer join");
});

test("top 10: a video before each question, final videos, and no-sound never leaves you stuck", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/technical");
  await expect(page.getByTestId("final-videos")).toContainText("SAP Global Student Training and Rotation Experience");
  await page.locator("li", { hasText: "Two Sum" }).getByRole("button", { name: "Interview" }).click();
  const watch = page.getByTestId("watch-first");
  await expect(watch).toHaveAttribute("open", "");
  await watch.getByRole("button", { name: /Play Two Sum/ }).click();
  await expect(watch.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/KLlXCFG5TnA/);
  await watch.getByRole("checkbox", { name: /watched/ }).click();
  await expect(page.getByTestId("watch-first")).toContainText("· watched");
  // Voice stays on: the interviewer's lines can be skipped, and you always get your turn.
  await page.getByTestId("ask").click();
  for (let i = 0; i < 2 && !(await page.getByLabel("Your answer").isVisible()); i++) {
    await page.getByTestId("skip").click({ timeout: 5000 }).catch(() => {});
  }
  await expect(page.getByLabel("Your answer")).toBeVisible({ timeout: 8000 });
});

test("top 10: the interviewer plays a recorded clip, and the mic opens when it ends", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/technical");
  await page.locator("li", { hasText: "Two Sum" }).getByRole("button", { name: "Interview" }).click();
  const res = await page.request.get("/voice/t-two-sum.mp3");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("audio");
  await page.getByTestId("ask").click();
  await expect(page.getByTestId("conversation")).toContainText("thanks for coming in");
  // skip the intro and the question, or let them play out; either way you get the floor
  for (let i = 0; i < 2 && !(await page.getByLabel("Your answer").isVisible()); i++) {
    await page.getByTestId("skip").click({ timeout: 5000 }).catch(() => {});
  }
  await expect(page.getByLabel("Your answer")).toBeVisible({ timeout: 15000 });
});

test("top 10 simulator: the interviewer reacts to what you say, then follows up and wraps up", async ({ page }) => {
  await skipIntro(page);
  await page.goto("/technical");
  await page.locator("li", { hasText: "Two Sum" }).getByRole("button", { name: "Interview" }).click();
  await page.getByRole("button", { name: "Voice on" }).click();
  await page.getByTestId("ask").click();
  const box = page.getByLabel("Your answer");
  const reply = async (text: string) => {
    await expect(box).toBeVisible();
    await box.fill(text);
    await page.getByRole("button", { name: "Send reply" }).click();
  };
  const lines = page.getByTestId("interviewer-line");
  await reply("I'd use a dictionary.");
  await expect(lines.last()).toContainText("Keep going");
  await reply("Brute force checks every pair, that's O(n squared). Instead I keep a dictionary from number to index and check if target minus the number is in it.");
  await expect(lines.last()).toContainText("questions about the input");
  await reply("Can numbers repeat? I'll assume yes, so duplicates like 3 and 3 should work.");
  await expect(lines.last()).toContainText("walk me through");
  await reply("For each number I check the dictionary before storing it, so a number never pairs with itself.");
  await expect(lines.last()).toContainText("time and space complexity");
  await reply("O(n) time and O(n) space.");
  await expect(lines.last()).toContainText("One follow-up");
  await reply("If it were sorted I'd use two pointers from both ends, O(1) space.");
  await expect(lines.last()).toContainText("Let's see how you did");
  await expect(page.getByTestId("tech-score")).toContainText("100", { timeout: 10000 });
  await expect(page.getByTestId("tech-result")).toContainText("The conversation");
});
